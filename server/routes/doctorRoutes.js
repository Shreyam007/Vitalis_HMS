import express from 'express';
import { getDoctors, getDoctorById } from '../controllers/doctorController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getDoctors);
router.get('/:id', verifyToken, getDoctorById);

export default router;
