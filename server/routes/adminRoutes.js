import express from 'express';
import { 
  getAdminOverview, 
  getAllDoctorsAdmin, 
  createDoctor, 
  updateDoctor, 
  deleteDoctor, 
  getAllPatientsAdmin, 
  getExportStats,
  exportAppointmentsCSV,
  exportPatientsCSV,
  exportDoctorsCSV
} from '../controllers/adminController.js';
import { verifyToken } from '../middleware/auth.js';
import { roleGuard } from '../middleware/roleGuard.js';

const router = express.Router();

router.use(verifyToken, roleGuard('admin'));

router.get('/overview', getAdminOverview);
router.get('/doctors', getAllDoctorsAdmin);
router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);
router.get('/patients', getAllPatientsAdmin);

// Export Engine Endpoints
router.get('/export/stats', getExportStats);
router.get('/export/appointments', exportAppointmentsCSV);
router.get('/export/patients', exportPatientsCSV);
router.get('/export/doctors', exportDoctorsCSV);

export default router;
