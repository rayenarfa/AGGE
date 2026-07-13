import { Outlet, useLocation } from 'react-router-dom';
import Header, { Footer } from '../components/layout/Header';

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Header />
      <main className="flex-1">
        <div key={location.pathname} className="page-transition-wrapper">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
