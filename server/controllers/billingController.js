import Invoice from '../models/Invoice.js';
import Patient from '../models/Patient.js';
import { eventBus } from '../sse/eventBus.js';

// List patient's invoices
export const getMyInvoices = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(200).json([]);
    }

    let invoices = await Invoice.find({ patientId: patient._id }).sort({ createdAt: -1 });

    // Seed a sample unpaid invoice if patient has 0 invoices
    if (invoices.length === 0) {
      const num = Math.floor(100 + Math.random() * 900);
      const invoiceId = `INV-2026-${num}`;
      const sample = await Invoice.create({
        invoiceId,
        patientId: patient._id,
        amount: 1240,
        lineItems: [
          { description: 'OPD Clinical Consultation Fee', amount: 150 },
          { description: 'ECG & Cardiology Diagnostic Panel', amount: 890 },
          { description: 'Hospital Pharmacy Service Fee', amount: 200 }
        ],
        status: 'unpaid'
      });
      invoices = [sample];
    }

    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch invoices', error: err.message });
  }
};

// Get invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name email' } });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json(invoice);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch invoice details', error: err.message });
  }
};

// Process stub payment
export const payInvoice = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const invoice = await Invoice.findById(req.params.id).populate('patientId');
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.status = 'paid';
    invoice.paymentDate = new Date();
    invoice.paymentMethod = paymentMethod || 'Credit Card (Stub)';
    await invoice.save();

    // Emit SSE event
    if (invoice.patientId?.userId) {
      eventBus.emitToUser(invoice.patientId.userId, 'invoice:paid', {
        invoiceId: invoice.invoiceId,
        amount: invoice.amount,
        status: 'paid'
      });
    }
    eventBus.broadcast('invoice:paid', { invoiceId: invoice.invoiceId, status: 'paid' });

    res.status(200).json({ message: 'Payment processed successfully', invoice });
  } catch (err) {
    res.status(500).json({ message: 'Payment failed', error: err.message });
  }
};
