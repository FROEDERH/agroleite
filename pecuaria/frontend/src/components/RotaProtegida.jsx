import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RotaProtegida({ children, somenteAdmin = false }) {
  const { usuario, carregando, ehAdmin } = useAuth();

  if (carregando) {
    return <div className="flex items-center justify-center h-screen text-gray-400">Carregando...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (somenteAdmin && !ehAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
