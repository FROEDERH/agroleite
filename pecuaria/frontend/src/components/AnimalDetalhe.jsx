import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Syringe, HeartPulse, Trash2, Milk, Pencil } from 'lucide-react';
import api from '../api';
import { Card, Button, Input, Select, Textarea, Badge, Modal, EmptyState } from './UI';

function formatarData(dataStr) {
  if (!dataStr) return '-';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

const corStatusDoenca = { 'Em tratamento': 'amarelo', Curado: 'verde', 'Crônico': 'vermelho' };

function vazioVacina() {
  return { nomeVacina: '', dataAplicacao: '', proximaDose: '', responsavel: '', observacoes: '' };
}

function vazioDoenca() {
  return { nomeDoenca: '', dataDiagnostico: '', tratamento: '', dataCura: '', status: 'Em tratamento', observacoes: '' };
}

export default function AnimalDetalhe({ animalId, onVoltar }) {
  const [animal, setAnimal] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [modalVacina, setModalVacina] = useState(false);
  const [modalDoenca, setModalDoenca] = useState(false);

  const [formVacina, setFormVacina] = useState(vazioVacina());
  const [formDoenca, setFormDoenca] = useState(vazioDoenca());
  const [editandoVacina, setEditandoVacina] = useState(null);
  const [editandoDoenca, setEditandoDoenca] = useState(null);
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    const resp = await api.get(`/animais/${animalId}`);
    setAnimal(resp.data);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, [animalId]);

  function abrirNovaVacina() {
    setFormVacina(vazioVacina());
    setEditandoVacina(null);
    setErro('');
    setModalVacina(true);
  }

  function abrirEdicaoVacina(v) {
    setFormVacina({
      nomeVacina: v.nomeVacina,
      dataAplicacao: v.dataAplicacao,
      proximaDose: v.proximaDose || '',
      responsavel: v.responsavel || '',
      observacoes: v.observacoes || '',
    });
    setEditandoVacina(v.id);
    setErro('');
    setModalVacina(true);
  }

  async function salvarVacina(e) {
    e.preventDefault();
    setErro('');
    try {
      if (editandoVacina) {
        await api.put(`/animais/vacinas/${editandoVacina}`, formVacina);
      } else {
        await api.post(`/animais/${animalId}/vacinas`, formVacina);
      }
      setModalVacina(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar vacina.');
    }
  }

  async function excluirVacina(id) {
    await api.delete(`/animais/vacinas/${id}`);
    carregar();
  }

  function abrirNovaDoenca() {
    setFormDoenca(vazioDoenca());
    setEditandoDoenca(null);
    setErro('');
    setModalDoenca(true);
  }

  function abrirEdicaoDoenca(d) {
    setFormDoenca({
      nomeDoenca: d.nomeDoenca,
      dataDiagnostico: d.dataDiagnostico,
      tratamento: d.tratamento || '',
      dataCura: d.dataCura || '',
      status: d.status || 'Em tratamento',
      observacoes: d.observacoes || '',
    });
    setEditandoDoenca(d.id);
    setErro('');
    setModalDoenca(true);
  }

  async function salvarDoenca(e) {
    e.preventDefault();
    setErro('');
    try {
      if (editandoDoenca) {
        await api.put(`/animais/doencas/${editandoDoenca}`, formDoenca);
      } else {
        await api.post(`/animais/${animalId}/doencas`, formDoenca);
      }
      setModalDoenca(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar doença.');
    }
  }

  async function excluirDoenca(id) {
    await api.delete(`/animais/doencas/${id}`);
    carregar();
  }

  if (carregando || !animal) {
    return <div className="p-10 text-center text-gray-400">Carregando...</div>;
  }

  const ultimaVenda = animal.vendas && animal.vendas.length > 0 ? animal.vendas[0] : null;

  return (
    <div>
      <button onClick={onVoltar} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar para a lista
      </button>

      <Card className="p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Brinco {animal.numeroBrinco} {animal.nome && <span className="text-gray-400 font-normal">— {animal.nome}</span>}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{animal.raca} • {animal.categoria} • {animal.sexo}</p>
          </div>
          <Badge color={animal.status === 'Ativo' ? 'verde' : 'cinza'}>{animal.status}</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-5 pt-5 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Nascimento</p>
            <p className="text-sm font-medium text-gray-700">{formatarData(animal.dataNascimento)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Peso</p>
            <p className="text-sm font-medium text-gray-700">{animal.pesoKg ? `${animal.pesoKg} kg` : '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Origem</p>
            <p className="text-sm font-medium text-gray-700">{animal.origem || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Mãe</p>
            <p className="text-sm font-medium text-gray-700">
              {animal.numeroBrincoMae ? `${animal.numeroBrincoMae}${animal.nomeMae ? ` (${animal.nomeMae})` : ''}` : '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">{ultimaVenda ? 'Vendido em' : 'Categoria'}</p>
            <p className="text-sm font-medium text-gray-700">
              {ultimaVenda ? formatarData(ultimaVenda.dataVenda) : animal.categoria}
            </p>
          </div>
        </div>
        {animal.observacoes && (
          <p className="text-sm text-gray-500 mt-4 bg-gray-50 p-3 rounded-xl">{animal.observacoes}</p>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vacinas */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <Syringe className="w-4 h-4 text-amber-600" /> Vacinas
            </h3>
            <Button variant="outline" onClick={abrirNovaVacina} className="px-3 py-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </Button>
          </div>
          {animal.vacinas.length === 0 ? (
            <EmptyState icon={Syringe} title="Nenhuma vacina registrada" />
          ) : (
            <div className="space-y-2">
              {animal.vacinas.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{v.nomeVacina}</p>
                    <p className="text-xs text-gray-400">
                      Aplicada em {formatarData(v.dataAplicacao)}
                      {v.proximaDose && ` • Próxima dose: ${formatarData(v.proximaDose)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => abrirEdicaoVacina(v)} className="p-1.5 text-gray-400 hover:text-gray-700" title="Editar">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => excluirVacina(v.id)} className="p-1.5 text-gray-400 hover:text-red-500" title="Excluir">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Doenças */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-500" /> Histórico de Saúde
            </h3>
            <Button variant="outline" onClick={abrirNovaDoenca} className="px-3 py-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </Button>
          </div>
          {animal.doencas.length === 0 ? (
            <EmptyState icon={HeartPulse} title="Nenhuma doença registrada" />
          ) : (
            <div className="space-y-2">
              {animal.doencas.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{d.nomeDoenca}</p>
                    <p className="text-xs text-gray-400">Diagnóstico: {formatarData(d.dataDiagnostico)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={corStatusDoenca[d.status] || 'cinza'}>{d.status}</Badge>
                    <button onClick={() => abrirEdicaoDoenca(d)} className="p-1.5 text-gray-400 hover:text-gray-700" title="Editar">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => excluirDoenca(d.id)} className="p-1.5 text-gray-400 hover:text-red-500" title="Excluir">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Histórico de Vendas (caso o animal já tenha sido vendido para corte) */}
      <Card className="p-5 mt-6">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <Milk className="w-4 h-4 text-blue-500" /> Histórico de Vendas
        </h3>
        {!animal.vendas || animal.vendas.length === 0 ? (
          <EmptyState icon={Milk} title="Nenhuma venda registrada para este animal" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-3 py-2 font-medium">Data</th>
                  <th className="px-3 py-2 font-medium">Peso</th>
                  <th className="px-3 py-2 font-medium">Valor/kg</th>
                  <th className="px-3 py-2 font-medium">Valor Final</th>
                  <th className="px-3 py-2 font-medium">Observações</th>
                </tr>
              </thead>
              <tbody>
                {animal.vendas.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50">
                    <td className="px-3 py-2">{formatarData(v.dataVenda)}</td>
                    <td className="px-3 py-2">{v.pesoKg ? `${v.pesoKg} kg` : '-'}</td>
                    <td className="px-3 py-2">{v.valorKg ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.valorKg) : '-'}</td>
                    <td className="px-3 py-2 font-medium text-verde-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.valorFinal)}</td>
                    <td className="px-3 py-2 text-gray-500">{v.observacoes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Vacina */}
      <Modal open={modalVacina} onClose={() => setModalVacina(false)} title={editandoVacina ? 'Editar Vacina' : 'Registrar Vacina'}>
        <form onSubmit={salvarVacina} className="space-y-4">
          {erro && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{erro}</p>}
          <Input label="Nome da Vacina *" value={formVacina.nomeVacina} onChange={(e) => setFormVacina({ ...formVacina, nomeVacina: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data de Aplicação *" type="date" value={formVacina.dataAplicacao} onChange={(e) => setFormVacina({ ...formVacina, dataAplicacao: e.target.value })} required />
            <Input label="Próxima Dose" type="date" value={formVacina.proximaDose} onChange={(e) => setFormVacina({ ...formVacina, proximaDose: e.target.value })} />
          </div>
          <Input label="Responsável" value={formVacina.responsavel} onChange={(e) => setFormVacina({ ...formVacina, responsavel: e.target.value })} />
          <Textarea label="Observações" value={formVacina.observacoes} onChange={(e) => setFormVacina({ ...formVacina, observacoes: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setModalVacina(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Doença */}
      <Modal open={modalDoenca} onClose={() => setModalDoenca(false)} title={editandoDoenca ? 'Editar Doença' : 'Registrar Doença'}>
        <form onSubmit={salvarDoenca} className="space-y-4">
          {erro && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{erro}</p>}
          <Input label="Nome da Doença *" value={formDoenca.nomeDoenca} onChange={(e) => setFormDoenca({ ...formDoenca, nomeDoenca: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data do Diagnóstico *" type="date" value={formDoenca.dataDiagnostico} onChange={(e) => setFormDoenca({ ...formDoenca, dataDiagnostico: e.target.value })} required />
            <Select label="Status" value={formDoenca.status} onChange={(e) => setFormDoenca({ ...formDoenca, status: e.target.value })}>
              <option>Em tratamento</option>
              <option>Curado</option>
              <option>Crônico</option>
            </Select>
          </div>
          <Input label="Tratamento" value={formDoenca.tratamento} onChange={(e) => setFormDoenca({ ...formDoenca, tratamento: e.target.value })} />
          <Input label="Data da Cura (se houver)" type="date" value={formDoenca.dataCura} onChange={(e) => setFormDoenca({ ...formDoenca, dataCura: e.target.value })} />
          <Textarea label="Observações" value={formDoenca.observacoes} onChange={(e) => setFormDoenca({ ...formDoenca, observacoes: e.target.value })} />
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => setModalDoenca(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
