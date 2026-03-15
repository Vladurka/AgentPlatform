import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ alignItems: 'center', backgroundColor: '#0F0F13', display: 'flex', fontFamily: '"Inter", system-ui, sans-serif', height: '100vh', justifyContent: 'center', position: 'relative' }}>
      <div style={{ bottom: 0, left: 0, pointerEvents: 'none', position: 'fixed', right: 0, top: 0 }}>
        <div style={{ backgroundImage: 'radial-gradient(circle farthest-corner at 50% 50% in oklab, oklab(54.1% 0.096 -0.227 / 18%) 0%, oklab(0% 0 -.0001 / 0%) 65%)', borderRadius: '50%', filter: 'blur(90px)', height: '600px', left: '50%', position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)', width: '600px' }} />
      </div>
      <div style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
        <div style={{ color: '#7C3AED', fontSize: '120px', fontWeight: 800, letterSpacing: '-4px', lineHeight: 1, opacity: 0.25 }}>404</div>
        <h1 style={{ color: '#E2E2F0', fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px', margin: '-10px 0 12px' }}>Page not found</h1>
        <p style={{ color: '#8888AA', fontSize: '15px', margin: '0 0 28px' }}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" style={{ alignItems: 'center', backgroundImage: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)', borderRadius: '10px', boxShadow: '#7C3AED59 0px 0px 20px', color: '#FFFFFF', display: 'inline-flex', fontSize: '14px', fontWeight: 600, gap: '8px', padding: '11px 24px', textDecoration: 'none' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
          Back to home
        </Link>
      </div>
    </div>
  );
}
