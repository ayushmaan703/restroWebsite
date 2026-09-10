import { CheckCircle2, Utensils } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OrderConfirmation() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const transid = params.get('transid') || '';
  const orderNo = params.get('orderNo') || '';
  const table = params.get('table') || '';

  return (
    <div className="customer-page">
      <div className="customer-card confirmation-card">
        <div className="success-icon">
          <CheckCircle2 size={36} />
        </div>
        <span className="eyebrow">ORDER RECEIVED</span>
        <h1>Thank you!</h1>
        <p>
          Your order has been sent to the restaurant kitchen. Please relax while
          the team prepares it.
        </p>
        <div className="confirmation-meta">
          {/* <div>
            <span>Table</span>
            <b>{table || '—'}</b>
          </div> */}
          <div>
            <span>Order</span>
            <b>#{orderNo || transid || '—'}</b>
          </div>
        </div>
        <button
          className="primary-full"
          onClick={() => navigate(`/customer/order?TableId=${encodeURIComponent(table)}`)}
        >
          <Utensils size={16} />
          Order more items
        </button>
      </div>
    </div>
  );
}
