import express from 'express';
import { User } from '../models/User.js';
import { EmergencyRequest } from '../models/EmergencyRequest.js';
import { BloodStock } from '../models/BloodStock.js';
import { AuditLog } from '../models/AuditLog.js';

export function createAdminRouter(socketHandler) {
  const router = express.Router();

  // 1. GET Full Admin Snapshot from MongoDB (Database Source of Truth)
  router.get('/snapshot', async (req, res) => {
    try {
      let users = await User.find({}).lean();
      let requests = await EmergencyRequest.find({}).lean();
      let stocks = await BloodStock.find({}).lean();
      let auditLogs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(50).lean();

      res.json({
        success: true,
        data: {
          users,
          requests,
          stocks,
          auditLogs,
          onlineUsersCount: socketHandler.getOnlineCount()
        }
      });
    } catch (err) {
      console.error('[API /snapshot error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 2. Account Status Update (Approve / Suspend / Verify)
  router.post('/accounts/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminName = 'Super Admin' } = req.body;

      const user = await User.findOneAndUpdate({ id }, { status }, { new: true });
      
      const auditEntry = new AuditLog({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adminName,
        action: status === 'Verified' ? 'ACCOUNT_APPROVED' : 'ACCOUNT_SUSPENDED',
        targetEntity: user ? `${user.name} (${user.role.toUpperCase()})` : id,
        details: `Updated account verification status to ${status}.`,
        status: status === 'Verified' ? 'SUCCESS' : 'WARNING'
      });
      await auditEntry.save();

      // Socket.IO Real-Time Emit to admin-dashboard
      socketHandler.broadcastAdminEvent('accountStatusUpdated', {
        userId: id,
        status,
        user,
        auditEntry
      });

      socketHandler.broadcastAdminEvent('adminNotification', {
        id: `notif-${Date.now()}`,
        title: status === 'Verified' ? '🏥 Account Verified' : '⚠️ Account Suspended',
        message: `${user?.name || id} status updated to ${status}.`,
        time: 'Just now',
        type: status === 'Verified' ? 'success' : 'warning'
      });

      res.json({ success: true, user, auditEntry });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Create New Emergency Request (MongoDB + Socket.IO)
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
        action: 'EMERGENCY_REQUEST_CREATED',
        targetEntity: `${newReq.patientName} (${newReq.bloodGroup})`,
        details: `New emergency request created at ${newReq.hospitalName}.`,
        status: 'SUCCESS'
      });
      await auditEntry.save();

      // Emit real-time Socket.IO event to admin-dashboard
      socketHandler.broadcastAdminEvent('newEmergencyRequest', {
        request: newReq,
        auditEntry
      });

      socketHandler.broadcastAdminEvent('adminNotification', {
        id: `notif-${Date.now()}`,
        title: '🚨 New Emergency Request',
        message: `${newReq.bloodGroup} Blood Critical • ${newReq.hospitalName} (${newReq.unitsNeeded} Units)`,
        time: 'Just now',
        type: 'urgent'
      });

      res.json({ success: true, request: newReq });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 4. Update Blood Stock Inventory
  router.post('/inventory/update', async (req, res) => {
    try {
      const { bankId, bloodGroup, component, change, adminName = 'Super Admin' } = req.body;
      const stock = await BloodStock.findOneAndUpdate(
        { bankId, bloodGroup, component },
        { $inc: { available: change }, lastUpdated: new Date() },
        { upsert: true, new: true }
      );

      const auditEntry = new AuditLog({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adminName,
        action: 'BLOOD_STOCK_UPDATED',
        targetEntity: `${bloodGroup} (${component})`,
        details: `Stock changed by ${change > 0 ? '+' : ''}${change} units.`,
        status: 'SUCCESS'
      });
      await auditEntry.save();

      // Emit real-time Socket.IO event to admin-dashboard
      socketHandler.broadcastAdminEvent('bloodStockUpdated', {
        bankId,
        bloodGroup,
        component,
        change,
        stock,
        auditEntry
      });

      if (stock.available < 5) {
        socketHandler.broadcastAdminEvent('lowStockAlert', {
          bloodGroup,
          component,
          available: stock.available,
          message: `🚨 Critical Stock Warning: ${bloodGroup} (${component}) is down to ${stock.available} units!`
        });
      }

      res.json({ success: true, stock, auditEntry });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Register New User Account
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

      // Socket.IO Emit
      socketHandler.broadcastAdminEvent('newRegistration', {
        user: newUser,
        role: newUser.role,
        auditEntry
      });

      socketHandler.broadcastAdminEvent('adminNotification', {
        id: `notif-${Date.now()}`,
        title: `👤 New ${newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)} Registration`,
        message: `${newUser.name} registered (${newUser.city}). Status: ${newUser.status}.`,
        time: 'Just now',
        type: 'info'
      });

      res.json({ success: true, user: newUser });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
