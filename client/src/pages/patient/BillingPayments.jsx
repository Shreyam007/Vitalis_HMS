import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell.jsx';
import ChartBar from '../../components/layout/ChartBar.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StampBadge from '../../components/ui/StampBadge.jsx';
import PulseDivider from '../../components/ui/PulseDivider.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Button from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSSE } from '../../hooks/useSSE.js';
import { CreditCard, CheckCircle, ArrowRight } from 'lucide-react';

export default function BillingPayments() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch('/api/billing/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (err) {
      console.error('Fetch billing error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useSSE((type) => {
    if (type === 'invoice:paid') {
      fetchInvoices();
    }
  });

  const unpaidInvoices = invoices.filter(i => i.status === 'unpaid');
  const outstandingTotal = unpaidInvoices.reduce((sum, i) => sum + i.amount, 0);

  const columns = [
    {
      header: 'INVOICE ID',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-ink">{row.invoiceId}</span>
      )
    },
    {
      header: 'DATE',
      cell: (row) => (
        <span className="font-mono text-xs text-sub">{new Date(row.createdAt).toLocaleDateString()}</span>
      )
    },
    {
      header: 'LINE ITEMS BREAKDOWN',
      cell: (row) => (
        <div className="space-y-0.5">
          {row.lineItems?.map((li, idx) => (
            <p key={idx} className="font-body text-xs text-sub">
              • {li.description} (<span className="font-mono font-semibold">₹{li.amount}</span>)
            </p>
          ))}
        </div>
      )
    },
    {
      header: 'TOTAL AMOUNT',
      cell: (row) => (
        <span className="font-mono text-sm font-bold text-ink">₹{row.amount}</span>
      )
    },
    {
      header: 'STATUS',
      cell: (row) => <StampBadge status={row.status === 'paid' ? 'confirmed' : 'cancelled'} text={row.status} />
    },
    {
      header: 'ACTION',
      cell: (row) => (
        row.status === 'unpaid' ? (
          <button
            onClick={() => navigate(`/patient/billing/pay/${row._id}`)}
            className="px-3 py-1 bg-rust text-surface font-mono text-[11px] font-bold uppercase rounded border border-rust hover:bg-rust-deep transition-all"
          >
            PAY NOW →
          </button>
        ) : (
          <span className="font-mono text-[10px] text-teal font-bold uppercase">
            PAID ON {new Date(row.paymentDate || row.updatedAt).toLocaleDateString()}
          </span>
        )
      )
    }
  ];

  return (
    <AppShell role="patient">
      <ChartBar
        title="Billing & Clinical Payment Ledger"
        subtitle="VITALIS FINANCIAL PORTAL · INVOICES & REVENUE LEDGER"
        ward="teal"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Outstanding Balance"
            value={`₹${outstandingTotal}`}
            subtext={unpaidInvoices.length > 0 ? `${unpaidInvoices.length} unpaid invoice pending` : 'All invoices settled'}
            ward="rust"
          />
          <StatCard
            label="Settled Invoices"
            value={invoices.length - unpaidInvoices.length}
            subtext="Paid transactions"
            ward="teal"
          />
          <StatCard
            label="Payment Gateway"
            value="SECURE SSL"
            subtext="Encrypted OPD payment stub"
            ward="indigo"
          />
        </div>

        <PulseDivider label="CLINICAL INVOICE HISTORY & PAYMENT RECORDS (LIVE SSE)" />

        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-faint uppercase">
            LOADING BILLING RECORDS...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={invoices}
            emptyMessage="NO INVOICE RECORDS FOUND."
          />
        )}
      </div>
    </AppShell>
  );
}
