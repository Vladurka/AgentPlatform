import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { agentsApi, LlmProvider, LlmModel } from '../lib/api';
import clsx from 'clsx';

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

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputCls =
  'w-full bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition';

const labelCls = 'block text-xs font-medium text-slate-600 mb-1.5';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewAgent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [provider, setProvider] = useState<LlmProvider>(LlmProvider.OpenAi);
  const [model, setModel] = useState<LlmModel>(LlmModel.Gpt4o);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  function handleProviderChange(val: number) {
    setProvider(val as LlmProvider);
    // Default to first model of newly selected provider
    const first = MODELS_BY_PROVIDER[val]?.[0];
    if (first) setModel(first.value);
  }

  const createMutation = useMutation({
    mutationFn: () =>
      agentsApi.create({ name, description, instructions, llmProvider: provider, llmModel: model, apiKey }),
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['billing-usage'] });
      navigate(`/agents/${agent.id}`, { replace: true });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to create agent.';
      setError(msg);
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!apiKey.trim()) {
      setError('API key is required when creating a new agent.');
      return;
    }
    createMutation.mutate();
  }

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto">
      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-1">Create New Agent</h1>
      <p className="text-sm text-slate-500 mb-8">Configure your AI agent and get an embed script.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-600">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            {error}
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
              placeholder="Short description of what this agent does"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>System instructions <span className="text-red-500">*</span></label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
              rows={5}
              placeholder="You are a helpful support assistant for Acme Corp. Answer questions about our products only. Be concise and friendly."
              className={clsx(inputCls, 'resize-y min-h-[100px]')}
            />
            <p className="text-xs text-slate-400 mt-1">
              This is the system prompt that shapes your agent's behavior and personality.
            </p>
          </div>
        </div>

        {/* Model config */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-700">Model Configuration</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Provider <span className="text-red-500">*</span></label>
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
              <label className={labelCls}>Model <span className="text-red-500">*</span></label>
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
            <label className={labelCls}>API Key <span className="text-red-500">*</span></label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-…"
              autoComplete="off"
              className={inputCls}
            />
            <p className="text-xs text-slate-400 mt-1">
              Your API key is stored securely and never exposed to end users.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors"
          >
            {createMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating…
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                Create Agent
              </>
            )}
          </button>
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-700 transition-colors px-3 py-2.5">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
