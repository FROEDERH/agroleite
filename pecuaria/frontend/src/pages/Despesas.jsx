import { useState, useEffect } from 'react';
import { Plus, Wallet, Trash2, Pencil } from 'lucide-react';
import api from '../api';
import { Card, Button, Input, Select, Textarea, Modal, EmptyState, PageHeader, ConfirmDialog, StatCard } from '../components/UI';

function hoje() {
  return new Date().toISOString().split('T')[0];
}

function formatarData(dataStr) {
  if (!dataStr) return '-';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
}

const CATEGORIAS = ['Ração', 'Veterinário', 'Manutenção', 'Combustível', 'Funcionários', 'Insumos', 'Outros'];

function vazio() {
  return { descricao: '', categoria: 'Outros', valor: '', data: hoje(), formaPagamento: '', observacoes: '' };
}

export default function Despesas() {
  const [registros, setRegistros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(vazio());
  const [excluir, setExcluir] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('');

  async function carregar() {
    setCarregando(true);
    const params = {};
    if (filtroCategoria) params.categoria = filtroCategoria;
    const resp = await api.get('/despesas', { params });
    setRegistros(resp.data);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, [filtroCategoria]);

  function abrirNovo() {
    setForm(vazio());
    setEditando(null);
    setErro('');
    setModalAberto(true);
  }

  function abrirEdicao(item) {
    setForm({ ...item });
    setEditando(item.id);
    setErro('');
    setModalAberto(true);
  }

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    try {
      const payload = { ...form, valor: Number(form.valor) };
      if (editando) {
        await api.put(`/despesas/${editando}`, payload);
      } else {
        await api.post('/despesas', payload);
      }
      setModalAberto(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar despesa.');
    }
  }

  async function confirmarExclusao() {
    await api.delete(`/despesas/${excluir.id}`);
    setExcluir(null);
    carregar();
  }

  const totalPeriodo = registros.reduce((acc, r) => acc + r.valor, 0);

  return (
    <div>
      <PageHeader
        title="Despesas"
        subtitle="Registre os gastos da propriedade"
        action={<Button onClick={abrirNovo}><Plus className="w-4 h-4" /> Nova Despesa</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <StatCard icon={Wallet} label="Total (lista atual)" value={formatarMoeda(totalPeriodo)} color="vermelho" />
        <Card className="p-4 flex items-end">
          <Select label="Filtrar por categoria" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="w-full">
            <option value="">Todas as categorias</option>
            {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Card>
      </div>

      <Card>
        {carregando ? (
          <div className="p-10 text-center text-gray-400">Carregando...</div>
        ) : registros.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="Nenhuma despesa registrada"
            description="Registre a primeira despesa para começar a acompanhar os gastos."
            action={<Button onClick={abrirNovo}><Plus className="w-4 h-4" /> Nova Despesa</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Descrição</th>
                  <th className="px-5 py-3 font-medium">Categoria</th>
                  <th className="px-5 py-3 font-medium">Valor</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                    <td className="px-5 py-3 text-gray-600">{formatarData(r.data)}</td>
                    <td className="px-5 py-3 font-medium text-gray-700">{r.descricao}</td>
                    <td className="px-5 py-3 text-gray-600">{r.categoria}</td>
                    <td className="px-5 py-3 text-red-600 font-medium">{formatarMoeda(r.valor)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => abrirEdicao(r)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setExcluir(r)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
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

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title={editando ? 'Editar Despesa' : 'Nova Despesa'}>
        <form onSubmit={salvar} className="space-y-4">
          {erro && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{erro}</p>}
          <Input label="Descrição *" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
              {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="Valor (R$) *" type="number" step="0.01" min="0" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data *" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} required />
            <Input label="Forma de Pagamento" value={form.formaPagamento} onChange={(e) => setForm({ ...form, formaPagamento: e.target.value })} placeholder="Ex: Pix, Dinheiro" />
          </div>
          <Textarea label="Observações" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!excluir} onClose={() => setExcluir(null)} onConfirm={confirmarExclusao} title="Excluir Despesa" message={`Tem certeza que deseja excluir "${excluir?.descricao}"?`} />
    </div>
  );
}
