import { useState, useEffect } from 'react';
import { Plus, Milk, Trash2, Pencil } from 'lucide-react';
import api from '../api';
import { Card, Button, Input, Textarea, Modal, EmptyState, PageHeader, ConfirmDialog, StatCard, ThOrdenavel } from '../components/UI';
import { useOrdenacao } from '../hooks/useOrdenacao';

function hoje() {
  return new Date().toISOString().split('T')[0];
}

function formatarData(dataStr) {
  if (!dataStr) return '-';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

function vazio() {
  return { dataInicio: hoje(), dataFim: hoje(), litrosTotal: '', observacoes: '' };
}

export default function ProducaoLeite() {
  const [registros, setRegistros] = useState([]);
  const ordemRegistros = useOrdenacao(registros);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(vazio());
  const [erro, setErro] = useState('');
  const [excluir, setExcluir] = useState(null);
  const [filtro, setFiltro] = useState({ inicio: '', fim: '' });

  async function carregar() {
    setCarregando(true);
    const params = {};
    if (filtro.inicio) params.dataInicio = filtro.inicio;
    if (filtro.fim) params.dataFim = filtro.fim;
    const resp = await api.get('/producao-leite', { params });
    setRegistros(resp.data);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  function abrirNovo() {
    setForm(vazio());
    setEditando(null);
    setErro('');
    setModalAberto(true);
  }

  function abrirEdicao(item) {
    setForm({
      dataInicio: item.dataInicio,
      dataFim: item.dataFim,
      litrosTotal: item.litrosTotal,
      observacoes: item.observacoes || ''
    });
    setEditando(item.id);
    setErro('');
    setModalAberto(true);
  }

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    if (form.dataFim < form.dataInicio) {
      setErro('A data final não pode ser anterior à data inicial.');
      return;
    }
    try {
      const payload = {
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
        litrosTotal: Number(form.litrosTotal) || 0,
        observacoes: form.observacoes
      };
      if (editando) {
        await api.put(`/producao-leite/${editando}`, payload);
      } else {
        await api.post('/producao-leite', payload);
      }
      setModalAberto(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar registro.');
    }
  }

  async function confirmarExclusao() {
    await api.delete(`/producao-leite/${excluir.id}`);
    setExcluir(null);
    carregar();
  }

  const totalLitros = registros.reduce((acc, r) => acc + r.litrosTotal, 0);

  return (
    <div>
      <PageHeader
        title="Produção de Leite"
        subtitle="Registros de produção por período"
        action={<Button onClick={abrirNovo}><Plus className="w-4 h-4" /> Novo Registro</Button>}
      />

      <Card className="p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <Input label="De" type="date" value={filtro.inicio} onChange={(e) => setFiltro({ ...filtro, inicio: e.target.value })} className="sm:w-48" />
          <Input label="Até" type="date" value={filtro.fim} onChange={(e) => setFiltro({ ...filtro, fim: e.target.value })} className="sm:w-48" />
          <Button variant="outline" onClick={carregar}>Filtrar</Button>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-400">Total no filtro</p>
            <p className="text-xl font-bold text-verde-700">{totalLitros.toFixed(1)} L</p>
          </div>
        </div>
      </Card>

      <Card>
        {carregando ? (
          <div className="p-10 text-center text-gray-400">Carregando...</div>
        ) : registros.length === 0 ? (
          <EmptyState
            icon={Milk}
            title="Nenhum registro de produção"
            description="Registre o primeiro período de produção para começar o controle."
            action={<Button onClick={abrirNovo}><Plus className="w-4 h-4" /> Novo Registro</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <ThOrdenavel {...ordemRegistros.cabecalho('dataInicio')} className="px-5 py-3 font-medium">Data Início</ThOrdenavel>
                  <ThOrdenavel {...ordemRegistros.cabecalho('dataFim')} className="px-5 py-3 font-medium">Data Fim</ThOrdenavel>
                  <ThOrdenavel {...ordemRegistros.cabecalho('litrosTotal')} className="px-5 py-3 font-medium">Total de Litros</ThOrdenavel>
                  <ThOrdenavel {...ordemRegistros.cabecalho('observacoes')} className="px-5 py-3 font-medium">Observações</ThOrdenavel>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {ordemRegistros.ordenados.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                    <td className="px-5 py-3 text-gray-600">{formatarData(r.dataInicio)}</td>
                    <td className="px-5 py-3 text-gray-600">{formatarData(r.dataFim)}</td>
                    <td className="px-5 py-3 font-semibold text-verde-700">{r.litrosTotal.toFixed(1)} L</td>
                    <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{r.observacoes || '-'}</td>
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

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title={editando ? 'Editar Registro' : 'Novo Registro de Produção'}>
        <form onSubmit={salvar} className="space-y-4">
          {erro && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{erro}</p>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data Início *" type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} required />
            <Input label="Data Fim *" type="date" value={form.dataFim} onChange={(e) => setForm({ ...form, dataFim: e.target.value })} required />
          </div>
          <Input label="Total de Litros *" type="number" step="0.1" min="0" value={form.litrosTotal} onChange={(e) => setForm({ ...form, litrosTotal: e.target.value })} required />
          <Textarea label="Observações" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!excluir} onClose={() => setExcluir(null)} onConfirm={confirmarExclusao} title="Excluir Registro" message="Tem certeza que deseja excluir este registro de produção?" />
    </div>
  );
}
