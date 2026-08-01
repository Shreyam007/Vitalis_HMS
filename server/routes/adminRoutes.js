import express from 'express';
import { 
  getAdminOverview, 
  getAllDoctorsAdmin, 
  createDoctor, 
  updateDoctor, 
  deleteDoctor, 
  getAllPatientsAdmin, 
  exportReportCSV 
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
router.get('/reports/export', exportReportCSV);

export default router;
