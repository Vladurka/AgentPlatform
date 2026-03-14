import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../lib/auth';

export default function Landing() {
  const token = useAuthStore((s) => s.token);
  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ backgroundColor: '#0F0F13', fontSynthesis: 'none', height: '100vh', minHeight: '900px', MozOsxFontSmoothing: 'grayscale', overflow: 'clip', position: 'relative', WebkitFontSmoothing: 'antialiased', fontFamily: '"Inter", system-ui, sans-serif' }}>
      {/* Background orbs */}
      <div style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, pointerEvents: 'none' }}>
        <div style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(54.1% 0.096 -0.227 / 20%) 0%, oklab(0% 0 -.0001 / 0%) 65%)', borderRadius: '50%', filter: 'blur(90px)', height: '800px', left: '-100px', position: 'absolute', top: '-200px', width: '800px' }} />
        <div style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(51.1% 0.028 -0.228 / 15%) 0%, oklab(0% 0 -.0001 / 0%) 65%)', borderRadius: '50%', bottom: '-100px', filter: 'blur(80px)', height: '600px', position: 'absolute', right: '-50px', width: '600px' }} />
        <div style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(60.6% 0.085 -0.202 / 8%) 0%, oklab(0% 0 -.0001 / 0%) 65%)', borderRadius: '50%', filter: 'blur(60px)', height: '400px', position: 'absolute', right: '400px', top: '200px', width: '400px' }} />
      </div>

      {/* Navbar */}
      <nav style={{ alignItems: 'center', backdropFilter: 'blur(20px)', backgroundColor: '#0F0F13B3', borderBottom: '1px solid #FFFFFF0D', display: 'flex', height: '68px', left: 0, paddingInline: '64px', position: 'absolute', right: 0, top: 0, zIndex: 10 }}>
        {/* Logo */}
        <div style={{ alignItems: 'center', display: 'flex', gap: '10px' }}>
          <div style={{ alignItems: 'center', backgroundImage: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', borderRadius: '9px', boxShadow: '#7C3AED73 0px 0px 14px', display: 'flex', flexShrink: 0, height: '32px', justifyContent: 'center', width: '32px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
              <path d="M12 2a8 8 0 0 1 8 8v1a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10a8 8 0 0 1 8-8z" />
              <path d="M8 16v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2" />
            </svg>
          </div>
          <span style={{ color: '#E2E2F0', fontSize: '16px', fontWeight: 700, letterSpacing: '-0.3px' }}>AgentForge</span>
        </div>

        {/* Nav links */}
        <div style={{ alignItems: 'center', display: 'flex', gap: '6px', marginInline: 'auto' }}>
          {['Features', 'Pricing', 'Docs', 'Blog'].map((item) => (
            <span key={item} style={{ color: '#8888AA', cursor: 'pointer', fontSize: '14px', fontWeight: 500, paddingBlock: '6px', paddingInline: '14px' }}>{item}</span>
          ))}
        </div>

        {/* Auth buttons */}
        <div style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
          <Link to="/login" style={{ color: '#8888AA', fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>Log in</Link>
          <Link to="/register" style={{ alignItems: 'center', backgroundImage: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', borderRadius: '8px', boxShadow: '#7C3AED59 0px 0px 16px', display: 'flex', gap: '8px', paddingBlock: '8px', paddingInline: '18px', textDecoration: 'none' }}>
            <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>Get started free</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ alignItems: 'center', bottom: '160px', display: 'flex', left: 0, paddingLeft: '80px', paddingRight: '64px', position: 'absolute', right: 0, top: '68px' }}>
        {/* Left copy */}
        <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, gap: '28px', width: '580px' }}>
          <div style={{ alignItems: 'center', backgroundColor: '#7C3AED1F', border: '1px solid #7C3AED40', borderRadius: '20px', display: 'inline-flex', gap: '8px', paddingBlock: '5px', paddingInline: '14px', width: 'fit-content' }}>
            <div style={{ backgroundColor: '#7C3AED', borderRadius: '50%', flexShrink: 0, height: '6px', width: '6px' }} />
            <span style={{ color: '#A78BFA', fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em' }}>AI AGENT PLATFORM</span>
          </div>

          <h1 style={{ color: '#E2E2F0', fontSize: '68px', fontWeight: 800, letterSpacing: '-2.5px', lineHeight: 1, margin: 0, whiteSpace: 'pre-wrap' }}>
            Build AI agents.<br />Embed anywhere.
          </h1>

          <p style={{ color: '#8888AA', fontSize: '18px', lineHeight: '160%', margin: 0, maxWidth: '480px' }}>
            Create intelligent chat agents powered by GPT-4o, Claude, or Gemini. Deploy to any website with a single line of code.
          </p>

          <div style={{ alignItems: 'center', display: 'flex', gap: '14px' }}>
            <Link to="/register" style={{ alignItems: 'center', backgroundImage: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', borderRadius: '10px', boxShadow: '#7C3AED66 0px 0px 24px', display: 'flex', gap: '8px', paddingBlock: '12px', paddingInline: '24px', textDecoration: 'none' }}>
              <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 600 }}>Start for free</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
            <div style={{ alignItems: 'center', backgroundColor: '#FFFFFF08', border: '1px solid #FFFFFF1A', borderRadius: '10px', cursor: 'pointer', display: 'flex', gap: '8px', paddingBlock: '12px', paddingInline: '24px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E2E2F0" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              <span style={{ color: '#E2E2F0', fontSize: '15px', fontWeight: 500 }}>Watch demo</span>
            </div>
          </div>

          {/* Social proof */}
          <div style={{ alignItems: 'center', display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex' }}>
              {[
                'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)',
                'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              ].map((bg, i) => (
                <div key={i} style={{ backgroundImage: bg, border: '2px solid #0F0F13', borderRadius: '50%', flexShrink: 0, height: '28px', marginLeft: i > 0 ? '-8px' : 0, width: '28px' }} />
              ))}
            </div>
            <div>
              <span style={{ color: '#E2E2F0', fontSize: '13px', fontWeight: 600 }}>2,000+</span>
              <span style={{ color: '#8888AA', fontSize: '13px' }}> teams already using AgentForge</span>
            </div>
          </div>
        </div>

        {/* Right — mock dashboard */}
        <div style={{ alignItems: 'center', display: 'flex', flex: 1, justifyContent: 'center', position: 'relative' }}>
          {/* Browser window */}
          <div style={{ backgroundColor: '#18181FE6', border: '1px solid #FFFFFF14', borderRadius: '16px', boxShadow: '#00000099 0px 32px 80px, #7C3AED1A 0px 0px 0px 1px', flexShrink: 0, height: '420px', overflow: 'clip', transform: 'rotateY(-8deg) rotateX(3deg)', width: '620px' }}>
            {/* Browser chrome */}
            <div style={{ alignItems: 'center', backgroundColor: '#1E1E27E6', borderBottom: '1px solid #FFFFFF0D', display: 'flex', gap: '8px', height: '36px', paddingInline: '16px' }}>
              <div style={{ backgroundColor: '#FF5F57', borderRadius: '50%', flexShrink: 0, height: '11px', width: '11px' }} />
              <div style={{ backgroundColor: '#FEBC2E', borderRadius: '50%', flexShrink: 0, height: '11px', width: '11px' }} />
              <div style={{ backgroundColor: '#28C840', borderRadius: '50%', flexShrink: 0, height: '11px', width: '11px' }} />
              <div style={{ alignItems: 'center', backgroundColor: '#FFFFFF0A', borderRadius: '4px', display: 'flex', flex: 1, height: '22px', marginInline: '16px', paddingInline: '10px' }}>
                <span style={{ color: '#44445A', fontSize: '11px' }}>app.agentforge.ai/dashboard</span>
              </div>
            </div>
            {/* Dashboard content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBlock: '20px', paddingInline: '20px' }}>
              {/* Stats row */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { val: '6', label: 'Total Agents', sub: '4 active', subColor: '#7C3AED' },
                  { val: '15.8k', label: 'Messages', sub: '+18% this month', subColor: '#0EA5E9' },
                  { val: '4', label: 'Active Now', sub: 'All healthy', subColor: '#22C55E' },
                ].map((s) => (
                  <div key={s.label} style={{ backgroundColor: '#1E1E27B3', border: '1px solid #FFFFFF0F', borderRadius: '10px', flex: 1, paddingBlock: '14px', paddingInline: '14px' }}>
                    <div style={{ color: '#E2E2F0', fontSize: '20px', fontWeight: 700 }}>{s.val}</div>
                    <div style={{ color: '#8888AA', fontSize: '11px', marginTop: '2px' }}>{s.label}</div>
                    <div style={{ color: s.subColor, fontSize: '10px', marginTop: '2px' }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              {/* Agent cards */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ alignItems: 'center', backgroundColor: '#1E1E27B3', border: '1px solid #FFFFFF0F', borderRadius: '10px', display: 'flex', flex: 1, gap: '10px', paddingBlock: '14px', paddingInline: '14px' }}>
                  <div style={{ backgroundColor: '#7C3AED33', borderRadius: '8px', flexShrink: 0, height: '32px', width: '32px' }} />
                  <div>
                    <div style={{ color: '#E2E2F0', fontSize: '12px', fontWeight: 600 }}>Support Sage</div>
                    <div style={{ color: '#22C55E', fontSize: '10px', marginTop: '1px' }}>● active</div>
                  </div>
                  <div style={{ backgroundColor: '#CC785C26', borderRadius: '20px', marginLeft: 'auto', paddingBlock: '2px', paddingInline: '7px' }}>
                    <span style={{ color: '#CC785C', fontSize: '10px', fontWeight: 600 }}>Claude</span>
                  </div>
                </div>
                <div style={{ alignItems: 'center', backgroundColor: '#1E1E27B3', border: '1px solid #FFFFFF0F', borderRadius: '10px', display: 'flex', flex: 1, gap: '10px', paddingBlock: '14px', paddingInline: '14px' }}>
                  <div style={{ backgroundColor: '#0EA5E933', borderRadius: '8px', flexShrink: 0, height: '32px', width: '32px' }} />
                  <div>
                    <div style={{ color: '#E2E2F0', fontSize: '12px', fontWeight: 600 }}>Onboard Buddy</div>
                    <div style={{ color: '#22C55E', fontSize: '10px', marginTop: '1px' }}>● active</div>
                  </div>
                  <div style={{ backgroundColor: '#10A37F26', borderRadius: '20px', marginLeft: 'auto', paddingBlock: '2px', paddingInline: '7px' }}>
                    <span style={{ color: '#10A37F', fontSize: '10px', fontWeight: 600 }}>GPT-4o</span>
                  </div>
                </div>
              </div>
              {/* Activity */}
              <div style={{ alignItems: 'center', backgroundColor: '#7C3AED14', border: '1px solid #7C3AED33', borderRadius: '10px', display: 'flex', gap: '12px', paddingBlock: '12px', paddingInline: '16px' }}>
                <div style={{ backgroundColor: '#22C55E', borderRadius: '50%', flexShrink: 0, height: '8px', width: '8px' }} />
                <span style={{ color: '#E2E2F0', fontSize: '12px' }}>Support Sage answered 47 questions today</span>
                <span style={{ color: '#8888AA', fontSize: '11px', marginLeft: 'auto' }}>just now</span>
              </div>
            </div>
          </div>
          {/* Live badge */}
          <div style={{ backgroundColor: '#18181FF2', border: '1px solid #7C3AED4D', borderRadius: '12px', boxShadow: '#00000066 0px 8px 32px', paddingBlock: '12px', paddingInline: '16px', position: 'absolute', right: '-10px', top: '30px' }}>
            <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
              <div style={{ backgroundColor: '#22C55E', borderRadius: '50%', flexShrink: 0, height: '8px', width: '8px' }} />
              <span style={{ color: '#E2E2F0', fontSize: '12px', fontWeight: 600 }}>Live · 4.8k msgs today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features bar */}
      <div style={{ alignItems: 'center', backdropFilter: 'blur(16px)', backgroundColor: '#121219B3', borderTop: '1px solid #FFFFFF0D', bottom: 0, display: 'flex', height: '160px', left: 0, paddingInline: '80px', position: 'absolute', right: 0 }}>
        {[
          {
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" /><line x1="9" y1="9" x2="9" y2="15" /><line x1="15" y1="9" x2="15" y2="15" /></svg>,
            iconBg: '#7C3AED26', iconBorder: '#7C3AED40',
            title: 'Any AI model',
            desc: 'GPT-4o, Claude 3.5, Gemini 1.5 — pick the best for your use case.',
            border: true,
          },
          {
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
            iconBg: '#0EA5E91F', iconBorder: '#0EA5E933',
            title: 'One-line embed',
            desc: 'Paste one script tag. Works on any website, no framework needed.',
            border: true,
          },
          {
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
            iconBg: '#22C55E1F', iconBorder: '#22C55E33',
            title: 'Live analytics',
            desc: 'Track messages, conversations, and performance in real-time.',
            border: false,
          },
        ].map((f) => (
          <div key={f.title} style={{ alignItems: 'center', borderRight: f.border ? '1px solid #FFFFFF0D' : 'none', display: 'flex', flex: 1, gap: '20px', paddingInline: f.border ? '0 48px' : '48px 0' }}>
            <div style={{ alignItems: 'center', backgroundColor: f.iconBg, border: `1px solid ${f.iconBorder}`, borderRadius: '12px', display: 'flex', flexShrink: 0, height: '44px', justifyContent: 'center', width: '44px' }}>
              {f.icon}
            </div>
            <div>
              <div style={{ color: '#E2E2F0', fontSize: '15px', fontWeight: 600 }}>{f.title}</div>
              <div style={{ color: '#8888AA', fontSize: '13px', marginTop: '4px' }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
