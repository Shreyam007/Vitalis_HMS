import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Prescription from '../models/Prescription.js';
import TestReport from '../models/TestReport.js';
import Invoice from '../models/Invoice.js';

export const seedInitialUsers = async () => {
  try {
    // 1. Seed Admin Account
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await User.create({
        name: 'Chief Admin',
        email: 'admin@vitalis.hms',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Seeded admin: admin@vitalis.hms / admin123');
    }

    // 2. Seed Doctor Accounts
    const doctorCount = await User.countDocuments({ role: 'doctor' });
    if (doctorCount < 5) {
      const defaultPassword = await bcrypt.hash('doctor123', 12);

      const doctorsData = [
        {
          name: 'Dr. Sarah Jenkins',
          email: 'doctor@vitalis.hms',
          specialization: 'Cardiology',
          qualification: 'MD, FACC, Gold Medalist',
          experienceYears: 14,
          department: 'Cardiology Ward',
          consultationFee: 200,
          roomNo: 'Room 302',
          rating: 4.9,
          availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        },
        {
          name: 'Dr. Kabir Sen',
          email: 'kabir.sen@vitalis.hms',
          specialization: 'Cardiology',
          qualification: 'MD, DM (Cardiology)',
          experienceYears: 11,
          department: 'OPD-1 Cardiology',
          consultationFee: 180,
          roomNo: 'Room 214',
          rating: 4.8,
          availableDays: ['Mon', 'Wed', 'Fri']
        },
        {
          name: 'Dr. Marcus Vance',
          email: 'marcus.vance@vitalis.hms',
          specialization: 'Neurology',
          qualification: 'MD, PhD (Neuroscience)',
          experienceYears: 16,
          department: 'Neurology ICU-2',
          consultationFee: 250,
          roomNo: 'Room 405',
          rating: 5.0,
          availableDays: ['Tue', 'Thu', 'Sat']
        },
        {
          name: 'Dr. Emily Watson',
          email: 'emily.watson@vitalis.hms',
          specialization: 'Pediatrics',
          qualification: 'MBBS, DCH, MD',
          experienceYears: 9,
          department: 'Pediatric Care Ward',
          consultationFee: 150,
          roomNo: 'Room 108',
          rating: 4.9,
          availableDays: ['Mon', 'Tue', 'Thu', 'Fri']
        },
        {
          name: 'Dr. Rajesh Nair',
          email: 'rajesh.nair@vitalis.hms',
          specialization: 'Orthopedics',
          qualification: 'MS (Orthopedics), M.Ch',
          experienceYears: 18,
          department: 'Orthopedic Trauma Center',
          consultationFee: 220,
          roomNo: 'Room 501',
          rating: 4.7,
          availableDays: ['Mon', 'Wed', 'Sat']
        }
      ];

      for (const d of doctorsData) {
        let user = await User.findOne({ email: d.email });
        if (!user) {
          user = await User.create({
            name: d.name,
            email: d.email,
            password: defaultPassword,
            role: 'doctor'
          });
        }

        const existingDoc = await Doctor.findOne({ userId: user._id });
        if (!existingDoc) {
          const randomId = Math.floor(1000 + Math.random() * 9000);
          await Doctor.create({
            userId: user._id,
            doctorId: `DOC-${randomId}`,
            name: d.name,
            specialization: d.specialization,
            qualification: d.qualification,
            experienceYears: d.experienceYears,
            department: d.department,
            consultationFee: d.consultationFee,
            roomNo: d.roomNo,
            rating: d.rating,
            availableDays: d.availableDays
          });
        }
      }
      console.log('Seeded 5 realistic doctor profiles.');
    }

    // 3. Seed Patient Accounts
    const patientCount = await User.countDocuments({ role: 'patient' });
    if (patientCount < 4) {
      const patientPass = await bcrypt.hash('patient123', 12);

      const patientsData = [
        {
          name: 'Ananya Sharma',
          email: 'patient@vitalis.hms',
          dateOfBirth: '1996-04-12',
          gender: 'female',
          phone: '+91 98201 44920',
          bloodGroup: 'O+',
          allergies: ['Penicillin', 'Dust Mites'],
          preExistingConditions: ['Mild Asthma', 'Hypertension'],
          wristbandCode: 'WB-08841',
          patientId: 'PAT-08841'
        },
        {
          name: 'Rahul Verma',
          email: 'rahul.verma@vitalis.hms',
          dateOfBirth: '1988-11-23',
          gender: 'male',
          phone: '+91 97110 39201',
          bloodGroup: 'A+',
          allergies: ['Sulfonamides'],
          preExistingConditions: ['Type 2 Diabetes'],
          wristbandCode: 'WB-19204',
          patientId: 'PAT-19204'
        },
        {
          name: 'Priya Patel',
          email: 'priya.patel@vitalis.hms',
          dateOfBirth: '2001-08-05',
          gender: 'female',
          phone: '+91 98920 11029',
          bloodGroup: 'B+',
          allergies: ['Peanuts'],
          preExistingConditions: ['Migraine'],
          wristbandCode: 'WB-28491',
          patientId: 'PAT-28491'
        },
        {
          name: 'Vikram Mehta',
          email: 'vikram.mehta@vitalis.hms',
          dateOfBirth: '1975-01-30',
          gender: 'male',
          phone: '+91 98100 88492',
          bloodGroup: 'AB+',
          allergies: ['Latex'],
          preExistingConditions: ['Hyperlipidemia', 'Coronary Artery Disease'],
          wristbandCode: 'WB-30291',
          patientId: 'PAT-30291'
        }
      ];

      for (const p of patientsData) {
        let user = await User.findOne({ email: p.email });
        if (!user) {
          user = await User.create({
            name: p.name,
            email: p.email,
            password: patientPass,
            role: 'patient'
          });
        }

        const existingPat = await Patient.findOne({ userId: user._id });
        if (!existingPat) {
          await Patient.create({
            userId: user._id,
            patientId: p.patientId,
            wristbandCode: p.wristbandCode,
            dateOfBirth: p.dateOfBirth,
            gender: p.gender,
            phone: p.phone,
            bloodGroup: p.bloodGroup,
            allergies: p.allergies,
            preExistingConditions: p.preExistingConditions,
            emergencyContact: {
              name: 'Emergency Contact Person',
              phone: p.phone,
              relation: 'Spouse/Family'
            }
          });
        }
      }
      console.log('Seeded 4 realistic patient profiles.');
    }

    // 4. Seed Clinical Records, Appointments & Invoices
    const appointmentCount = await Appointment.countDocuments();
    if (appointmentCount === 0) {
      const primaryDoc = await Doctor.findOne();
      const primaryPat = await Patient.findOne();

      if (primaryDoc && primaryPat) {
        // Appointments
        const apt1 = await Appointment.create({
          appointmentId: 'APT-92041',
          patientId: primaryPat._id,
          doctorId: primaryDoc._id,
          date: new Date().toISOString().split('T')[0],
          slotTime: '10:30 AM',
          specialization: 'Cardiology',
          chiefComplaint: 'Intermittent chest tightness after physical exertion & palpitations',
          status: 'confirmed',
          queuePosition: 1
        });

        const apt2 = await Appointment.create({
          appointmentId: 'APT-84092',
          patientId: primaryPat._id,
          doctorId: primaryDoc._id,
          date: '2026-08-06',
          slotTime: '02:00 PM',
          specialization: 'Cardiology',
          chiefComplaint: 'Follow-up consultation for blood pressure regulation',
          status: 'pending',
          queuePosition: 2
        });

        // Medical Record
        await MedicalRecord.create({
          recordId: 'REC-10492',
          patientId: primaryPat._id,
          doctorId: primaryDoc._id,
          appointmentId: apt1._id,
          diagnosis: 'Essential Hypertension & Mild Angina',
          symptoms: ['Chest tightness', 'Fatigue', 'Mild dyspnea on stairs'],
          vitals: {
            bloodPressure: '138/88',
            heartRate: 78,
            temperature: 98.4,
            weightKg: 68,
            oxygenSaturation: 99
          },
          clinicalNotes: 'ECG shows normal sinus rhythm. Advised low sodium intake, daily aerobic exercise, and started Metoprolol 25mg daily.'
        });

        // Prescription
        await Prescription.create({
          prescriptionId: 'RX-80291',
          patientId: primaryPat._id,
          doctorId: primaryDoc._id,
          appointmentId: apt1._id,
          medicines: [
            { name: 'Metoprolol Succinate 25mg', dosage: '1 Tablet', frequency: 'Once daily (1-0-0)', duration: '30 Days', instructions: 'Take in morning with food' },
            { name: 'Atorvastatin 10mg', dosage: '1 Tablet', frequency: 'Once daily (0-0-1)', duration: '30 Days', instructions: 'Take at bedtime' },
            { name: 'Aspirin Low-Dose 75mg', dosage: '1 Tablet', frequency: 'Once daily (1-0-0)', duration: '30 Days', instructions: 'After breakfast' }
          ],
          notes: 'Avoid high-cholesterol foods, re-check lipid profile in 30 days.',
          status: 'active'
        });

        // Test Report
        await TestReport.create({
          reportId: 'TR-40291',
          patientId: primaryPat._id,
          doctorId: primaryDoc._id,
          title: 'Comprehensive Lipid & Cardiac Biomarker Panel',
          category: 'Pathology',
          fileUrl: '/uploads/sample-lipid-report.pdf',
          fileName: 'Lipid_Panel_08841.pdf',
          notes: 'Total Cholesterol: 215 mg/dL, HDL: 48 mg/dL, LDL: 138 mg/dL.'
        });

        // Invoices
        await Invoice.create({
          invoiceId: 'INV-2026-084',
          patientId: primaryPat._id,
          appointmentId: apt1._id,
          amount: 1240,
          lineItems: [
            { description: 'Cardiology Specialist OPD Consultation Fee', amount: 200 },
            { description: '12-Lead Electrocardiogram (ECG) Diagnostics', amount: 840 },
            { description: 'Hospital Pharmacy Service Fee', amount: 200 }
          ],
          status: 'unpaid'
        });

        await Invoice.create({
          invoiceId: 'INV-2026-042',
          patientId: primaryPat._id,
          amount: 650,
          lineItems: [
            { description: 'Routine Blood Glucose & HbA1c Panel', amount: 450 },
            { description: 'Phlebotomy Sample Collection Fee', amount: 200 }
          ],
          status: 'paid',
          paymentDate: new Date('2026-07-20'),
          paymentMethod: 'Credit Card'
        });

        console.log('Seeded initial appointments, medical records, prescriptions, test reports, and invoices.');
      }
    }
  } catch (err) {
    console.error('Seeding error:', err.message);
  }
};
