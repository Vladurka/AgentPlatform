import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bot, LayoutDashboard, Plus, LogOut, Zap } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../lib/auth';
import { billingApi, authApi } from '../lib/api';

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-slate-600 text-slate-200',
  pro: 'bg-violet-600 text-white',
  business: 'bg-amber-500 text-white',
};

export default function Layout() {
  const { token, user, setAuth, logout } = useAuthStore();
  const navigate = useNavigate();

  // Fetch user info once on mount (hydrates user from token)
  useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const u = await authApi.me();
      if (token) setAuth(token, u);
      return u;
    },
    enabled: !!token && !user,
    staleTime: Infinity,
  });

  const { data: usage } = useQuery({
    queryKey: ['billing-usage'],
    queryFn: billingApi.usage,
    enabled: !!token,
    staleTime: 60_000,
  });

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const planKey = (user?.plan ?? usage?.plan ?? 'free').toLowerCase();
  const planLabel = planKey.charAt(0).toUpperCase() + planKey.slice(1);

  const msgUsed = usage?.messagesUsed ?? 0;
  const msgLimit = usage?.messagesLimit ?? 1;
  const msgPct = Math.min(100, Math.round((msgUsed / msgLimit) * 100));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-64 flex-shrink-0 bg-slate-900 flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <span className="text-white font-semibold text-base tracking-tight">AgentPlatform</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              )
            }
          >
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>
          <NavLink
            to="/agents/new"
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              )
            }
          >
            <Plus size={16} />
            New Agent
          </NavLink>
        </nav>

        {/* Usage + User */}
        <div className="px-4 py-4 border-t border-slate-800 space-y-4">
          {usage && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Zap size={11} className="text-violet-400" />
                  Messages
                </span>
                <span className="text-xs text-slate-400">
                  {msgUsed.toLocaleString()} / {msgLimit === -1 ? '∞' : msgLimit.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all',
                    msgPct > 85 ? 'bg-red-500' : 'bg-violet-500'
                  )}
                  style={{ width: `${msgLimit === -1 ? 0 : msgPct}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-slate-200">
                {(user?.email ?? '?').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-200 font-medium truncate">{user?.email ?? '—'}</p>
              <span
                className={clsx(
                  'inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide',
                  PLAN_COLORS[planKey] ?? PLAN_COLORS['free']
                )}
              >
                {planLabel}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
