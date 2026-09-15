import { Minus, Plus } from 'lucide-react';

export default function FoodCard({ item, qty = 0, onAdd, onChange }) {
  // const hasImage = Boolean(item.image);
  const hasImage = Boolean(item.image64);

  const getImageUrl = (url) => {
    if (!url) return '';

    // If website is HTTPS, use the same-origin proxy
    // to avoid mixed-content blocking.
    if (
      window.location.protocol === 'https:' &&
      url.startsWith('http://103.175.22.11:8911/')
    ) {
      return url.replace('http://103.175.22.11:8911', '');
    }

    // If website is HTTP, use the backend URL directly.
    return url;
  };

  const normalizeBase64Image = rawImage => {
    const image = String(rawImage || '').trim();

    if (!image) return '';

    if (image.startsWith('data:image/')) {
      return image;
    }

    return `data:image/jpeg;base64,${image}`;
  };

  return (
    <article
      className={`customer-food-card ${hasImage ? '' : 'customer-no-image'}`}
    >
      {hasImage ? (
        <img
          className="food-image"
          // src={getImageUrl(item.image)}
          src={normalizeBase64Image(item.image64)}
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
