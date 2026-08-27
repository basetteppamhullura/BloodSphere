import express from 'express';
import { EmergencyRequest } from '../models/EmergencyRequest.js';
import { BloodStock } from '../models/BloodStock.js';
import { AuditLog } from '../models/AuditLog.js';
import { SystemSettings } from '../models/SystemSettings.js';
import { User } from '../models/User.js';

export function createBloodBankRouter(socketHandler) {
  const router = express.Router();

  // 1. GET Full Blood Bank Database Snapshot (Source of Truth)
  router.get('/snapshot', async (req, res) => {
    try {
      let stocks = await BloodStock.find({}).lean();
      let requests = await EmergencyRequest.find({}).lean();
      let auditLogs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100).lean();
      let settings = await SystemSettings.findOne({ key: 'global_settings' }).lean();

      if (!settings) {
        settings = await SystemSettings.create({ key: 'global_settings' });
      }

      res.json({
        success: true,
        data: {
          stocks,
          requests,
          auditLogs,
          settings,
          onlineUsersCount: socketHandler.getOnlineCount()
        }
      });
    } catch (err) {
      console.error('[API /bloodbank/snapshot error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Reserve Blood Units for an Emergency Request
  router.post('/reserve', async (req, res) => {
    try {
      const { requestId, bankId = 'BB-MAIN', bloodGroup, component = 'PRBC', unitsNeeded = 1, adminName = 'Blood Bank Staff' } = req.body;

      // Find emergency request
      const reqObj = await EmergencyRequest.findOne({ id: requestId });
      if (!reqObj) {
        return res.status(404).json({ success: false, message: 'Blood request not found.' });
      }

      // Check current available inventory
      const currentStock = await BloodStock.findOne({ bankId, bloodGroup, component });
      const availableUnits = currentStock ? currentStock.available : 10;

      if (availableUnits < unitsNeeded) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for ${bloodGroup} (${component}). Only ${availableUnits} units available.`
        });
      }

      // Update inventory stock (Deduct available, increment reserved)
      const stock = await BloodStock.findOneAndUpdate(
        { bankId, bloodGroup, component },
        { $inc: { available: -unitsNeeded, reserved: unitsNeeded }, lastUpdated: new Date() },
        { upsert: true, new: true }
      );

      // Update request status to RESERVED
      reqObj.status = 'BLOOD_RESERVED';
      reqObj.confirmedUnits = unitsNeeded;
      await reqObj.save();

      // Log Audit Entry
      const auditEntry = new AuditLog({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adminName,
        action: 'BLOOD_RESERVED',
        targetEntity: `Request #${requestId} (${bloodGroup} ${component})`,
        details: `Reserved ${unitsNeeded} units of ${bloodGroup} (${component}). Available: ${stock.available}, Reserved: ${stock.reserved}.`,
        status: 'SUCCESS'
      });
      await auditEntry.save();

      // Broadcast Socket.IO Events across all connected clients
      socketHandler.broadcastAll('BLOOD_RESERVED', {
        requestId,
        request: reqObj,
        unitsReserved: unitsNeeded,
        stock,
        auditEntry
      });

      socketHandler.broadcastAll('INVENTORY_UPDATED', {
        bankId,
        bloodGroup,
        component,
        stock,
        auditEntry
      });

      socketHandler.broadcastAdminEvent('adminNotification', {
        id: `notif-${Date.now()}`,
        title: '🩸 Blood Units Reserved',
        message: `Reserved ${unitsNeeded} units of ${bloodGroup} for Request #${requestId}.`,
        time: 'Just now',
        type: 'info'
      });

      res.json({ success: true, request: reqObj, stock, auditEntry });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Issue Blood Transfusion Units
  router.post('/issue', async (req, res) => {
    try {
      const { requestId, bankId = 'BB-MAIN', bloodGroup, component = 'PRBC', unitsIssued = 1, adminName = 'Blood Bank Staff' } = req.body;

      const reqObj = await EmergencyRequest.findOne({ id: requestId });
      if (!reqObj) {
        return res.status(404).json({ success: false, message: 'Blood request not found.' });
      }

      // Update inventory stock (Deduct reserved, increment issued)
      const stock = await BloodStock.findOneAndUpdate(
        { bankId, bloodGroup, component },
        { $inc: { reserved: -unitsIssued, issued: unitsIssued }, lastUpdated: new Date() },
        { upsert: true, new: true }
      );

      // Update request status to BLOOD_ISSUED
      reqObj.status = 'BLOOD_ISSUED';
      reqObj.unitsFulfilled = (reqObj.unitsFulfilled || 0) + unitsIssued;
      await reqObj.save();

      // Audit Log
      const auditEntry = new AuditLog({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adminName,
        action: 'BLOOD_ISSUED',
        targetEntity: `Request #${requestId} (${bloodGroup} ${component})`,
        details: `Issued ${unitsIssued} units of ${bloodGroup} (${component}) for patient ${reqObj.patientName}.`,
        status: 'SUCCESS'
      });
      await auditEntry.save();

      // Socket.IO Emit
      socketHandler.broadcastAll('BLOOD_ISSUED', {
        requestId,
        request: reqObj,
        unitsIssued,
        stock,
        auditEntry
      });

      socketHandler.broadcastAll('INVENTORY_UPDATED', {
        bankId,
        bloodGroup,
        component,
        stock,
        auditEntry
      });

      socketHandler.broadcastAdminEvent('adminNotification', {
        id: `notif-${Date.now()}`,
        title: '✅ Blood Issued Successfully',
        message: `Issued ${unitsIssued} units of ${bloodGroup} for patient ${reqObj.patientName}.`,
        time: 'Just now',
        type: 'success'
      });

      res.json({ success: true, request: reqObj, stock, auditEntry });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Intake New Blood Unit into Inventory
  router.post('/intake', async (req, res) => {
    try {
      const { bankId = 'BB-MAIN', bloodGroup, component = 'PRBC', quantity = 1, donorId = 'VOL-DONOR', storageLocation = 'Rack A-01', adminName = 'Blood Bank Staff' } = req.body;

      const stock = await BloodStock.findOneAndUpdate(
        { bankId, bloodGroup, component },
        { $inc: { available: quantity }, lastUpdated: new Date() },
        { upsert: true, new: true }
      );

      const auditEntry = new AuditLog({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adminName,
        action: 'STOCK_INTAKE',
        targetEntity: `${bloodGroup} (${component})`,
        details: `Added ${quantity} new blood unit(s) into inventory at ${storageLocation}. Total available: ${stock.available}.`,
        status: 'SUCCESS'
      });
      await auditEntry.save();

      socketHandler.broadcastAll('INVENTORY_UPDATED', {
        bankId,
        bloodGroup,
        component,
        stock,
        auditEntry
      });

      res.json({ success: true, stock, auditEntry });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. GET Blood Bank Reports & Analytics Aggregations
  router.get('/analytics', async (req, res) => {
    try {
      const totalRequests = await EmergencyRequest.countDocuments({});
      const completedRequests = await EmergencyRequest.countDocuments({ status: 'COMPLETED' });
      const issuedRequests = await EmergencyRequest.countDocuments({ status: 'BLOOD_ISSUED' });
      const reservedRequests = await EmergencyRequest.countDocuments({ status: 'BLOOD_RESERVED' });

      const stockAggregation = await BloodStock.aggregate([
        { $group: { _id: '$bloodGroup', available: { $sum: '$available' }, reserved: { $sum: '$reserved' }, issued: { $sum: '$issued' } } }
      ]);

      res.json({
        success: true,
        analytics: {
          totalRequests,
          completedRequests,
          issuedRequests,
          reservedRequests,
          stockAggregation
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
