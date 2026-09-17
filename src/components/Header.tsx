import { LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-600 shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">
                CVInsight AI
              </h1>
              <p className="text-xs text-slate-500 leading-tight">
                Intelligent Resume Screening
              </p>
            </div>
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col items-end">
                <p className="text-sm font-semibold text-slate-700 leading-tight">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-400 leading-tight">
                  {user?.email}
                </p>
              </div>
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold">
                {initials}
              </div>
            </div>
            <button
              onClick={logout}
              className="btn-ghost text-danger-600 hover:bg-danger-50 hover:text-danger-700"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
