import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { assets } from '@/config/assets';
import { useAuth } from '@/context/AuthProvider';
import { SpinnerIcon } from '@/lib/icons';

export function AdminLogin() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border-subtle bg-surface p-8 shadow-md">
        <div className="flex justify-center">
          <img
            src={assets.brand.lockup.src}
            alt="Moiz Web Solutions"
            className="logo-mark h-10 w-auto object-contain"
          />
        </div>

        <h1 className="mt-8 text-center text-[18px] font-medium text-foreground">Admin Login</h1>
        <p className="mt-2 text-center text-[13px] text-muted-foreground">
          Sign in to manage portfolio projects.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error ? (
            <p className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] text-danger">
              {error}
            </p>
          ) : null}

          <div>
            <label htmlFor="email" className="block text-[12px] font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[12px] font-medium text-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-yellow py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-ink transition-colors hover:bg-brand-yellow-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
          >
            {submitting ? 'Signing in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
