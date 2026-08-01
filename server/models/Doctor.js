import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: String, required: true, unique: true }, // e.g. DOC-3021
  name: { type: String, required: true },
  specialization: { type: String, required: true }, // e.g. Cardiology, Neurology, General Medicine
  qualification: { type: String, required: true }, // e.g. MBBS, MD
  experienceYears: { type: Number, default: 0 },
  department: { type: String, required: true }, // e.g. Cardiology Ward, OPD-1, ICU-2
  consultationFee: { type: Number, required: true },
  availableDays: [{ type: String }], // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  roomNo: { type: String },
  rating: { type: Number, default: 4.9 }
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);
