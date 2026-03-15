import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '../lib/auth';
import { authApi } from '../lib/api';

export default function AuthCallback() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      navigate('/login?error=' + (error ?? 'oauth_failed'), { replace: true });
      return;
    }

    // Store token then fetch user info
    localStorage.setItem('token', token);
    authApi.me()
      .then((user) => {
        setAuth(token, user);
        navigate('/dashboard', { replace: true });
      })
      .catch(() => navigate('/login?error=oauth_failed', { replace: true }));
  }, []);

  return (
    <div style={{ alignItems: 'center', backgroundColor: '#0F0F13', display: 'flex', fontFamily: '"Inter", system-ui, sans-serif', height: '100vh', justifyContent: 'center' }}>
      <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#7C3AED' }} />
        <p style={{ color: '#8888AA', fontSize: '14px', margin: 0 }}>Signing you in…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
