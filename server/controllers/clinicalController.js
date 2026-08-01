import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Prescription from '../models/Prescription.js';
import TestReport from '../models/TestReport.js';
import { eventBus } from '../sse/eventBus.js';

// Get today's queue for doctor
export const getDoctorQueue = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email' } })
      .sort({ queuePosition: 1, createdAt: 1 });

    res.status(200).json({
      doctor,
      queue: appointments
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctor queue', error: err.message });
  }
};

// Get patient's full medical history
export const getPatientHistory = async (req, res) => {
  try {
    let patientId = req.params.patientId;

    let patient;
    if (patientId === 'my-history') {
      patient = await Patient.findOne({ userId: req.user._id }).populate('userId', 'name email');
    } else {
      patient = await Patient.findById(patientId).populate('userId', 'name email');
    }

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const records = await MedicalRecord.find({ patientId: patient._id })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });

    const prescriptions = await Prescription.find({ patientId: patient._id })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });

    const testReports = await TestReport.find({ patientId: patient._id })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });

    res.status(200).json({
      patient,
      records,
      prescriptions,
      testReports
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch patient history', error: err.message });
  }
};

// Add Medical Record / Diagnosis
export const createMedicalRecord = async (req, res) => {
  try {
    const { patientId, appointmentId, diagnosis, symptoms, vitals, clinicalNotes } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const num = Math.floor(10000 + Math.random() * 90000);
    const recordId = `REC-${num}`;

    const record = await MedicalRecord.create({
      recordId,
      patientId,
      doctorId: doctor._id,
      appointmentId,
      diagnosis,
      symptoms: Array.isArray(symptoms) ? symptoms : (symptoms ? symptoms.split(',').map(s => s.trim()) : []),
      vitals,
      clinicalNotes
    });

    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: 'completed' });
      eventBus.broadcast('queue:update', { appointmentId, status: 'completed' });
    }

    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create medical record', error: err.message });
  }
};

// Issue Prescription
export const createPrescription = async (req, res) => {
  try {
    const { patientId, appointmentId, medicines, notes } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const num = Math.floor(10000 + Math.random() * 90000);
    const prescriptionId = `RX-${num}`;

    const prescription = await Prescription.create({
      prescriptionId,
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentId,
      medicines: medicines || [],
      notes,
      status: 'active'
    });

    // Notify patient via SSE
    eventBus.emitToUser(patient.userId, 'prescription:issued', {
      prescriptionId: prescription.prescriptionId,
      patientId: patient.userId,
      count: medicines?.length || 0
    });

    res.status(201).json(prescription);
  } catch (err) {
    res.status(500).json({ message: 'Failed to issue prescription', error: err.message });
  }
};

// Attach Test Report
export const attachTestReport = async (req, res) => {
  try {
    const { patientId, title, notes } = req.body;

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No report file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const num = Math.floor(10000 + Math.random() * 90000);
    const reportId = `TR-${num}`;

    const report = await TestReport.create({
      reportId,
      patientId,
      doctorId: doctor._id,
      title: title || req.file.originalname,
      fileUrl,
      fileName: req.file.originalname,
      notes
    });

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: 'Failed to attach test report', error: err.message });
  }
};
