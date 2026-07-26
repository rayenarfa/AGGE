import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login(email.trim(), password);
      if (['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'EVENT_MANAGER'].includes(user.role)) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-6 py-12 bg-cream">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-sandstone/30 bg-white p-8 shadow-xl">
        
        {/* Top brand border strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-copper to-copper-light" />

        <div className="mb-8 text-center space-y-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sand-light text-navy font-bold text-xl border border-sandstone/20">
            A
          </div>
          <h2 className="text-2xl font-display font-semibold text-navy leading-none">Welcome Back</h2>
          <p className="text-xs text-text-muted">
            Sign in to access your AGGE member dashboard and portal
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-50 p-3 text-xs text-red-600 animate-fadeIn font-semibold">
            <p className="font-bold">Authentication Error</p>
            <p className="mt-0.5 opacity-90">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-[10px] uppercase font-bold tracking-widest text-text-muted">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-sandstone/35 bg-cream/20 px-3.5 py-2 text-xs text-navy focus:border-copper focus:outline-none"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-[10px] uppercase font-bold tracking-widest text-text-muted">
                Password
              </label>
              <Link to="#" className="text-[10px] font-bold uppercase tracking-wider text-copper hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-sandstone/35 bg-cream/20 px-3.5 py-2 text-xs text-navy focus:border-copper focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-gradient-to-r from-copper to-copper-light py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:scale-[1.01] transition shadow shadow-copper/25 border-none cursor-pointer mt-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-text-muted">
          New to AGGE?{' '}
          <Link to="/register" className="font-bold text-copper hover:underline uppercase tracking-wider">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
