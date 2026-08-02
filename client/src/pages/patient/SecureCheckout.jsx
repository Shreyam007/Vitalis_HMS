import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import StampBadge from '../../components/ui/StampBadge.jsx';
import PulseDivider from '../../components/ui/PulseDivider.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { CreditCard, QrCode, ShieldCheck, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import vitalisLogo from '../../assets/vitalis-logo.png';

export default function SecureCheckout() {
  const { invoiceId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [activeMethod, setActiveMethod] = useState('card'); // 'card' | 'upi' | 'insurance'
  const [cardDetails, setCardDetails] = useState({ number: '4532 •••• •••• 8892', exp: '08/28', cvv: '•••' });
  const [upiId, setUpiId] = useState('patient@okicici');
  const [policyNo, setPolicyNo] = useState('INS-84920194');

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/billing/invoices/${invoiceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setInvoice(data);
          if (data.status === 'paid') {
            setSuccess(true);
          }
        }
      } catch (err) {
        console.error('Fetch invoice detail error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId, token]);

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    const methodNameMap = {
      card: 'Credit Card',
      upi: 'UPI / QR',
      insurance: 'Insurance Claim'
    };

    try {
      const res = await fetch(`/api/billing/pay/${invoiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ paymentMethod: methodNameMap[activeMethod] })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Payment failed');
      }

      setInvoice(data);
      setSuccess(true);
      setTimeout(() => {
        navigate('/patient/billing');
      }, 2400);
    } catch (err) {
      setError(err.message || 'Payment processing error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <AppShell role="patient">
        <div className="p-12 text-center font-mono text-xs text-faint uppercase">
          RETRIEVING INVOICE DETAILS...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="patient">
      <ChartBar
        title="Secure Clinical Payment Checkout"
        subtitle={`INVOICE ID: ${invoice?.invoiceId || 'INV-2026-084'} · AMOUNT DUE: ₹${invoice?.amount || 1240}`}
        ward="teal"
      />

      <div className="p-6 max-w-xl mx-auto space-y-6">
        <div className="bg-surface border-2 border-line p-8 rounded-sm shadow-sm space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-line pb-4">
            <div className="flex items-center gap-3">
              <img src={vitalisLogo} alt="Vitalis Logo" className="h-10 w-auto" />
              <div>
                <h3 className="font-display font-bold text-xl text-ink">Vitalis OPD Receipt</h3>
                <p className="font-mono text-[10px] text-faint uppercase">Encrypted Payment Gateway</p>
              </div>
            </div>
            {/* 7.3 Stamp Impact for Paid status */}
            <StampBadge status={success || invoice?.status === 'paid' ? 'paid' : 'unpaid'} />
          </div>

          {/* 7.3 Payment Success Summary State */}
          {success ? (
            <div className="p-6 bg-teal-tint border-2 border-teal rounded text-center space-y-3 animate-fade-in">
              <CheckCircle className="w-12 h-12 text-teal mx-auto animate-bounce" />
              <h4 className="font-display font-bold text-xl text-teal">Payment Successfully Authorized</h4>
              <p className="font-mono text-xs text-sub uppercase">
                INVOICE #{invoice?.invoiceId} HAS BEEN STAMPED AS PAID & UPDATED ON CLINICAL LEDGER.
              </p>
              <div className="pt-2 font-mono text-xs text-faint">
                Redirecting to Patient Ledger in 2 seconds...
              </div>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-tint border border-red/30 rounded font-mono text-xs text-red">
                  {error}
                </div>
              )}

              {/* Line Items Receipt Box */}
              <div className="bg-bg border border-line p-4 rounded space-y-2 font-mono text-xs">
                <span className="font-bold text-sub uppercase text-[10px] tracking-wider">Itemized Charges</span>
                {invoice?.lineItems?.map((li, idx) => (
                  <div key={idx} className="flex justify-between items-center text-ink py-1 border-b border-line/40 last:border-0">
                    <span>{li.description}</span>
                    <span className="font-bold">₹{li.amount}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-ink pt-2 text-sm font-bold border-t-2 border-line">
                  <span>TOTAL AMOUNT DUE</span>
                  <span className="text-teal text-base">₹{invoice?.amount}</span>
                </div>
              </div>

              {/* 7.4 Single-Select Accordion Payment Methods */}
              <div className="space-y-3">
                <label className="block font-mono text-xs font-bold uppercase text-sub tracking-wider">
                  Select Gateway Payment Accordion
                </label>

                {/* Option 1: Credit / Debit Card Accordion */}
                <div className="border border-line rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setActiveMethod('card')}
                    className={`w-full p-3 flex items-center justify-between font-mono text-xs font-bold uppercase transition-all ${
                      activeMethod === 'card' ? 'bg-teal-tint text-teal border-b border-teal/20' : 'bg-surface text-sub hover:bg-bg'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Credit / Debit Card</span>
                    </div>
                    {activeMethod === 'card' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {activeMethod === 'card' && (
                    <div className="p-4 bg-surface space-y-3 font-mono text-xs animate-fade-in">
                      <div>
                        <label className="block text-[10px] text-faint uppercase font-semibold mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          className="w-full px-3 py-1.5 border border-line rounded text-ink focus:outline-none focus:border-teal"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-faint uppercase font-semibold mb-1">Expiry</label>
                          <input
                            type="text"
                            value={cardDetails.exp}
                            onChange={(e) => setCardDetails({ ...cardDetails, exp: e.target.value })}
                            className="w-full px-3 py-1.5 border border-line rounded text-ink focus:outline-none focus:border-teal"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-faint uppercase font-semibold mb-1">CVV</label>
                          <input
                            type="password"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            className="w-full px-3 py-1.5 border border-line rounded text-ink focus:outline-none focus:border-teal"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 2: UPI / QR Code Accordion */}
                <div className="border border-line rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setActiveMethod('upi')}
                    className={`w-full p-3 flex items-center justify-between font-mono text-xs font-bold uppercase transition-all ${
                      activeMethod === 'upi' ? 'bg-teal-tint text-teal border-b border-teal/20' : 'bg-surface text-sub hover:bg-bg'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4" />
                      <span>UPI / Instant QR</span>
                    </div>
                    {activeMethod === 'upi' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {activeMethod === 'upi' && (
                    <div className="p-4 bg-surface space-y-3 font-mono text-xs animate-fade-in">
                      <div>
                        <label className="block text-[10px] text-faint uppercase font-semibold mb-1">UPI VPA ID</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="username@upi"
                          className="w-full px-3 py-1.5 border border-line rounded text-ink focus:outline-none focus:border-teal"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Option 3: Insurance Claim Accordion */}
                <div className="border border-line rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setActiveMethod('insurance')}
                    className={`w-full p-3 flex items-center justify-between font-mono text-xs font-bold uppercase transition-all ${
                      activeMethod === 'insurance' ? 'bg-teal-tint text-teal border-b border-teal/20' : 'bg-surface text-sub hover:bg-bg'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Medical Insurance Claim</span>
                    </div>
                    {activeMethod === 'insurance' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {activeMethod === 'insurance' && (
                    <div className="p-4 bg-surface space-y-3 font-mono text-xs animate-fade-in">
                      <div>
                        <label className="block text-[10px] text-faint uppercase font-semibold mb-1">Insurance Policy Number</label>
                        <input
                          type="text"
                          value={policyNo}
                          onChange={(e) => setPolicyNo(e.target.value)}
                          className="w-full px-3 py-1.5 border border-line rounded text-ink focus:outline-none focus:border-teal"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Anchored Action Buttons at bottom of container */}
              <div className="pt-4 flex justify-between items-center border-t border-line">
                <Button type="button" variant="ghost" ward="ink" onClick={() => navigate('/patient/billing')}>
                  Back
                </Button>
                <Button type="submit" variant="primary" ward="teal" disabled={processing || invoice?.status === 'paid'}>
                  {processing ? 'AUTHORIZING PAYMENT...' : `PAY ₹${invoice?.amount || 1240} NOW →`}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </AppShell>
  );
}
