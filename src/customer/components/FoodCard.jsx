import { Minus, Plus } from 'lucide-react';

export default function FoodCard({ item, qty = 0, onAdd, onChange }) {
  const hasImage = Boolean(item.image);

  return (
    <article
      className={`customer-food-card ${hasImage ? '' : 'customer-no-image'}`}
    >
      {hasImage ? (
        <img
          className="food-image"
          src={item.image}
          alt={item.name}
          onError={event => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="food-placeholder">No image</div>
      )}
      <div className="food-info">
        <div className="food-name">{item.name}</div>
        <div className="food-desc">{item.category}</div>
        <div className="food-bottom">
          <span className="food-price">₹ {item.price.toFixed(2)}</span>
          {qty ? (
            <div className="qty-mini">
              <button onClick={() => onChange(-1)} aria-label="Decrease quantity">
                <Minus size={14} />
              </button>
              <b>{qty}</b>
              <button onClick={() => onChange(1)} aria-label="Increase quantity">
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button className="add-button" onClick={onAdd} aria-label={`Add ${item.name}`}>
              <Plus size={17} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
