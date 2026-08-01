import express from 'express';
import { 
  getDoctorQueue, 
  getPatientHistory, 
  createMedicalRecord, 
  createPrescription, 
  attachTestReport 
} from '../controllers/clinicalController.js';
import { verifyToken } from '../middleware/auth.js';
import { roleGuard } from '../middleware/roleGuard.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/doctor/queue', verifyToken, roleGuard('doctor'), getDoctorQueue);
router.get('/patient-history/:patientId', verifyToken, getPatientHistory);
router.post('/medical-records', verifyToken, roleGuard('doctor'), createMedicalRecord);
router.post('/prescriptions', verifyToken, roleGuard('doctor'), createPrescription);
router.post('/test-reports', verifyToken, roleGuard('doctor'), upload.single('reportFile'), attachTestReport);

export default router;
