export default function CategoryTabs({ categories, active, onChange }) {
  return (
    <div className="customer-categories">
      <button
        className={`customer-category ${active === 0 ? 'active' : ''}`}
        onClick={() => onChange(0)}
      >
        All
      </button>
      {categories.map(category => (
        <button
          key={category.id}
          className={`customer-category ${
            active === category.id ? 'active' : ''
          }`}
          onClick={() => onChange(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
