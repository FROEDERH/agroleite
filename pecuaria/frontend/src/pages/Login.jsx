import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Milk, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/UI';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await login(email, senha);
      navigate('/');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível entrar. Verifique sua conexão.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-verde-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex bg-verde-500 rounded-2xl p-4 shadow-lg mb-4">
            <Milk className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AgroLeite</h1>
          <p className="text-verde-200 mt-1">Sistema de Controle Pecuário</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-1">Entrar</h2>
          <p className="text-gray-500 text-sm mb-6">Acesse sua conta para continuar</p>

          {erro && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-[42px]" />
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-[42px]" />
              <Input
                label="Senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={carregando}>
              {carregando ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
