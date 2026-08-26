import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'global_settings' },
  lowStockThreshold: { type: Number, default: 5 },
  criticalStockThreshold: { type: Number, default: 2 },
  autoBroadcastEmergency: { type: Boolean, default: true },
  requireHospitalApproval: { type: Boolean, default: true },
  requireLicenseVerification: { type: Boolean, default: true },
  maxActiveRequestsPerRequester: { type: Number, default: 3 },
  donorCooldownDays: { type: Number, default: 90 },
  updatedAt: { type: Date, default: Date.now },
  updatedBy: { type: String, default: 'Super Admin' }
});

export const SystemSettings = mongoose.models.SystemSettings || mongoose.model('SystemSettings', systemSettingsSchema);
