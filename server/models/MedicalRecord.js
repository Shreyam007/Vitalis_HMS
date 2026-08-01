import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  recordId: { type: String, required: true, unique: true }, // e.g. REC-91024
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  diagnosis: { type: String, required: true },
  symptoms: [{ type: String }],
  vitals: {
    bloodPressure: { type: String, default: '120/80' }, // mmHg
    heartRate: { type: Number, default: 72 }, // bpm
    temperature: { type: Number, default: 98.6 }, // °F
    weightKg: { type: Number, default: 70 }, // kg
    oxygenSaturation: { type: Number, default: 98 } // %
  },
  clinicalNotes: { type: String },
  attachments: [{ type: String }], // File URLs
}, { timestamps: true });

export default mongoose.model('MedicalRecord', medicalRecordSchema);
