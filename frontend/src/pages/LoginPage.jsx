import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { loginUser } from '../features/auth/authSlice';
import tapAcademyLogo from '../assets/new logo.jpg';

const EyeIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const EyeOffIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M3 3l18 18M9.9 4.7A10.3 10.3 0 0 1 12 4.5C18.2 4.5 22 11 22 11s-1.5 2.6-4.1 4.5M6.2 6.2C3.8 8 2 11 2 11s3.8 6.5 10 6.5c1 0 1.9-.1 2.8-.4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user?.role === 'manager') {
      navigate('/manager/dashboard', { replace: true });
    }
    if (user?.role === 'employee') {
      navigate('/employee/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const onSubmit = async (event) => {
    event.preventDefault();
    await dispatch(loginUser(form));
  };

  return (
    <div className="auth-shell relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-gradient px-4 py-12">
      <div className="absolute left-1/2 top-[-12rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-accent-500/30 blur-[100px]" />
      <div className="absolute bottom-[-10rem] right-[-10rem] h-[24rem] w-[24rem] rounded-full bg-brand-500/30 blur-[100px]" />

      <form onSubmit={onSubmit} className="glass-card z-10 w-full max-w-md space-y-6 p-8 shadow-card sm:p-10">
        <div className="text-center">
          <div className="mx-auto mb-5 w-fit rounded-[2rem] border border-white/20 bg-white/5 p-3 shadow-glow">
            <img src={tapAcademyLogo} alt="Tap Academy" className="h-24 w-24 rounded-[1.4rem] object-cover sm:h-28 sm:w-28" />
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-accent-400">Tap Academy</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-white">Employee Attendance System</h1>
          <p className="mt-2 text-sm text-slate-300">Sign in to continue to your workspace.</p>
        </div>

        <label className="block space-y-2 text-sm text-slate-200">
          <span>Email</span>
          <input
            className="input-control"
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            required
          />
        </label>

        <label className="block space-y-2 text-sm text-slate-200">
          <span>Password</span>
          <div className="relative">
            <input
              className="input-control pr-12"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 my-auto h-8 w-8 rounded-lg text-slate-300 transition hover:text-white"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
            </button>
          </div>
        </label>

        {error && <p className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{error}</p>}

        <button className="btn-gradient w-full" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-slate-300">
          Need an account?{' '}
          <Link to="/register" className="font-semibold text-accent-400 hover:text-accent-500">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
