import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  prescriptionId: { type: String, required: true, unique: true }, // e.g. RX-8021
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  medicines: [
    {
      name: { type: String, required: true }, // e.g. Amoxicillin 500mg
      dosage: { type: String, required: true }, // e.g. 1 tablet
      frequency: { type: String, required: true }, // e.g. Twice daily (1-0-1)
      duration: { type: String, required: true }, // e.g. 5 days
      instructions: { type: String } // e.g. After meals
    }
  ],
  notes: { type: String },
  status: { type: String, enum: ['active', 'dispensed', 'expired'], default: 'active' },
  refillsAllowed: { type: Number, default: 1 }
}, { timestamps: true });

export default mongoose.model('Prescription', prescriptionSchema);
