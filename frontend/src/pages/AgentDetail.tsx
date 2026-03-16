import { useState, useRef, type FormEvent, type CSSProperties, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Copy, CheckCheck, AlertCircle, Loader2, Plus, Globe, FileText, MessageSquare, FileUp, Trash2 } from 'lucide-react';
import { agentsApi, knowledgeApi, LlmProvider, LlmModel } from '../lib/api';

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

const selectStyle: CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238888AA' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  cursor: 'pointer',
  paddingRight: '36px',
};

function focusInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.borderColor = '#7C3AED80';
}
function blurInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.target.style.borderColor = '#FFFFFF14';
}

function EmbedCode({ embedToken, agentName }: { embedToken: string; agentName: string }) {
  const [copied, setCopied] = useState(false);
  const snippet = `<script src="${window.location.origin}/widget.js" data-token="${embedToken}" data-name="${agentName}"></script>`;

  function copy() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div style={cardStyle}>
      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ color: '#E2E2F0', fontSize: '14px', fontWeight: 600, margin: 0 }}>Embed Code</h2>
          <p style={{ color: '#8888AA', fontSize: '12px', margin: '4px 0 0' }}>Paste this into your website's HTML</p>
        </div>
        <button onClick={copy}
          style={{ alignItems: 'center', backgroundColor: copied ? '#22C55E26' : '#FFFFFF0A', border: `1px solid ${copied ? '#22C55E33' : '#FFFFFF14'}`, borderRadius: '8px', color: copied ? '#22C55E' : '#8888AA', cursor: 'pointer', display: 'flex', fontSize: '12px', fontWeight: 500, gap: '6px', padding: '7px 14px', transition: 'all 0.15s' }}
        >
          {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre style={{ backgroundColor: '#0A0A0F', border: '1px solid #FFFFFF0A', borderRadius: '10px', color: '#A78BFA', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.6', margin: 0, overflow: 'auto', padding: '14px 16px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {snippet}
      </pre>
      <div style={{ alignItems: 'flex-start', backgroundColor: '#7C3AED14', border: '1px solid #7C3AED26', borderRadius: '10px', display: 'flex', fontSize: '12px', gap: '8px', marginTop: '12px', padding: '10px 14px' }}>
        <span style={{ color: '#A78BFA', flexShrink: 0 }}>ℹ</span>
        <p style={{ color: '#8888AA', margin: 0 }}>
          Place this script tag just before the closing <code style={{ backgroundColor: '#7C3AED26', borderRadius: '4px', color: '#A78BFA', padding: '1px 5px' }}>&lt;/body&gt;</code> tag.
        </p>
      </div>
    </div>
  );
}

const SOURCE_TYPES = [
  { value: 'url', label: 'Website URL', icon: Globe, placeholder: 'https://example.com/docs' },
  { value: 'text', label: 'Raw Text', icon: FileText, placeholder: 'Paste your text content here…' },
  { value: 'faq', label: 'FAQ', icon: MessageSquare, placeholder: 'Q: Question?\nA: Answer.\n\nQ: Another?\nA: Answer.' },
  { value: 'pdf', label: 'PDF File', icon: FileUp, placeholder: '' },
];

const STATUS_CFG: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: '#F59E0B', bg: '#F59E0B1F', label: 'Pending' },
  processing: { color: '#0EA5E9', bg: '#0EA5E91F', label: 'Processing' },
  ready: { color: '#22C55E', bg: '#22C55E1F', label: 'Ready' },
  failed: { color: '#EF4444', bg: '#EF44441F', label: 'Failed' },
};

