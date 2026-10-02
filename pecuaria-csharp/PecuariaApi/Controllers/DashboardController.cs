using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PecuariaApi.Data;

namespace PecuariaApi.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly PecuariaDbContext _db;

    public DashboardController(PecuariaDbContext db)
    {
        _db = db;
    }

    private static string HojeStr() => DateTime.Now.ToString("yyyy-MM-dd");
    private static string PrimeiroDiaMes() => new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1).ToString("yyyy-MM-dd");
    private static string PrimeiroDiaAno() => new DateTime(DateTime.Now.Year, 1, 1).ToString("yyyy-MM-dd");

    // Todas as comparações de data (strings no formato YYYY-MM-DD) são feitas em memória
    // (depois de .ToList()/.AsEnumerable()) para evitar problemas de tradução de
    // string.CompareTo() para SQL pelo provedor do SQLite no Entity Framework Core.

    [HttpGet("resumo")]
    public IActionResult Resumo()
    {
        var hoje = HojeStr();
        var primeiroDiaMes = PrimeiroDiaMes();
        var primeiroDiaAno = PrimeiroDiaAno();
        var em30Dias = DateTime.Now.AddDays(30).ToString("yyyy-MM-dd");
        var em15Dias = DateTime.Now.AddDays(15).ToString("yyyy-MM-dd");
        var menos5Dias = DateTime.Now.AddDays(-5).ToString("yyyy-MM-dd");

        // Animais
        var totalAnimais = _db.Animais.Count(a => a.Status == "Ativo");
        var totalVacas = _db.Animais.Count(a => a.Status == "Ativo" && a.Categoria == "Vaca");

        // Produção de leite (agora por período, sem vínculo de animal) — trazido para memória
        var producoesLeite = _db.ProducoesLeite.ToList();
        var producaoMes = producoesLeite
            .Where(p => string.Compare(p.DataFim, primeiroDiaMes, StringComparison.Ordinal) >= 0)
            .Sum(p => p.LitrosTotal);
        var totalRegistrosMes = producoesLeite
            .Count(p => string.Compare(p.DataFim, primeiroDiaMes, StringComparison.Ordinal) >= 0);

        // Reprodução
        var totalPrenhes = _db.Reproducoes
            .Count(r => r.Status == "Inseminada" || r.Status == "Confirmada Prenhe");

        var perdasCriaAno = _db.Reproducoes
            .Where(r => r.Status == "Perda de Cria" && r.DataPerdaCria != null)
            .ToList()
            .Count(r => string.Compare(r.DataPerdaCria, primeiroDiaAno, StringComparison.Ordinal) >= 0);

        // Financeiro do mês — trazido para memória antes de comparar datas
        var todasDespesas = _db.Despesas.ToList();
        var todasReceitas = _db.Receitas.ToList();

        var despesasMes = todasDespesas
            .Where(d => string.Compare(d.Data, primeiroDiaMes, StringComparison.Ordinal) >= 0)
            .Sum(d => d.Valor);

        var receitasMes = todasReceitas
            .Where(r => string.Compare(r.Data, primeiroDiaMes, StringComparison.Ordinal) >= 0)
            .Sum(r => r.Valor);

        // Financeiro total
        var despesasTotal = todasDespesas.Sum(d => d.Valor);
        var receitasTotal = todasReceitas.Sum(r => r.Valor);

        // Estoques atuais
        var estoqueRacaoEntradas = _db.EstoqueRacao.Sum(e => (double?)e.QuantidadeKg) ?? 0;
        var estoqueRacaoSaidas = _db.ConsumoRacao.Sum(c => (double?)c.QuantidadeKg) ?? 0;
        var estoqueRacao = estoqueRacaoEntradas - estoqueRacaoSaidas;

        var estoqueFenoEntradas = _db.EstoqueFeno.Sum(e => (double?)e.QuantidadeFardos) ?? 0;
        var estoqueFenoSaidas = _db.ConsumoFeno.Sum(c => (double?)c.QuantidadeFardos) ?? 0;
        var estoqueFeno = estoqueFenoEntradas - estoqueFenoSaidas;

        var estoqueSilagemEntradas = _db.EstoqueSilagem.Sum(e => (double?)e.QuantidadeToneladas) ?? 0;
        var estoqueSilagemSaidas = _db.ConsumoSilagem.Sum(c => (double?)c.QuantidadeToneladas) ?? 0;
        var estoqueSilagem = estoqueSilagemEntradas - estoqueSilagemSaidas;

        // Partos previstos (próximos 30 dias) — filtro de data em memória
        var partosProximos = _db.Reproducoes
            .Include(r => r.Animal)
            .Where(r => r.Status == "Inseminada" || r.Status == "Confirmada Prenhe")
            .ToList()
            .Where(r => r.DataPrevistaParto != null
                        && string.Compare(r.DataPrevistaParto, hoje, StringComparison.Ordinal) >= 0
                        && string.Compare(r.DataPrevistaParto, em30Dias, StringComparison.Ordinal) <= 0)
            .OrderBy(r => r.DataPrevistaParto)
            .Select(r => new
            {
                r.Id,
                r.AnimalId,
                NumeroBrinco = r.Animal!.NumeroBrinco,
                NomeAnimal = r.Animal.Nome,
                r.DataPrevistaParto,
                r.Status
            })
            .ToList();

        // Vacinas a vencer (próximos 15 dias, com margem de 5 dias passados) — filtro em memória
        var vacinasProximas = _db.Vacinas
            .Include(v => v.Animal)
            .Where(v => v.ProximaDose != null)
            .ToList()
            .Where(v => string.Compare(v.ProximaDose, menos5Dias, StringComparison.Ordinal) >= 0
                        && string.Compare(v.ProximaDose, em15Dias, StringComparison.Ordinal) <= 0)
            .OrderBy(v => v.ProximaDose)
            .Select(v => new
            {
                v.Id,
                v.AnimalId,
                NumeroBrinco = v.Animal!.NumeroBrinco,
                NomeAnimal = v.Animal.Nome,
                v.NomeVacina,
                v.ProximaDose
            })
            .ToList();

        return Ok(new
        {
            totalAnimais,
            totalVacas,
            producaoMes,
            totalRegistrosMes,
            totalPrenhes,
            perdasCriaAno,
            despesasMes,
            receitasMes,
            saldoMes = receitasMes - despesasMes,
            despesasTotal,
            receitasTotal,
            saldoTotal = receitasTotal - despesasTotal,
            estoqueRacao,
            estoqueFeno,
            estoqueSilagem,
            partosProximos,
            vacinasProximas
        });
    }

    [HttpGet("producao-mensal")]
    public IActionResult ProducaoMensal([FromQuery] int meses = 12)
    {
        var limite = DateTime.Now.AddMonths(-meses).ToString("yyyy-MM-dd");

        // Agrupa produção de leite por mês (usando o DataFim do registro como referência)
        var dados = _db.ProducoesLeite
            .ToList()
            .Where(p => string.Compare(p.DataFim, limite, StringComparison.Ordinal) >= 0)
            .GroupBy(p => p.DataFim.Substring(0, 7)) // "YYYY-MM"
            .Select(g => new
            {
                mes = g.Key,
                total = g.Sum(p => p.LitrosTotal)
            })
            .OrderBy(g => g.mes)
            .ToList();

        return Ok(dados);
    }

    [HttpGet("financeiro-mensal")]
    public IActionResult FinanceiroMensal()
    {
        var limite = DateTime.Now.AddMonths(-12).ToString("yyyy-MM-dd");

        var despesas = _db.Despesas
            .ToList()
            .Where(d => string.Compare(d.Data, limite, StringComparison.Ordinal) >= 0)
            .GroupBy(d => d.Data.Substring(0, 7))
            .Select(g => new { mes = g.Key, total = g.Sum(d => d.Valor) })
            .ToDictionary(g => g.mes, g => g.total);

        var receitas = _db.Receitas
            .ToList()
            .Where(r => string.Compare(r.Data, limite, StringComparison.Ordinal) >= 0)
            .GroupBy(r => r.Data.Substring(0, 7))
            .Select(g => new { mes = g.Key, total = g.Sum(r => r.Valor) })
            .ToDictionary(g => g.mes, g => g.total);

        var meses = despesas.Keys.Union(receitas.Keys).OrderBy(m => m);

        var resultado = meses.Select(mes => new
        {
            mes,
            despesas = despesas.GetValueOrDefault(mes, 0),
            receitas = receitas.GetValueOrDefault(mes, 0)
        }).ToList();

        return Ok(resultado);
    }

    [HttpGet("despesas-categoria")]
    public IActionResult DespesasPorCategoria()
    {
        var primeiroDiaMes = PrimeiroDiaMes();

        var dados = _db.Despesas
            .ToList()
            .Where(d => string.Compare(d.Data, primeiroDiaMes, StringComparison.Ordinal) >= 0)
            .GroupBy(d => d.Categoria)
            .Select(g => new { categoria = g.Key, total = g.Sum(d => d.Valor) })
            .OrderByDescending(g => g.total)
            .ToList();

        return Ok(dados);
    }

    [HttpGet("vendas-animais-resumo")]
    public IActionResult VendasAnimaisResumo()
    {
        var primeiroDiaMes = PrimeiroDiaMes();
        var primeiroDiaAno = PrimeiroDiaAno();

        var todasVendas = _db.VendasAnimais.ToList();

        var totalVendasMes = todasVendas
            .Where(v => string.Compare(v.DataVenda, primeiroDiaMes, StringComparison.Ordinal) >= 0)
            .Sum(v => v.ValorFinal);

        var vendasAno = todasVendas
            .Where(v => string.Compare(v.DataVenda, primeiroDiaAno, StringComparison.Ordinal) >= 0)
            .ToList();

        var totalVendasAno = vendasAno.Sum(v => v.ValorFinal);
        var qtdVendasAno = vendasAno.Count;

        return Ok(new { totalVendasMes, totalVendasAno, qtdVendasAno });
    }
}
