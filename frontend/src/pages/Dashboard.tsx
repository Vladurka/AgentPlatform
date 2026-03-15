import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Copy, Pencil, CheckCheck, Loader2, AlertCircle } from 'lucide-react';
import { agentsApi, billingApi, type Agent } from '../lib/api';

// ─── Accent colors per agent index ────────────────────────────────────────────

const ACCENTS = [
  { icon: '#7C3AED', bg: '#7C3AED26', border: '#7C3AED4D' },
  { icon: '#0EA5E9', bg: '#0EA5E91F', border: '#0EA5E94D' },
  { icon: '#F59E0B', bg: '#F59E0B1F', border: '#F59E0B4D' },
  { icon: '#10B981', bg: '#10B9811F', border: '#10B9814D' },
  { icon: '#EC4899', bg: '#EC48991F', border: '#EC48994D' },
  { icon: '#6366F1', bg: '#6366F11F', border: '#6366F14D' },
];

function getAccent(idx: number) {
  return ACCENTS[idx % ACCENTS.length];
}

// ─── Model badge ──────────────────────────────────────────────────────────────

function getModelBadge(model: string) {
  const m = (model ?? '').toLowerCase();
  if (m.includes('claude')) return { bg: '#CC785C1F', border: '#CC785C33', color: '#CC785C', label: 'Claude 3.5' };
  if (m.includes('gpt4omini') || m.includes('mini')) return { bg: '#10A37F1F', border: '#10A37F33', color: '#10A37F', label: 'GPT-4o Mini' };
  if (m.includes('gpt4o') || m.includes('gpt')) return { bg: '#10A37F1F', border: '#10A37F33', color: '#10A37F', label: 'GPT-4o' };
  if (m.includes('gemini15pro') || m.includes('pro')) return { bg: '#4285F41F', border: '#4285F433', color: '#4285F4', label: 'Gemini 1.5 Pro' };
  if (m.includes('gemini')) return { bg: '#4285F41F', border: '#4285F433', color: '#4285F4', label: 'Gemini 1.5' };
  return { bg: '#7C3AED26', border: '#7C3AED33', color: '#A78BFA', label: model };
}

// ─── Status dot ───────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: string }) {
  const cfg: Record<string, { color: string; glow?: string }> = {
    Active: { color: '#22C55E', glow: '#22C55EB3 0px 0px 6px' },
    Inactive: { color: '#8888AA' },
    Training: { color: '#F59E0B', glow: '#F59E0B80 0px 0px 6px' },
  };
  const c = cfg[status] ?? cfg['Inactive'];
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: '5px' }}>
      <div style={{ backgroundColor: c.color, borderRadius: '50%', boxShadow: c.glow, flexShrink: 0, height: '7px', width: '7px' }} />
      <span style={{ color: c.color, fontSize: '11px', fontWeight: 500 }}>{status.toLowerCase()}</span>
    </div>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyEmbedButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    const snippet = `<script src="https://cdn.agentforge.ai/widget.js" data-token="${token}"></script>`;
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={copy}
      style={{ alignItems: 'center', background: 'none', border: '1px solid #FFFFFF14', borderRadius: '8px', color: copied ? '#22C55E' : '#8888AA', cursor: 'pointer', display: 'flex', fontSize: '12px', fontWeight: 500, gap: '6px', justifyContent: 'center', padding: '8px 14px', transition: 'all 0.15s', width: '100%' }}
      onMouseEnter={(e) => { if (!copied) (e.currentTarget as HTMLButtonElement).style.borderColor = '#FFFFFF30'; }}
      onMouseLeave={(e) => { if (!copied) (e.currentTarget as HTMLButtonElement).style.borderColor = '#FFFFFF14'; }}
    >
      {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : 'Copy embed'}
    </button>
  );
}

