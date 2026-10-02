import { useState, useEffect } from 'react';
import { Plus, Wheat, Trash2, ArrowUpCircle } from 'lucide-react';
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

export default function EstoqueSilagem() {
  const [entradas, setEntradas] = useState([]);
  const [consumo, setConsumo] = useState([]);
  const [saldo, setSaldo] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [modalEntrada, setModalEntrada] = useState(false);
  const [modalConsumo, setModalConsumo] = useState(false);
  const [excluirEntrada, setExcluirEntrada] = useState(null);
  const [excluirConsumo, setExcluirConsumo] = useState(null);

  const [formEntrada, setFormEntrada] = useState({
    dataProducao: hoje(), tipoSilagem: 'Milho', quantidadeToneladas: '', valorTotal: '', origem: 'Produzido na propriedade', observacoes: ''
  });
  const [formConsumo, setFormConsumo] = useState({ data: hoje(), quantidadeToneladas: '', observacoes: '' });

  async function carregar() {
    setCarregando(true);
    const [e, c, s] = await Promise.all([
      api.get('/estoque-silagem/entradas'),
      api.get('/estoque-silagem/consumo'),
      api.get('/estoque-silagem/saldo'),
    ]);
    setEntradas(e.data);
    setConsumo(c.data);
    setSaldo(s.data.saldoToneladas);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  function abrirEntrada() {
    setFormEntrada({ dataProducao: hoje(), tipoSilagem: 'Milho', quantidadeToneladas: '', valorTotal: '', origem: 'Produzido na propriedade', observacoes: '' });
    setErro('');
    setModalEntrada(true);
  }

  async function salvarEntrada(e) {
    e.preventDefault();
    setErro('');
    try {
      await api.post('/estoque-silagem/entradas', {
        ...formEntrada,
        quantidadeToneladas: Number(formEntrada.quantidadeToneladas),
        valorTotal: formEntrada.valorTotal ? Number(formEntrada.valorTotal) : null,
      });
      setModalEntrada(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao registrar entrada.');
    }
  }

  function abrirConsumo() {
    setFormConsumo({ data: hoje(), quantidadeToneladas: '', observacoes: '' });
    setErro('');
    setModalConsumo(true);
  }

  async function salvarConsumo(e) {
    e.preventDefault();
    setErro('');
    try {
      await api.post('/estoque-silagem/consumo', { ...formConsumo, quantidadeToneladas: Number(formConsumo.quantidadeToneladas) });
      setModalConsumo(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao registrar consumo.');
    }
  }

  async function confirmarExclusaoEntrada() {
    await api.delete(`/estoque-silagem/entradas/${excluirEntrada.id}`);
    setExcluirEntrada(null);
    carregar();
  }

  async function confirmarExclusaoConsumo() {
    await api.delete(`/estoque-silagem/consumo/${excluirConsumo.id}`);
    setExcluirConsumo(null);
    carregar();
  }

  return (
    <div>
      <PageHeader
        title="Estoque de Silagem"
        subtitle="Controle de produção/compra e consumo em toneladas"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={abrirConsumo}><ArrowUpCircle className="w-4 h-4" /> Registrar Consumo</Button>
            <Button onClick={abrirEntrada}><Plus className="w-4 h-4" /> Nova Entrada</Button>
          </div>
        }
      />

      <div className="mb-6">
        <StatCard icon={Wheat} label="Saldo Atual em Estoque" value={`${saldo.toFixed(1)} ton`} color="verde" />
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
                    <th className="px-4 py-2.5 font-medium">Data</th>
                    <th className="px-4 py-2.5 font-medium">Tipo</th>
                    <th className="px-4 py-2.5 font-medium">Toneladas</th>
                    <th className="px-4 py-2.5 font-medium">Valor</th>
                    <th className="px-4 py-2.5 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {entradas.map((e) => (
                    <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                      <td className="px-4 py-2.5 text-gray-600">{formatarData(e.dataProducao)}</td>
                      <td className="px-4 py-2.5 text-gray-600">{e.tipoSilagem || '-'}</td>
                      <td className="px-4 py-2.5 text-gray-600">{e.quantidadeToneladas} ton</td>
                      <td className="px-4 py-2.5 text-gray-600">{e.valorTotal ? formatarMoeda(e.valorTotal) : '-'}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => setExcluirEntrada(e)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                    <th className="px-4 py-2.5 font-medium">Data</th>
                    <th className="px-4 py-2.5 font-medium">Toneladas</th>
                    <th className="px-4 py-2.5 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {consumo.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                      <td className="px-4 py-2.5 text-gray-600">{formatarData(c.data)}</td>
                      <td className="px-4 py-2.5 text-gray-600">{c.quantidadeToneladas} ton</td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => setExcluirConsumo(c)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
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
      <Modal open={modalEntrada} onClose={() => setModalEntrada(false)} title="Nova Entrada de Silagem">
        <form onSubmit={salvarEntrada} className="space-y-4">
          {erro && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{erro}</p>}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data de Produção *" type="date" value={formEntrada.dataProducao} onChange={(e) => setFormEntrada({ ...formEntrada, dataProducao: e.target.value })} required />
            <Select label="Tipo de Silagem" value={formEntrada.tipoSilagem} onChange={(e) => setFormEntrada({ ...formEntrada, tipoSilagem: e.target.value })}>
              <option>Milho</option>
              <option>Sorgo</option>
              <option>Capim</option>
              <option>Outro</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantidade (toneladas) *" type="number" step="0.1" min="0" value={formEntrada.quantidadeToneladas} onChange={(e) => setFormEntrada({ ...formEntrada, quantidadeToneladas: e.target.value })} required />
            <Input label="Valor Total (R$)" type="number" step="0.01" min="0" value={formEntrada.valorTotal} onChange={(e) => setFormEntrada({ ...formEntrada, valorTotal: e.target.value })} />
          </div>
          <Select label="Origem" value={formEntrada.origem} onChange={(e) => setFormEntrada({ ...formEntrada, origem: e.target.value })}>
            <option>Produzido na propriedade</option>
            <option>Comprado</option>
          </Select>
          <Textarea label="Observações" value={formEntrada.observacoes} onChange={(e) => setFormEntrada({ ...formEntrada, observacoes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalEntrada(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Consumo */}
      <Modal open={modalConsumo} onClose={() => setModalConsumo(false)} title="Registrar Consumo de Silagem" maxWidth="max-w-md">
        <form onSubmit={salvarConsumo} className="space-y-4">
          {erro && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{erro}</p>}
          <Input label="Data *" type="date" value={formConsumo.data} onChange={(e) => setFormConsumo({ ...formConsumo, data: e.target.value })} required />
          <Input label="Quantidade (toneladas) *" type="number" step="0.1" min="0" value={formConsumo.quantidadeToneladas} onChange={(e) => setFormConsumo({ ...formConsumo, quantidadeToneladas: e.target.value })} required />
          <Textarea label="Observações" value={formConsumo.observacoes} onChange={(e) => setFormConsumo({ ...formConsumo, observacoes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalConsumo(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!excluirEntrada} onClose={() => setExcluirEntrada(null)} onConfirm={confirmarExclusaoEntrada} title="Excluir Entrada" message="Tem certeza que deseja excluir esta entrada de silagem?" />
      <ConfirmDialog open={!!excluirConsumo} onClose={() => setExcluirConsumo(null)} onConfirm={confirmarExclusaoConsumo} title="Excluir Consumo" message="Tem certeza que deseja excluir este registro de consumo?" />
    </div>
  );
}
