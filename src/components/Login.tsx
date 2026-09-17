import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sparkles, User } from 'lucide-react';
import { useAuth, DEMO_USER } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        showToast('Welcome back! Redirecting to your dashboard...', 'success');
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.error ?? 'Login failed. Please try again.');
        setLoading(false);
      }
    }, 300);
  };

  const fillDemo = () => {
    setEmail(DEMO_USER.email);
    setPassword(DEMO_USER.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-brand-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 shadow-lg shadow-brand-600/30 mb-3">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            CVInsight AI
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Intelligent Resume Screening
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-5 h-5 text-brand-600" />
              <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
            </div>
            <p className="text-sm text-slate-500">
              Sign in to continue to your intelligent recruitment workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label-text">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label-text">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo Section */}
        <div className="mt-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Demo Authentication
              </h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Want to try the application? Use the demo credentials below to
              access the CV screening dashboard.
            </p>

            <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Demo Email
                  </p>
                  <p className="font-mono text-slate-800 mt-0.5">
                    demo@cvinsight.ai
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Demo Password
                  </p>
                  <p className="font-mono text-slate-800 mt-0.5">Demo@123</p>
                </div>
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="btn-secondary w-full"
              >
                Use Demo Credentials
              </button>
              <p className="text-xs text-slate-500 text-center pt-1">
                This is a demo account for testing purposes only. Do not use
                real personal information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
