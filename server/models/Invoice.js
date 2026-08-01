import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true, unique: true }, // e.g. INV-2026-084
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  amount: { type: Number, required: true },
  lineItems: [
    {
      description: { type: String, required: true }, // e.g. Cardiology OPD Consultation Fee
      amount: { type: Number, required: true }
    }
  ],
  status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
  paymentDate: { type: Date },
  paymentMethod: { type: String } // e.g. Credit Card, UPI, Net Banking
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);
