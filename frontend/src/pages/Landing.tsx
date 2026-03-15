import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../lib/auth';

const CARD_BG = '#18181FE6';
const CARD_BORDER = '#FFFFFF14';
const TEXT = '#E2E2F0';
const MUTED = '#8888AA';
const VIOLET = '#7C3AED';
const DEEP_VIOLET = '#6D28D9';

function Section({ children, id, style }: { children: React.ReactNode; id?: string; style?: React.CSSProperties }) {
  return (
    <section id={id} style={{ paddingBlock: '100px', paddingInline: '80px', position: 'relative', ...style }}>
      {children}
    </section>
  );
}

function SectionTitle({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: '56px', textAlign: 'center' }}>
      <div style={{ alignItems: 'center', backgroundColor: '#7C3AED1F', border: '1px solid #7C3AED40', borderRadius: '20px', display: 'inline-flex', gap: '8px', marginBottom: '20px', paddingBlock: '5px', paddingInline: '14px' }}>
        <div style={{ backgroundColor: VIOLET, borderRadius: '50%', height: '6px', width: '6px' }} />
        <span style={{ color: '#A78BFA', fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em' }}>{badge}</span>
      </div>
      <h2 style={{ color: TEXT, fontSize: '42px', fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.15, margin: '0 auto 16px' }}>{title}</h2>
      <p style={{ color: MUTED, fontSize: '17px', lineHeight: '160%', margin: '0 auto', maxWidth: '560px' }}>{subtitle}</p>
    </div>
  );
}

