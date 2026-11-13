import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { useAuth } from './AuthContext';

export default function PrivateRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div role="status" className="flex items-center justify-center gap-3 p-12"><Spinner /> Verificando tu sesión…</div>;
  if (!user) return <Navigate to="/ingreso" replace state={{ from: location.pathname + location.search + location.hash }} />;
  return <Outlet />;
}
