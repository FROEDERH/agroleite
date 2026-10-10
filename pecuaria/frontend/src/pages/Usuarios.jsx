import { useState, useEffect } from 'react';
import { Plus, Users, ToggleLeft, ToggleRight, Pencil } from 'lucide-react';
import api from '../api';
import { Card, Button, Input, Select, Badge, Modal, EmptyState, PageHeader, ThOrdenavel } from '../components/UI';
import { useOrdenacao } from '../hooks/useOrdenacao';

function vazio() {
  return { nome: '', email: '', senha: '', papel: 'operador' };
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const ordemUsuarios = useOrdenacao(usuarios);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(vazio());
  const [editando, setEditando] = useState(null);
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
    setEditando(null);
    setErro('');
    setModalAberto(true);
  }

  function abrirEdicao(usuario) {
    setForm({ nome: usuario.nome, email: usuario.email, senha: '', papel: usuario.papel });
    setEditando(usuario.id);
    setErro('');
    setModalAberto(true);
  }

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    try {
      if (editando) {
        await api.put(`/auth/usuarios/${editando}`, {
          nome: form.nome, email: form.email, papel: form.papel, novaSenha: form.senha || null
        });
      } else {
        await api.post('/auth/usuarios', form);
      }
      setModalAberto(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar usuário.');
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
                  <ThOrdenavel {...ordemUsuarios.cabecalho('nome')} className="px-5 py-3 font-medium">Nome</ThOrdenavel>
                  <ThOrdenavel {...ordemUsuarios.cabecalho('email')} className="px-5 py-3 font-medium">E-mail</ThOrdenavel>
                  <ThOrdenavel {...ordemUsuarios.cabecalho('papel')} className="px-5 py-3 font-medium">Papel</ThOrdenavel>
                  <ThOrdenavel {...ordemUsuarios.cabecalho('ativo')} className="px-5 py-3 font-medium">Status</ThOrdenavel>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {ordemUsuarios.ordenados.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 even:bg-gray-100/60 hover:bg-gray-100">
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
                      <div className="flex justify-end gap-1">
                        <button onClick={() => abrirEdicao(u)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => alternarStatus(u)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title={u.ativo ? 'Desativar' : 'Ativar'}>
                          {u.ativo ? <ToggleRight className="w-5 h-5 text-verde-600" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title={editando ? 'Editar Usuário' : 'Novo Usuário'} maxWidth="max-w-md">
        <form onSubmit={salvar} className="space-y-4">
          {erro && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{erro}</p>}
          <Input label="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
          <Input label="E-mail *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          {editando ? (
            <Input label="Nova Senha" type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} minLength={6} placeholder="Deixe em branco para manter a atual" />
          ) : (
            <Input label="Senha *" type="password" value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} required minLength={6} />
          )}
          <Select label="Papel" value={form.papel} onChange={(e) => setForm({ ...form, papel: e.target.value })}>
            <option value="operador">Operador</option>
            <option value="admin">Administrador</option>
          </Select>
          <p className="text-xs text-gray-400">
            Administradores podem gerenciar outros usuários. Operadores têm acesso aos demais módulos do sistema.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button type="submit">{editando ? 'Salvar' : 'Criar Usuário'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
