import { useState, type FormEvent, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Copy, CheckCheck, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { agentsApi, LlmProvider, LlmModel } from '../lib/api';

// ─── Provider / Model config ──────────────────────────────────────────────────

const PROVIDERS = [
  { value: LlmProvider.OpenAi, label: 'OpenAI' },
  { value: LlmProvider.Anthropic, label: 'Anthropic' },
  { value: LlmProvider.Gemini, label: 'Google Gemini' },
];

const MODELS_BY_PROVIDER: Record<number, { value: LlmModel; label: string }[]> = {
  [LlmProvider.OpenAi]: [
    { value: LlmModel.Gpt4o, label: 'GPT-4o' },
    { value: LlmModel.Gpt4oMini, label: 'GPT-4o Mini' },
  ],
  [LlmProvider.Anthropic]: [
    { value: LlmModel.Claude35Sonnet, label: 'Claude 3.5 Sonnet' },
    { value: LlmModel.Claude3Haiku, label: 'Claude 3 Haiku' },
  ],
  [LlmProvider.Gemini]: [
    { value: LlmModel.Gemini15Pro, label: 'Gemini 1.5 Pro' },
    { value: LlmModel.Gemini15Flash, label: 'Gemini 1.5 Flash' },
  ],
};

const inputCls =
  'w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition';

const labelCls = 'block text-xs font-medium text-slate-600 mb-1.5';

// ─── Embed code component ─────────────────────────────────────────────────────

function EmbedCode({ embedToken }: { embedToken: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="https://cdn.agentplatform.io/widget.js" data-token="${embedToken}"></script>`;

  function copy() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">Embed Code</h2>
          <p className="text-xs text-slate-400 mt-0.5">Paste this into your website's HTML</p>
        </div>
        <button
          onClick={copy}
          className={clsx(
            'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
            copied
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          )}
        >
          {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="bg-slate-950 text-slate-200 text-xs rounded-lg px-4 py-3 overflow-x-auto font-mono leading-relaxed">
        {snippet}
      </pre>
      <div className="mt-3 flex items-start gap-2 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2.5">
        <span className="text-violet-400 text-xs mt-0.5">ℹ</span>
        <p className="text-xs text-violet-700">
          Place this script tag just before the closing <code className="bg-violet-100 px-1 py-0.5 rounded text-[11px]">&lt;/body&gt;</code> tag.
          The widget will automatically appear on your page.
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: agents, isLoading, isError } = useQuery({
    queryKey: ['agents'],
    queryFn: agentsApi.list,
    staleTime: 30_000,
  });

  const agent = agents?.find((a) => a.id === id);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [provider, setProvider] = useState<LlmProvider>(LlmProvider.OpenAi);
  const [model, setModel] = useState<LlmModel>(LlmModel.Gpt4o);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate form when agent loads
  useEffect(() => {
    if (agent && !hydrated) {
      setName(agent.name);
      setDescription(agent.description ?? '');
      setProvider(agent.llmProvider);
      setModel(agent.llmModel);
      setHydrated(true);
    }
  }, [agent, hydrated]);

  function handleProviderChange(val: LlmProvider) {
    setProvider(val);
    const first = MODELS_BY_PROVIDER[val]?.[0];
    if (first) setModel(first.value);
  }

  const updateMutation = useMutation({
    mutationFn: () =>
      agentsApi.update(id!, {
        name,
        description,
        instructions: instructions || undefined,
        llmProvider: provider,
        llmModel: model,
        ...(apiKey ? { apiKey } : {}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      setSuccess(true);
      setApiKey('');
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to update agent.';
      setError(msg);
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    updateMutation.mutate();
  }

  // ── Loading / error states ──────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 size={24} className="animate-spin mr-2" />
        Loading agent…
      </div>
    );
  }

  if (isError || (!isLoading && !agent)) {
    return (
      <div className="px-8 py-8 max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600">
          <AlertCircle size={16} />
          Agent not found or failed to load.
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>

      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-bold text-slate-800">{agent!.name}</h1>
        <span
          className={clsx(
            'text-xs font-medium px-2 py-0.5 rounded-full border',
            agent!.status === 'Active'
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
              : agent!.status === 'Training'
              ? 'bg-amber-100 text-amber-700 border-amber-200'
              : 'bg-slate-100 text-slate-500 border-slate-200'
          )}
        >
          {agent!.status}
        </span>
      </div>
      <p className="text-sm text-slate-500 mb-8">
        Created {new Date(agent!.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {/* Embed code — show at top so users can grab it quickly */}
      <div className="mb-6">
        <EmbedCode embedToken={agent!.embedToken} />
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-600">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 text-sm text-emerald-700">
            <CheckCircle2 size={15} />
            Agent updated successfully.
          </div>
        )}

        {/* Basic info */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Basic Information</h2>

          <div>
            <label className={labelCls}>Agent name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Support Bot"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>System instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
              placeholder="Leave blank to keep current instructions…"
              className={clsx(inputCls, 'resize-y min-h-[100px]')}
            />
            <p className="text-xs text-slate-400 mt-1">Leave blank to keep existing instructions unchanged.</p>
          </div>
        </div>

        {/* Model config */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Model Configuration</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Provider</label>
              <select
                value={provider}
                onChange={(e) => handleProviderChange(Number(e.target.value) as LlmProvider)}
                className={inputCls}
              >
                {PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Model</label>
              <select
                value={model}
                onChange={(e) => setModel(Number(e.target.value) as LlmModel)}
                className={inputCls}
              >
                {(MODELS_BY_PROVIDER[provider] ?? []).map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>New API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Leave blank to keep existing key"
              autoComplete="off"
              className={inputCls}
            />
            <p className="text-xs text-slate-400 mt-1">Only fill this if you want to rotate your API key.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            {updateMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                Save Changes
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors px-3 py-2.5"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
