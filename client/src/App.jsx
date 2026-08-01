import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

// Auth Pages
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

// Patient Ward Pages
import PatientDashboard from './pages/patient/PatientDashboard.jsx';
import BookVisit from './pages/patient/BookVisit.jsx';
import BookingConfirmation from './pages/patient/BookingConfirmation.jsx';
import PrescriptionView from './pages/patient/PrescriptionView.jsx';
import BillingPayments from './pages/patient/BillingPayments.jsx';
import SecureCheckout from './pages/patient/SecureCheckout.jsx';

// Doctor Ward Pages
import DoctorQueue from './pages/doctor/DoctorQueue.jsx';
import PatientChartRecord from './pages/doctor/PatientChartRecord.jsx';
import NewPrescription from './pages/doctor/NewPrescription.jsx';
import AttachTestReport from './pages/doctor/AttachTestReport.jsx';

// Admin Ward Pages
import AdminOverview from './pages/admin/AdminOverview.jsx';
import DoctorDirectory from './pages/admin/DoctorDirectory.jsx';
import DoctorForm from './pages/admin/DoctorForm.jsx';
import PatientDirectory from './pages/admin/PatientDirectory.jsx';
import ReportsExport from './pages/admin/ReportsExport.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Patient Routes */}
          <Route 
            path="/patient/*" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <Routes>
                  <Route path="home" element={<PatientDashboard />} />
                  <Route path="book" element={<BookVisit />} />
                  <Route path="book/confirm/:id" element={<BookingConfirmation />} />
                  <Route path="records/:id" element={<PatientChartRecord />} />
                  <Route path="prescriptions/:id" element={<PrescriptionView />} />
                  <Route path="billing" element={<BillingPayments />} />
                  <Route path="billing/pay/:invoiceId" element={<SecureCheckout />} />
                  <Route path="*" element={<Navigate to="home" replace />} />
                </Routes>
              </ProtectedRoute>
            } 
          />

          {/* Protected Doctor Routes */}
          <Route 
            path="/doctor/*" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <Routes>
                  <Route path="queue" element={<DoctorQueue />} />
                  <Route path="patients/:id/record" element={<PatientChartRecord />} />
                  <Route path="patients/:id/prescribe" element={<NewPrescription />} />
                  <Route path="patients/:id/attach-report" element={<AttachTestReport />} />
                  <Route path="*" element={<Navigate to="queue" replace />} />
                </Routes>
              </ProtectedRoute>
            } 
          />

          {/* Protected Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Routes>
                  <Route path="overview" element={<AdminOverview />} />
                  <Route path="doctors" element={<DoctorDirectory />} />
                  <Route path="doctors/new" element={<DoctorForm />} />
                  <Route path="doctors/:id/edit" element={<DoctorForm />} />
                  <Route path="patients" element={<PatientDirectory />} />
                  <Route path="reports" element={<ReportsExport />} />
                  <Route path="*" element={<Navigate to="overview" replace />} />
                </Routes>
              </ProtectedRoute>
            } 
          />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
