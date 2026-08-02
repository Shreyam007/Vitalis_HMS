import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import ExportLog from '../models/ExportLog.js';

// Helper to calculate age from DOB
const calculateAge = (dobString) => {
  if (!dobString) return 'N/A';
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 'N/A';
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// Helper to escape CSV field values
const escapeCSV = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

// Admin: Get overview stats
export const getAdminOverview = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const pendingConfirmations = await Appointment.countDocuments({ status: 'pending' });
    const completedVisits = await Appointment.countDocuments({ status: 'completed' });

    // Department Breakdown
    const deptBreakdown = await Doctor.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } }
    ]);

    // Recent pending appointments
    const recentPending = await Appointment.find({ status: 'pending' })
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name' } })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .limit(5)
      .sort({ createdAt: -1 });

    res.status(200).json({
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        pendingConfirmations,
        completedVisits,
        totalRevenue: completedVisits * 150
      },
      deptBreakdown,
      recentPending
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch admin overview', error: err.message });
  }
};

// Admin: Get 24h Export Stats
export const getExportStats = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const totalExports24h = await ExportLog.countDocuments({ timestamp: { $gte: twentyFourHoursAgo } });
    res.status(200).json({ totalExports24h });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch export stats', error: err.message });
  }
};

// Admin: CRUD Doctors & Patients
export const getAllDoctorsAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'name email createdAt');
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctor directory', error: err.message });
  }
};

export const getAllPatientsAdmin = async (req, res) => {
  try {
    const patients = await Patient.find().populate('userId', 'name email createdAt');
    res.status(200).json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch patient directory', error: err.message });
  }
};

export const createDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, qualification, experienceYears, department, consultationFee, roomNo, availableDays } = req.body;

    if (!name || !email || !password || !specialization || !department) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'doctor'
    });

    const num = Math.floor(1000 + Math.random() * 9000);
    const doctorId = `DOC-${num}`;

    const doctor = await Doctor.create({
      userId: user._id,
      doctorId,
      name,
      specialization,
      qualification,
      experienceYears: experienceYears || 5,
      department,
      consultationFee: consultationFee || 150,
      roomNo: roomNo || 'Room 101',
      availableDays: availableDays || ['Mon', 'Wed', 'Fri']
    });

    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create doctor', error: err.message });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization, qualification, experienceYears, department, consultationFee, roomNo, availableDays } = req.body;

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    if (name) {
      doctor.name = name;
      await User.findByIdAndUpdate(doctor.userId, { name });
    }

    doctor.specialization = specialization || doctor.specialization;
    doctor.qualification = qualification || doctor.qualification;
    doctor.experienceYears = experienceYears ?? doctor.experienceYears;
    doctor.department = department || doctor.department;
    doctor.consultationFee = consultationFee ?? doctor.consultationFee;
    doctor.roomNo = roomNo || doctor.roomNo;
    doctor.availableDays = availableDays || doctor.availableDays;

    await doctor.save();
    res.status(200).json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update doctor', error: err.message });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    await User.findByIdAndDelete(doctor.userId);
    await Doctor.findByIdAndDelete(id);

    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete doctor', error: err.message });
  }
};

