import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Trash2, AlertCircle, Pencil } from 'lucide-react';
import api from '../api';
import {
  Card, Button, Input, Select, Textarea, Modal,
  EmptyState, PageHeader, ConfirmDialog, StatCard, ThOrdenavel } from '../components/UI';
import { SeletorAnimal } from '../components/SeletorBusca';
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

function vazio() {
  return { animalId: '', dataVenda: hoje(), pesoKg: '', valorKg: '', valorFinal: '', observacoes: '' };
}

export default function VendasAnimais() {
  const [vendas, setVendas] = useState([]);
  const ordemVendas = useOrdenacao(vendas);
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(vazio());
  const [editando, setEditando] = useState(null); // venda completa em edição
  const [erro, setErro] = useState('');
  const [excluir, setExcluir] = useState(null);

  async function carregar() {
    setCarregando(true);
    const [v, a] = await Promise.all([
      api.get('/vendas-animais'),
      api.get('/animais', { params: { status: 'Ativo' } })
    ]);
    setVendas(v.data);
    setAnimais(a.data);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  function abrirNovo() {
    setForm(vazio());
    setEditando(null);
    setErro('');
    setModalAberto(true);
  }

  function abrirEdicao(venda) {
    setForm({
      animalId: venda.animalId,
      dataVenda: venda.dataVenda,
      pesoKg: venda.pesoKg || '',
      valorKg: venda.valorKg || '',
      valorFinal: venda.valorFinal,
      observacoes: venda.observacoes || '',
    });
    setEditando(venda);
    setErro('');
    setModalAberto(true);
  }

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    if (!form.animalId) {
      setErro('Selecione um animal.');
      return;
    }
    if (!form.valorFinal || Number(form.valorFinal) <= 0) {
      setErro('Informe o valor final da venda.');
      return;
    }
    try {
      const payload = {
        animalId: Number(form.animalId),
        dataVenda: form.dataVenda,
        pesoKg: Number(form.pesoKg) || 0,
        valorKg: Number(form.valorKg) || 0,
        valorFinal: Number(form.valorFinal),
        observacoes: form.observacoes
      };
      if (editando) {
        await api.put(`/vendas-animais/${editando.id}`, payload);
      } else {
        await api.post('/vendas-animais', payload);
      }
      setModalAberto(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar venda.');
    }
  }

  async function confirmarExclusao() {
    await api.delete(`/vendas-animais/${excluir.id}`);
    setExcluir(null);
    carregar();
  }

  const totalVendas = vendas.reduce((acc, v) => acc + v.valorFinal, 0);

  return (
    <div>
      <PageHeader
        title="Venda de Animais de Corte"
        subtitle="Registro de animais vendidos para corte — gera receita automaticamente"
        action={<Button onClick={abrirNovo}><Plus className="w-4 h-4" /> Nova Venda</Button>}
      />

      <div className="mb-5">
        <StatCard icon={TrendingUp} label="Total de Vendas (histórico)" value={formatarMoeda(totalVendas)} color="verde" />
      </div>

      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl mb-5 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        Ao registrar uma venda, o status do animal é alterado para <strong>Vendido</strong> automaticamente e o valor da venda é lançado como <strong>Receita</strong> no financeiro.
      </div>

      <Card>
        {carregando ? (
          <div className="p-10 text-center text-gray-400">Carregando...</div>
        ) : vendas.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="Nenhuma venda registrada"
            description="Registre a primeira venda de animal para começar o controle."
            action={<Button onClick={abrirNovo}><Plus className="w-4 h-4" /> Nova Venda</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <ThOrdenavel {...ordemVendas.cabecalho('dataVenda')} className="px-5 py-3 font-medium">Data</ThOrdenavel>
                  <ThOrdenavel {...ordemVendas.cabecalho('numeroBrinco')} className="px-5 py-3 font-medium">Brinco</ThOrdenavel>
                  <ThOrdenavel {...ordemVendas.cabecalho('pesoKg')} className="px-5 py-3 font-medium">Peso (kg)</ThOrdenavel>
                  <ThOrdenavel {...ordemVendas.cabecalho('valorKg')} className="px-5 py-3 font-medium">Valor/kg</ThOrdenavel>
                  <ThOrdenavel {...ordemVendas.cabecalho('valorFinal')} className="px-5 py-3 font-medium">Valor Final</ThOrdenavel>
                  <ThOrdenavel {...ordemVendas.cabecalho('observacoes')} className="px-5 py-3 font-medium">Observações</ThOrdenavel>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {ordemVendas.ordenados.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 even:bg-gray-100/60 hover:bg-gray-100">
                    <td className="px-5 py-3 text-gray-600">{formatarData(v.dataVenda)}</td>
                    <td className="px-5 py-3 font-medium text-gray-700">
                      {v.numeroBrinco}
                      {v.nomeAnimal && <span className="text-gray-400 font-normal ml-1">({v.nomeAnimal})</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{v.pesoKg > 0 ? `${v.pesoKg} kg` : '-'}</td>
                    <td className="px-5 py-3 text-gray-600">{v.valorKg > 0 ? formatarMoeda(v.valorKg) : '-'}</td>
                    <td className="px-5 py-3 font-semibold text-verde-700">{formatarMoeda(v.valorFinal)}</td>
                    <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{v.observacoes || '-'}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => abrirEdicao(v)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Editar venda">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setExcluir(v)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Excluir venda">
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

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title={editando ? 'Editar Venda de Animal' : 'Registrar Venda de Animal'}>
        <form onSubmit={salvar} className="space-y-4">
          {erro && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{erro}</p>}

          {editando ? (
            <Select label="Animal" value={form.animalId} disabled>
              <option value={editando.animalId}>{editando.numeroBrinco} {editando.nomeAnimal ? `- ${editando.nomeAnimal}` : ''}</option>
            </Select>
          ) : (
            <SeletorAnimal
              label="Animal *"
              animais={animais}
              value={form.animalId}
              onChange={(id) => setForm({ ...form, animalId: id })}
              placeholder="Selecione um animal ativo..."
              required
            />
          )}

          <Input label="Data da Venda *" type="date" value={form.dataVenda} onChange={(e) => setForm({ ...form, dataVenda: e.target.value })} required />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Peso (kg)"
              type="number" step="0.1" min="0"
              value={form.pesoKg}
              onChange={(e) => setForm({ ...form, pesoKg: e.target.value })}
              placeholder="Ex: 450"
            />
            <Input
              label="Valor por kg (R$)"
              type="number" step="0.01" min="0"
              value={form.valorKg}
              onChange={(e) => setForm({ ...form, valorKg: e.target.value })}
              placeholder="Ex: 12.50"
            />
          </div>

          <Input
            label="Valor Final da Venda (R$) *"
            type="number" step="0.01" min="0"
            value={form.valorFinal}
            onChange={(e) => setForm({ ...form, valorFinal: e.target.value })}
            required
            placeholder="Valor efetivo recebido"
          />
          <p className="text-xs text-gray-400 -mt-2">
            O peso e o valor/kg são informativos. O valor final é o que será lançado no financeiro.
          </p>

          <Textarea
            label="Observações"
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            placeholder="Ex: vendido para frigorífico X, comprador, etc."
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button type="submit">{editando ? 'Salvar' : 'Registrar Venda'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!excluir}
        onClose={() => setExcluir(null)}
        onConfirm={confirmarExclusao}
        title="Excluir Venda"
        message={`Tem certeza que deseja excluir esta venda? A receita de ${formatarMoeda(excluir?.valorFinal)} gerada automaticamente também será removida.`}
      />
    </div>
  );
}
