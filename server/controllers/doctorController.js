import Doctor from '../models/Doctor.js';

export const getDoctors = async (req, res) => {
  try {
    const { specialization, department } = req.query;
    let query = {};
    if (specialization) query.specialization = new RegExp(specialization, 'i');
    if (department) query.department = new RegExp(department, 'i');

    const doctors = await Doctor.find(query).populate('userId', 'name email avatarUrl');
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctors', error: err.message });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email avatarUrl');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(200).json(doctor);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctor', error: err.message });
  }
};
