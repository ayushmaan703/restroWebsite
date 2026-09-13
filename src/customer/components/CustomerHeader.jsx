import { ShoppingCart } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function CustomerHeader({ tableNo, search, setSearch }) {
  const navigate = useNavigate();
  const name = useSelector(s => s.auth.restroName)

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
          <div className="customer-brand">{name}</div>
          <div className="customer-sub">
            Order from your
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginLeft: '3px',
                fontWeight: 500,
                color: 'black',
                fontSize: '13px',
              }}
            >
              {tableNo}
            </span>
          </div>
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
