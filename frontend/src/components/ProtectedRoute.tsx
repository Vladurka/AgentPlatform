import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../lib/auth';

export default function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}
