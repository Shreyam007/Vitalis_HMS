import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import StampBadge from '../../components/ui/StampBadge.jsx';
import PulseDivider from '../../components/ui/PulseDivider.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { CreditCard, ShieldCheck, CheckCircle } from 'lucide-react';
import vitalisLogo from '../../assets/vitalis-logo.png';

export default function SecureCheckout() {
  const { invoiceId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
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

    try {
      const res = await fetch(`/api/billing/pay/${invoiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ paymentMethod })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Payment failed');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/patient/billing');
      }, 2000);
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
        <div className="bg-surface border-2 border-line p-8 rounded-sm shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-line pb-4">
            <div className="flex items-center gap-3">
              <img src={vitalisLogo} alt="Vitalis Logo" className="h-10 w-auto" />
              <div>
                <h3 className="font-display font-bold text-xl text-ink">Vitalis OPD Receipt</h3>
                <p className="font-mono text-[10px] text-faint uppercase">Encrypted Payment Gateway</p>
              </div>
            </div>
            <StampBadge status={invoice?.status === 'paid' ? 'confirmed' : 'pending'} text={invoice?.status} />
          </div>

          {success ? (
            <div className="p-6 bg-teal-tint border border-teal rounded text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-teal mx-auto animate-bounce" />
              <h4 className="font-display font-bold text-lg text-teal">Payment Successful!</h4>
              <p className="font-mono text-xs text-sub uppercase">RECEIPT STAMPED & SAVED TO LEDGER. REDIRECTING...</p>
            </div>
          ) : (
            <form onSubmit={handlePay} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-tint border border-red/30 rounded font-mono text-xs text-red">
                  {error}
                </div>
              )}

              {/* Line Items Receipt Box */}
              <div className="bg-bg border border-line p-4 rounded space-y-2 font-mono text-xs">
                <span className="font-bold text-sub uppercase text-[10px]">Itemized Charges</span>
                {invoice?.lineItems?.map((li, idx) => (
                  <div key={idx} className="flex justify-between items-center text-ink py-1 border-b border-line/40 last:border-0">
                    <span>{li.description}</span>
                    <span className="font-bold">₹{li.amount}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-ink pt-2 text-sm font-bold border-t-2 border-line">
                  <span>TOTAL DUE</span>
                  <span className="text-teal">₹{invoice?.amount}</span>
                </div>
              </div>

              {/* Payment Method Select */}
              <div>
                <label className="block font-mono text-xs font-bold uppercase text-sub tracking-wider mb-2">
                  Select Payment Gateway Stub
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Credit Card', 'UPI / NetBanking', 'Insurance Stub'].map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`p-3 border rounded text-center transition-all font-mono text-xs font-semibold uppercase ${
                        paymentMethod === pm 
                          ? 'border-teal bg-teal-tint text-teal font-bold' 
                          : 'border-line text-sub hover:border-line-strong'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

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
