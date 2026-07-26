import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-xs font-sans tracking-wide text-text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && <span className="text-sandstone">/</span>}
            {item.to ? (
              <Link to={item.to} className="transition-colors hover:text-copper">
                {item.label}
              </Link>
            ) : (
              <span className="text-navy font-semibold">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
