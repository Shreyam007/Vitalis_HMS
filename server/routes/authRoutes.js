import express from 'express';
import { registerPatient, login, me, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerPatient);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, me);

export default router;
