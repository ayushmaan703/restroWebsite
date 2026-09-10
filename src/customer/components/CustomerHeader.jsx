import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CustomerHeader({ tableNo, search, setSearch }) {
  const navigate = useNavigate();

  return (
    <header className="customer-top">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div className="customer-brand">Restaurant</div>
          <div className="customer-sub"> Order from your table</div>
        </div>
        <button
          className="add-button"
          aria-label="Open cart"
          onClick={() => navigate('/customer/cart')}
        >
          <ShoppingCart size={17} />
        </button>
      </div>
      <input
        className="customer-search"
        value={search}
        onChange={event => setSearch(event.target.value)}
        placeholder="Search dishes..."
      />
    </header>
  );
}
