import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { changeQty, removeFromCart } from '../../store/slices/cartSlice';

export default function CustomerCart() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(state => state.cart.items);
  const tableId = params.get('table') || params.get('TableId') || sessionStorage.getItem('customerTable') || '';
  const Comid = params.get('Comid') || sessionStorage.getItem('customerComid') || '1';
  const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="customer-page">
      <div className="customer-card cart-card">
        <button className="back-link" onClick={() => navigate(`/customer/order?table=${encodeURIComponent(tableId)}&Comid=${encodeURIComponent(Comid)}`)}><ArrowLeft size={16} /> Back to menu</button>
        <div className="customer-page-title"><div className="page-icon"><ShoppingBag size={20} /></div><div><h2>Your order</h2><span>Table {tableId} · {itemCount} items</span></div></div>
        {!items.length ? <div className="empty-order">Your cart is empty.</div> : (
          <div className="customer-cart-list">
            {items.map(item => (
              <div className="cart-line" key={item.id}>
                <div><div className="cart-line-name">{item.name}</div><div className="cart-line-price">₹ {item.price.toFixed(2)} each</div></div>
                <div className="cart-controls"><button onClick={() => dispatch(changeQty({ id: item.id, delta: -1 }))}><Minus size={14} /></button><b>{item.qty}</b><button onClick={() => dispatch(changeQty({ id: item.id, delta: 1 }))}><Plus size={14} /></button><button className="cart-remove" aria-label={`Remove ${item.name}`} title="Remove item" onClick={() => dispatch(removeFromCart(item.id))}><Trash2 size={14} /></button></div>
              </div>
            ))}
          </div>
        )}
        <div className="totals">
          <div className="total-line"><span>Items</span><b>{itemCount}</b></div>
          <div className="total-line grand-total"><span>Total</span><b>₹ {total.toFixed(2)}</b></div>
        </div>
        {items.length > 0 && <button className="primary-full" onClick={() => navigate(`/customer/checkout?table=${encodeURIComponent(tableId)}&Comid=${encodeURIComponent(Comid)}`)}>Continue to place order</button>}
      </div>
    </div>
  );
}
