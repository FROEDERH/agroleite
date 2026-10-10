import { useState, useEffect } from 'react';
import { Plus, Wheat, Trash2, ArrowUpCircle, Pencil } from 'lucide-react';
import api from '../api';
import { Card, Button, Input, Select, Textarea, Modal, EmptyState, PageHeader, ConfirmDialog, StatCard, ThOrdenavel } from '../components/UI';
import { useOrdenacao } from '../hooks/useOrdenacao';

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

export default function EstoqueFeno() {
  const [entradas, setEntradas] = useState([]);
  const ordemEntradas = useOrdenacao(entradas);
  const [consumo, setConsumo] = useState([]);
  const ordemConsumo = useOrdenacao(consumo);
  const [saldo, setSaldo] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [modalEntrada, setModalEntrada] = useState(false);
  const [modalConsumo, setModalConsumo] = useState(false);
  const [editandoEntrada, setEditandoEntrada] = useState(null);
  const [editandoConsumo, setEditandoConsumo] = useState(null);
  const [excluirEntrada, setExcluirEntrada] = useState(null);
  const [excluirConsumo, setExcluirConsumo] = useState(null);

  const [formEntrada, setFormEntrada] = useState({
    dataProducao: hoje(), tipoCapim: '', quantidadeFardos: '', pesoFardoKg: '', valorTotal: '', origem: 'Produzido na propriedade', observacoes: ''
  });
  const [formConsumo, setFormConsumo] = useState({ data: hoje(), quantidadeFardos: '', observacoes: '' });

  async function carregar() {
    setCarregando(true);
    const [e, c, s] = await Promise.all([
      api.get('/estoque-feno/entradas'),
      api.get('/estoque-feno/consumo'),
      api.get('/estoque-feno/saldo'),
    ]);
    setEntradas(e.data);
    setConsumo(c.data);
    setSaldo(s.data.saldoFardos);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  function abrirEntrada() {
    setFormEntrada({ dataProducao: hoje(), tipoCapim: '', quantidadeFardos: '', pesoFardoKg: '', valorTotal: '', origem: 'Produzido na propriedade', observacoes: '' });
    setEditandoEntrada(null);
    setErro('');
    setModalEntrada(true);
  }

  function abrirEdicaoEntrada(item) {
    setFormEntrada({
      dataProducao: item.dataProducao,
      tipoCapim: item.tipoCapim || '',
      quantidadeFardos: item.quantidadeFardos,
      pesoFardoKg: item.pesoFardoKg ?? '',
      valorTotal: item.valorTotal ?? '',
      origem: item.origem || 'Produzido na propriedade',
      observacoes: item.observacoes || '',
    });
    setEditandoEntrada(item.id);
    setErro('');
    setModalEntrada(true);
  }

  async function salvarEntrada(e) {
    e.preventDefault();
    setErro('');
    try {
      const payload = {
        ...formEntrada,
        quantidadeFardos: Number(formEntrada.quantidadeFardos),
        pesoFardoKg: formEntrada.pesoFardoKg ? Number(formEntrada.pesoFardoKg) : null,
        valorTotal: formEntrada.valorTotal ? Number(formEntrada.valorTotal) : null,
      };
      if (editandoEntrada) {
        await api.put(`/estoque-feno/entradas/${editandoEntrada}`, payload);
      } else {
        await api.post('/estoque-feno/entradas', payload);
      }
      setModalEntrada(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao registrar entrada.');
    }
  }

  function abrirConsumo() {
    setFormConsumo({ data: hoje(), quantidadeFardos: '', observacoes: '' });
    setEditandoConsumo(null);
    setErro('');
    setModalConsumo(true);
  }

  function abrirEdicaoConsumo(item) {
    setFormConsumo({ data: item.data, quantidadeFardos: item.quantidadeFardos, observacoes: item.observacoes || '' });
    setEditandoConsumo(item.id);
    setErro('');
    setModalConsumo(true);
  }

  async function salvarConsumo(e) {
    e.preventDefault();
    setErro('');
    try {
      const payload = { ...formConsumo, quantidadeFardos: Number(formConsumo.quantidadeFardos) };
      if (editandoConsumo) {
        await api.put(`/estoque-feno/consumo/${editandoConsumo}`, payload);
      } else {
        await api.post('/estoque-feno/consumo', payload);
      }
      setModalConsumo(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao registrar consumo.');
    }
  }

  async function confirmarExclusaoEntrada() {
    await api.delete(`/estoque-feno/entradas/${excluirEntrada.id}`);
    setExcluirEntrada(null);
    carregar();
  }

  async function confirmarExclusaoConsumo() {
    await api.delete(`/estoque-feno/consumo/${excluirConsumo.id}`);
    setExcluirConsumo(null);
    carregar();
  }

  return (
    <div>
      <PageHeader
        title="Estoque de Feno"
        subtitle="Controle de produção/compra e consumo de fardos"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={abrirConsumo}><ArrowUpCircle className="w-4 h-4" /> Registrar Consumo</Button>
            <Button onClick={abrirEntrada}><Plus className="w-4 h-4" /> Nova Entrada</Button>
          </div>
        }
      />

      <div className="mb-6">
        <StatCard icon={Wheat} label="Saldo Atual em Estoque" value={`${saldo.toFixed(0)} fardos`} color="amarelo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700">Entradas</h3>
          </div>
          {carregando ? (
            <div className="p-10 text-center text-gray-400">Carregando...</div>
          ) : entradas.length === 0 ? (
            <EmptyState icon={Wheat} title="Nenhuma entrada registrada" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <ThOrdenavel {...ordemEntradas.cabecalho('dataProducao')} className="px-4 py-2.5 font-medium">Data</ThOrdenavel>
                    <ThOrdenavel {...ordemEntradas.cabecalho('tipoCapim')} className="px-4 py-2.5 font-medium">Tipo</ThOrdenavel>
                    <ThOrdenavel {...ordemEntradas.cabecalho('quantidadeFardos')} className="px-4 py-2.5 font-medium">Fardos</ThOrdenavel>
                    <ThOrdenavel {...ordemEntradas.cabecalho('valorTotal')} className="px-4 py-2.5 font-medium">Valor</ThOrdenavel>
                    <th className="px-4 py-2.5 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {ordemEntradas.ordenados.map((e) => (
                    <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                      <td className="px-4 py-2.5 text-gray-600">{formatarData(e.dataProducao)}</td>
                      <td className="px-4 py-2.5 text-gray-600">{e.tipoCapim || '-'}</td>
                      <td className="px-4 py-2.5 text-gray-600">{e.quantidadeFardos}</td>
                      <td className="px-4 py-2.5 text-gray-600">{e.valorTotal ? formatarMoeda(e.valorTotal) : '-'}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => abrirEdicaoEntrada(e)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setExcluirEntrada(e)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Excluir">
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

        <Card>
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-700">Consumo</h3>
          </div>
          {carregando ? (
            <div className="p-10 text-center text-gray-400">Carregando...</div>
          ) : consumo.length === 0 ? (
            <EmptyState icon={ArrowUpCircle} title="Nenhum consumo registrado" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <ThOrdenavel {...ordemConsumo.cabecalho('data')} className="px-4 py-2.5 font-medium">Data</ThOrdenavel>
                    <ThOrdenavel {...ordemConsumo.cabecalho('quantidadeFardos')} className="px-4 py-2.5 font-medium">Fardos</ThOrdenavel>
                    <th className="px-4 py-2.5 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {ordemConsumo.ordenados.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                      <td className="px-4 py-2.5 text-gray-600">{formatarData(c.data)}</td>
                      <td className="px-4 py-2.5 text-gray-600">{c.quantidadeFardos}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => abrirEdicaoConsumo(c)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Editar">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => setExcluirConsumo(c)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Excluir">
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
      </div>

      {/* Modal Entrada */}
      <Modal open={modalEntrada} onClose={() => setModalEntrada(false)} title={editandoEntrada ? 'Editar Entrada de Feno' : 'Nova Entrada de Feno'}>
        <form onSubmit={salvarEntrada} className="space-y-4">
          {erro && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{erro}</p>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data de Produção *" type="date" value={formEntrada.dataProducao} onChange={(e) => setFormEntrada({ ...formEntrada, dataProducao: e.target.value })} required />
            <Input label="Tipo de Capim" value={formEntrada.tipoCapim} onChange={(e) => setFormEntrada({ ...formEntrada, tipoCapim: e.target.value })} placeholder="Ex: Tifton, Coast-cross" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantidade de Fardos *" type="number" min="0" value={formEntrada.quantidadeFardos} onChange={(e) => setFormEntrada({ ...formEntrada, quantidadeFardos: e.target.value })} required />
            <Input label="Peso por Fardo (kg)" type="number" step="0.1" min="0" value={formEntrada.pesoFardoKg} onChange={(e) => setFormEntrada({ ...formEntrada, pesoFardoKg: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valor Total (R$)" type="number" step="0.01" min="0" value={formEntrada.valorTotal} onChange={(e) => setFormEntrada({ ...formEntrada, valorTotal: e.target.value })} />
            <Select label="Origem" value={formEntrada.origem} onChange={(e) => setFormEntrada({ ...formEntrada, origem: e.target.value })}>
              <option>Produzido na propriedade</option>
              <option>Comprado</option>
            </Select>
          </div>
          <Textarea label="Observações" value={formEntrada.observacoes} onChange={(e) => setFormEntrada({ ...formEntrada, observacoes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalEntrada(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Consumo */}
      <Modal open={modalConsumo} onClose={() => setModalConsumo(false)} title={editandoConsumo ? 'Editar Consumo de Feno' : 'Registrar Consumo de Feno'} maxWidth="max-w-md">
        <form onSubmit={salvarConsumo} className="space-y-4">
          {erro && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{erro}</p>}
          <Input label="Data *" type="date" value={formConsumo.data} onChange={(e) => setFormConsumo({ ...formConsumo, data: e.target.value })} required />
          <Input label="Quantidade de Fardos *" type="number" min="0" value={formConsumo.quantidadeFardos} onChange={(e) => setFormConsumo({ ...formConsumo, quantidadeFardos: e.target.value })} required />
          <Textarea label="Observações" value={formConsumo.observacoes} onChange={(e) => setFormConsumo({ ...formConsumo, observacoes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalConsumo(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!excluirEntrada} onClose={() => setExcluirEntrada(null)} onConfirm={confirmarExclusaoEntrada} title="Excluir Entrada" message="Tem certeza que deseja excluir esta entrada de feno?" />
      <ConfirmDialog open={!!excluirConsumo} onClose={() => setExcluirConsumo(null)} onConfirm={confirmarExclusaoConsumo} title="Excluir Consumo" message="Tem certeza que deseja excluir este registro de consumo?" />
    </div>
  );
}
