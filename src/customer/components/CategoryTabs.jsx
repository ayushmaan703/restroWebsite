import { ChevronDown } from 'lucide-react';

export default function CategoryTabs({ categories, active, onChange }) {
  const visibleCategories = categories.slice(0, 3);
  const moreCategories = categories.slice(1);
  const moreActive = moreCategories.some(
    category => String(category.id) === String(active),
  );

  return (
    <div className="customer-categories">
      <button
        type="button"
        className={`customer-category ${String(active) === '0' ? 'active' : ''}`}
        onClick={() => onChange(0)}
      >
        All
      </button>

      {visibleCategories.map(category => (
        <button
          type="button"
          key={category.id}
          className={`customer-category ${
            String(active) === String(category.id) ? 'active' : ''
          }`}
          onClick={() => onChange(category.id)}
        >
          {category.name}
        </button>
      ))}

      {moreCategories.length > 0 && (
        <label
          className={`customer-category-more ${moreActive ? 'active' : ''}`}
        >
          <span>{moreActive ? 'Selected' : 'More'}</span>
          <ChevronDown size={14} />
          <select
            value={moreActive ? String(active) : ''}
            onChange={event => {
              if (event.target.value) onChange(event.target.value);
            }}
            aria-label="More food categories"
          >
            <option value="">More categories</option>
            {moreCategories.map(category => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