function KnowledgeSources({ agentId }: { agentId: string }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [sourceType, setSourceType] = useState('url');
  const [content, setContent] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: sources = [] } = useQuery({
    queryKey: ['knowledge', agentId],
    queryFn: () => knowledgeApi.list(agentId),
    staleTime: 15_000,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      if (sourceType === 'url') {
        return knowledgeApi.add(agentId, { type: 'url', sourceUrl: content });
      }
      if (sourceType === 'pdf' && pdfFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(pdfFile);
        });
        return knowledgeApi.add(agentId, { type: 'pdf', content: base64 });
      }
      return knowledgeApi.add(agentId, { type: sourceType, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge', agentId] });
      setContent('');
      setPdfFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (sourceId: string) => knowledgeApi.remove(agentId, sourceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['knowledge', agentId] }),
  });

  const typeInfo = SOURCE_TYPES.find((t) => t.value === sourceType)!;
  const canSubmit = sourceType === 'pdf' ? !!pdfFile : !!content.trim();

  return (
    <div style={cardStyle}>
      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: sources.length > 0 || showForm ? '16px' : '0' }}>
        <div>
          <h2 style={{ color: '#E2E2F0', fontSize: '14px', fontWeight: 600, margin: 0 }}>Knowledge Sources</h2>
          <p style={{ color: '#8888AA', fontSize: '12px', margin: '4px 0 0' }}>Train your agent with URLs, text, or FAQs</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ alignItems: 'center', backgroundColor: showForm ? '#FFFFFF0A' : '#7C3AED1F', border: `1px solid ${showForm ? '#FFFFFF14' : '#7C3AED33'}`, borderRadius: '8px', color: showForm ? '#8888AA' : '#A78BFA', cursor: 'pointer', display: 'flex', fontSize: '12px', fontWeight: 500, gap: '6px', padding: '7px 14px', transition: 'all 0.15s' }}
        >
          {showForm ? 'Cancel' : <><Plus size={13} /> Add source</>}
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: '#13131C', border: '1px solid #FFFFFF0A', borderRadius: '12px', marginBottom: '16px', padding: '16px' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
            {SOURCE_TYPES.map((t) => (
              <button key={t.value} onClick={() => setSourceType(t.value)}
                style={{ alignItems: 'center', backgroundColor: sourceType === t.value ? '#7C3AED2E' : 'transparent', border: 'none', borderRadius: '8px', color: sourceType === t.value ? '#E2E2F0' : '#8888AA', cursor: 'pointer', display: 'flex', fontSize: '12px', fontWeight: 500, gap: '6px', padding: '6px 12px', transition: 'all 0.15s' }}
              >
                <t.icon size={13} /> {t.label}
              </button>
            ))}
          </div>
          {sourceType === 'url' ? (
            <input type="url" value={content} onChange={(e) => setContent(e.target.value)} placeholder={typeInfo.placeholder}
              style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
          ) : sourceType === 'pdf' ? (
            <div>
              <input ref={fileInputRef} type="file" accept=".pdf,application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                style={{ display: 'none' }} />
              <button type="button" onClick={() => fileInputRef.current?.click()}
                style={{ alignItems: 'center', backgroundColor: '#13131C', border: '1px dashed #FFFFFF26', borderRadius: '10px', color: pdfFile ? '#E2E2F0' : '#8888AA', cursor: 'pointer', display: 'flex', fontSize: '13px', gap: '10px', justifyContent: 'center', padding: '20px', width: '100%', boxSizing: 'border-box' }}>
                <FileUp size={16} style={{ color: pdfFile ? '#A78BFA' : '#8888AA' }} />
                {pdfFile ? pdfFile.name : 'Click to select a PDF file'}
              </button>
              {pdfFile && (
                <p style={{ color: '#44445A', fontSize: '11px', margin: '6px 0 0' }}>
                  {(pdfFile.size / 1024).toFixed(0)} KB — will be sent as base64 for processing
                </p>
              )}
            </div>
          ) : (
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={typeInfo.placeholder} rows={4}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', lineHeight: '1.5' }}
              onFocus={focusInput} onBlur={blurInput} />
          )}
          <button onClick={() => addMutation.mutate()} disabled={!canSubmit || addMutation.isPending}
            style={{ alignItems: 'center', backgroundImage: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', border: 'none', borderRadius: '8px', boxShadow: '#7C3AED40 0px 0px 12px', color: '#FFFFFF', cursor: canSubmit && !addMutation.isPending ? 'pointer' : 'not-allowed', display: 'flex', fontSize: '13px', fontWeight: 600, gap: '6px', marginTop: '12px', opacity: canSubmit && !addMutation.isPending ? 1 : 0.5, padding: '9px 18px' }}
          >
            {addMutation.isPending ? (
              <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Adding…</>
            ) : (
              <><Plus size={13} /> Add {typeInfo.label}</>
            )}
          </button>
        </div>
      )}

      {sources.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sources.map((s) => {
            const st = STATUS_CFG[s.status.toLowerCase()] ?? STATUS_CFG['pending'];
            const iconMap: Record<string, typeof Globe> = { url: Globe, text: FileText, faq: MessageSquare };
            const Icon = iconMap[s.type.toLowerCase()] ?? FileText;
            return (
              <div key={s.id} style={{ alignItems: 'center', backgroundColor: '#13131C', border: '1px solid #FFFFFF0A', borderRadius: '10px', display: 'flex', gap: '12px', padding: '12px 14px' }}>
                <Icon size={15} style={{ color: '#8888AA', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#E2E2F0', fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.sourceUrl || `${s.type} content`}
                  </div>
                  <div style={{ color: '#44445A', fontSize: '11px', marginTop: '2px' }}>
                    Added {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ backgroundColor: st.bg, borderRadius: '20px', flexShrink: 0, paddingBlock: '3px', paddingInline: '8px' }}>
                  <span style={{ color: st.color, fontSize: '10px', fontWeight: 600 }}>{st.label}</span>
                </div>
                <button onClick={() => deleteMutation.mutate(s.id)} disabled={deleteMutation.isPending}
                  title="Delete source"
                  style={{ alignItems: 'center', background: 'none', border: 'none', borderRadius: '6px', color: '#44445A', cursor: 'pointer', display: 'flex', flexShrink: 0, padding: '4px', transition: 'color 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#44445A')}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!showForm && sources.length === 0 && (
        <div style={{ color: '#44445A', fontSize: '13px', paddingTop: '12px', textAlign: 'center' }}>
          No knowledge sources yet. Add URLs or text to train your agent.
        </div>
      )}
    </div>
  );
}

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

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [provider, setProvider] = useState<LlmProvider>(LlmProvider.OpenAi);
  const [model, setModel] = useState<LlmModel>(LlmModel.Gpt4o);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (agent && !hydrated) {
      const providerMap: Record<string, LlmProvider> = {
        OpenAi: LlmProvider.OpenAi,
        Anthropic: LlmProvider.Anthropic,
        Gemini: LlmProvider.Gemini,
      };
      const modelMap: Record<string, LlmModel> = {
        Gpt4o: LlmModel.Gpt4o,
        Gpt4oMini: LlmModel.Gpt4oMini,
        Claude35Sonnet: LlmModel.Claude35Sonnet,
        Claude3Haiku: LlmModel.Claude3Haiku,
        Gemini15Pro: LlmModel.Gemini15Pro,
        Gemini15Flash: LlmModel.Gemini15Flash,
      };
      const providerStr = agent.llmProvider as unknown as string;
      const modelStr = agent.llmModel as unknown as string;
      setName(agent.name);
      setDescription(agent.description ?? '');
      setInstructions(agent.instructions ?? '');
      setProvider(providerMap[providerStr] ?? LlmProvider.OpenAi);
      setModel(modelMap[modelStr] ?? LlmModel.Gpt4o);
      setHydrated(true);
    }
  }, [agent, hydrated]);

  function handleProviderChange(val: LlmProvider) {
    setProvider(val);
    const first = MODELS_BY_PROVIDER[val]?.[0];
    if (first) setModel(first.value);
  }

  const [confirmDelete, setConfirmDelete] = useState(false);

  const deleteAgentMutation = useMutation({
    mutationFn: () => agentsApi.remove(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      navigate('/dashboard');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Failed to delete agent.';
      setError(msg);
      setConfirmDelete(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      agentsApi.update(id!, {
        name, description,
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

  const bgOrbs = (
    <div style={{ bottom: 0, left: 0, pointerEvents: 'none', position: 'fixed', right: 0, top: 0, zIndex: 0 }}>
      <div style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(54.1% 0.096 -0.227 / 22%) 0%, oklab(0% 0 -.0001 / 0%) 70%)', borderRadius: '50%', filter: 'blur(80px)', height: '700px', left: '-100px', position: 'absolute', top: '-200px', width: '700px' }} />
      <div style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(49.1% 0.093 -0.223 / 15%) 0%, oklab(0% 0 -.0001 / 0%) 70%)', borderRadius: '50%', bottom: '-150px', filter: 'blur(70px)', height: '500px', position: 'absolute', right: '200px', width: '500px' }} />
    </div>
  );

  if (isLoading) {
    return (
      <div style={{ alignItems: 'center', color: '#8888AA', display: 'flex', fontFamily: '"Inter", system-ui, sans-serif', gap: '10px', justifyContent: 'center', minHeight: '100%', padding: '80px' }}>
        <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading agent…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isError || (!isLoading && !agent)) {
    return (
      <div style={{ fontFamily: '"Inter", system-ui, sans-serif', padding: '40px 48px', position: 'relative' }}>
        {bgOrbs}
        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
          <Link to="/dashboard" style={{ alignItems: 'center', color: '#8888AA', display: 'inline-flex', fontSize: '13px', gap: '6px', marginBottom: '24px', textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back
          </Link>
          <div style={{ alignItems: 'center', backgroundColor: '#2D1515', border: '1px solid #7F1D1D', borderRadius: '12px', color: '#FCA5A5', display: 'flex', fontSize: '14px', gap: '10px', padding: '16px 20px' }}>
            <AlertCircle size={16} /> Agent not found or failed to load.
          </div>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, { color: string; bg: string; border: string }> = {
    Active: { color: '#22C55E', bg: '#22C55E1F', border: '#22C55E33' },
    Inactive: { color: '#8888AA', bg: '#8888AA1F', border: '#8888AA33' },
    Training: { color: '#F59E0B', bg: '#F59E0B1F', border: '#F59E0B33' },
  };
  const sc = statusColors[agent!.status] ?? statusColors['Inactive'];

  return (
    <div style={{ fontFamily: '"Inter", system-ui, sans-serif', minHeight: '100%', padding: '40px 48px', position: 'relative' }}>
      {bgOrbs}

      <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
        <Link to="/dashboard" style={{ alignItems: 'center', color: '#8888AA', display: 'inline-flex', fontSize: '13px', gap: '6px', marginBottom: '24px', textDecoration: 'none', transition: 'color 0.15s' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#E2E2F0')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#8888AA')}
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div style={{ alignItems: 'center', display: 'flex', gap: '12px', marginBottom: '6px' }}>
          <h1 style={{ color: '#E2E2F0', fontSize: '26px', fontWeight: 700, letterSpacing: '-0.5px', margin: 0 }}>{agent!.name}</h1>
          <div style={{ backgroundColor: sc.bg, border: `1px solid ${sc.border}`, borderRadius: '20px', paddingBlock: '3px', paddingInline: '10px' }}>
            <span style={{ color: sc.color, fontSize: '11px', fontWeight: 600 }}>{agent!.status}</span>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            {confirmDelete ? (
              <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
                <span style={{ color: '#FCA5A5', fontSize: '13px' }}>Delete agent?</span>
                <button onClick={() => deleteAgentMutation.mutate()} disabled={deleteAgentMutation.isPending}
                  style={{ alignItems: 'center', backgroundColor: '#EF4444', border: 'none', borderRadius: '7px', color: '#FFF', cursor: 'pointer', display: 'flex', fontSize: '12px', fontWeight: 600, gap: '4px', padding: '6px 12px', opacity: deleteAgentMutation.isPending ? 0.6 : 1 }}>
                  {deleteAgentMutation.isPending ? 'Deleting…' : 'Yes, delete'}
                </button>
                <button onClick={() => setConfirmDelete(false)}
                  style={{ background: 'none', border: 'none', color: '#8888AA', cursor: 'pointer', fontSize: '12px', padding: '6px 10px' }}>
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                style={{ alignItems: 'center', background: 'none', border: '1px solid #FFFFFF14', borderRadius: '8px', color: '#8888AA', cursor: 'pointer', display: 'flex', fontSize: '12px', gap: '6px', padding: '6px 12px', transition: 'all 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#EF444440'; e.currentTarget.style.color = '#EF4444'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#FFFFFF14'; e.currentTarget.style.color = '#8888AA'; }}
              >
                <Trash2 size={13} /> Delete agent
              </button>
            )}
          </div>
        </div>
        <p style={{ color: '#8888AA', fontSize: '13px', margin: '0 0 32px' }}>
          Created {new Date(agent!.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div style={{ marginBottom: '20px' }}>
          <EmbedCode embedToken={agent!.embedToken} agentName={agent!.name} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <KnowledgeSources agentId={agent!.id} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{ alignItems: 'flex-start', backgroundColor: '#2D1515', border: '1px solid #7F1D1D', borderRadius: '10px', color: '#FCA5A5', display: 'flex', fontSize: '13px', gap: '8px', padding: '12px 14px' }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} /> {error}
            </div>
          )}
          {success && (
            <div style={{ alignItems: 'center', backgroundColor: '#14301F', border: '1px solid #166534', borderRadius: '10px', color: '#86EFAC', display: 'flex', fontSize: '13px', gap: '8px', padding: '12px 14px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" /></svg>
              Agent updated successfully.
            </div>
          )}

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
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description"
                  style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
              </div>
              <div>
                <label style={labelStyle}>System instructions</label>
                <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={5}
                  placeholder="Leave blank to keep current instructions…"
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '100px', lineHeight: '1.5' }}
                  onFocus={focusInput} onBlur={blurInput} />
                <p style={{ color: '#44445A', fontSize: '11px', margin: '6px 0 0' }}>Leave blank to keep existing instructions unchanged.</p>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={{ color: '#E2E2F0', fontSize: '14px', fontWeight: 600, margin: '0 0 20px' }}>Model Configuration</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={labelStyle}>Provider</label>
                  <select value={provider} onChange={(e) => handleProviderChange(Number(e.target.value) as LlmProvider)}
                    style={selectStyle} onFocus={focusInput} onBlur={blurInput}>
                    {PROVIDERS.map((p) => <option key={p.value} value={p.value} style={{ backgroundColor: '#1E1E27' }}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Model</label>
                  <select value={model} onChange={(e) => setModel(Number(e.target.value) as LlmModel)}
                    style={selectStyle} onFocus={focusInput} onBlur={blurInput}>
                    {MODELS_BY_PROVIDER[provider].map((p) => <option key={p.value} value={p.value} style={{ backgroundColor: '#1E1E27' }}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>New API Key</label>
                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Leave blank to keep existing key" autoComplete="off"
                  style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
                <p style={{ color: '#44445A', fontSize: '11px', margin: '6px 0 0' }}>Only fill this if you want to rotate your API key.</p>
              </div>
            </div>
          </div>

          <div style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
            <button type="submit" disabled={updateMutation.isPending}
              style={{ alignItems: 'center', backgroundImage: updateMutation.isPending ? 'none' : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', backgroundColor: updateMutation.isPending ? '#3D2B6D' : undefined, border: 'none', borderRadius: '10px', boxShadow: updateMutation.isPending ? 'none' : '#7C3AED59 0px 0px 20px', color: '#FFFFFF', cursor: updateMutation.isPending ? 'not-allowed' : 'pointer', display: 'flex', fontSize: '14px', fontWeight: 600, gap: '8px', opacity: updateMutation.isPending ? 0.7 : 1, padding: '11px 24px' }}
            >
              {updateMutation.isPending ? (
                <><span style={{ animation: 'spin 1s linear infinite', border: '2px solid #FFFFFF40', borderRadius: '50%', borderTopColor: '#FFFFFF', display: 'inline-block', height: '14px', width: '14px' }} /> Saving…</>
              ) : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard')}
              style={{ background: 'none', border: 'none', color: '#8888AA', cursor: 'pointer', fontSize: '14px', padding: '11px 16px', transition: 'color 0.15s' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#E2E2F0')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = '#8888AA')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
