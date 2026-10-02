import { useState, useEffect } from 'react';
import { Plus, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../api';
import { Card, Button, Input, Select, Badge, Modal, EmptyState, PageHeader } from '../components/UI';

function vazio() {
  return { nome: '', email: '', senha: '', papel: 'operador' };
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(vazio());
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    const resp = await api.get('/auth/usuarios');
    setUsuarios(resp.data);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  function abrirNovo() {
    setForm(vazio());
    setErro('');
    setModalAberto(true);
  }

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    try {
      await api.post('/auth/usuarios', form);
      setModalAberto(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao criar usuário.');
    }
  }

  async function alternarStatus(usuario) {
    await api.put(`/auth/usuarios/${usuario.id}/status`, { ativo: !usuario.ativo });
    carregar();
  }

  return (
    <div>
      <PageHeader
        title="Usuários"
        subtitle="Gerencie quem tem acesso ao sistema"
        action={<Button onClick={abrirNovo}><Plus className="w-4 h-4" /> Novo Usuário</Button>}
      />

      <Card>
        {carregando ? (
          <div className="p-10 text-center text-gray-400">Carregando...</div>
        ) : usuarios.length === 0 ? (
          <EmptyState icon={Users} title="Nenhum usuário encontrado" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">E-mail</th>
                  <th className="px-5 py-3 font-medium">Papel</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                    <td className="px-5 py-3 font-medium text-gray-700">{u.nome}</td>
                    <td className="px-5 py-3 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3">
                      <Badge color={u.papel === 'admin' ? 'terra' : 'azul'}>
                        {u.papel === 'admin' ? 'Administrador' : 'Operador'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge color={u.ativo ? 'verde' : 'cinza'}>{u.ativo ? 'Ativo' : 'Inativo'}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => alternarStatus(u)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title={u.ativo ? 'Desativar' : 'Ativar'}>
                        {u.ativo ? <ToggleRight className="w-5 h-5 text-verde-600" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title="Novo Usuário" maxWidth="max-w-md">
        <form onSubmit={salvar} className="space-y-4">
          {erro && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{erro}</p>}
          <Input label="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          <Input label="E-mail *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Senha *" type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} required minLength={6} />
          <Select label="Papel" value={form.papel} onChange={(e) => setForm({ ...form, papel: e.target.value })}>
            <option value="operador">Operador</option>
            <option value="admin">Administrador</option>
          </Select>
          <p className="text-xs text-gray-400">
            Administradores podem gerenciar outros usuários. Operadores têm acesso aos demais módulos do sistema.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button type="submit">Criar Usuário</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