// Admin: CSV Exporter - Appointments Log
export const exportAppointmentsCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate && endDate) {
      const startD = new Date(startDate);
      const endD = new Date(endDate + 'T23:59:59.999Z');
      query.$or = [
        { date: { $gte: startDate, $lte: endDate } },
        { createdAt: { $gte: startD, $lte: endD } }
      ];
    }

    const appointments = await Appointment.find(query)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name' } })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });

    const filename = `vitalis_appointments_${startDate || 'all'}_${endDate || 'time'}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Record-Count', appointments.length);

    // UTF-8 BOM
    res.write('\uFEFF');

    // Header Row
    const headers = ['#', 'Appointment ID', 'Patient Name', 'Patient ID', 'Doctor', 'Department', 'Date', 'Time', 'Status', 'Complaint'];
    res.write(headers.map(escapeCSV).join(',') + '\n');

    // Data Rows
    appointments.forEach((apt, idx) => {
      const row = [
        idx + 1,
        apt.appointmentId || '',
        apt.patientId?.userId?.name || 'Patient',
        apt.patientId?.patientId || '',
        apt.doctorId?.name || 'Doctor',
        apt.specialization || apt.doctorId?.department || 'General',
        apt.date || '',
        apt.slotTime || '',
        (apt.status || '').toUpperCase(),
        apt.chiefComplaint || ''
      ];
      res.write(row.map(escapeCSV).join(',') + '\n');
    });

    res.end();

    // Log export
    await ExportLog.create({
      adminUserId: req.user._id,
      dataset: 'appointments',
      startDate: startDate || '',
      endDate: endDate || '',
      recordCount: appointments.length
    });
  } catch (err) {
    console.error('Export appointments error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to export appointments CSV' });
    }
  }
};

// Admin: CSV Exporter - Patient Master Index
export const exportPatientsCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate && endDate) {
      const startD = new Date(startDate);
      const endD = new Date(endDate + 'T23:59:59.999Z');
      query.createdAt = { $gte: startD, $lte: endD };
    }

    const patients = await Patient.find(query)
      .populate('userId', 'name email createdAt')
      .sort({ createdAt: -1 });

    const filename = `vitalis_patients_${startDate || 'all'}_${endDate || 'time'}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Record-Count', patients.length);

    // UTF-8 BOM
    res.write('\uFEFF');

    // Header Row
    const headers = ['#', 'Patient ID', 'Full Name', 'Age', 'Gender', 'Blood Group', 'Contact', 'Registered On'];
    res.write(headers.map(escapeCSV).join(',') + '\n');

    // Data Rows
    patients.forEach((pat, idx) => {
      const regDate = pat.userId?.createdAt ? new Date(pat.userId.createdAt).toISOString().split('T')[0] : '';
      const row = [
        idx + 1,
        pat.patientId || '',
        pat.userId?.name || 'Patient',
        calculateAge(pat.dateOfBirth),
        (pat.gender || '').toUpperCase(),
        pat.bloodGroup || 'N/A',
        pat.phone || 'N/A',
        regDate
      ];
      res.write(row.map(escapeCSV).join(',') + '\n');
    });

    res.end();

    // Log export
    await ExportLog.create({
      adminUserId: req.user._id,
      dataset: 'patients',
      startDate: startDate || '',
      endDate: endDate || '',
      recordCount: patients.length
    });
  } catch (err) {
    console.error('Export patients error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to export patients CSV' });
    }
  }
};

// Admin: CSV Exporter - Physician Staff Roster
export const exportDoctorsCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate && endDate) {
      const startD = new Date(startDate);
      const endD = new Date(endDate + 'T23:59:59.999Z');
      query.createdAt = { $gte: startD, $lte: endD };
    }

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const filename = `vitalis_doctors_${startDate || 'all'}_${endDate || 'time'}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Record-Count', doctors.length);

    // UTF-8 BOM
    res.write('\uFEFF');

    // Header Row
    const headers = ['#', 'Doctor ID', 'Name', 'Specialization', 'Department', 'Room', 'Consultation Fee', 'Availability'];
    res.write(headers.map(escapeCSV).join(',') + '\n');

    // Data Rows
    doctors.forEach((doc, idx) => {
      const avail = doc.availableDays?.length > 0 ? doc.availableDays.join('/') : 'Mon-Fri';
      const row = [
        idx + 1,
        doc.doctorId || '',
        doc.name || '',
        doc.specialization || '',
        doc.department || '',
        doc.roomNo || '',
        `₹${doc.consultationFee || 0}`,
        avail
      ];
      res.write(row.map(escapeCSV).join(',') + '\n');
    });

    res.end();

    // Log export
    await ExportLog.create({
      adminUserId: req.user._id,
      dataset: 'doctors',
      startDate: startDate || '',
      endDate: endDate || '',
      recordCount: doctors.length
    });
  } catch (err) {
    console.error('Export doctors error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to export doctors CSV' });
    }
  }
};
