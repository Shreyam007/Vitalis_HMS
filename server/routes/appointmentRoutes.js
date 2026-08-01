import express from 'express';
import { 
  createAppointment, 
  getMyAppointments, 
  getAppointmentById, 
  updateAppointmentStatus 
} from '../controllers/appointmentController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createAppointment);
router.get('/my', verifyToken, getMyAppointments);
router.get('/:id', verifyToken, getAppointmentById);
router.patch('/:id/status', verifyToken, updateAppointmentStatus);

export default router;
