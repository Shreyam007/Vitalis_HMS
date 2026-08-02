import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Prescription from '../models/Prescription.js';
import TestReport from '../models/TestReport.js';
import Invoice from '../models/Invoice.js';
import ExportLog from '../models/ExportLog.js';

export const seedInitialUsers = async () => {
  try {
    const adminPass = await bcrypt.hash('admin123', 12);
    const doctorPass = await bcrypt.hash('doctor123', 12);
    const patientPass = await bcrypt.hash('patient123', 12);

    // 1. Seed / Reset Admin Account
    let adminUser = await User.findOne({ email: 'admin@vitalis.hms' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Chief Admin',
        email: 'admin@vitalis.hms',
        password: adminPass,
        role: 'admin'
      });
    } else {
      adminUser.password = adminPass;
      await adminUser.save();
    }

    // 2. Seed / Reset Doctor Accounts (8 Doctors)
    const doctorsData = [
      { name: 'Dr. Sarah Jenkins', email: 'doctor@vitalis.hms', spec: 'Cardiology', qual: 'MD, FACC', exp: 14, dept: 'Cardiology Ward', fee: 200, room: 'Room 302' },
      { name: 'Dr. Kabir Sen', email: 'kabir.sen@vitalis.hms', spec: 'Cardiology', qual: 'MD, DM', exp: 11, dept: 'OPD-1 Cardiology', fee: 180, room: 'Room 214' },
      { name: 'Dr. Marcus Vance', email: 'marcus.vance@vitalis.hms', spec: 'Neurology', qual: 'MD, PhD', exp: 16, dept: 'Neurology ICU-2', fee: 250, room: 'Room 405' },
      { name: 'Dr. Emily Watson', email: 'emily.watson@vitalis.hms', spec: 'Pediatrics', qual: 'MBBS, DCH', exp: 9, dept: 'Pediatric Care Ward', fee: 150, room: 'Room 108' },
      { name: 'Dr. Rajesh Nair', email: 'rajesh.nair@vitalis.hms', spec: 'Orthopedics', qual: 'MS, M.Ch', exp: 18, dept: 'Orthopedic Trauma Center', fee: 220, room: 'Room 501' },
      { name: 'Dr. Anita Roy', email: 'anita.roy@vitalis.hms', spec: 'General Medicine', qual: 'MD (Internal Med)', exp: 12, dept: 'OPD General Ward', fee: 160, room: 'Room 102' },
      { name: 'Dr. David Kim', email: 'david.kim@vitalis.hms', spec: 'Dermatology', qual: 'MD (Dermatology)', exp: 7, dept: 'Skin & Allergy Clinic', fee: 190, room: 'Room 205' },
      { name: 'Dr. Priya Sundaram', email: 'priya.sundaram@vitalis.hms', spec: 'Neurology', qual: 'DM (Neurology)', exp: 13, dept: 'Neurology Ward-B', fee: 240, room: 'Room 408' }
    ];

    const doctorInstances = [];
    for (const d of doctorsData) {
      let user = await User.findOne({ email: d.email });
      if (!user) {
        user = await User.create({ name: d.name, email: d.email, password: doctorPass, role: 'doctor' });
      } else {
        user.password = doctorPass;
        await user.save();
      }

      let doc = await Doctor.findOne({ userId: user._id });
      if (!doc) {
        const docIdNum = Math.floor(1000 + Math.random() * 9000);
        doc = await Doctor.create({
          userId: user._id,
          doctorId: `DOC-${docIdNum}`,
          name: d.name,
          specialization: d.spec,
          qualification: d.qual,
          experienceYears: d.exp,
          department: d.dept,
          consultationFee: d.fee,
          roomNo: d.room,
          availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
        });
      }
      doctorInstances.push(doc);
    }

    // 3. Seed / Reset Patient Accounts (10 Patients)
    const patientsData = [
      { name: 'Ananya Sharma', email: 'patient@vitalis.hms', dob: '1996-04-12', gender: 'female', phone: '+91 98201 44920', bg: 'O+', patId: 'PAT-08841', wb: 'WB-08841', alg: ['Penicillin'], cond: ['Mild Asthma', 'Hypertension'] },
      { name: 'Rahul Verma', email: 'rahul.verma@vitalis.hms', dob: '1988-11-23', gender: 'male', phone: '+91 97110 39201', bg: 'A+', patId: 'PAT-19204', wb: 'WB-19204', alg: ['Sulfonamides'], cond: ['Type 2 Diabetes'] },
      { name: 'Priya Patel', email: 'priya.patel@vitalis.hms', dob: '2001-08-05', gender: 'female', phone: '+91 98920 11029', bg: 'B+', patId: 'PAT-28491', wb: 'WB-28491', alg: ['Peanuts'], cond: ['Migraine'] },
      { name: 'Vikram Mehta', email: 'vikram.mehta@vitalis.hms', dob: '1975-01-30', gender: 'male', phone: '+91 98100 88492', bg: 'AB+', patId: 'PAT-30291', wb: 'WB-30291', alg: ['Latex'], cond: ['Hyperlipidemia', 'CAD'] },
      { name: 'Sunita Rao', email: 'sunita.rao@vitalis.hms', dob: '1992-06-18', gender: 'female', phone: '+91 98330 91024', bg: 'O-', patId: 'PAT-41029', wb: 'WB-41029', alg: [], cond: ['Thyroiditis'] },
      { name: 'Arjun Kapoor', email: 'arjun.kapoor@vitalis.hms', dob: '1983-09-14', gender: 'male', phone: '+91 98400 12093', bg: 'A-', patId: 'PAT-59201', wb: 'WB-59201', alg: ['NSAIDs'], cond: ['GERD'] },
      { name: 'Kavita Das', email: 'kavita.das@vitalis.hms', dob: '1999-03-27', gender: 'female', phone: '+91 98190 44902', bg: 'B-', patId: 'PAT-60912', wb: 'WB-60912', alg: [], cond: ['Anemia'] },
      { name: 'Rohan Gupta', email: 'rohan.gupta@vitalis.hms', dob: '1990-12-01', gender: 'male', phone: '+91 98210 55901', bg: 'O+', patId: 'PAT-70192', wb: 'WB-70192', alg: ['Aspirin'], cond: ['Hypertension'] },
      { name: 'Meera Iyer', email: 'meera.iyer@vitalis.hms', dob: '1986-07-22', gender: 'female', phone: '+91 98700 33891', bg: 'AB-', patId: 'PAT-81029', wb: 'WB-81029', alg: [], cond: [] },
      { name: 'Siddharth Joshi', email: 'siddharth.joshi@vitalis.hms', dob: '1994-05-19', gender: 'male', phone: '+91 98910 88201', bg: 'A+', patId: 'PAT-92018', wb: 'WB-92018', alg: ['Pollen'], cond: ['Rhinitis'] }
    ];

    const patientInstances = [];
    for (const p of patientsData) {
      let user = await User.findOne({ email: p.email });
      if (!user) {
        user = await User.create({ name: p.name, email: p.email, password: patientPass, role: 'patient' });
      } else {
        user.password = patientPass;
        await user.save();
      }

      let pat = await Patient.findOne({ userId: user._id });
      if (!pat) {
        pat = await Patient.create({
          userId: user._id,
          patientId: p.patId,
          wristbandCode: p.wb,
          dateOfBirth: p.dob,
          gender: p.gender,
          phone: p.phone,
          bloodGroup: p.bg,
          allergies: p.alg,
          preExistingConditions: p.cond,
          emergencyContact: { name: 'Family Emergency', phone: p.phone, relation: 'Spouse/Parent' }
        });
      }
      patientInstances.push(pat);
    }

    // 4. Seed Appointments Log (8+ appointments across status)
    const todayStr = new Date().toISOString().split('T')[0];
    const sampleAppointments = [
      { aptId: 'APT-92041', patIdx: 0, docIdx: 0, date: todayStr, time: '10:30 AM', spec: 'Cardiology', complaint: 'Intermittent chest tightness after physical exertion & palpitations', status: 'confirmed', q: 1 },
      { aptId: 'APT-84092', patIdx: 1, docIdx: 1, date: todayStr, time: '11:15 AM', spec: 'Cardiology', complaint: 'Follow-up consultation for blood pressure regulation', status: 'pending', q: 2 },
      { aptId: 'APT-71029', patIdx: 2, docIdx: 2, date: todayStr, time: '02:00 PM', spec: 'Neurology', complaint: 'Severe recurring migraine headache with aura', status: 'pending', q: 3 },
      { aptId: 'APT-60918', patIdx: 3, docIdx: 3, date: todayStr, time: '03:30 PM', spec: 'Pediatrics', complaint: 'High grade fever & persistent nocturnal cough', status: 'pending', q: 4 },
      { aptId: 'APT-59201', patIdx: 4, docIdx: 4, date: '2026-08-04', time: '09:00 AM', spec: 'Orthopedics', complaint: 'Right knee joint pain after jogging', status: 'confirmed', q: 5 },
      { aptId: 'APT-48201', patIdx: 5, docIdx: 5, date: '2026-08-05', time: '10:00 AM', spec: 'General Medicine', complaint: 'Routine diabetic checkup & HbA1c review', status: 'completed', q: 6 },
      { aptId: 'APT-30192', patIdx: 6, docIdx: 6, date: '2026-08-05', time: '11:30 AM', spec: 'Dermatology', complaint: 'Skin allergic rash on forearms', status: 'completed', q: 7 },
      { aptId: 'APT-21098', patIdx: 7, docIdx: 7, date: '2026-08-06', time: '04:00 PM', spec: 'Neurology', complaint: 'Chronic insomnia & fatigue consultation', status: 'confirmed', q: 8 }
    ];

    for (const apt of sampleAppointments) {
      let existing = await Appointment.findOne({ appointmentId: apt.aptId });
      if (!existing && patientInstances[apt.patIdx] && doctorInstances[apt.docIdx]) {
        await Appointment.create({
          appointmentId: apt.aptId,
          patientId: patientInstances[apt.patIdx]._id,
          doctorId: doctorInstances[apt.docIdx]._id,
          date: apt.date,
          slotTime: apt.time,
          specialization: apt.spec,
          chiefComplaint: apt.complaint,
          status: apt.status,
          queuePosition: apt.q
        });
      }
    }

    // 5. Seed Clinical Invoices for Ledger
    const primaryPat = patientInstances[0];
    if (primaryPat) {
      const sampleInvoices = [
        {
          invoiceId: 'INV-2026-101',
          amount: 850,
          status: 'unpaid',
          lineItems: [
            { description: 'Cardiology Follow-up OPD Consultation', amount: 200 },
            { description: 'Echocardiogram (2D Echo) Diagnostic Scan', amount: 450 },
            { description: 'Pharmacy Prescription Medication Stub', amount: 200 }
          ]
        },
        {
          invoiceId: 'INV-2026-098',
          amount: 1450,
          status: 'unpaid',
          lineItems: [
            { description: '24-Hour Holter Cardiac Monitoring', amount: 950 },
            { description: 'Serum Electrolytes & Biomarker Panel', amount: 300 },
            { description: 'Clinical Administrative Fee', amount: 200 }
          ]
        },
        {
          invoiceId: 'INV-2026-075',
          amount: 650,
          status: 'paid',
          paymentDate: new Date('2026-07-28'),
          paymentMethod: 'UPI / Instant QR',
          lineItems: [
            { description: 'Comprehensive Lipid & Cholesterol Panel', amount: 450 },
            { description: 'Phlebotomy & Sample Collection Fee', amount: 200 }
          ]
        },
        {
          invoiceId: 'INV-2026-052',
          amount: 1800,
          status: 'paid',
          paymentDate: new Date('2026-07-15'),
          paymentMethod: 'Credit Card',
          lineItems: [
            { description: 'Emergency Room Triage & Stabilization', amount: 1000 },
            { description: '12-Lead Electrocardiogram (ECG)', amount: 600 },
            { description: 'Medication Administration', amount: 200 }
          ]
        },
        {
          invoiceId: 'INV-2026-031',
          amount: 400,
          status: 'paid',
          paymentDate: new Date('2026-06-30'),
          paymentMethod: 'Insurance Claim',
          lineItems: [
            { description: 'Routine General OPD Health Checkup', amount: 200 },
            { description: 'CBC (Complete Blood Count) Lab Test', amount: 200 }
          ]
        }
      ];

      for (const inv of sampleInvoices) {
        let existing = await Invoice.findOne({ invoiceId: inv.invoiceId });
        if (!existing) {
          await Invoice.create({
            invoiceId: inv.invoiceId,
            patientId: primaryPat._id,
            amount: inv.amount,
            lineItems: inv.lineItems,
            status: inv.status,
            paymentDate: inv.paymentDate,
            paymentMethod: inv.paymentMethod
          });
        }
      }
    }

    // 6. Seed ExportLog Initial Audit Record
    const exportLogCount = await ExportLog.countDocuments();
    if (exportLogCount === 0 && adminUser) {
      await ExportLog.create({
        adminUserId: adminUser._id,
        dataset: 'appointments',
        startDate: '2026-08-01',
        endDate: '2026-08-02',
        recordCount: 8
      });
    }

    console.log('Seeded 8+ appointments, 10 patients, 8 doctors, and full financial ledger.');
  } catch (err) {
    console.error('Seeding error:', err.message);
  }
};
