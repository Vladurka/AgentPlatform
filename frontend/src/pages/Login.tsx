import { useState, type FormEvent } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authApi } from '../lib/api';
import { useAuthStore } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const token = useAuthStore((s) => s.token);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (token) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { accessToken, user } = await authApi.login(email, password);
      setAuth(accessToken, user);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Invalid email or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ backgroundColor: '#0F0F13', fontFamily: '"Inter", system-ui, sans-serif', fontSynthesis: 'none', minHeight: '100vh', MozOsxFontSmoothing: 'grayscale', overflow: 'clip', position: 'relative', WebkitFontSmoothing: 'antialiased' }}>
      {/* Background orbs */}
      <div style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, pointerEvents: 'none' }}>
        <div style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(54.1% 0.096 -0.227 / 20%) 0%, oklab(0% 0 -.0001 / 0%) 65%)', borderRadius: '50%', filter: 'blur(90px)', height: '800px', left: '-100px', position: 'absolute', top: '-200px', width: '800px' }} />
        <div style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(51.1% 0.028 -0.228 / 15%) 0%, oklab(0% 0 -.0001 / 0%) 65%)', borderRadius: '50%', bottom: '-100px', filter: 'blur(80px)', height: '600px', position: 'absolute', right: '-50px', width: '600px' }} />
        <div style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(60.6% 0.085 -0.202 / 8%) 0%, oklab(0% 0 -.0001 / 0%) 65%)', borderRadius: '50%', filter: 'blur(60px)', height: '400px', position: 'absolute', right: '400px', top: '200px', width: '400px' }} />
      </div>

      {/* Navbar */}
      <nav style={{ alignItems: 'center', backdropFilter: 'blur(20px)', backgroundColor: '#0F0F13B3', borderBottom: '1px solid #FFFFFF0D', display: 'flex', height: '68px', left: 0, paddingInline: '64px', position: 'absolute', right: 0, top: 0, zIndex: 10 }}>
        <Link to="/" style={{ alignItems: 'center', display: 'flex', gap: '10px', textDecoration: 'none' }}>
          <div style={{ alignItems: 'center', backgroundImage: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', borderRadius: '9px', boxShadow: '#7C3AED73 0px 0px 14px', display: 'flex', flexShrink: 0, height: '32px', justifyContent: 'center', width: '32px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
              <path d="M12 2a8 8 0 0 1 8 8v1a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10a8 8 0 0 1 8-8z" />
              <path d="M8 16v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2" />
            </svg>
          </div>
          <span style={{ color: '#E2E2F0', fontSize: '16px', fontWeight: 700, letterSpacing: '-0.3px' }}>AgentForge</span>
        </Link>
        <div style={{ marginLeft: 'auto', alignItems: 'center', display: 'flex', gap: '12px' }}>
          <span style={{ color: '#8888AA', fontSize: '14px' }}>Don't have an account?</span>
          <Link to="/register" style={{ alignItems: 'center', backgroundImage: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', borderRadius: '8px', boxShadow: '#7C3AED59 0px 0px 16px', display: 'flex', gap: '8px', paddingBlock: '8px', paddingInline: '18px', textDecoration: 'none' }}>
            <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>Get started free</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </Link>
        </div>
      </nav>

      {/* Login card */}
      <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', minHeight: '100vh', paddingTop: '68px', position: 'relative', zIndex: 1 }}>
        <div style={{ backgroundColor: '#18181FE6', border: '1px solid #FFFFFF14', borderRadius: '20px', boxShadow: '#00000066 0px 32px 80px, #7C3AED1A 0px 0px 0px 1px', padding: '40px', width: '100%', maxWidth: '400px' }}>
          {/* Logo */}
          <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', marginBottom: '32px' }}>
            <div style={{ alignItems: 'center', backgroundImage: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', borderRadius: '14px', boxShadow: '#7C3AED73 0px 0px 20px', display: 'flex', height: '48px', justifyContent: 'center', marginBottom: '16px', width: '48px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
                <path d="M12 2a8 8 0 0 1 8 8v1a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V10a8 8 0 0 1 8-8z" />
                <path d="M8 16v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2" />
              </svg>
            </div>
            <h1 style={{ color: '#E2E2F0', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.4px', margin: 0 }}>Welcome back</h1>
            <p style={{ color: '#8888AA', fontSize: '14px', margin: '6px 0 0' }}>Sign in to your AgentForge account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ alignItems: 'flex-start', backgroundColor: '#2D1515', border: '1px solid #7F1D1D', borderRadius: '10px', color: '#FCA5A5', display: 'flex', fontSize: '13px', gap: '8px', padding: '12px 14px' }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                {error}
              </div>
            )}

            <div>
              <label style={{ color: '#8888AA', display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{ backgroundColor: '#0F0F1380', border: '1px solid #FFFFFF14', borderRadius: '10px', color: '#E2E2F0', fontSize: '14px', outline: 'none', padding: '11px 14px', width: '100%', boxSizing: 'border-box' }}
                onFocus={(e) => (e.target.style.borderColor = '#7C3AED80')}
                onBlur={(e) => (e.target.style.borderColor = '#FFFFFF14')}
              />
            </div>

            <div>
              <label style={{ color: '#8888AA', display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ backgroundColor: '#0F0F1380', border: '1px solid #FFFFFF14', borderRadius: '10px', color: '#E2E2F0', fontSize: '14px', outline: 'none', padding: '11px 42px 11px 14px', width: '100%', boxSizing: 'border-box' }}
                  onFocus={(e) => (e.target.style.borderColor = '#7C3AED80')}
                  onBlur={(e) => (e.target.style.borderColor = '#FFFFFF14')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{ background: 'none', border: 'none', color: '#8888AA', cursor: 'pointer', position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundImage: loading ? 'none' : 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', backgroundColor: loading ? '#3D2B6D' : undefined, border: 'none', borderRadius: '10px', boxShadow: loading ? 'none' : '#7C3AED59 0px 0px 20px', color: '#FFFFFF', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '15px', fontWeight: 600, marginTop: '4px', opacity: loading ? 0.7 : 1, padding: '12px', width: '100%' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{ color: '#8888AA', fontSize: '13px', marginTop: '24px', textAlign: 'center' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#A78BFA', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
