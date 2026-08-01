import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { eventBus } from '../sse/eventBus.js';

export const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, slotTime, specialization, chiefComplaint } = req.body;

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check slot availability
    const existingSlot = await Appointment.findOne({ doctorId, date, slotTime, status: { $ne: 'cancelled' } });
    if (existingSlot) {
      return res.status(400).json({ message: 'This slot is already booked. Please choose another slot.' });
    }

    // Count today's queue position for doctor
    const todayCount = await Appointment.countDocuments({ doctorId, date, status: { $ne: 'cancelled' } });
    const queuePosition = todayCount + 1;

    const appointmentNum = Math.floor(10000 + Math.random() * 90000);
    const appointmentId = `APT-${appointmentNum}`;

    const appointment = await Appointment.create({
      appointmentId,
      patientId: patient._id,
      doctorId: doctor._id,
      date,
      slotTime,
      specialization: specialization || doctor.specialization,
      chiefComplaint,
      status: 'pending',
      queuePosition
    });

    const populatedApt = await Appointment.findById(appointment._id)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } });

    // Emit SSE events to patient and doctor
    const payload = {
      appointmentId: populatedApt.appointmentId,
      _id: populatedApt._id,
      patientId: patient.userId,
      doctorId: doctor.userId,
      status: populatedApt.status
    };

    eventBus.emitToUser(patient.userId, 'appointment:created', payload);
    eventBus.emitToUser(doctor.userId, 'appointment:created', payload);
    eventBus.broadcast('queue:update', payload);

    res.status(201).json(populatedApt);
  } catch (err) {
    res.status(500).json({ message: 'Failed to book appointment', error: err.message });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ userId: req.user._id });
      if (!patient) return res.status(200).json([]);
      query.patientId = patient._id;
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) return res.status(200).json([]);
      query.doctorId = doctor._id;
    }

    const appointments = await Appointment.find(query)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } })
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
};

export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email' } })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name email' } });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.status(200).json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointment details', error: err.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid appointment status' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId')
      .populate('doctorId');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    const payload = {
      appointmentId: appointment.appointmentId,
      _id: appointment._id,
      patientId: appointment.patientId?.userId,
      doctorId: appointment.doctorId?.userId,
      status: appointment.status
    };

    if (appointment.patientId?.userId) {
      eventBus.emitToUser(appointment.patientId.userId, 'appointment:statusChanged', payload);
    }
    if (appointment.doctorId?.userId) {
      eventBus.emitToUser(appointment.doctorId.userId, 'appointment:statusChanged', payload);
    }
    eventBus.broadcast('queue:update', payload);

    res.status(200).json(appointment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};
