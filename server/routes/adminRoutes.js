import express from 'express';
import { User } from '../models/User.js';
import { EmergencyRequest } from '../models/EmergencyRequest.js';
import { BloodStock } from '../models/BloodStock.js';
import { AuditLog } from '../models/AuditLog.js';
import { SystemSettings } from '../models/SystemSettings.js';
import { CampRegistration } from '../models/CampRegistration.js';
import { SystemEvent } from '../models/SystemEvent.js';
import { sendCampRegistrationConfirmation } from '../services/smsService.js';
import { campRepository } from '../services/campRepository.js';
import { isDBConnected } from '../db.js';

export function createAdminRouter(socketHandler) {
  const router = express.Router();

  // 1. GET Full Admin Snapshot from MongoDB & campRepository (Source of Truth)
  router.get('/snapshot', async (req, res) => {
    try {
      let users = [];
      let requests = [];
      let stocks = [];
      let auditLogs = [];
      let settings = { key: 'global_settings' };
      let campRegistrations = [];
      let systemEvents = [];
      let camps = await campRepository.getAllCamps();

      if (isDBConnected()) {
        try {
          users = await User.find({}).lean();
          requests = await EmergencyRequest.find({}).lean();
          stocks = await BloodStock.find({}).lean();
          auditLogs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(100).lean();
          const s = await SystemSettings.findOne({ key: 'global_settings' }).lean();
          if (s) settings = s;
          campRegistrations = await CampRegistration.find({}).sort({ createdAt: -1 }).lean();
          systemEvents = await SystemEvent.find({}).sort({ createdAt: -1 }).lean();
        } catch (dbErr) {
          console.warn('[API /snapshot DB warning]', dbErr.message);
        }
      }

      res.json({
        success: true,
        data: {
          users,
          requests,
          stocks,
          auditLogs,
          settings,
          camps,
          campRegistrations,
          systemEvents,
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

  // 3. Create Emergency Request (MongoDB + Real-time Socket Emit + Automatic Matching Engine)
  router.post('/emergency-requests', async (req, res) => {
    try {
      const reqData = req.body;
      
      // Dynamic Request ID Generation: e.g. BR-2026-000125
      const totalCount = await EmergencyRequest.countDocuments({});
      const dynamicId = reqData.id || `BR-2026-${String(totalCount + 125).padStart(6, '0')}`;

      // Automatic matching against donors & blood stocks
      let matchingDonors = [];
      let matchingStocks = [];
      try {
        matchingDonors = await User.find({
          role: 'donor',
          bloodGroup: reqData.bloodGroup
        }).lean();
        matchingStocks = await BloodStock.find({
          bloodGroup: reqData.bloodGroup,
          available: { $gt: 0 }
        }).lean();
      } catch (e) {
        console.warn('[Matching Query Warning]', e.message);
      }

      const matchedDonorsCount = matchingDonors.length > 0 ? matchingDonors.length : (reqData.matchedDonorsCount || 4);

      const newReq = new EmergencyRequest({
        ...reqData,
        id: dynamicId,
        matchedDonorsCount,
        status: reqData.status || (reqData.isVerifiedByHospital ? 'VERIFIED_SEARCHING_DONORS' : 'PENDING_HOSPITAL_APPROVAL'),
        requestedAt: reqData.requestedAt || `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        deadline: reqData.deadline || `${reqData.requiredDate || new Date().toISOString().split('T')[0]} ${reqData.requiredTime || '06:00 PM'}`
      });

      await newReq.save();

      const auditEntry = new AuditLog({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adminName: reqData.contactPerson || 'Requester System',
        action: 'REQUEST_CREATED',
        targetEntity: `${newReq.patientName} (${newReq.bloodGroup})`,
        details: `Created emergency request #${newReq.id} for ${newReq.unitsNeeded} units of ${newReq.bloodGroup} (${newReq.bloodComponent}) at ${newReq.hospitalName}. Priority: ${newReq.urgency}.`,
        status: 'SUCCESS'
      });
      await auditEntry.save();

      // Broadcast Socket.IO Events across all connected clients & rooms
      socketHandler.broadcastAll('REQUEST_CREATED', {
        request: newReq,
        auditEntry,
        matchedDonorsCount
      });

      socketHandler.broadcastAdminEvent('newEmergencyRequest', {
        request: newReq,
        auditEntry
      });

      socketHandler.broadcastAdminEvent('adminNotification', {
        id: `notif-${Date.now()}`,
        title: `🚨 EMERGENCY REQUEST (${newReq.id})`,
        message: `${newReq.patientName} needs ${newReq.unitsNeeded} Units of ${newReq.bloodGroup} (${newReq.bloodComponent}) at ${newReq.hospitalName} • Priority: ${newReq.urgency}`,
        time: 'Just now',
        type: 'urgent',
        requestId: newReq.id
      });

      res.json({
        success: true,
        request: newReq,
        auditEntry,
        matchingSummary: {
          matchedDonorsCount,
          matchingStocksCount: matchingStocks.length
        }
      });
    } catch (err) {
      console.error('[Create Emergency Request Error]', err);
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

  // 9. Camp Participant Registration Endpoint (with DB save, capacity check, duplicate protection, SMS dispatch & real-time broadcast)
  router.post('/camps/register', async (req, res) => {
    try {
      const regData = req.body;
      const { campId, phoneNumber, email, participantUserId, fullName, bloodGroup, age, city } = regData;

      if (!campId || !phoneNumber || !fullName || !bloodGroup || !age || !city) {
        return res.status(400).json({
          success: false,
          message: 'Missing required registration fields. Please complete all required fields.'
        });
      }

      // Phone Normalization & Validation
      const cleanPhoneDigits = String(phoneNumber).replace(/\D/g, '');
      if (cleanPhoneDigits.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid 10-digit mobile number.'
        });
      }
      const normalizedPhoneNumber = cleanPhoneDigits;

      // Camp Capacity Check
      const maxCapacity = regData.expectedDonors || 100;
      const activeCount = await CampRegistration.countDocuments({
        campId,
        registrationStatus: { $in: ['REGISTERED', 'CONFIRMED', 'ATTENDED', 'COMPLETED'] }
      });

      if (activeCount >= maxCapacity) {
        return res.status(400).json({
          success: false,
          message: 'This camp is currently full.'
        });
      }

      // Duplicate Check: Check if participant is already registered for this camp
      const duplicateQuery = {
        campId,
        registrationStatus: { $in: ['REGISTERED', 'CONFIRMED', 'ATTENDED', 'COMPLETED'] },
        $or: [
          { phoneNumber: normalizedPhoneNumber }
        ]
      };

      if (email && email.trim()) duplicateQuery.$or.push({ email: email.trim().toLowerCase() });
      if (participantUserId && participantUserId.trim()) duplicateQuery.$or.push({ participantUserId: participantUserId.trim() });

      let existingReg = await CampRegistration.findOne(duplicateQuery).lean();
      if (existingReg) {
        return res.status(409).json({
          success: false,
          isDuplicate: true,
          registration: existingReg,
          message: 'You are already registered for this camp.'
        });
      }

      // Dynamic Registration ID Generation: e.g. BDC-2026-000125
      const totalRegs = await CampRegistration.countDocuments({});
      const dynamicRegId = regData.registrationId || `BDC-2026-${String(totalRegs + 125).padStart(6, '0')}`;

      // 1. SAVE TO DATABASE FIRST
      const newRegistration = new CampRegistration({
        ...regData,
        registrationId: dynamicRegId,
        phoneNumber: normalizedPhoneNumber,
        email: regData.email ? regData.email.trim().toLowerCase() : '',
        registrationStatus: 'REGISTERED',
        createdAt: new Date()
      });

      await newRegistration.save();

      // 2. CONFIRM DATABASE SAVE SUCCESS BEFORE ATTEMPTING SMS DISPATCH
      let smsResult = { success: false, status: 'FAILED', message: 'SMS delivery not attempted.' };
      try {
        smsResult = await sendCampRegistrationConfirmation({
          phoneNumber: normalizedPhoneNumber,
          fullName: regData.fullName,
          campTitle: regData.campTitle || regData.campName || 'Blood Donation Camp',
          campDate: regData.campDate || '15 Oct 2026',
          campTime: regData.campTime || '9:00 AM - 4:00 PM',
          campVenue: regData.campVenue || regData.venue || 'Hospital / Venue',
          city: regData.city || 'Bengaluru',
          registrationId: dynamicRegId
        });
      } catch (smsErr) {
        console.error('[SMS Delivery Warning]', smsErr.message);
        smsResult = {
          success: false,
          status: 'FAILED',
          error: smsErr.message || 'Confirmation SMS could not be delivered.'
        };
      }

      const auditEntry = new AuditLog({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adminName: regData.fullName,
        action: 'CAMP_REGISTRATION_CREATED',
        targetEntity: `${regData.fullName} (${regData.bloodGroup})`,
        details: `Registered for camp (ID: ${dynamicRegId}). SMS Status: ${smsResult.status}.`,
        status: 'SUCCESS'
      });
      await auditEntry.save();

      const updatedRsvps = await campRepository.incrementRsvpsCount(campId, 1);
      const updatedCamp = await campRepository.getCampById(campId);

      // Emit Socket.IO event to update participant counts in real time across all connected clients
      socketHandler.broadcastAll('CAMP_REGISTRATION_CREATED', {
        campId,
        registration: newRegistration,
        rsvpsCount: updatedRsvps,
        camp: updatedCamp,
        auditEntry
      });

      res.json({
        success: true,
        registration: newRegistration,
        smsStatus: smsResult.status,
        smsMessage: smsResult.message || smsResult.error,
        auditEntry,
        rsvpsCount: updatedRsvps,
        message: 'Registration Successful! 🎉'
      });
    } catch (err) {
      console.error('[Camp Registration Error]', err);
      res.status(500).json({ success: false, error: err.message || 'We couldn\'t complete your registration. Please try again.' });
    }
  });

  // 10. GET All Camp Registrations (For Admin / Organizer View)
  router.get('/camps/registrations', async (req, res) => {
    try {
      const { campId } = req.query;
      const query = campId ? { campId } : {};
      let registrations = [];
      if (isDBConnected()) {
        try {
          registrations = await CampRegistration.find(query).sort({ createdAt: -1 }).lean();
        } catch (dbErr) {
          console.warn('[camps/registrations DB error]', dbErr.message);
        }
      }
      res.json({ success: true, registrations });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 11. Cancel Camp Registration Endpoint
  router.post('/camps/registrations/:id/cancel', async (req, res) => {
    try {
      const { id } = req.params;
      let updated = null;
      if (isDBConnected()) {
        try {
          updated = await CampRegistration.findOneAndUpdate(
            { $or: [{ registrationId: id }, { _id: id }] },
            { registrationStatus: 'CANCELLED', updatedAt: new Date() },
            { new: true }
          );
        } catch (e) {}
      }

      const campId = updated?.campId || req.body.campId;
      const updatedRsvps = campId ? await campRepository.incrementRsvpsCount(campId, -1) : 0;
      const updatedCamp = campId ? await campRepository.getCampById(campId) : null;

      socketHandler.broadcastAll('CAMP_REGISTRATION_CANCELLED', {
        registrationId: id,
        campId,
        rsvpsCount: updatedRsvps,
        camp: updatedCamp,
        registration: updated
      });

      res.json({ success: true, registration: updated, rsvpsCount: updatedRsvps, message: 'Camp registration cancelled.' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // =========================================================================
  // 11B. BLOOD DONATION CAMPS FULL CRUD API (HOSPITAL, BLOOD BANK & PUBLIC)
  // =========================================================================

  // GET /api/camps - Get all camps (public or filtered)
  router.get('/camps', async (req, res) => {
    try {
      const { status, organizerType, organizerId, search } = req.query;
      const filter = {};
      if (status) {
        if (status === 'PUBLIC') {
          filter.status = { $in: ['PUBLISHED', 'UPCOMING'] };
        } else {
          filter.status = status;
        }
      }
      if (organizerType && organizerType !== 'ALL') {
        filter.organizerType = organizerType;
      }
      if (organizerId) {
        filter.organizerId = organizerId;
      }

      let camps = await campRepository.getAllCamps(filter);

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        camps = camps.filter(c =>
          c.title?.toLowerCase().includes(q) ||
          c.venue?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.organizer?.toLowerCase().includes(q)
        );
      }

      res.json({ success: true, count: camps.length, camps });
    } catch (err) {
      console.error('[GET /api/camps error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/camps/:id - Get single camp details
  router.get('/camps/:id', async (req, res) => {
    try {
      const camp = await campRepository.getCampById(req.params.id);
      if (!camp) {
        return res.status(404).json({ success: false, message: 'Camp not found.' });
      }
      res.json({ success: true, camp });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/camps - Create and publish a camp (Hospital or Blood Bank)
  router.post('/camps', async (req, res) => {
    try {
      const campData = req.body;
      const { title, date, venue, city, organizerId, organizer, organizerType } = campData;

      if (!title || !date || !venue || !city) {
        return res.status(400).json({
          success: false,
          message: 'Please complete all required fields: Camp Name, Date, Venue, and City.'
        });
      }
      if (!organizerId || !organizer) {
        return res.status(400).json({
          success: false,
          message: 'Organizer authentication details are missing. Please sign in.'
        });
      }

      const createdCamp = await campRepository.createCamp({
        ...campData,
        organizerType: organizerType || 'Hospital',
        status: campData.status || 'PUBLISHED'
      });

      // Audit Log
      const auditEntry = new AuditLog({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adminName: organizer,
        action: 'CAMP_CREATED',
        targetEntity: `${createdCamp.title} (${createdCamp.campId})`,
        details: `Organized by ${organizer} (${createdCamp.organizerType}) scheduled for ${createdCamp.date} at ${createdCamp.venue}, ${createdCamp.city}.`,
        status: 'SUCCESS'
      });
      if (isDBConnected()) {
        try { await auditEntry.save(); } catch (e) {}
      }

      // Broadcast real-time event to all connected clients (Home Page, Portals, Admin)
      socketHandler.broadcastAll('CAMP_CREATED', {
        camp: createdCamp,
        auditEntry
      });

      res.status(201).json({
        success: true,
        camp: createdCamp,
        message: `Camp "${createdCamp.title}" published successfully! Real-time sync complete.`
      });
    } catch (err) {
      console.error('[POST /api/camps error]', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // PUT /api/camps/:id - Edit/Update an existing camp
  router.put('/camps/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const user = req.body.user || { id: updateData.organizerId, name: updateData.organizer, role: req.body.role };

      const updatedCamp = await campRepository.updateCamp(id, updateData, user);

      // Broadcast update
      socketHandler.broadcastAll('CAMP_UPDATED', {
        campId: id,
        camp: updatedCamp
      });

      res.json({
        success: true,
        camp: updatedCamp,
        message: `Camp "${updatedCamp.title}" updated successfully.`
      });
    } catch (err) {
      console.error('[PUT /api/camps error]', err);
      res.status(err.message?.includes('Unauthorized') ? 403 : 500).json({ success: false, error: err.message });
    }
  });

  // POST /api/camps/:id/cancel - Cancel a camp
  router.post('/camps/:id/cancel', async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, user } = req.body;

      const cancelledCamp = await campRepository.cancelCamp(id, reason, user);

      // Broadcast cancellation
      socketHandler.broadcastAll('CAMP_CANCELLED', {
        campId: id,
        camp: cancelledCamp,
        reason: reason || 'Cancelled by Organizer'
      });

      res.json({
        success: true,
        camp: cancelledCamp,
        message: `Camp "${cancelledCamp.title}" has been cancelled.`
      });
    } catch (err) {
      console.error('[POST /api/camps/:id/cancel error]', err);
      res.status(err.message?.includes('Unauthorized') ? 403 : 500).json({ success: false, error: err.message });
    }
  });

  // 12. GET All Published System Events & Announcements
  router.get('/events', async (req, res) => {
    try {
      let events = await SystemEvent.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
      
      // Seed initial events if database has none
      if (!events || events.length === 0) {
        const seedData = [
          {
            id: "EVT-2026-000101",
            title: "Mega Independence Day Voluntary Blood Drive",
            category: "Blood Donation Camp",
            description: "Annual voluntary blood donation drive organized by Rotary Club & KIMS Blood Bank. Digital donor certificate and health checkup provided.",
            date: "2026-08-15",
            time: "09:00 AM - 04:00 PM",
            location: "KLE Technological University Campus, Vidyanagar",
            venue: "KLE Tech Auditorium",
            city: "Hubballi",
            organizer: "Rotary Club & KIMS Blood Bank",
            status: "Upcoming",
            isPublished: true,
            publishedAt: new Date().toISOString()
          },
          {
            id: "EVT-2026-000102",
            title: "National Blood Donation Awareness Week",
            category: "BloodNet Announcement",
            description: "BloodNet is organizing district-wide awareness programs, college seminars, and community pledge drives across Karnataka.",
            date: "2026-10-01",
            time: "Full Day",
            location: "Karnataka Regional Centers",
            venue: "Regional Healthcare Centers",
            city: "Bengaluru",
            organizer: "BloodNet Central Directorate",
            status: "Published",
            isPublished: true,
            publishedAt: new Date().toISOString()
          },
          {
            id: "EVT-2026-000103",
            title: "Rare Blood Group (O- / Bombay Phenotype) Registry Meet",
            category: "Health Awareness",
            description: "Specialized interactive session for registered universal donors and rare blood group volunteers.",
            date: "2026-10-15",
            time: "10:00 AM - 01:00 PM",
            location: "KIMS Auditorium, Hubballi",
            venue: "Main Conference Hall",
            city: "Hubballi",
            organizer: "KIMS Regional Blood Center",
            status: "Upcoming",
            isPublished: true,
            publishedAt: new Date().toISOString()
          }
        ];
        await SystemEvent.insertMany(seedData);
        events = seedData;
      }

      res.json({ success: true, events });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 13. Create or Update System Event / Announcement (Admin Endpoint)
  router.post('/events', async (req, res) => {
    try {
      const eventData = req.body;
      const count = await SystemEvent.countDocuments({});
      const dynamicId = eventData.id || `EVT-2026-${String(count + 101).padStart(6, '0')}`;

      const savedEvent = await SystemEvent.findOneAndUpdate(
        { id: dynamicId },
        {
          ...eventData,
          id: dynamicId,
          isPublished: eventData.isPublished !== undefined ? eventData.isPublished : true,
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );

      const auditEntry = new AuditLog({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        adminName: eventData.createdBy || 'Super Admin',
        action: 'EVENT_PUBLISHED',
        targetEntity: `${savedEvent.title} (${savedEvent.category})`,
        details: `Published event/announcement "${savedEvent.title}" for ${savedEvent.city}.`,
        status: 'SUCCESS'
      });
      await auditEntry.save();

      // Emit Socket.IO event to update all clients in real time
      socketHandler.broadcastAll('EVENT_UPDATED', {
        event: savedEvent,
        auditEntry
      });

      res.json({ success: true, event: savedEvent, auditEntry });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 14. Change Event Status (Publish / Unpublish / Cancel / Archive)
  router.post('/events/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, isPublished, adminName = 'Super Admin' } = req.body;

      const updated = await SystemEvent.findOneAndUpdate(
        { id },
        { 
          status: status || 'Published', 
          isPublished: isPublished !== undefined ? isPublished : true,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Event not found.' });
      }

      socketHandler.broadcastAll('EVENT_UPDATED', {
        event: updated
      });

      res.json({ success: true, event: updated });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}

