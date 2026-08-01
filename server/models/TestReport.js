import mongoose from 'mongoose';

const testReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true }, // e.g. TR-5491
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  title: { type: String, required: true }, // e.g. Blood Work / Lipid Profile / Chest X-Ray
  category: { type: String, default: 'Lab Test' },
  fileUrl: { type: String, required: true },
  fileName: { type: String },
  notes: { type: String },
  uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('TestReport', testReportSchema);
