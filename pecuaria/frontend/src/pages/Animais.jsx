import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Pencil, Trash2 } from 'lucide-react';
import IconeVaca from '../components/IconeVaca';
import api from '../api';
import {
  Card, Button, Input, Select, Textarea, Badge, Modal,
  EmptyState, PageHeader, ConfirmDialog, ThOrdenavel } from '../components/UI';
import { SeletorAnimal } from '../components/SeletorBusca';
import { useOrdenacao } from '../hooks/useOrdenacao';
import AnimalDetalhe from '../components/AnimalDetalhe';

const RACAS = ['Holandesa', 'Girolando', 'Jersey', 'Gir', 'Pardo Suíço', 'Sindi', 'Nelore', 'Mestiça', 'Outra'];

const corStatus = { Ativo: 'verde', Vendido: 'azul', Morto: 'cinza', Descartado: 'vermelho' };

function vazio() {
  return {
    numeroBrinco: '', nome: '', raca: 'Holandesa', sexo: 'Fêmea',
    dataNascimento: '', categoria: 'Vaca', status: 'Ativo',
    origem: 'Nascido na propriedade', pesoKg: '', maeId: '', paiInfo: '', observacoes: ''
  };
}

export default function Animais() {
  const [animais, setAnimais] = useState([]);
  const ordemAnimais = useOrdenacao(animais);
  const [femeas, setFemeas] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('Ativo');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(vazio());
  const [erro, setErro] = useState('');
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [excluir, setExcluir] = useState(null);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    const params = {};
    if (filtroStatus) params.status = filtroStatus;
    if (busca) params.busca = busca;
    const resp = await api.get('/animais', { params });
    setAnimais(resp.data);
    setCarregando(false);
  }

  // Lista de fêmeas para o seletor de "Mãe" — busca todas, independente do
  // filtro de status aplicado na listagem principal, para não esconder mães
  // cujo filtro atual da tela não inclui (ex: filtro em "Vendido").
  async function carregarFemeas() {
    const resp = await api.get('/animais', { params: { sexo: 'Fêmea' } });
    setFemeas(resp.data);
  }

  useEffect(() => { carregar(); carregarFemeas(); }, [filtroStatus]);

  function abrirNovo() {
    setForm(vazio());
    setEditando(null);
    setErro('');
    setModalAberto(true);
  }

  function abrirEdicao(animal) {
    setForm({
      ...animal,
      dataNascimento: animal.dataNascimento || '',
      pesoKg: animal.pesoKg || '',
      maeId: animal.maeId || '',
    });
    setEditando(animal.id);
    setErro('');
    setModalAberto(true);
  }

  async function salvar(e) {
    e.preventDefault();
    setErro('');

    if (editando && form.maeId && Number(form.maeId) === editando) {
      setErro('Um animal não pode ser selecionado como mãe de si mesmo.');
      return;
    }

    try {
      const payload = {
        ...form,
        pesoKg: form.pesoKg ? Number(form.pesoKg) : null,
        maeId: form.maeId ? Number(form.maeId) : null
      };
      if (editando) {
        await api.put(`/animais/${editando}`, payload);
      } else {
        await api.post('/animais', payload);
      }
      setModalAberto(false);
      carregar();
      carregarFemeas();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar animal.');
    }
  }

  async function confirmarExclusao() {
    await api.delete(`/animais/${excluir.id}`);
    setExcluir(null);
    carregar();
  }

  if (animalSelecionado) {
    return (
      <AnimalDetalhe
        animalId={animalSelecionado}
        onVoltar={() => { setAnimalSelecionado(null); carregar(); }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Cadastro de Animais"
        subtitle="Gerencie o plantel: raça, brinco, vacinas e saúde"
        action={<Button onClick={abrirNovo}><Plus className="w-4 h-4" /> Novo Animal</Button>}
      />

      <Card className="p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Buscar por brinco, nome ou raça..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && carregar()}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-verde-400"
            />
          </div>
          <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="sm:w-48">
            <option value="">Todos os status</option>
            <option value="Ativo">Ativo</option>
            <option value="Vendido">Vendido</option>
            <option value="Morto">Morto</option>
            <option value="Descartado">Descartado</option>
          </Select>
          <Button variant="outline" onClick={carregar}>Buscar</Button>
        </div>
      </Card>

      <Card>
        {carregando ? (
          <div className="p-10 text-center text-gray-400">Carregando...</div>
        ) : animais.length === 0 ? (
          <EmptyState
            icon={IconeVaca}
            title="Nenhum animal encontrado"
            description="Cadastre o primeiro animal do seu plantel para começar."
            action={<Button onClick={abrirNovo}><Plus className="w-4 h-4" /> Novo Animal</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <ThOrdenavel {...ordemAnimais.cabecalho('numeroBrinco')} className="px-5 py-3 font-medium">Brinco</ThOrdenavel>
                  <ThOrdenavel {...ordemAnimais.cabecalho('nome')} className="px-5 py-3 font-medium">Nome</ThOrdenavel>
                  <ThOrdenavel {...ordemAnimais.cabecalho('raca')} className="px-5 py-3 font-medium">Raça</ThOrdenavel>
                  <ThOrdenavel {...ordemAnimais.cabecalho('categoria')} className="px-5 py-3 font-medium">Categoria</ThOrdenavel>
                  <ThOrdenavel {...ordemAnimais.cabecalho('status')} className="px-5 py-3 font-medium">Status</ThOrdenavel>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {ordemAnimais.ordenados.map((a) => (
                  <tr key={a.id} className="border-b border-gray-50 even:bg-gray-100/60 hover:bg-gray-100">
                    <td className="px-5 py-3 font-medium text-gray-700">{a.numeroBrinco}</td>
                    <td className="px-5 py-3 text-gray-600">{a.nome || '-'}</td>
                    <td className="px-5 py-3 text-gray-600">{a.raca}</td>
                    <td className="px-5 py-3 text-gray-600">{a.categoria}</td>
                    <td className="px-5 py-3"><Badge color={corStatus[a.status]}>{a.status}</Badge></td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setAnimalSelecionado(a.id)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Ver detalhes">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => abrirEdicao(a)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setExcluir(a)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Excluir">
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

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title={editando ? 'Editar Animal' : 'Novo Animal'} maxWidth="max-w-2xl">
        <form onSubmit={salvar} className="space-y-4">
          {erro && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{erro}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Número do Brinco *"
              value={form.numeroBrinco}
              onChange={(e) => setForm({ ...form, numeroBrinco: e.target.value })}
              required
            />
            <Input
              label="Nome (opcional)"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Raça *" value={form.raca} onChange={(e) => setForm({ ...form, raca: e.target.value })} required>
              {RACAS.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
            <Select label="Sexo" value={form.sexo} onChange={(e) => setForm({ ...form, sexo: e.target.value })}>
              <option>Fêmea</option>
              <option>Macho</option>
            </Select>
            <Select label="Categoria" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
              <option>Vaca</option>
              <option>Novilha</option>
              <option>Bezerra</option>
              <option>Touro</option>
              <option>Boi</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Data de Nascimento"
              type="date"
              value={form.dataNascimento}
              onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
            />
            <Input
              label="Peso (kg)"
              type="number"
              step="0.1"
              value={form.pesoKg}
              onChange={(e) => setForm({ ...form, pesoKg: e.target.value })}
            />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Ativo</option>
              <option>Vendido</option>
              <option>Morto</option>
              <option>Descartado</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Origem" value={form.origem} onChange={(e) => setForm({ ...form, origem: e.target.value })}>
              <option>Nascido na propriedade</option>
              <option>Comprado</option>
            </Select>
            <SeletorAnimal
              label="Mãe (se nascido na propriedade)"
              animais={femeas.filter((f) => f.id !== editando)}
              value={form.maeId ?? ''}
              onChange={(id) => setForm({ ...form, maeId: id })}
              opcaoVazia="Não informado"
            />
          </div>

          <Input
            label="Pai (informação, opcional)"
            value={form.paiInfo}
            onChange={(e) => setForm({ ...form, paiInfo: e.target.value })}
            placeholder="Ex: touro da raça X, ou nome"
          />

          <Textarea
            label="Observações"
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!excluir}
        onClose={() => setExcluir(null)}
        onConfirm={confirmarExclusao}
        title="Excluir Animal"
        message={`Tem certeza que deseja excluir o animal de brinco "${excluir?.numeroBrinco}"? Todos os registros de produção, vacinas e reprodução associados serão removidos também. Esta ação não pode ser desfeita.`}
      />
    </div>
  );
}
