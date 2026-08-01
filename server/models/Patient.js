import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: String, required: true, unique: true }, // e.g. PAT-84920
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  phone: { type: String },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String }
  },
  allergies: [{ type: String }],
  preExistingConditions: [{ type: String }],
  wristbandCode: { type: String }
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);
