import { NavLink } from 'react-router-dom';

export default function SubNav({ items }) {
  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-slate-800 pb-4">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to.split('/').length <= 2}
          className={({ isActive }) =>
            `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              isActive
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
