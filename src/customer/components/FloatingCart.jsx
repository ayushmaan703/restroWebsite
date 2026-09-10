import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FloatingCart({ count, total }) {
  const navigate = useNavigate();

  if (!count) {
    return null;
  }

  return (
    <button className="floating-cart" onClick={() => navigate('/customer/cart')}>
      <span>
        <ShoppingCart size={18} />
        {count} {count === 1 ? 'item' : 'items'}
      </span>
      <span>₹ {total.toFixed(2)} · View cart</span>
    </button>
  );
}