export default function Landing() {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ backgroundColor: '#0F0F13', fontSynthesis: 'none', MozOsxFontSmoothing: 'grayscale', overflow: 'auto', position: 'relative', WebkitFontSmoothing: 'antialiased', fontFamily: '"Inter", system-ui, sans-serif' }}>
      {/* ── Background orbs ── */}
      <div style={{ bottom: 0, left: 0, position: 'fixed', right: 0, top: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(54.1% 0.096 -0.227 / 20%) 0%, oklab(0% 0 -.0001 / 0%) 65%)', borderRadius: '50%', filter: 'blur(90px)', height: '800px', left: '-100px', position: 'absolute', top: '-200px', width: '800px' }} />
        <div style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(51.1% 0.028 -0.228 / 15%) 0%, oklab(0% 0 -.0001 / 0%) 65%)', borderRadius: '50%', bottom: '20%', filter: 'blur(80px)', height: '600px', position: 'absolute', right: '-50px', width: '600px' }} />
      </div>

      {/* ── Navbar ── */}
      <nav style={{ alignItems: 'center', backdropFilter: 'blur(20px)', backgroundColor: '#0F0F13B3', borderBottom: '1px solid #FFFFFF0D', display: 'flex', height: '68px', left: 0, paddingInline: '64px', position: 'sticky', right: 0, top: 0, zIndex: 50 }}>
        <div style={{ alignItems: 'center', display: 'flex', gap: '10px' }}>
          <div style={{ alignItems: 'center', backgroundImage: `linear-gradient(135deg, ${VIOLET} 0%, ${DEEP_VIOLET} 100%)`, borderRadius: '9px', boxShadow: '#7C3AED73 0px 0px 14px', display: 'flex', flexShrink: 0, height: '32px', justifyContent: 'center', width: '32px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
              <path d="M12 2a8 8 0 0 1 8 8v1a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10a8 8 0 0 1 8-8z" />
              <path d="M8 16v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2" />
            </svg>
          </div>
          <span style={{ color: TEXT, fontSize: '16px', fontWeight: 700, letterSpacing: '-0.3px' }}>AgentForge</span>
        </div>
        <div style={{ alignItems: 'center', display: 'flex', gap: '6px', marginInline: 'auto' }}>
          {[
            { label: 'Features', href: '#features' },
            { label: 'How it works', href: '#how-it-works' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Docs', href: '#docs' },
          ].map((item) => (
            <a key={item.label} href={item.href} style={{ color: MUTED, cursor: 'pointer', fontSize: '14px', fontWeight: 500, paddingBlock: '6px', paddingInline: '14px', textDecoration: 'none' }}>{item.label}</a>
          ))}
        </div>
        <div style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
          <Link to="/login" style={{ color: MUTED, fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>Log in</Link>
          <Link to="/register" style={{ alignItems: 'center', backgroundImage: `linear-gradient(135deg, ${VIOLET} 0%, ${DEEP_VIOLET} 100%)`, borderRadius: '8px', boxShadow: '#7C3AED59 0px 0px 16px', display: 'flex', gap: '8px', paddingBlock: '8px', paddingInline: '18px', textDecoration: 'none' }}>
            <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>Get started free</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <Section style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', paddingTop: '40px', paddingBottom: '40px' }}>
        <div style={{ alignItems: 'center', display: 'flex', gap: '64px', position: 'relative', width: '100%', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, gap: '28px', width: '580px' }}>
            <div style={{ alignItems: 'center', backgroundColor: '#7C3AED1F', border: '1px solid #7C3AED40', borderRadius: '20px', display: 'inline-flex', gap: '8px', paddingBlock: '5px', paddingInline: '14px', width: 'fit-content' }}>
              <div style={{ backgroundColor: VIOLET, borderRadius: '50%', height: '6px', width: '6px' }} />
              <span style={{ color: '#A78BFA', fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em' }}>AI AGENT PLATFORM</span>
            </div>
            <h1 style={{ color: TEXT, fontSize: '68px', fontWeight: 800, letterSpacing: '-2.5px', lineHeight: 1, margin: 0 }}>
              Build AI agents.<br />Embed anywhere.
            </h1>
            <p style={{ color: MUTED, fontSize: '18px', lineHeight: '160%', margin: 0, maxWidth: '480px' }}>
              Create intelligent chat agents powered by GPT-4o, Claude, or Gemini. Deploy to any website with a single line of code.
            </p>
            <div style={{ alignItems: 'center', display: 'flex', gap: '14px' }}>
              <Link to="/register" style={{ alignItems: 'center', backgroundImage: `linear-gradient(135deg, ${VIOLET} 0%, ${DEEP_VIOLET} 100%)`, borderRadius: '10px', boxShadow: '#7C3AED66 0px 0px 24px', display: 'flex', gap: '8px', paddingBlock: '12px', paddingInline: '24px', textDecoration: 'none' }}>
                <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 600 }}>Start for free</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
              </Link>
              <a href="#how-it-works" style={{ alignItems: 'center', backgroundColor: '#FFFFFF08', border: '1px solid #FFFFFF1A', borderRadius: '10px', display: 'flex', gap: '8px', paddingBlock: '12px', paddingInline: '24px', textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT} strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                <span style={{ color: TEXT, fontSize: '15px', fontWeight: 500 }}>See how it works</span>
              </a>
            </div>
            <div style={{ alignItems: 'center', display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex' }}>
                {['#7C3AED', '#06B6D4', '#10B981', '#F59E0B'].map((c, i) => (
                  <div key={i} style={{ backgroundImage: `linear-gradient(135deg, ${c} 0%, ${c}CC 100%)`, border: '2px solid #0F0F13', borderRadius: '50%', height: '28px', marginLeft: i > 0 ? '-8px' : 0, width: '28px' }} />
                ))}
              </div>
              <div>
                <span style={{ color: TEXT, fontSize: '13px', fontWeight: 600 }}>2,000+</span>
                <span style={{ color: MUTED, fontSize: '13px' }}> teams already using AgentForge</span>
              </div>
            </div>
          </div>

          <div style={{ alignItems: 'center', display: 'flex', flex: 1, justifyContent: 'center', position: 'relative' }}>
            <div style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: '16px', boxShadow: '#00000099 0px 32px 80px, #7C3AED1A 0px 0px 0px 1px', height: '420px', overflow: 'clip', transform: 'rotateY(-8deg) rotateX(3deg)', width: '620px' }}>
              <div style={{ alignItems: 'center', backgroundColor: '#1E1E27E6', borderBottom: '1px solid #FFFFFF0D', display: 'flex', gap: '8px', height: '36px', paddingInline: '16px' }}>
                <div style={{ backgroundColor: '#FF5F57', borderRadius: '50%', height: '11px', width: '11px' }} />
                <div style={{ backgroundColor: '#FEBC2E', borderRadius: '50%', height: '11px', width: '11px' }} />
                <div style={{ backgroundColor: '#28C840', borderRadius: '50%', height: '11px', width: '11px' }} />
                <div style={{ alignItems: 'center', backgroundColor: '#FFFFFF0A', borderRadius: '4px', display: 'flex', flex: 1, height: '22px', marginInline: '16px', paddingInline: '10px' }}>
                  <span style={{ color: '#44445A', fontSize: '11px' }}>app.agentforge.ai/dashboard</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[
                    { val: '6', label: 'Total Agents', sub: '4 active', subColor: VIOLET },
                    { val: '15.8k', label: 'Messages', sub: '+18% this month', subColor: '#0EA5E9' },
                    { val: '4', label: 'Active Now', sub: 'All healthy', subColor: '#22C55E' },
                  ].map((s) => (
                    <div key={s.label} style={{ backgroundColor: '#1E1E27B3', border: '1px solid #FFFFFF0F', borderRadius: '10px', flex: 1, padding: '14px' }}>
                      <div style={{ color: TEXT, fontSize: '20px', fontWeight: 700 }}>{s.val}</div>
                      <div style={{ color: MUTED, fontSize: '11px', marginTop: '2px' }}>{s.label}</div>
                      <div style={{ color: s.subColor, fontSize: '10px', marginTop: '2px' }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[
                    { name: 'Support Sage', color: '#7C3AED', model: 'Claude', modelColor: '#CC785C' },
                    { name: 'Onboard Buddy', color: '#0EA5E9', model: 'GPT-4o', modelColor: '#10A37F' },
                  ].map((a) => (
                    <div key={a.name} style={{ alignItems: 'center', backgroundColor: '#1E1E27B3', border: '1px solid #FFFFFF0F', borderRadius: '10px', display: 'flex', flex: 1, gap: '10px', padding: '14px' }}>
                      <div style={{ backgroundColor: a.color + '33', borderRadius: '8px', height: '32px', width: '32px' }} />
                      <div>
                        <div style={{ color: TEXT, fontSize: '12px', fontWeight: 600 }}>{a.name}</div>
                        <div style={{ color: '#22C55E', fontSize: '10px', marginTop: '1px' }}>● active</div>
                      </div>
                      <div style={{ backgroundColor: a.modelColor + '26', borderRadius: '20px', marginLeft: 'auto', paddingBlock: '2px', paddingInline: '7px' }}>
                        <span style={{ color: a.modelColor, fontSize: '10px', fontWeight: 600 }}>{a.model}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ alignItems: 'center', backgroundColor: '#7C3AED14', border: '1px solid #7C3AED33', borderRadius: '10px', display: 'flex', gap: '12px', padding: '12px 16px' }}>
                  <div style={{ backgroundColor: '#22C55E', borderRadius: '50%', height: '8px', width: '8px' }} />
                  <span style={{ color: TEXT, fontSize: '12px' }}>Support Sage answered 47 questions today</span>
                  <span style={{ color: MUTED, fontSize: '11px', marginLeft: 'auto' }}>just now</span>
                </div>
              </div>
            </div>
            <div style={{ backgroundColor: '#18181FF2', border: '1px solid #7C3AED4D', borderRadius: '12px', boxShadow: '#00000066 0px 8px 32px', padding: '12px 16px', position: 'absolute', right: '-10px', top: '30px' }}>
              <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
                <div style={{ backgroundColor: '#22C55E', borderRadius: '50%', height: '8px', width: '8px' }} />
                <span style={{ color: TEXT, fontSize: '12px', fontWeight: 600 }}>Live · 4.8k msgs today</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════ FEATURES ═══════════════════════ */}
      <Section id="features" style={{ paddingTop: '80px' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <SectionTitle badge="FEATURES" title="Everything you need to ship AI agents" subtitle="From creation to deployment — a complete toolkit for building, training, and embedding intelligent assistants." />
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[
              { emoji: '🤖', color: VIOLET, title: 'Multi-model support', desc: 'Choose GPT-4o, Claude 3.5 Sonnet, or Gemini 1.5 Pro. Switch models anytime without changing code.' },
              { emoji: '📄', color: '#0EA5E9', title: 'Knowledge ingestion', desc: 'Feed your agent URLs, PDFs, or raw text. We chunk, embed, and index everything automatically via RAG.' },
              { emoji: '🔌', color: '#22C55E', title: 'One-line embed', desc: 'Add a single script tag to any website. No frameworks, no dependencies — works everywhere.' },
              { emoji: '🔑', color: '#F59E0B', title: 'Bring your own key', desc: 'Use your own OpenAI, Anthropic, or Google API key. Full control over costs and rate limits.' },
              { emoji: '📊', color: '#EC4899', title: 'Real-time analytics', desc: 'Track messages, conversations, response times, and costs. See what your users are asking about.' },
              { emoji: '🎨', color: '#6366F1', title: 'Customizable widget', desc: 'Set your agent\'s name, avatar, and greeting. Match the chat widget to your brand.' },
            ].map((f) => (
              <div key={f.title} style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: '16px', padding: '28px' }}>
                <div style={{ alignItems: 'center', backgroundColor: f.color + '1F', border: `1px solid ${f.color}33`, borderRadius: '12px', display: 'flex', fontSize: '20px', height: '48px', justifyContent: 'center', marginBottom: '18px', width: '48px' }}>
                  {f.emoji}
                </div>
                <h3 style={{ color: TEXT, fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ color: MUTED, fontSize: '14px', lineHeight: '165%', margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <Section id="how-it-works">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <SectionTitle badge="HOW IT WORKS" title="Three steps to your AI agent" subtitle="Go from zero to a deployed AI assistant in under five minutes." />
          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
            {[
              { step: '01', title: 'Create your agent', desc: 'Pick a name, choose an AI model, and write a system prompt describing your agent\'s role and personality.', color: VIOLET },
              { step: '02', title: 'Add knowledge', desc: 'Upload URLs, PDFs, or paste text. Your agent learns from your content through automatic RAG processing.', color: '#0EA5E9' },
              { step: '03', title: 'Embed & go live', desc: 'Copy the embed code, paste it into your site. Your AI agent is live and ready to chat with visitors.', color: '#22C55E' },
            ].map((s) => (
              <div key={s.step} style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: '16px', flex: 1, maxWidth: '380px', padding: '32px' }}>
                <div style={{ color: s.color, fontSize: '48px', fontWeight: 800, letterSpacing: '-2px', marginBottom: '16px', opacity: 0.25 }}>{s.step}</div>
                <h3 style={{ color: TEXT, fontSize: '18px', fontWeight: 600, margin: '0 0 10px' }}>{s.title}</h3>
                <p style={{ color: MUTED, fontSize: '14px', lineHeight: '165%', margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════ EMBED CODE ═══════════════════════ */}
      <Section>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <SectionTitle badge="EMBED CODE" title="One script tag. That's it." subtitle="Drop this into any website and your AI agent appears as a chat widget." />
          <div style={{ backgroundColor: '#0A0A0F', border: '1px solid #FFFFFF0A', borderRadius: '16px', margin: '0 auto', maxWidth: '720px', overflow: 'hidden' }}>
            <div style={{ alignItems: 'center', backgroundColor: '#1E1E27', borderBottom: '1px solid #FFFFFF0D', display: 'flex', gap: '8px', padding: '10px 16px' }}>
              <div style={{ backgroundColor: '#FF5F57', borderRadius: '50%', height: '10px', width: '10px' }} />
              <div style={{ backgroundColor: '#FEBC2E', borderRadius: '50%', height: '10px', width: '10px' }} />
              <div style={{ backgroundColor: '#28C840', borderRadius: '50%', height: '10px', width: '10px' }} />
              <span style={{ color: '#44445A', fontSize: '12px', marginLeft: '12px' }}>index.html</span>
            </div>
            <pre style={{ color: '#A78BFA', fontFamily: '"JetBrains Mono", "Fira Code", monospace', fontSize: '14px', lineHeight: '1.7', margin: 0, overflow: 'auto', padding: '24px 28px' }}>
{`<script
  src="https://agent-forge.duckdns.org/widget.js"
  data-token="YOUR_EMBED_TOKEN"
  data-name="Support Agent"
></script>`}
            </pre>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════ PRICING ═══════════════════════ */}
      <Section id="pricing">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <SectionTitle badge="PRICING" title="Simple, transparent pricing" subtitle="Start free. Upgrade when you need more power." />
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            {[
              {
                name: 'Free', price: '$0', period: '/month', featured: false,
                features: ['1 AI agent', '5 knowledge sources', '100 messages / month', 'All AI models', 'Chat widget embed', 'Community support'],
                cta: 'Get started',
              },
              {
                name: 'Pro', price: '$29', period: '/month', featured: true,
                features: ['10 AI agents', 'Unlimited sources', '5,000 messages / month', 'All AI models', 'Custom branding', 'Priority support', 'Analytics dashboard'],
                cta: 'Start free trial',
              },
              {
                name: 'Business', price: '$99', period: '/month', featured: false,
                features: ['Unlimited agents', 'Unlimited sources', 'Unlimited messages', 'All AI models', 'Custom branding', 'Dedicated support', 'Advanced analytics', 'Team management'],
                cta: 'Contact sales',
              },
            ].map((plan) => (
              <div key={plan.name} style={{
                backgroundColor: plan.featured ? '#1E1E27' : CARD_BG,
                border: `1px solid ${plan.featured ? '#7C3AED4D' : CARD_BORDER}`,
                borderRadius: '20px',
                boxShadow: plan.featured ? '#7C3AED26 0px 0px 40px' : 'none',
                display: 'flex',
                flexDirection: 'column',
                padding: '36px 32px',
                position: 'relative',
                transform: plan.featured ? 'scale(1.04)' : 'none',
                width: '340px',
              }}>
                {plan.featured && (
                  <div style={{ backgroundColor: VIOLET, borderRadius: '20px', color: '#FFFFFF', fontSize: '11px', fontWeight: 700, left: '50%', letterSpacing: '0.04em', paddingBlock: '4px', paddingInline: '14px', position: 'absolute', top: '-12px', transform: 'translateX(-50%)' }}>
                    MOST POPULAR
                  </div>
                )}
                <h3 style={{ color: TEXT, fontSize: '20px', fontWeight: 700, margin: '0 0 4px' }}>{plan.name}</h3>
                <div style={{ alignItems: 'baseline', display: 'flex', gap: '4px', marginBottom: '24px' }}>
                  <span style={{ color: TEXT, fontSize: '40px', fontWeight: 800, letterSpacing: '-1px' }}>{plan.price}</span>
                  <span style={{ color: MUTED, fontSize: '14px' }}>{plan.period}</span>
                </div>
                <ul style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '12px', listStyle: 'none', margin: '0 0 28px', padding: 0 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ alignItems: 'center', color: '#B8B8CC', display: 'flex', fontSize: '14px', gap: '10px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={plan.featured ? '#A78BFA' : '#22C55E'} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" style={{
                  alignItems: 'center',
                  backgroundImage: plan.featured ? `linear-gradient(135deg, ${VIOLET} 0%, ${DEEP_VIOLET} 100%)` : 'none',
                  backgroundColor: plan.featured ? undefined : '#FFFFFF0A',
                  border: plan.featured ? 'none' : '1px solid #FFFFFF1A',
                  borderRadius: '10px',
                  boxShadow: plan.featured ? '#7C3AED59 0px 0px 20px' : 'none',
                  color: plan.featured ? '#FFFFFF' : TEXT,
                  display: 'flex',
                  fontSize: '14px',
                  fontWeight: 600,
                  justifyContent: 'center',
                  padding: '12px',
                  textDecoration: 'none',
                }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════ DOCS ═══════════════════════ */}
      <Section id="docs">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <SectionTitle badge="DOCUMENTATION" title="Built for developers" subtitle="Clean REST API, webhook events, and comprehensive docs to integrate AgentForge into your stack." />
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '960px', margin: '0 auto' }}>
            {[
              { title: 'REST API', desc: 'Full CRUD for agents, knowledge sources, and conversations. JWT auth, clean JSON responses.', icon: '{ }' },
              { title: 'Widget SDK', desc: 'Customize the chat widget appearance, behavior, and event hooks with data attributes.', icon: '</>' },
              { title: 'Webhooks', desc: 'Get notified when conversations happen, knowledge finishes processing, or limits are reached.', icon: '⚡' },
            ].map((d) => (
              <div key={d.title} style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`, borderRadius: '16px', padding: '28px' }}>
                <div style={{ alignItems: 'center', backgroundColor: '#7C3AED1F', border: '1px solid #7C3AED33', borderRadius: '12px', color: '#A78BFA', display: 'flex', fontFamily: 'monospace', fontSize: '16px', fontWeight: 700, height: '48px', justifyContent: 'center', marginBottom: '18px', width: '48px' }}>
                  {d.icon}
                </div>
                <h3 style={{ color: TEXT, fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>{d.title}</h3>
                <p style={{ color: MUTED, fontSize: '14px', lineHeight: '165%', margin: 0 }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════ CTA ═══════════════════════ */}
      <Section style={{ paddingBottom: '40px' }}>
        <div style={{ backgroundColor: '#1E1E27', border: `1px solid ${CARD_BORDER}`, borderRadius: '24px', margin: '0 auto', maxWidth: '800px', overflow: 'hidden', padding: '64px', position: 'relative', textAlign: 'center', zIndex: 1 }}>
          <div style={{ backgroundImage: `radial-gradient(circle at center, ${VIOLET}33 0%, transparent 60%)`, height: '400px', left: '50%', pointerEvents: 'none', position: 'absolute', top: '-100px', transform: 'translateX(-50%)', width: '600px' }} />
          <h2 style={{ color: TEXT, fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', margin: '0 0 14px', position: 'relative' }}>
            Ready to build your AI agent?
          </h2>
          <p style={{ color: MUTED, fontSize: '16px', margin: '0 0 32px', position: 'relative' }}>
            Start free — no credit card required. Deploy your first agent in minutes.
          </p>
          <Link to="/register" style={{ alignItems: 'center', backgroundImage: `linear-gradient(135deg, ${VIOLET} 0%, ${DEEP_VIOLET} 100%)`, borderRadius: '12px', boxShadow: '#7C3AED66 0px 0px 28px', display: 'inline-flex', fontSize: '16px', fontWeight: 600, gap: '8px', paddingBlock: '14px', paddingInline: '32px', position: 'relative', textDecoration: 'none' }}>
            <span style={{ color: '#FFFFFF' }}>Get started for free</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
        </div>
      </Section>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer style={{ borderTop: '1px solid #FFFFFF0D', padding: '40px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: '10px' }}>
            <div style={{ alignItems: 'center', backgroundImage: `linear-gradient(135deg, ${VIOLET} 0%, ${DEEP_VIOLET} 100%)`, borderRadius: '8px', display: 'flex', height: '28px', justifyContent: 'center', width: '28px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
                <path d="M12 2a8 8 0 0 1 8 8v1a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10a8 8 0 0 1 8-8z" />
                <path d="M8 16v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2" />
              </svg>
            </div>
            <span style={{ color: '#44445A', fontSize: '13px' }}>© 2026 AgentForge. All rights reserved.</span>
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            {['Privacy', 'Terms', 'GitHub'].map((l) => (
              <span key={l} style={{ color: '#44445A', cursor: 'pointer', fontSize: '13px' }}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
