import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: String, required: true },
  adminName: { type: String, required: true },
  action: { type: String, required: true },
  targetEntity: { type: String, required: true },
  details: { type: String, required: true },
  status: { type: String, enum: ['SUCCESS', 'WARNING', 'FAILED'], default: 'SUCCESS' },
  createdAt: { type: Date, default: Date.now }
});

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
