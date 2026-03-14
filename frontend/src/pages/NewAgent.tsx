import { useState, type FormEvent, type CSSProperties } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle } from 'lucide-react';
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

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: CSSProperties = {
  backgroundColor: '#13131C',
  border: '1px solid #FFFFFF14',
  borderRadius: '10px',
  color: '#E2E2F0',
  fontFamily: '"Inter", system-ui, sans-serif',
  fontSize: '14px',
  outline: 'none',
  padding: '11px 14px',
  width: '100%',
  boxSizing: 'border-box',
};

const labelStyle: CSSProperties = {
  color: '#8888AA',
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  marginBottom: '6px',
};

const cardStyle: CSSProperties = {
  backgroundColor: '#18181FE6',
  border: '1px solid #FFFFFF14',
  borderRadius: '16px',
  padding: '24px',
};

function focusInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.borderColor = '#7C3AED80';
}
function blurInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.borderColor = '#FFFFFF14';
}

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
      setError('API key is required.');
      return;
    }
    createMutation.mutate();
  }

  return (
    <div style={{ fontFamily: '"Inter", system-ui, sans-serif', minHeight: '100%', padding: '40px 48px', position: 'relative' }}>
      {/* BG orbs */}
      <div style={{ bottom: 0, left: 0, pointerEvents: 'none', position: 'fixed', right: 0, top: 0, zIndex: 0 }}>
        <div style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(54.1% 0.096 -0.227 / 22%) 0%, oklab(0% 0 -.0001 / 0%) 70%)', borderRadius: '50%', filter: 'blur(80px)', height: '700px', left: '-100px', position: 'absolute', top: '-200px', width: '700px' }} />
        <div style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(49.1% 0.093 -0.223 / 15%) 0%, oklab(0% 0 -.0001 / 0%) 70%)', borderRadius: '50%', bottom: '-150px', filter: 'blur(70px)', height: '500px', position: 'absolute', right: '200px', width: '500px' }} />
      </div>

      <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
        {/* Back */}
        <Link to="/dashboard" style={{ alignItems: 'center', color: '#8888AA', display: 'inline-flex', fontSize: '13px', gap: '6px', marginBottom: '24px', textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#E2E2F0')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#8888AA')}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <h1 style={{ color: '#E2E2F0', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 6px' }}>Create New Agent</h1>
        <p style={{ color: '#8888AA', fontSize: '13px', margin: '0 0 32px' }}>Configure your AI agent and get an embed script.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{ alignItems: 'flex-start', backgroundColor: '#2D1515', border: '1px solid #7F1D1D', borderRadius: '10px', color: '#FCA5A5', display: 'flex', fontSize: '13px', gap: '8px', padding: '12px 14px' }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
              {error}
            </div>
          )}

          {/* Basic info */}
          <div style={cardStyle}>
            <h2 style={{ color: '#E2E2F0', fontSize: '14px', fontWeight: 600, margin: '0 0 20px' }}>Basic Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Agent name <span style={{ color: '#7C3AED' }}>*</span></label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Support Bot"
                  style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description of what this agent does"
                  style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
              </div>
              <div>
                <label style={labelStyle}>System instructions <span style={{ color: '#7C3AED' }}>*</span></label>
                <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} required rows={5}
                  placeholder="You are a helpful support assistant for Acme Corp. Answer questions about our products only. Be concise and friendly."
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '100px', lineHeight: '1.5' }}
                  onFocus={focusInput} onBlur={blurInput} />
                <p style={{ color: '#44445A', fontSize: '11px', margin: '6px 0 0' }}>This is the system prompt that shapes your agent's behavior and personality.</p>
              </div>
            </div>
          </div>

          {/* Model config */}
          <div style={cardStyle}>
            <h2 style={{ color: '#E2E2F0', fontSize: '14px', fontWeight: 600, margin: '0 0 20px' }}>Model Configuration</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={labelStyle}>Provider <span style={{ color: '#7C3AED' }}>*</span></label>
                  <select value={provider} onChange={(e) => handleProviderChange(Number(e.target.value))}
                    style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238888AA' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', cursor: 'pointer', paddingRight: '36px' }}
                    onFocus={focusInput} onBlur={blurInput}
                  >
                    {PROVIDERS.map((p) => <option key={p.value} value={p.value} style={{ backgroundColor: '#1E1E27' }}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Model <span style={{ color: '#7C3AED' }}>*</span></label>
                  <select value={model} onChange={(e) => setModel(Number(e.target.value) as LlmModel)}
                    style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238888AA' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', cursor: 'pointer', paddingRight: '36px' }}
                    onFocus={focusInput} onBlur={blurInput}
                  >
                    {(MODELS_BY_PROVIDER[provider] ?? []).map((m) => <option key={m.value} value={m.value} style={{ backgroundColor: '#1E1E27' }}>{m.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>API Key <span style={{ color: '#7C3AED' }}>*</span></label>
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-…" autoComplete="off"
                  style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                <p style={{ color: '#44445A', fontSize: '11px', margin: '6px 0 0' }}>Your API key is encrypted and never exposed to end users.</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
            <button type="submit" disabled={createMutation.isPending}
              style={{ alignItems: 'center', backgroundImage: createMutation.isPending ? 'none' : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', backgroundColor: createMutation.isPending ? '#3D2B6D' : undefined, border: 'none', borderRadius: '10px', boxShadow: createMutation.isPending ? 'none' : '#7C3AED59 0px 0px 20px', color: '#FFFFFF', cursor: createMutation.isPending ? 'not-allowed' : 'pointer', display: 'flex', fontSize: '14px', fontWeight: 600, gap: '8px', opacity: createMutation.isPending ? 0.7 : 1, padding: '11px 24px' }}
            >
              {createMutation.isPending ? (
                <><span style={{ animation: 'spin 1s linear infinite', border: '2px solid #FFFFFF40', borderRadius: '50%', borderTopColor: '#FFFFFF', display: 'inline-block', height: '14px', width: '14px' }} /> Creating…</>
              ) : 'Create Agent'}
            </button>
            <Link to="/dashboard" style={{ color: '#8888AA', fontSize: '14px', padding: '11px 16px', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#E2E2F0')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#8888AA')}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
