import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Copy,
  Pencil,
  Trash2,
  CheckCheck,
  Bot,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { agentsApi, LlmProvider, LlmModel, type Agent } from '../lib/api';

// ─── Label maps ───────────────────────────────────────────────────────────────

const PROVIDER_LABELS: Record<number, string> = {
  [LlmProvider.OpenAi]: 'OpenAI',
  [LlmProvider.Anthropic]: 'Anthropic',
  [LlmProvider.Gemini]: 'Google Gemini',
};

const MODEL_LABELS: Record<number, string> = {
  [LlmModel.Gpt4o]: 'GPT-4o',
  [LlmModel.Gpt4oMini]: 'GPT-4o Mini',
  [LlmModel.Claude35Sonnet]: 'Claude 3.5 Sonnet',
  [LlmModel.Claude3Haiku]: 'Claude 3 Haiku',
  [LlmModel.Gemini15Pro]: 'Gemini 1.5 Pro',
  [LlmModel.Gemini15Flash]: 'Gemini 1.5 Flash',
};

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Agent['status'] }) {
  const cfg = {
    Active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Inactive: 'bg-slate-100 text-slate-500 border-slate-200',
    Training: 'bg-amber-100 text-amber-700 border-amber-200',
  }[status] ?? 'bg-slate-100 text-slate-500 border-slate-200';

  const dot = {
    Active: 'bg-emerald-500',
    Inactive: 'bg-slate-400',
    Training: 'bg-amber-500',
  }[status] ?? 'bg-slate-400';

  return (
    <span className={clsx('inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border', cfg)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', dot)} />
      {status}
    </span>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copy}
      className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
      title="Copy embed token"
    >
      {copied ? <CheckCheck size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  );
}

// ─── Agent card ───────────────────────────────────────────────────────────────

function AgentCard({ agent, onDelete }: { agent: Agent; onDelete: (id: string) => void }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
            <Bot size={18} className="text-violet-600" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-800 truncate text-sm">{agent.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{agent.description || 'No description'}</p>
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 w-16 flex-shrink-0">Provider</span>
          <span className="text-xs font-medium text-slate-600">{PROVIDER_LABELS[agent.llmProvider] ?? '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 w-16 flex-shrink-0">Model</span>
          <span className="text-xs font-medium text-slate-600">{MODEL_LABELS[agent.llmModel] ?? '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 w-16 flex-shrink-0">Token</span>
          <span className="text-xs font-mono text-slate-500 truncate flex-1">
            {agent.embedToken.slice(0, 20)}…
          </span>
          <CopyButton text={agent.embedToken} />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        <Link
          to={`/agents/${agent.id}`}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-violet-600 transition-colors px-2 py-1.5 rounded hover:bg-violet-50"
        >
          <Pencil size={13} />
          Edit
        </Link>
        <button
          onClick={() => onDelete(agent.id)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-600 transition-colors px-2 py-1.5 rounded hover:bg-red-50 ml-auto"
        >
          <Trash2 size={13} />
          Delete
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: agents = [], isLoading, isError } = useQuery({
    queryKey: ['agents'],
    queryFn: agentsApi.list,
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: agentsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['billing-usage'] });
    },
  });

  function handleDeleteRequest(id: string) {
    const agent = agents.find((a) => a.id === id);
    const confirmed = window.confirm(
      `Are you sure you want to delete "${agent?.name ?? 'this agent'}"? This action cannot be undone.`
    );
    if (confirmed) {
      setDeletingId(id);
      deleteMutation.mutate(id, { onSettled: () => setDeletingId(null) });
    }
  }

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Your Agents</h1>
          <p className="text-sm text-slate-500 mt-1">
            {agents.length} {agents.length === 1 ? 'agent' : 'agents'} configured
          </p>
        </div>
        <Link
          to="/agents/new"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Agent
        </Link>
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 size={24} className="animate-spin mr-2" />
          Loading agents…
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600">
          <AlertCircle size={16} />
          Failed to load agents. Please refresh the page.
        </div>
      )}

      {!isLoading && !isError && agents.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Bot size={26} className="text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-700 mb-1">No agents yet</h3>
          <p className="text-sm text-slate-400 mb-6">
            Create your first AI agent and embed it on any website.
          </p>
          <Link
            to="/agents/new"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Create your first agent
          </Link>
        </div>
      )}

      {!isLoading && !isError && agents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {agents.map((agent) => (
            <div key={agent.id} className={clsx('relative', deletingId === agent.id && 'opacity-50 pointer-events-none')}>
              <AgentCard agent={agent} onDelete={handleDeleteRequest} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
