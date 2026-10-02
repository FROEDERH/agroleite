import { useState, useEffect } from 'react';
import { Plus, HeartPulse, Check, X, Baby, AlertOctagon, Trash2 } from 'lucide-react';
import api from '../api';
import { Card, Button, Input, Select, Textarea, Badge, Modal, EmptyState, PageHeader, ConfirmDialog } from '../components/UI';

function hoje() {
  return new Date().toISOString().split('T')[0];
}

function formatarData(dataStr) {
  if (!dataStr) return '-';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

const corStatus = {
  'Inseminada': 'azul',
  'Confirmada Prenhe': 'verde',
  'Parto Realizado': 'verde',
  'Perda de Cria': 'vermelho',
  'Não Prenhe': 'cinza',
};

const RACAS_SEMEN = ['Holandesa', 'Girolando', 'Jersey', 'Gir', 'Pardo Suíço', 'Sindi', 'Nelore', 'Mestiça', 'Outra'];

function vazioInseminacao() {
  return {
    animalId: '', dataInseminacao: hoje(), tipo: 'Inseminação Artificial',
    racaSemen: 'Holandesa', identificacaoSemen: '', valorInseminacao: '', observacoes: ''
  };
}

export default function Reproducao() {
  const [registros, setRegistros] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [modalNova, setModalNova] = useState(false);
  const [formNova, setFormNova] = useState(vazioInseminacao());

  const [modalParto, setModalParto] = useState(null);
  const [dataParto, setDataParto] = useState(hoje());

  const [modalPerda, setModalPerda] = useState(null);
  const [dataPerda, setDataPerda] = useState(hoje());
  const [motivoPerda, setMotivoPerda] = useState('');

  const [excluir, setExcluir] = useState(null);

  async function carregarAnimais() {
    const resp = await api.get('/animais', { params: { status: 'Ativo' } });
    setAnimais(resp.data.filter(a => a.sexo === 'Fêmea'));
  }

  async function carregar() {
    setCarregando(true);
    const params = {};
    if (filtroStatus) params.status = filtroStatus;
    const resp = await api.get('/reproducao', { params });
    setRegistros(resp.data);
    setCarregando(false);
  }

  useEffect(() => { carregarAnimais(); }, []);
  useEffect(() => { carregar(); }, [filtroStatus]);

  function abrirNova() {
    setFormNova(vazioInseminacao());
    setErro('');
    setModalNova(true);
  }

  async function salvarNova(e) {
    e.preventDefault();
    setErro('');
    if (!formNova.animalId) {
      setErro('Selecione um animal.');
      return;
    }
    try {
      await api.post('/reproducao', {
        ...formNova,
        valorInseminacao: Number(formNova.valorInseminacao) || 0
      });
      setModalNova(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao registrar inseminação.');
    }
  }

  async function confirmarPrenhez(registro) {
    await api.put(`/reproducao/${registro.id}/confirmar-prenhez`, { dataConfirmacaoPrenhez: hoje() });
    carregar();
  }

  async function marcarNaoPrenhe(registro) {
    await api.put(`/reproducao/${registro.id}/nao-prenhe`);
    carregar();
  }

  function abrirModalParto(registro) {
    setDataParto(hoje());
    setModalParto(registro);
  }

  async function confirmarParto(e) {
    e.preventDefault();
    await api.put(`/reproducao/${modalParto.id}/parto`, { dataParto: dataParto });
    setModalParto(null);
    carregar();
  }

  function abrirModalPerda(registro) {
    setDataPerda(hoje());
    setMotivoPerda('');
    setModalPerda(registro);
  }

  async function confirmarPerdaCria(e) {
    e.preventDefault();
    await api.put(`/reproducao/${modalPerda.id}/perda-cria`, {
      dataPerdaCria: dataPerda,
      motivoPerda: motivoPerda
    });
    setModalPerda(null);
    carregar();
  }

  async function confirmarExclusao() {
    await api.delete(`/reproducao/${excluir.id}`);
    setExcluir(null);
    carregar();
  }

  return (
    <div>
      <PageHeader
        title="Controle Reprodutivo"
        subtitle="Inseminação, confirmação de prenhez, partos e perdas de cria"
        action={<Button onClick={abrirNova}><Plus className="w-4 h-4" /> Nova Inseminação</Button>}
      />

      <Card className="p-4 mb-5">
        <div className="flex gap-3 items-end">
          <Select label="Filtrar por status" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="sm:w-64">
            <option value="">Todos</option>
            <option value="Inseminada">Inseminada</option>
            <option value="Confirmada Prenhe">Confirmada Prenhe</option>
            <option value="Parto Realizado">Parto Realizado</option>
            <option value="Perda de Cria">Perda de Cria</option>
            <option value="Não Prenhe">Não Prenhe</option>
          </Select>
        </div>
      </Card>

      <Card>
        {carregando ? (
          <div className="p-10 text-center text-gray-400">Carregando...</div>
        ) : registros.length === 0 ? (
          <EmptyState
            icon={HeartPulse}
            title="Nenhum registro reprodutivo"
            description="Registre a primeira inseminação para iniciar o controle reprodutivo."
            action={<Button onClick={abrirNova}><Plus className="w-4 h-4" /> Nova Inseminação</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3 font-medium">Brinco</th>
                  <th className="px-5 py-3 font-medium">Data Inseminação</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 font-medium">Raça do Sêmen</th>
                  <th className="px-5 py-3 font-medium">Valor</th>
                  <th className="px-5 py-3 font-medium">Previsão Parto</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {registros.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/60">
                    <td className="px-5 py-3 font-medium text-gray-700">{r.numeroBrinco}</td>
                    <td className="px-5 py-3 text-gray-600">{formatarData(r.dataInseminacao)}</td>
                    <td className="px-5 py-3 text-gray-600">{r.tipo}</td>
                    <td className="px-5 py-3 text-gray-600">{r.racaSemen || '-'}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {r.valorInseminacao ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.valorInseminacao) : '-'}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{formatarData(r.dataPrevistaParto)}</td>
                    <td className="px-5 py-3"><Badge color={corStatus[r.status]}>{r.status}</Badge></td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {r.status === 'Inseminada' && (
                          <>
                            <button onClick={() => confirmarPrenhez(r)} className="p-2 text-verde-600 hover:bg-verde-50 rounded-lg" title="Confirmar Prenhez">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => marcarNaoPrenhe(r)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Marcar Não Prenhe">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {(r.status === 'Inseminada' || r.status === 'Confirmada Prenhe') && (
                          <>
                            <button onClick={() => abrirModalParto(r)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" title="Registrar Parto">
                              <Baby className="w-4 h-4" />
                            </button>
                            <button onClick={() => abrirModalPerda(r)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Marcar Perda de Cria">
                              <AlertOctagon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => setExcluir(r)} className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg" title="Excluir registro">
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

      {/* Modal Nova Inseminação */}
      <Modal open={modalNova} onClose={() => setModalNova(false)} title="Nova Inseminação">
        <form onSubmit={salvarNova} className="space-y-4">
          {erro && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{erro}</p>}

          <Select label="Animal (fêmea) *" value={formNova.animalId} onChange={(e) => setFormNova({ ...formNova, animalId: e.target.value })} required>
            <option value="">Selecione...</option>
            {animais.map((a) => (
              <option key={a.id} value={a.id}>{a.numeroBrinco} {a.nome ? `- ${a.nome}` : ''}</option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Data da Inseminação *" type="date" value={formNova.dataInseminacao} onChange={(e) => setFormNova({ ...formNova, dataInseminacao: e.target.value })} required />
            <Select label="Tipo" value={formNova.tipo} onChange={(e) => setFormNova({ ...formNova, tipo: e.target.value })}>
              <option>Inseminação Artificial</option>
              <option>Monta Natural</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Raça do Sêmen / Touro" value={formNova.racaSemen} onChange={(e) => setFormNova({ ...formNova, racaSemen: e.target.value })}>
              {RACAS_SEMEN.map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
            <Input label="Identificação do Sêmen/Touro" value={formNova.identificacaoSemen} onChange={(e) => setFormNova({ ...formNova, identificacaoSemen: e.target.value })} placeholder="Código, lote ou nome" />
          </div>

          <Input label="Valor da Inseminação (R$)" type="number" step="0.01" min="0" value={formNova.valorInseminacao} onChange={(e) => setFormNova({ ...formNova, valorInseminacao: e.target.value })} />

          <p className="text-xs text-gray-400 -mt-2">
            A previsão de parto será calculada automaticamente (gestação de aproximadamente 283 dias).
          </p>

          <Textarea label="Observações" value={formNova.observacoes} onChange={(e) => setFormNova({ ...formNova, observacoes: e.target.value })} />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalNova(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Registrar Parto */}
      <Modal open={!!modalParto} onClose={() => setModalParto(null)} title="Registrar Parto" maxWidth="max-w-md">
        <form onSubmit={confirmarParto} className="space-y-4">
          <p className="text-sm text-gray-500">
            Confirmar o nascimento para o animal de brinco <strong>{modalParto?.numeroBrinco}</strong>.
          </p>
          <Input label="Data do Parto" type="date" value={dataParto} onChange={(e) => setDataParto(e.target.value)} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalParto(null)}>Cancelar</Button>
            <Button type="submit">Confirmar Parto</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Marcar Perda de Cria */}
      <Modal open={!!modalPerda} onClose={() => setModalPerda(null)} title="Marcar Perda de Cria" maxWidth="max-w-md">
        <form onSubmit={confirmarPerdaCria} className="space-y-4">
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
            <AlertOctagon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            Esta ação marcará a gestação do animal de brinco <strong>{modalPerda?.numeroBrinco}</strong> como perdida (aborto).
          </div>
          <Input label="Data da Perda *" type="date" value={dataPerda} onChange={(e) => setDataPerda(e.target.value)} required />
          <Textarea label="Motivo da Perda (opcional)" value={motivoPerda} onChange={(e) => setMotivoPerda(e.target.value)} placeholder="Ex: aborto espontâneo, doença, acidente..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalPerda(null)}>Cancelar</Button>
            <Button variant="danger" type="submit">Confirmar Perda de Cria</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!excluir}
        onClose={() => setExcluir(null)}
        onConfirm={confirmarExclusao}
        title="Excluir Registro"
        message="Tem certeza que deseja excluir este registro reprodutivo? Esta ação não pode ser desfeita."
      />
    </div>
  );
}
