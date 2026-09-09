import { CheckCircle2, Utensils } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OrderConfirmation() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const transid = params.get('transid') || '';
  const orderNo = params.get('orderNo') || '';
  const table = params.get('table') || sessionStorage.getItem('customerTable') || '';
  const Comid = params.get('Comid') || sessionStorage.getItem('customerComid') || '1';

  return (
    <div className="customer-page confirmation-page">
      <div className="customer-card confirmation-card">
        <div className="success-icon"><CheckCircle2 size={42} /></div>
        <span className="eyebrow">ORDER PLACED</span>
        <h1>Thanks! Your order is in.</h1>
        <p>The restaurant has received your order for Table {table}.</p>
        <div className="confirmation-meta"><div><span>Order no.</span><b>#{orderNo}</b></div><div><span>Transaction</span><b>{transid}</b></div></div>
        <button className="primary-full" onClick={() => navigate(`/customer/order?table=${encodeURIComponent(table)}&Comid=${encodeURIComponent(Comid)}`)}><Utensils size={17} /> Order more</button>
      </div>
    </div>
  );
}
