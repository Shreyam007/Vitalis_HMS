import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

export const seedInitialUsers = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.create({
        name: 'Chief Admin',
        email: 'admin@vitalis.hms',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Seeded default admin user: admin@vitalis.hms / admin123');
    }

    const doctorCount = await User.countDocuments({ role: 'doctor' });
    if (doctorCount === 0) {
      const hashedPassword = await bcrypt.hash('doctor123', 12);
      const user = await User.create({
        name: 'Dr. Sarah Jenkins',
        email: 'doctor@vitalis.hms',
        password: hashedPassword,
        role: 'doctor'
      });

      await Doctor.create({
        userId: user._id,
        doctorId: 'DOC-101',
        name: 'Dr. Sarah Jenkins',
        specialization: 'Cardiology',
        qualification: 'MD, FACC',
        experienceYears: 12,
        department: 'Cardiology Ward',
        consultationFee: 150,
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        roomNo: 'Room 302',
        rating: 4.9
      });
      console.log('Seeded default doctor user: doctor@vitalis.hms / doctor123');
    }
  } catch (err) {
    console.error('Seeding error:', err.message);
  }
};
