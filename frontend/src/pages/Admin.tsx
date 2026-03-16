import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Users, Bot, AlertCircle, Loader2 } from 'lucide-react';
import { adminApi, type AdminUser } from '../lib/api';
import { useAuthStore } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

const PLANS = ['free', 'pro', 'business'];

const PLAN_COLORS: Record<string, { color: string; bg: string }> = {
  free:     { color: '#8888AA', bg: '#8888AA1F' },
  pro:      { color: '#A78BFA', bg: '#7C3AED1F' },
  business: { color: '#F59E0B', bg: '#F59E0B1F' },
};

export default function Admin() {
  const { token, user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => import('../lib/api').then((m) => m.authApi.me()),
    enabled: !!token && !user,
    staleTime: Infinity,
  });

  if (userLoading || (!user && token)) {
    return (
      <div style={{ alignItems: 'center', color: '#8888AA', display: 'flex', fontFamily: '"Inter", system-ui, sans-serif', gap: '10px', justifyContent: 'center', minHeight: '100%' }}>
        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user?.isAdmin) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.users,
  });

  const planMutation = useMutation({
    mutationFn: ({ userId, plan }: { userId: string; plan: string }) =>
      adminApi.updatePlan(userId, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setUpdatingId(null);
    },
  });

  return (
    <div style={{ fontFamily: '"Inter", system-ui, sans-serif', minHeight: '100%', padding: '40px 48px' }}>
      {/* Header */}
      <div style={{ alignItems: 'center', display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <ShieldCheck size={22} style={{ color: '#A78BFA' }} />
        <h1 style={{ color: '#E2E2F0', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.4px', margin: 0 }}>
          Admin Panel
        </h1>
      </div>

      {isLoading && (
        <div style={{ alignItems: 'center', color: '#8888AA', display: 'flex', gap: '10px' }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading users…
        </div>
      )}

      {isError && (
        <div style={{ alignItems: 'center', backgroundColor: '#2D1515', border: '1px solid #7F1D1D', borderRadius: '10px', color: '#FCA5A5', display: 'flex', fontSize: '14px', gap: '8px', padding: '14px 16px' }}>
          <AlertCircle size={16} /> Failed to load users.
        </div>
      )}

      {users && (
        <div style={{ backgroundColor: '#18181FE6', border: '1px solid #FFFFFF14', borderRadius: '16px', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ borderBottom: '1px solid #FFFFFF0A', display: 'grid', gridTemplateColumns: '1fr 120px 80px 140px', padding: '12px 20px' }}>
            {['User', 'Plan', 'Agents', 'Joined'].map((h) => (
              <span key={h} style={{ color: '#44445A', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {users.map((u: AdminUser) => {
            const pc = PLAN_COLORS[u.plan.toLowerCase()] ?? PLAN_COLORS['free'];
            return (
              <div key={u.id} style={{ alignItems: 'center', borderBottom: '1px solid #FFFFFF08', display: 'grid', gridTemplateColumns: '1fr 120px 80px 140px', padding: '14px 20px' }}>
                {/* Email */}
                <div>
                  <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
                    <div style={{ alignItems: 'center', backgroundColor: '#FFFFFF0A', borderRadius: '50%', display: 'flex', flexShrink: 0, height: '28px', justifyContent: 'center', width: '28px' }}>
                      <span style={{ color: '#8888AA', fontSize: '11px', fontWeight: 600 }}>{u.email.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <div style={{ color: '#E2E2F0', fontSize: '13px', fontWeight: 500 }}>{u.email}</div>
                      {u.isAdmin && (
                        <span style={{ color: '#A78BFA', fontSize: '10px', fontWeight: 600 }}>ADMIN</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Plan selector */}
                <div>
                  {updatingId === u.id ? (
                    <select
                      defaultValue={u.plan.toLowerCase()}
                      autoFocus
                      onChange={(e) => {
                        planMutation.mutate({ userId: u.id, plan: e.target.value });
                      }}
                      onBlur={() => setUpdatingId(null)}
                      style={{ backgroundColor: '#13131C', border: '1px solid #7C3AED80', borderRadius: '6px', color: '#E2E2F0', fontSize: '12px', padding: '4px 8px', cursor: 'pointer' }}
                    >
                      {PLANS.map((p) => (
                        <option key={p} value={p} style={{ backgroundColor: '#1E1E27' }}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => setUpdatingId(u.id)}
                      style={{ alignItems: 'center', backgroundColor: pc.bg, border: 'none', borderRadius: '20px', color: pc.color, cursor: 'pointer', display: 'inline-flex', fontSize: '11px', fontWeight: 600, gap: '4px', padding: '3px 10px' }}
                    >
                      {u.plan.charAt(0).toUpperCase() + u.plan.slice(1)}
                      <span style={{ fontSize: '9px', opacity: 0.6 }}>▼</span>
                    </button>
                  )}
                </div>

                {/* Agent count */}
                <div style={{ alignItems: 'center', color: '#8888AA', display: 'flex', fontSize: '13px', gap: '5px' }}>
                  <Bot size={13} /> {u.agentCount}
                </div>

                {/* Joined */}
                <div style={{ color: '#44445A', fontSize: '12px' }}>
                  {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}

          {users.length === 0 && (
            <div style={{ color: '#44445A', fontSize: '13px', padding: '24px 20px', textAlign: 'center' }}>
              <Users size={24} style={{ margin: '0 auto 8px', display: 'block' }} />
              No users yet.
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
