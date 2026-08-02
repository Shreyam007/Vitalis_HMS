import mongoose from 'mongoose';

const exportLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dataset: {
    type: String,
    enum: ['appointments', 'patients', 'doctors'],
    required: true
  },
  startDate: {
    type: String,
    default: ''
  },
  endDate: {
    type: String,
    default: ''
  },
  recordCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const ExportLog = mongoose.model('ExportLog', exportLogSchema);
export default ExportLog;
