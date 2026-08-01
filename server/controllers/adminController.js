import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';

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

// Admin: CRUD Doctors
export const getAllDoctorsAdmin = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('userId', 'name email createdAt');
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctor directory', error: err.message });
  }
};

export const createDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, qualification, experienceYears, department, consultationFee, roomNo, availableDays } = req.body;

    if (!name || !email || !password || !specialization || !department) {
      return res.status(400).json({ message: 'Name, email, password, specialization, and department are required.' });
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

    const docNum = Math.floor(1000 + Math.random() * 9000);
    const doctorId = `DOC-${docNum}`;

    const doctor = await Doctor.create({
      userId: user._id,
      doctorId,
      name,
      specialization,
      qualification: qualification || 'MD',
      experienceYears: experienceYears || 5,
      department,
      consultationFee: consultationFee || 150,
      roomNo: roomNo || `Room ${docNum}`,
      availableDays: availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    });

    res.status(201).json({ message: 'Doctor created successfully', doctor });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create doctor profile', error: err.message });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const { name, specialization, qualification, experienceYears, department, consultationFee, roomNo } = req.body;

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    if (name) doctor.name = name;
    if (specialization) doctor.specialization = specialization;
    if (qualification) doctor.qualification = qualification;
    if (experienceYears) doctor.experienceYears = experienceYears;
    if (department) doctor.department = department;
    if (consultationFee) doctor.consultationFee = consultationFee;
    if (roomNo) doctor.roomNo = roomNo;

    await doctor.save();

    if (name) {
      await User.findByIdAndUpdate(doctor.userId, { name });
    }

    res.status(200).json({ message: 'Doctor updated successfully', doctor });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update doctor', error: err.message });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    await User.findByIdAndDelete(doctor.userId);
    await Doctor.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete doctor', error: err.message });
  }
};

// Admin: Patients Directory
export const getAllPatientsAdmin = async (req, res) => {
  try {
    const patients = await Patient.find().populate('userId', 'name email createdAt');
    res.status(200).json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch patient directory', error: err.message });
  }
};

// Admin: CSV Reports Export
export const exportReportCSV = async (req, res) => {
  try {
    const { reportType } = req.query; // 'appointments' | 'patients' | 'doctors'
    let csvData = '';

    if (reportType === 'doctors') {
      const doctors = await Doctor.find();
      csvData = 'Doctor ID,Name,Specialization,Department,Fee,Rating\n' +
        doctors.map(d => `"${d.doctorId}","${d.name}","${d.specialization}","${d.department}",${d.consultationFee},${d.rating}`).join('\n');
    } else if (reportType === 'patients') {
      const patients = await Patient.find().populate('userId', 'name email');
      csvData = 'Patient ID,Name,Email,Blood Group,Phone,Wristband Code\n' +
        patients.map(p => `"${p.patientId}","${p.userId?.name || ''}","${p.userId?.email || ''}","${p.bloodGroup || ''}","${p.phone || ''}","${p.wristbandCode || ''}"`).join('\n');
    } else {
      const appointments = await Appointment.find()
        .populate({ path: 'patientId', populate: { path: 'userId', select: 'name' } })
        .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } });
      csvData = 'Appointment ID,Patient,Doctor,Specialization,Date,Slot,Status\n' +
        appointments.map(a => `"${a.appointmentId}","${a.patientId?.userId?.name || ''}","${a.doctorId?.name || ''}","${a.specialization}","${a.date}","${a.slotTime}","${a.status}"`).join('\n');
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="vitalis-${reportType || 'report'}.csv"`);
    res.status(200).send(csvData);
  } catch (err) {
    res.status(500).json({ message: 'CSV export failed', error: err.message });
  }
};
