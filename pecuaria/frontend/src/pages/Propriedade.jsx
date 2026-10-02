import { useState, useEffect } from 'react';
import { Building2, Check } from 'lucide-react';
import api from '../api';
import { Card, Button, Input, Textarea, PageHeader } from '../components/UI';

function vazio() {
  return {
    nome: '', proprietario: '', cnpjCpf: '', endereco: '', cidade: '', estado: '',
    areaHectares: '', inscricaoEstadual: '', telefone: '', email: '', observacoes: ''
  };
}

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export default function Propriedade() {
  const [form, setForm] = useState(vazio());
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    const resp = await api.get('/propriedade');
    if (resp.data) {
      setForm({
        ...vazio(),
        ...resp.data,
        areaHectares: resp.data.areaHectares || ''
      });
    }
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    setSalvando(true);
    try {
      const payload = { ...form, areaHectares: form.areaHectares ? Number(form.areaHectares) : null };
      const resp = await api.post('/propriedade', payload);
      setForm({ ...vazio(), ...resp.data, areaHectares: resp.data.areaHectares || '' });
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar dados da propriedade.');
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return <div className="p-10 text-center text-gray-400">Carregando...</div>;
  }

  return (
    <div>
      <PageHeader title="Dados da Propriedade" subtitle="Informações cadastrais da fazenda" />

      <Card className="p-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-verde-50 text-verde-700 rounded-xl p-3">
            <Building2 className="w-5 h-5" />
          </div>
          <p className="text-sm text-gray-500">Estes dados podem ser usados em relatórios e documentos da fazenda.</p>
        </div>

        {erro && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl mb-4">{erro}</p>}
        {sucesso && (
          <p className="text-verde-700 text-sm bg-verde-50 p-3 rounded-xl mb-4 flex items-center gap-2">
            <Check className="w-4 h-4" /> Dados salvos com sucesso.
          </p>
        )}

        <form onSubmit={salvar} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome da Propriedade *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            <Input label="Proprietário" value={form.proprietario} onChange={(e) => setForm({ ...form, proprietario: e.target.value })} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="CNPJ / CPF" value={form.cnpjCpf} onChange={(e) => setForm({ ...form, cnpjCpf: e.target.value })} />
            <Input label="Inscrição Estadual" value={form.inscricaoEstadual} onChange={(e) => setForm({ ...form, inscricaoEstadual: e.target.value })} />
          </div>

          <Input label="Endereço" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Cidade" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} className="sm:col-span-2" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
              <select
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-verde-400 bg-white"
              >
                <option value="">Selecione...</option>
                {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Área (hectares)" type="number" step="0.01" min="0" value={form.areaHectares} onChange={(e) => setForm({ ...form, areaHectares: e.target.value })} />
            <Input label="Telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            <Input label="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <Textarea label="Observações" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar Dados'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
