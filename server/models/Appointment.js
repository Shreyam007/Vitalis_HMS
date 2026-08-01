import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  appointmentId: { type: String, required: true, unique: true }, // e.g. APT-92041
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  slotTime: { type: String, required: true }, // e.g. "10:30 AM"
  specialization: { type: String, required: true },
  chiefComplaint: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  queuePosition: { type: Number },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);