// ─── Agent card ───────────────────────────────────────────────────────────────

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  const accent = getAccent(index);
  const badge = getModelBadge(String(agent.llmModel ?? ''));

  return (
    <div style={{ backgroundColor: '#1E1E278C', border: '1px solid #FFFFFF12', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px', transition: 'border-color 0.2s' }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = '#FFFFFF20')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = '#FFFFFF12')}
    >
      {/* Header */}
      <div style={{ alignItems: 'flex-start', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
          <div style={{ alignItems: 'center', backgroundColor: accent.bg, border: `1px solid ${accent.border}`, borderRadius: '12px', display: 'flex', flexShrink: 0, height: '42px', justifyContent: 'center', width: '42px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent.icon} strokeWidth="2">
              <path d="M12 2a8 8 0 0 1 8 8v1a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10a8 8 0 0 1 8-8z" />
              <path d="M8 16v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2" />
              <circle cx="9" cy="10" r="1" fill={accent.icon} stroke="none" />
              <circle cx="15" cy="10" r="1" fill={accent.icon} stroke="none" />
            </svg>
          </div>
          <div>
            <div style={{ color: '#E2E2F0', fontSize: '14px', fontWeight: 600 }}>{agent.name}</div>
            <div style={{ color: '#44445A', fontSize: '11px', marginTop: '2px' }}>{agent.description || 'No description'}</div>
          </div>
        </div>
        <div style={{ alignItems: 'center', display: 'flex', gap: '10px' }}>
          <StatusDot status={agent.status} />
          <Link to={`/agents/${agent.id}`} style={{ alignItems: 'center', color: '#44445A', display: 'flex', transition: 'color 0.15s' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#E2E2F0')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#44445A')}
          >
            <Pencil size={14} />
          </Link>
        </div>
      </div>

      {/* Model badge */}
      <div style={{ backgroundColor: badge.bg, border: `1px solid ${badge.border}`, borderRadius: '20px', display: 'inline-block', paddingBlock: '3px', paddingInline: '8px', width: 'fit-content' }}>
        <span style={{ color: badge.color, fontSize: '11px', fontWeight: 600 }}>{badge.label}</span>
      </div>

      {/* Stats */}
      <div style={{ alignItems: 'center', backgroundColor: '#00000033', border: '1px solid #FFFFFF0A', borderRadius: '10px', display: 'flex', gap: '10px', padding: '10px 14px' }}>
        <span style={{ color: '#E2E2F0', fontSize: '13px', fontWeight: 600 }}>—</span>
        <span style={{ color: '#44445A', fontSize: '11px' }}>msgs</span>
        <div style={{ backgroundColor: '#FFFFFF0F', flexShrink: 0, height: '14px', width: '1px' }} />
        <span style={{ color: '#8888AA', fontSize: '12px' }}>No data yet</span>
      </div>

      {/* Copy embed */}
      <CopyEmbedButton token={agent.embedToken} />
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

type Filter = 'All' | 'Active' | 'Inactive' | 'Training';
const FILTERS: Filter[] = ['All', 'Active', 'Inactive', 'Training'];

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('All');

  const { data: agents = [], isLoading, isError } = useQuery({
    queryKey: ['agents'],
    queryFn: agentsApi.list,
    staleTime: 30_000,
  });

  const { data: usage } = useQuery({
    queryKey: ['billing-usage'],
    queryFn: billingApi.usage,
    staleTime: 60_000,
  });

  const deleteMutation = useMutation({
    mutationFn: agentsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['billing-usage'] });
    },
  });
  void deleteMutation;

  const activeCount = agents.filter((a) => a.status === 'Active').length;
  const filtered = filter === 'All' ? agents : agents.filter((a) => a.status === filter);

  const stats = [
    {
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><path d="M12 2a8 8 0 0 1 8 8v1a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10a8 8 0 0 1 8-8z" /><path d="M8 16v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2" /></svg>,
      iconBg: '#7C3AED26', iconBorder: '#7C3AED33',
      val: String(agents.length), label: 'Total Agents', sub: `${activeCount} active`, subColor: '#7C3AEDE6',
    },
    {
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
      iconBg: '#0EA5E91F', iconBorder: '#0EA5E933',
      val: String(usage?.messagesUsed ?? 0), label: 'Messages This Month', sub: 'this month', subColor: '#0EA5E9E6',
    },
    {
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
      iconBg: '#22C55E1F', iconBorder: '#22C55E33',
      val: String(activeCount), label: 'Active Agents', sub: activeCount > 0 ? 'All healthy' : 'None active', subColor: '#22C55EE6',
    },
  ];

  return (
    <div style={{ fontFamily: '"Inter", system-ui, sans-serif', minHeight: '100%', padding: '40px 48px', position: 'relative' }}>
      {/* BG orbs */}
      <div style={{ bottom: 0, left: 0, pointerEvents: 'none', position: 'fixed', right: 0, top: 0, zIndex: 0 }}>
        <div style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(54.1% 0.096 -0.227 / 22%) 0%, oklab(0% 0 -.0001 / 0%) 70%)', borderRadius: '50%', filter: 'blur(80px)', height: '700px', left: '-100px', position: 'absolute', top: '-200px', width: '700px' }} />
        <div style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(49.1% 0.093 -0.223 / 15%) 0%, oklab(0% 0 -.0001 / 0%) 70%)', borderRadius: '50%', bottom: '-150px', filter: 'blur(70px)', height: '500px', position: 'absolute', right: '200px', width: '500px' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ alignItems: 'flex-start', display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ color: '#E2E2F0', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 6px' }}>Dashboard</h1>
            <p style={{ color: '#8888AA', fontSize: '13px', margin: 0 }}>Manage your AI agents and monitor their performance.</p>
          </div>
          <Link to="/agents/new" style={{ alignItems: 'center', backgroundImage: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', borderRadius: '8px', boxShadow: '#7C3AED4D 0px 0px 16px', color: '#FFFFFF', display: 'flex', fontSize: '14px', fontWeight: 600, gap: '9px', padding: '9px 18px', textDecoration: 'none' }}>
            <Plus size={15} /> New Agent
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          {stats.map((s) => (
            <div key={s.label} style={{ backgroundColor: '#1E1E2780', border: '1px solid #FFFFFF0F', borderRadius: '12px', flex: 1, padding: '20px 24px' }}>
              <div style={{ alignItems: 'flex-start', display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ alignItems: 'center', backgroundColor: s.iconBg, border: `1px solid ${s.iconBorder}`, borderRadius: '8px', display: 'flex', flexShrink: 0, height: '34px', justifyContent: 'center', width: '34px' }}>
                  {s.icon}
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#44445A" strokeWidth="2"><polyline points="7 17 17 7" /><polyline points="7 7 17 7 17 17" /></svg>
              </div>
              <div style={{ color: '#E2E2F0', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.8px', marginBottom: '4px' }}>{s.val}</div>
              <div style={{ color: '#8888AA', fontSize: '12px', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ color: s.subColor, fontSize: '11px' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Agents header + filters */}
        <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#E2E2F0', fontSize: '15px', fontWeight: 600 }}>Your Agents</span>
            <div style={{ backgroundColor: '#7C3AED26', borderRadius: '20px', paddingBlock: '2px', paddingInline: '8px' }}>
              <span style={{ color: '#A78BFA', fontSize: '11px', fontWeight: 600 }}>{agents.length}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ background: 'none', border: 'none', borderRadius: '8px', backgroundColor: filter === f ? '#7C3AED2E' : 'transparent', color: filter === f ? '#E2E2F0' : '#8888AA', cursor: 'pointer', fontSize: '12px', fontWeight: 500, padding: '5px 12px', transition: 'all 0.15s' }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ alignItems: 'center', color: '#8888AA', display: 'flex', gap: '10px', justifyContent: 'center', padding: '80px 0' }}>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading agents…
          </div>
        )}

        {/* Error */}
        {isError && (
          <div style={{ alignItems: 'center', backgroundColor: '#2D1515', border: '1px solid #7F1D1D', borderRadius: '12px', color: '#FCA5A5', display: 'flex', fontSize: '14px', gap: '10px', padding: '16px 20px' }}>
            <AlertCircle size={16} /> Failed to load agents. Please refresh.
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && agents.length === 0 && (
          <div style={{ alignItems: 'center', backgroundColor: '#1E1E278C', border: '1px dashed #FFFFFF14', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '12px', padding: '80px 40px', textAlign: 'center' }}>
            <div style={{ alignItems: 'center', backgroundColor: '#7C3AED26', border: '1px solid #7C3AED33', borderRadius: '16px', display: 'flex', height: '56px', justifyContent: 'center', width: '56px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2"><path d="M12 2a8 8 0 0 1 8 8v1a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10a8 8 0 0 1 8-8z" /><path d="M8 16v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2" /></svg>
            </div>
            <div>
              <h3 style={{ color: '#E2E2F0', fontSize: '16px', fontWeight: 600, margin: 0 }}>No agents yet</h3>
              <p style={{ color: '#8888AA', fontSize: '14px', margin: '6px 0 0' }}>Create your first AI agent and embed it anywhere.</p>
            </div>
            <Link to="/agents/new" style={{ alignItems: 'center', backgroundImage: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', borderRadius: '10px', boxShadow: '#7C3AED59 0px 0px 20px', color: '#FFFFFF', display: 'inline-flex', fontSize: '14px', fontWeight: 600, gap: '8px', marginTop: '8px', padding: '12px 24px', textDecoration: 'none' }}>
              <Plus size={16} /> Create your first agent
            </Link>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !isError && agents.length > 0 && (
          <div style={{ display: 'grid', gap: '14px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {filtered.map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} index={i} />
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
