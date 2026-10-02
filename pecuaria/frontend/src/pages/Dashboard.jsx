import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Milk, Beef, HeartPulse, Wallet, TrendingUp, TrendingDown,
  Package, Wheat, AlertTriangle, Baby, Syringe
} from 'lucide-react';
import api from '../api';
import { Card, StatCard, PageHeader, Badge } from '../components/UI';

const CORES_GRAFICO = ['#48903f', '#b97935', '#67ab5e', '#c6924f', '#90c587', '#d6b27c'];

function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
}

function formatarData(dataStr) {
  if (!dataStr) return '-';
  const [ano, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [producaoMensal, setProducaoMensal] = useState([]);
  const [financeiroMensal, setFinanceiroMensal] = useState([]);
  const [despesasCategoria, setDespesasCategoria] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        const [r1, r2, r3, r4] = await Promise.all([
          api.get('/dashboard/resumo'),
          api.get('/dashboard/producao-mensal'),
          api.get('/dashboard/financeiro-mensal'),
          api.get('/dashboard/despesas-categoria'),
        ]);
        setResumo(r1.data);
        setProducaoMensal(r2.data);
        setFinanceiroMensal(r3.data);
        setDespesasCategoria(r4.data);
      } catch (e) {
        console.error(e);
        setErro('Não foi possível carregar os dados do painel. Verifique se o backend está rodando.');
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  if (carregando) {
    return <div className="flex items-center justify-center h-96 text-gray-400">Carregando painel...</div>;
  }

  if (erro || !resumo) {
    return (
      <div className="flex items-center justify-center h-96 text-red-500 text-center px-4">
        {erro || 'Não foi possível carregar os dados.'}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Painel Geral" subtitle="Visão geral da sua produção e finanças" />

      {/* Cards principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Milk} label="Produção do Mês" value={`${resumo.producaoMes.toFixed(0)} L`} sublabel={`${resumo.totalRegistrosMes} registro(s) no mês`} color="azul" />
        <StatCard icon={Beef} label="Vacas no Plantel" value={resumo.totalVacas} sublabel={`${resumo.totalAnimais} animais no total`} color="terra" />
        <StatCard icon={HeartPulse} label="Animais Prenhes" value={resumo.totalPrenhes} sublabel={`${resumo.perdasCriaAno} perdas de cria este ano`} color="amarelo" />
        <StatCard icon={Wallet} label="Saldo do Mês" value={formatarMoeda(resumo.saldoMes)} color={resumo.saldoMes >= 0 ? 'verde' : 'vermelho'} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={TrendingUp} label="Receitas do Mês" value={formatarMoeda(resumo.receitasMes)} color="verde" />
        <StatCard icon={TrendingDown} label="Despesas do Mês" value={formatarMoeda(resumo.despesasMes)} color="vermelho" />
        <StatCard icon={Wallet} label="Saldo Total (geral)" value={formatarMoeda(resumo.saldoTotal)} color={resumo.saldoTotal >= 0 ? 'verde' : 'vermelho'} />
        <StatCard icon={Beef} label="Total de Animais Ativos" value={resumo.totalAnimais} color="terra" />
      </div>

      {/* Estoques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 flex items-center gap-4">
          <div className="bg-terra-50 text-terra-700 rounded-xl p-3"><Package className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Estoque de Ração</p>
            <p className="text-xl font-bold text-gray-800">{resumo.estoqueRacao.toFixed(0)} kg</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="bg-amber-50 text-amber-700 rounded-xl p-3"><Wheat className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Estoque de Feno</p>
            <p className="text-xl font-bold text-gray-800">{resumo.estoqueFeno.toFixed(0)} fardos</p>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="bg-verde-50 text-verde-700 rounded-xl p-3"><Wheat className="w-5 h-5" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Estoque de Silagem</p>
            <p className="text-xl font-bold text-gray-800">{resumo.estoqueSilagem.toFixed(1)} ton</p>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Produção de Leite por Mês</h3>
          {producaoMensal.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">Sem registros de produção ainda</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={producaoMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v.toFixed(1)} L`, 'Produção']} />
                <Bar dataKey="total" fill="#48903f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Despesas por Categoria (mês atual)</h3>
          {despesasCategoria.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">Sem despesas este mês</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={despesasCategoria}
                  dataKey="total"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ categoria, percent }) => `${categoria} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={11}
                >
                  {despesasCategoria.map((_, i) => (
                    <Cell key={i} fill={CORES_GRAFICO[i % CORES_GRAFICO.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatarMoeda(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 mb-6">
        <Card className="p-5">
          <h3 className="font-semibold text-gray-700 mb-4">Receitas x Despesas (últimos meses)</h3>
          {financeiroMensal.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-gray-400 text-sm">Sem dados financeiros ainda</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={financeiroMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatarMoeda(v)} />
                <Legend />
                <Bar dataKey="receitas" name="Receitas" fill="#48903f" radius={[6, 6, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="#c0392b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Baby className="w-4 h-4 text-terra-600" /> Partos Previstos (próximos 30 dias)
          </h3>
          {resumo.partosProximos.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum parto previsto para os próximos 30 dias.</p>
          ) : (
            <div className="space-y-2">
              {resumo.partosProximos.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 px-3 bg-terra-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Brinco {p.numeroBrinco} {p.nomeAnimal ? `(${p.nomeAnimal})` : ''}</p>
                    <p className="text-xs text-gray-500">Previsão: {formatarData(p.dataPrevistaParto)}</p>
                  </div>
                  <Badge color="terra">{p.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Syringe className="w-4 h-4 text-amber-600" /> Vacinas a Vencer (próximos 15 dias)
          </h3>
          {resumo.vacinasProximas.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma vacina próxima do vencimento.</p>
          ) : (
            <div className="space-y-2">
              {resumo.vacinasProximas.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-2 px-3 bg-amber-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Brinco {v.numeroBrinco} — {v.nomeVacina}</p>
                    <p className="text-xs text-gray-500">Próxima dose: {formatarData(v.proximaDose)}</p>
                  </div>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
