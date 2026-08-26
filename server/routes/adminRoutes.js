import express from 'express';
import { User } from '../models/User.js';
import { EmergencyRequest } from '../models/EmergencyRequest.js';
import { BloodStock } from '../models/BloodStock.js';
import { AuditLog } from '../models/AuditLog.js';
import { SystemSettings } from '../models/SystemSettings.js';

export function createAdminRouter(socketHandler) {
  const router = express.Router();

  // 1. GET Full Admin Snapshot from MongoDB (Source of Truth)
  router.get('/snapshot', async (req, res) => {
    try {
      let users = await User.find({}).lean();
      let requests = await EmergencyRequest.find({}).lean();
      let stocks = await BloodStock.find({}).lean();
      let auditLogs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100).lean();
      let settings = await SystemSettings.findOne({ key: 'global_settings' }).lean();

      if (!settings) {
        settings = await SystemSettings.create({ key: 'global_settings' });
      }

      res.json({
        success: true,
        data: {
          users,
          requests,
          stocks,
          auditLogs,
          settings,
          onlineUsersCount: socketHandler.getOnlineCount()
        }
      });
    } catch (err) {
      console.error('[API /snapshot error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Account Verification Status Update (Approve / Reject / Suspend) with Conflict Check
  router.post('/accounts/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminName = 'Super Admin' } = req.body;

      const existingUser = await User.findOne({ id });
      if (!existingUser) {
        return res.status(404).json({ success: false, message: 'Account not found.' });
      }

      // Concurrent conflict check: prevent duplicate processing if already in target status
      if (existingUser.status === status) {
        return res.status(409).json({
          success: false,
          message: `This account verification has already been processed as ${status}.`
        });
      }

      const user = await User.findOneAndUpdate({ id }, { status }, { new: true });
      
      const auditEntry = new AuditLog({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adminName,
        action: status === 'Verified' ? 'ACCOUNT_APPROVED' : status === 'Disabled' ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_REJECTED',
        targetEntity: `${user.name} (${user.role.toUpperCase()})`,
        details: `Updated account verification status to ${status}.`,
        status: status === 'Verified' ? 'SUCCESS' : 'WARNING'
      });
      await auditEntry.save();

      // Emit targeted Socket.IO event to admin-dashboard & individual role room
      const eventName = status === 'Verified' ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED';
      socketHandler.broadcastToRoom(`${user.role}-${id}`, eventName, {
        userId: id,
        role: user.role,
        status,
        user,
        message: status === 'Verified' ? `${user.role.toUpperCase()} account verified successfully!` : `Account verification status: ${status}`
      });

      socketHandler.broadcastAdminEvent('accountStatusUpdated', {
        userId: id,
        status,
        user,
        auditEntry
      });

      socketHandler.broadcastAdminEvent('adminNotification', {
        id: `notif-${Date.now()}`,
        title: status === 'Verified' ? '🏥 Account Verified' : '⚠️ Account Status Changed',
        message: `${user.name} (${user.role.toUpperCase()}) is now ${status}.`,
        time: 'Just now',
        type: status === 'Verified' ? 'success' : 'warning'
      });

      res.json({ success: true, user, auditEntry });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Create Emergency Request (MongoDB + Real-time Socket Emit)
  router.post('/emergency-requests', async (req, res) => {
    try {
      const reqData = req.body;
      const newReq = new EmergencyRequest({
        ...reqData,
        id: reqData.id || `REQ-${Date.now()}`
      });
      await newReq.save();

      const auditEntry = new AuditLog({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adminName: 'Requester System',
        action: 'REQUEST_CREATED',
        targetEntity: `${newReq.patientName} (${newReq.bloodGroup})`,
        details: `Created emergency request for ${newReq.unitsNeeded} units of ${newReq.bloodGroup} at ${newReq.hospitalName}.`,
        status: 'SUCCESS'
      });
      await auditEntry.save();

      // Emit REQUEST_CREATED to admin-dashboard & portal clients
      socketHandler.broadcastAdminEvent('REQUEST_CREATED', {
        request: newReq,
        auditEntry
      });

      socketHandler.broadcastAdminEvent('newEmergencyRequest', {
        request: newReq,
        auditEntry
      });

      socketHandler.broadcastAdminEvent('adminNotification', {
        id: `notif-${Date.now()}`,
        title: '🚨 NEW CRITICAL REQUEST',
        message: `${newReq.bloodGroup} Blood Critical • ${newReq.hospitalName} (${newReq.unitsNeeded} Units)`,
        time: 'Just now',
        type: 'urgent'
      });

      res.json({ success: true, request: newReq });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Update Request Lifecycle Stage (REQUEST_CREATED -> HOSPITAL_RECEIVED -> BLOOD_BANK_RECEIVED -> DONORS_NOTIFIED -> BLOOD_RESERVED -> BLOOD_ISSUED -> COMPLETED)
  router.post('/emergency-requests/:id/stage', async (req, res) => {
    try {
      const { id } = req.params;
      const { stage, unitsReserved, unitsIssued, updatedBy = 'System' } = req.body;

      const updateData = { status: stage };
      if (typeof unitsReserved === 'number') updateData.confirmedUnits = unitsReserved;
      if (typeof unitsIssued === 'number') updateData.unitsFulfilled = unitsIssued;

      const reqObj = await EmergencyRequest.findOneAndUpdate({ id }, updateData, { new: true });

      const auditEntry = new AuditLog({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adminName: updatedBy,
        action: 'REQUEST_UPDATED',
        targetEntity: `${reqObj?.patientName || id} (${reqObj?.bloodGroup || ''})`,
        details: `Request stage advanced to ${stage}. Reserved: ${unitsReserved || 0}, Issued: ${unitsIssued || 0}.`,
        status: 'SUCCESS'
      });
      await auditEntry.save();

      // Socket Emit for Stage Lifecycle
      const eventName = stage === 'BLOOD_RESERVED' ? 'BLOOD_RESERVED' : stage === 'BLOOD_ISSUED' ? 'BLOOD_ISSUED' : 'REQUEST_UPDATED';
      socketHandler.broadcastAll(eventName, {
        requestId: id,
        stage,
        request: reqObj,
        unitsReserved,
        unitsIssued,
        auditEntry
      });

      socketHandler.broadcastAdminEvent('adminNotification', {
        id: `notif-${Date.now()}`,
        title: `📋 Request ${stage}`,
        message: `Request #${id} updated to ${stage}.`,
        time: 'Just now',
        type: 'info'
      });

      res.json({ success: true, request: reqObj, auditEntry });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Update Inventory Stock (Blood Bank)
  router.post('/inventory/update', async (req, res) => {
    try {
      const { bankId, bloodGroup, component, change, actionType = 'UPDATE', adminName = 'Super Admin' } = req.body;
      const stock = await BloodStock.findOneAndUpdate(
        { bankId, bloodGroup, component },
        { $inc: { available: change }, lastUpdated: new Date() },
        { upsert: true, new: true }
      );

      const auditEntry = new AuditLog({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adminName,
        action: actionType === 'ISSUE' ? 'BLOOD_ISSUED' : actionType === 'RESERVE' ? 'BLOOD_RESERVED' : 'INVENTORY_UPDATED',
        targetEntity: `${bloodGroup} (${component})`,
        details: `Bank ${bankId} stock ${actionType}: ${change > 0 ? '+' : ''}${change} units. Total available: ${stock.available}.`,
        status: 'SUCCESS'
      });
      await auditEntry.save();

      // Emit INVENTORY_UPDATED to admin-dashboard & clients
      socketHandler.broadcastAll('INVENTORY_UPDATED', {
        bankId,
        bloodGroup,
        component,
        change,
        stock,
        auditEntry
      });

      if (stock.available < 5) {
        socketHandler.broadcastAdminEvent('LOW_STOCK', {
          bloodGroup,
          component,
          available: stock.available,
          message: `🚨 Low Stock Warning: ${bloodGroup} (${component}) available stock is ${stock.available} units.`
        });
      }

      res.json({ success: true, stock, auditEntry });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. User Registration Endpoint
  router.post('/register', async (req, res) => {
    try {
      const userData = req.body;
      const newUser = new User({
        ...userData,
        id: userData.id || `USER-${Date.now()}`
      });
      await newUser.save();

      const auditEntry = new AuditLog({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adminName: 'Registration System',
        action: 'USER_REGISTERED',
        targetEntity: `${newUser.name} (${newUser.role.toUpperCase()})`,
        details: `New ${newUser.role} registered in ${newUser.city}. Status: ${newUser.status}.`,
        status: 'SUCCESS'
      });
      await auditEntry.save();

      // Emit USER_REGISTERED event
      const eventName = newUser.role === 'hospital' ? 'HOSPITAL_REGISTERED' : newUser.role === 'bloodbank' ? 'BLOOD_BANK_REGISTERED' : 'USER_REGISTERED';
      socketHandler.broadcastAdminEvent(eventName, {
        user: newUser,
        role: newUser.role,
        auditEntry
      });

      socketHandler.broadcastAdminEvent('adminNotification', {
        id: `notif-${Date.now()}`,
        title: `🆕 New ${newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)} Registration`,
        message: `${newUser.name} registered (${newUser.city}). Status: ${newUser.status}.`,
        time: 'Just now',
        type: 'info'
      });

      res.json({ success: true, user: newUser });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. GET Dynamic MongoDB Analytics Aggregations
  router.get('/analytics', async (req, res) => {
    try {
      const totalUsers = await User.countDocuments({});
      const totalDonors = await User.countDocuments({ role: 'donor' });
      const totalRequesters = await User.countDocuments({ role: 'requester' });
      const totalHospitals = await User.countDocuments({ role: 'hospital' });
      const totalBloodBanks = await User.countDocuments({ role: 'bloodbank' });
      const totalRequests = await EmergencyRequest.countDocuments({});
      const completedRequests = await EmergencyRequest.countDocuments({ status: 'COMPLETED' });
      const criticalRequests = await EmergencyRequest.countDocuments({ urgency: 'CRITICAL', status: { $ne: 'COMPLETED' } });

      const bloodGroupDemand = await EmergencyRequest.aggregate([
        { $group: { _id: '$bloodGroup', count: { $sum: 1 }, totalUnits: { $sum: '$unitsNeeded' } } }
      ]);

      const requestsByCity = await EmergencyRequest.aggregate([
        { $group: { _id: '$city', count: { $sum: 1 } } }
      ]);

      res.json({
        success: true,
        analytics: {
          totalUsers,
          totalDonors,
          totalRequesters,
          totalHospitals,
          totalBloodBanks,
          totalRequests,
          completedRequests,
          criticalRequests,
          completionRate: totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 100,
          bloodGroupDemand,
          requestsByCity
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. GET & POST System Settings
  router.get('/settings', async (req, res) => {
    try {
      let settings = await SystemSettings.findOne({ key: 'global_settings' }).lean();
      if (!settings) {
        settings = await SystemSettings.create({ key: 'global_settings' });
      }
      res.json({ success: true, settings });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  router.post('/settings', async (req, res) => {
    try {
      const updateData = req.body;
      const settings = await SystemSettings.findOneAndUpdate(
        { key: 'global_settings' },
        { ...updateData, updatedAt: new Date() },
        { upsert: true, new: true }
      );

      const auditEntry = new AuditLog({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adminName: updateData.updatedBy || 'Super Admin',
        action: 'SETTINGS_UPDATED',
        targetEntity: 'System Governance Rules',
        details: `Updated system rules: Low Stock Threshold = ${settings.lowStockThreshold}, Auto Broadcast = ${settings.autoBroadcastEmergency}.`,
        status: 'SUCCESS'
      });
      await auditEntry.save();

      socketHandler.broadcastAll('SETTINGS_UPDATED', {
        settings,
        auditEntry
      });

      res.json({ success: true, settings, auditEntry });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
