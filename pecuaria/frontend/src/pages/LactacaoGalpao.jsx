import { useState, useEffect } from 'react';
import {
  Plus, Milk, Trash2, Pencil, Pill, AlertTriangle,
  CheckCircle2, Circle, Syringe, Unlock
} from 'lucide-react';
import api from '../api';
import {
  Card, Button, Input, Select, Textarea, Modal,
  EmptyState, PageHeader, ConfirmDialog, StatCard
} from '../components/UI';
import { SeletorAnimal } from '../components/SeletorBusca';

function hoje() {
  return new Date().toISOString().split('T')[0];
}

function formatarData(dataStr) {
  if (!dataStr) return '-';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

function vazioLactacao() {
  return { animalId: '', dataInicio: hoje(), dataFim: '' };
}

function vazioMedicacao() {
  return {
    dataMedicacao: hoje(),
    nomeMedicacao: '',
    doseMl: '',
    podeVenderLeite: true,
    carenciaDias: '',
    observacoes: ''
  };
}

// Configuração visual de cada status: cor da borda lateral, badge, ícone
const STATUS_CONFIG = {
  Ativo: {
    borda: 'border-l-verde-500',
    badge: 'bg-verde-100 text-verde-700',
    icone: CheckCircle2,
    iconeCor: 'text-verde-600',
    label: 'Ativo — dando leite'
  },
  Inativo: {
    borda: 'border-l-gray-300',
    badge: 'bg-gray-100 text-gray-500',
    icone: Circle,
    iconeCor: 'text-gray-400',
    label: 'Inativo'
  },
  Medicado: {
    borda: 'border-l-red-500',
    badge: 'bg-red-100 text-red-700',
    icone: Pill,
    iconeCor: 'text-red-600',
    label: 'Medicado — leite bloqueado'
  }
};

export default function LactacaoGalpao() {
  const [registros, setRegistros] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  const [modalLactacao, setModalLactacao] = useState(false);
  const [editandoLactacao, setEditandoLactacao] = useState(null);
  const [formLactacao, setFormLactacao] = useState(vazioLactacao());

  const [modalMedicacoes, setModalMedicacoes] = useState(null); // guarda o registro selecionado
  const [formMedicacao, setFormMedicacao] = useState(vazioMedicacao());
  const [erroMedicacao, setErroMedicacao] = useState('');
  const [editandoMedicacao, setEditandoMedicacao] = useState(null);

  const [excluirLactacao, setExcluirLactacao] = useState(null);
  const [excluirMedicacao, setExcluirMedicacao] = useState(null);

  async function carregarAnimais() {
    const resp = await api.get('/animais', { params: { status: 'Ativo' } });
    setAnimais(resp.data.filter(a => a.categoria === 'Vaca'));
  }

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const params = {};
      if (filtroStatus) params.status = filtroStatus;
      if (filtroDataInicio) params.dataInicio = filtroDataInicio;
      if (filtroDataFim) params.dataFim = filtroDataFim;
      const resp = await api.get('/lactacao-galpao', { params });
      setRegistros(resp.data);
    } catch (e) {
      setErro('Não foi possível carregar os dados. Verifique se o backend está rodando.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregarAnimais(); }, []);
  useEffect(() => { carregar(); }, [filtroStatus, filtroDataInicio, filtroDataFim]);

  // ===== LACTAÇÃO =====

  function abrirNovaLactacao() {
    setFormLactacao(vazioLactacao());
    setEditandoLactacao(null);
    setErro('');
    setModalLactacao(true);
  }

  function abrirEdicaoLactacao(registro) {
    setFormLactacao({
      animalId: registro.animalId,
      dataInicio: registro.dataInicio,
      dataFim: registro.dataFim || ''
    });
    setEditandoLactacao(registro.id);
    setErro('');
    setModalLactacao(true);
  }

  async function salvarLactacao(e) {
    e.preventDefault();
    setErro('');
    if (!formLactacao.animalId) {
      setErro('Selecione um animal.');
      return;
    }
    try {
      const payload = {
        animalId: Number(formLactacao.animalId),
        dataInicio: formLactacao.dataInicio,
        dataFim: formLactacao.dataFim || null
      };
      if (editandoLactacao) {
        await api.put(`/lactacao-galpao/${editandoLactacao}`, payload);
      } else {
        await api.post('/lactacao-galpao', payload);
      }
      setModalLactacao(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar registro.');
    }
  }

  async function confirmarExclusaoLactacao() {
    await api.delete(`/lactacao-galpao/${excluirLactacao.id}`);
    setExcluirLactacao(null);
    carregar();
  }

  // ===== MEDICAÇÕES =====

  async function abrirMedicacoes(registro) {
    // Busca a versão mais atual do registro (caso tenha mudado desde a última listagem)
    const resp = await api.get(`/lactacao-galpao/${registro.id}`);
    setModalMedicacoes(resp.data);
    setFormMedicacao(vazioMedicacao());
    setEditandoMedicacao(null);
    setErroMedicacao('');
  }

  function abrirEdicaoMedicacao(m) {
    setFormMedicacao({
      dataMedicacao: m.dataMedicacao,
      nomeMedicacao: m.nomeMedicacao,
      doseMl: m.doseMl || '',
      podeVenderLeite: m.podeVenderLeite,
      carenciaDias: m.carenciaDias ?? '',
      observacoes: m.observacoes || '',
    });
    setEditandoMedicacao(m.id);
    setErroMedicacao('');
  }

  function cancelarEdicaoMedicacao() {
    setFormMedicacao(vazioMedicacao());
    setEditandoMedicacao(null);
    setErroMedicacao('');
  }

  async function recarregarModalMedicacoes(id) {
    const resp = await api.get(`/lactacao-galpao/${id}`);
    setModalMedicacoes(resp.data);
  }

  async function salvarMedicacao(e) {
    e.preventDefault();
    setErroMedicacao('');

    if (!formMedicacao.nomeMedicacao || !formMedicacao.dataMedicacao) {
      setErroMedicacao('Informe a data e o nome da medicação.');
      return;
    }
    if (!formMedicacao.podeVenderLeite && !formMedicacao.carenciaDias) {
      setErroMedicacao('Informe os dias de carência, já que o leite não pode ser vendido.');
      return;
    }

    try {
      const payload = {
        dataMedicacao: formMedicacao.dataMedicacao,
        nomeMedicacao: formMedicacao.nomeMedicacao,
        doseMl: Number(formMedicacao.doseMl) || 0,
        podeVenderLeite: formMedicacao.podeVenderLeite,
        carenciaDias: formMedicacao.podeVenderLeite ? null : Number(formMedicacao.carenciaDias),
        observacoes: formMedicacao.observacoes
      };
      if (editandoMedicacao) {
        await api.put(`/lactacao-galpao/medicacoes/${editandoMedicacao}`, payload);
      } else {
        await api.post(`/lactacao-galpao/${modalMedicacoes.id}/medicacoes`, payload);
      }
      setFormMedicacao(vazioMedicacao());
      setEditandoMedicacao(null);
      await recarregarModalMedicacoes(modalMedicacoes.id);
      carregar(); // atualiza status na lista principal também
    } catch (err) {
      setErroMedicacao(err.response?.data?.erro || 'Erro ao salvar medicação.');
    }
  }

  async function liberarMedicacao(medicacaoId) {
    await api.put(`/lactacao-galpao/medicacoes/${medicacaoId}/liberar`, { dataLiberacao: hoje() });
    await recarregarModalMedicacoes(modalMedicacoes.id);
    carregar();
  }

  async function confirmarExclusaoMedicacao() {
    await api.delete(`/lactacao-galpao/medicacoes/${excluirMedicacao.id}`);
    if (excluirMedicacao.id === editandoMedicacao) cancelarEdicaoMedicacao();
    setExcluirMedicacao(null);
    await recarregarModalMedicacoes(modalMedicacoes.id);
    carregar();
  }

  // ===== CONTAGENS PARA OS CARDS DE RESUMO =====
  const totalAtivo = registros.filter(r => r.status === 'Ativo').length;
  const totalMedicado = registros.filter(r => r.status === 'Medicado').length;
  const totalInativo = registros.filter(r => r.status === 'Inativo').length;

  return (
    <div>
      <PageHeader
        title="Animais em Lactação no Galpão"
        subtitle="Controle principal: quem está dando leite, quem está parado e quem está medicado"
        action={<Button onClick={abrirNovaLactacao}><Plus className="w-4 h-4" /> Novo Registro</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={CheckCircle2} label="Ativos (dando leite)" value={totalAtivo} color="verde" />
        <StatCard icon={Pill} label="Medicados (leite bloqueado)" value={totalMedicado} color="vermelho" />
        <StatCard icon={Circle} label="Inativos" value={totalInativo} color="cinza" />
      </div>

      <Card className="p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <Select label="Status" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="sm:w-56">
            <option value="">Todos os status</option>
            <option value="Ativo">Ativo</option>
            <option value="Medicado">Medicado</option>
            <option value="Inativo">Inativo</option>
          </Select>
          <Input label="A partir de" type="date" value={filtroDataInicio} onChange={(e) => setFiltroDataInicio(e.target.value)} className="sm:w-48" />
          <Input label="Até" type="date" value={filtroDataFim} onChange={(e) => setFiltroDataFim(e.target.value)} className="sm:w-48" />
          {(filtroStatus || filtroDataInicio || filtroDataFim) && (
            <Button variant="ghost" onClick={() => { setFiltroStatus(''); setFiltroDataInicio(''); setFiltroDataFim(''); }}>
              Limpar filtros
            </Button>
          )}
        </div>
      </Card>

      {carregando ? (
        <div className="p-10 text-center text-gray-400">Carregando...</div>
      ) : erro ? (
        <Card className="p-10 text-center text-red-500">{erro}</Card>
      ) : registros.length === 0 ? (
        <Card>
          <EmptyState
            icon={Milk}
            title="Nenhum registro encontrado"
            description="Cadastre o primeiro animal em lactação no galpão."
            action={<Button onClick={abrirNovaLactacao}><Plus className="w-4 h-4" /> Novo Registro</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {registros.map((r) => {
            const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.Inativo;
            const Icone = cfg.icone;
            const carenciaVencidaAlerta = r.medicacaoAtiva?.carenciaVencida;

            return (
              <Card key={r.id} className={`p-5 border-l-4 ${cfg.borda} relative`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Brinco {r.numeroBrinco}
                      {r.nomeAnimal && <span className="text-gray-400 font-normal"> ({r.nomeAnimal})</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatarData(r.dataInicio)} {r.dataFim ? `→ ${formatarData(r.dataFim)}` : '→ em andamento'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
                    <Icone className="w-3.5 h-3.5" /> {r.status}
                  </span>
                </div>

                {r.status === 'Medicado' && r.medicacaoAtiva && (
                  <div className={`text-xs rounded-xl px-3 py-2 mb-3 ${carenciaVencidaAlerta ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                    <p className="font-medium flex items-center gap-1">
                      {carenciaVencidaAlerta && <AlertTriangle className="w-3.5 h-3.5" />}
                      {r.medicacaoAtiva.nomeMedicacao}
                    </p>
                    <p>
                      Aplicada em {formatarData(r.medicacaoAtiva.dataMedicacao)}
                      {r.medicacaoAtiva.dataFimCarencia && ` • carência até ${formatarData(r.medicacaoAtiva.dataFimCarencia)}`}
                    </p>
                    {carenciaVencidaAlerta && (
                      <p className="font-semibold mt-0.5">Carência já venceu — confirme a liberação para voltar a vender o leite.</p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                  <Button variant="outline" className="flex-1 px-3 py-2 text-xs" onClick={() => abrirMedicacoes(r)}>
                    <Syringe className="w-3.5 h-3.5" /> Medicações ({r.medicacoes.length})
                  </Button>
                  <button onClick={() => abrirEdicaoLactacao(r)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Editar">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setExcluirLactacao(r)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Excluir">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Nova/Editar Lactação */}
      <Modal open={modalLactacao} onClose={() => setModalLactacao(false)} title={editandoLactacao ? 'Editar Registro' : 'Novo Registro de Lactação'}>
        <form onSubmit={salvarLactacao} className="space-y-4">
          {erro && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{erro}</p>}

          <SeletorAnimal
            label="Animal *"
            animais={animais}
            value={formLactacao.animalId}
            onChange={(id) => setFormLactacao({ ...formLactacao, animalId: id })}
            required
            disabled={!!editandoLactacao}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Data Inicial Lactação *" type="date" value={formLactacao.dataInicio} onChange={(e) => setFormLactacao({ ...formLactacao, dataInicio: e.target.value })} required />
            <Input label="Data Final Lactação" type="date" value={formLactacao.dataFim} onChange={(e) => setFormLactacao({ ...formLactacao, dataFim: e.target.value })} />
          </div>
          <p className="text-xs text-gray-400 -mt-2">
            Deixe a data final em branco enquanto o animal continua ativo no galpão. Ao preencher, o status passa a Inativo.
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalLactacao(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Medicações */}
      <Modal
        open={!!modalMedicacoes}
        onClose={() => setModalMedicacoes(null)}
        title={modalMedicacoes ? `Medicações — Brinco ${modalMedicacoes.numeroBrinco}` : ''}
        maxWidth="max-w-2xl"
      >
        {modalMedicacoes && (
          <div className="space-y-6">
            {/* Lista de medicações existentes */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-3">Histórico de medicações</h4>
              {modalMedicacoes.medicacoes.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhuma medicação registrada para este período.</p>
              ) : (
                <div className="space-y-2">
                  {modalMedicacoes.medicacoes.map((m) => {
                    const ativa = !m.podeVenderLeite && !m.dataLiberacaoManual;
                    return (
                      <div key={m.id} className={`rounded-xl px-4 py-3 ${ativa ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">{m.nomeMedicacao} — {m.doseMl} ml</p>
                            <p className="text-xs text-gray-500">Aplicada em {formatarData(m.dataMedicacao)}</p>
                            {m.podeVenderLeite ? (
                              <p className="text-xs text-verde-600 font-medium mt-1">Pode continuar vendendo o leite</p>
                            ) : (
                              <>
                                <p className="text-xs text-red-600 font-medium mt-1">
                                  Leite bloqueado — carência de {m.carenciaDias} dia(s)
                                  {m.dataFimCarencia && ` (até ${formatarData(m.dataFimCarencia)})`}
                                </p>
                                {m.dataLiberacaoManual ? (
                                  <p className="text-xs text-gray-500 mt-0.5">Liberado manualmente em {formatarData(m.dataLiberacaoManual)}</p>
                                ) : m.carenciaVencida ? (
                                  <p className="text-xs text-amber-600 font-medium mt-0.5 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> Carência vencida — ainda não liberado
                                  </p>
                                ) : null}
                              </>
                            )}
                            {m.observacoes && <p className="text-xs text-gray-400 mt-1">{m.observacoes}</p>}
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            {ativa && (
                              <button
                                onClick={() => liberarMedicacao(m.id)}
                                className="p-2 text-verde-600 hover:bg-verde-50 rounded-lg"
                                title="Confirmar liberação da venda do leite"
                              >
                                <Unlock className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => abrirEdicaoMedicacao(m)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Editar">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setExcluirMedicacao(m)} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg" title="Excluir">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Formulário de nova medicação */}
            <div className="border-t border-gray-100 pt-5">
              <h4 className="text-sm font-semibold text-gray-600 mb-3">{editandoMedicacao ? 'Editar medicação' : 'Registrar nova medicação'}</h4>
              <form onSubmit={salvarMedicacao} className="space-y-4">
                {erroMedicacao && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{erroMedicacao}</p>}

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Data da Medicação *" type="date" value={formMedicacao.dataMedicacao} onChange={(e) => setFormMedicacao({ ...formMedicacao, dataMedicacao: e.target.value })} required />
                  <Input label="Dose (ml)" type="number" step="0.1" min="0" value={formMedicacao.doseMl} onChange={(e) => setFormMedicacao({ ...formMedicacao, doseMl: e.target.value })} />
                </div>

                <Input label="Medicação Aplicada *" value={formMedicacao.nomeMedicacao} onChange={(e) => setFormMedicacao({ ...formMedicacao, nomeMedicacao: e.target.value })} placeholder="Ex: Ocitocina, antibiótico X..." required />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Indicação *</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormMedicacao({ ...formMedicacao, podeVenderLeite: true, carenciaDias: '' })}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${formMedicacao.podeVenderLeite ? 'border-verde-500 bg-verde-50 text-verde-700' : 'border-gray-200 text-gray-500'}`}
                    >
                      Pode continuar vendendo o leite
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormMedicacao({ ...formMedicacao, podeVenderLeite: false })}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-colors ${!formMedicacao.podeVenderLeite ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}
                    >
                      NÃO pode vender o leite
                    </button>
                  </div>
                </div>

                {!formMedicacao.podeVenderLeite && (
                  <Input
                    label="Carência (dias) *"
                    type="number"
                    min="1"
                    value={formMedicacao.carenciaDias}
                    onChange={(e) => setFormMedicacao({ ...formMedicacao, carenciaDias: e.target.value })}
                    required
                  />
                )}

                <Textarea label="Observações" value={formMedicacao.observacoes} onChange={(e) => setFormMedicacao({ ...formMedicacao, observacoes: e.target.value })} />

                <div className="flex justify-end gap-3 pt-1">
                  {editandoMedicacao ? (
                    <>
                      <Button variant="outline" type="button" onClick={cancelarEdicaoMedicacao}>Cancelar edição</Button>
                      <Button type="submit">Salvar Alterações</Button>
                    </>
                  ) : (
                    <Button type="submit"><Plus className="w-4 h-4" /> Registrar Medicação</Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!excluirLactacao}
        onClose={() => setExcluirLactacao(null)}
        onConfirm={confirmarExclusaoLactacao}
        title="Excluir Registro"
        message="Tem certeza que deseja excluir este registro de lactação? Todas as medicações associadas também serão removidas."
      />

      <ConfirmDialog
        open={!!excluirMedicacao}
        onClose={() => setExcluirMedicacao(null)}
        onConfirm={confirmarExclusaoMedicacao}
        title="Excluir Medicação"
        message="Tem certeza que deseja excluir esta medicação do histórico?"
      />
    </div>
  );
}
