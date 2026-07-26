import { NavLink } from 'react-router-dom';

export default function SubNav({ items }) {
  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-sandstone/20 pb-4 font-sans">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to.split('/').length <= 2}
          className={({ isActive }) =>
            `rounded-full px-4 py-1.5 text-xs font-bold tracking-wide uppercase transition ${
              isActive
                ? 'bg-copper text-white shadow shadow-copper/20'
                : 'text-navy/80 hover:bg-sand-light/60 hover:text-navy'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
