import express from 'express';
import { getMyInvoices, getInvoiceById, payInvoice } from '../controllers/billingController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/my', getMyInvoices);
router.get('/invoices/:id', getInvoiceById);
router.post('/pay/:id', payInvoice);

export default router;
