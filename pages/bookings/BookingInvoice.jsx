import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBookingInvoice } from '../../services/api';
import Card from '../../components/ui/Card';

const BookingInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchBookingInvoice(id);
        setInvoice(res.data?.data || null);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: 'var(--color-error)' }}>{error}</p>
        <button onClick={() => navigate('/bookings')} style={{ marginTop: 12 }}>
          Back
        </button>
      </div>
    );
  }

  if (!invoice) return null;

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '');

  return (
    <Card
      title={
        <div>
          <div className="text-lg font-semibold text-[var(--color-text)]">Booking Invoice</div>
          <div className="text-sm text-[var(--color-text-light)] mt-1">#{invoice.bookingId?.slice(-6)}</div>
        </div>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ padding: 12, border: '1px solid var(--color-border)', borderRadius: 12, background: 'var(--color-surface-soft)' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Customer</div>
          <div>Name: {invoice.customer?.name}</div>
          <div>Email: {invoice.customer?.email}</div>
          <div>Phone: {invoice.customer?.phone}</div>
        </div>

        <div style={{ padding: 12, border: '1px solid var(--color-border)', borderRadius: 12, background: 'var(--color-surface-soft)' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Event</div>
          <div>Name: {invoice.event?.name}</div>
          <div>Date: {formatDate(invoice.event?.date)}</div>
          <div>Time: {invoice.event?.time}</div>
          <div>Guests: {invoice.event?.guestCount}</div>
        </div>

        <div style={{ padding: 12, border: '1px solid var(--color-border)', borderRadius: 12, background: 'var(--color-surface-soft)', gridColumn: '1 / -1' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Venue</div>
          <div>Name: {invoice.venue?.name || '-'}</div>
          <div>City: {invoice.venue?.city || '-'}</div>
          <div>Price/hr: {invoice.venue?.basePrice ? `PKR ${Number(invoice.venue.basePrice).toLocaleString()}` : '-'}</div>
          <div>Status: {invoice.status}</div>
        </div>

        <div style={{ padding: 12, border: '1px solid var(--color-border)', borderRadius: 12, background: 'var(--color-surface-soft)', gridColumn: '1 / -1' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Payment</div>
          <div>Payment status: {invoice.payment?.paymentStatus}</div>
          <div>Paid amount: PKR {Number(invoice.payment?.advancePaid || 0).toLocaleString()}</div>
          <div>Total amount: PKR {Number(invoice.totals?.totalAmount || 0).toLocaleString()}</div>
          <div>Tax: PKR {Number(invoice.totals?.taxAmount || 0).toLocaleString()}</div>
          <div>Discount: PKR {Number(invoice.totals?.discountAmount || 0).toLocaleString()}</div>
        </div>

        <div style={{ padding: 12, border: '1px solid var(--color-border)', borderRadius: 12, background: 'var(--color-surface-soft)', gridColumn: '1 / -1' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Menu</div>
          {invoice.menuItems?.length ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {invoice.menuItems.map((m, idx) => (
                <li key={idx}>
                  {m.name} - {m.quantity} x PKR {Number(m.price || 0).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ color: 'var(--color-text-light)' }}>No menu items selected.</div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BookingInvoice;

