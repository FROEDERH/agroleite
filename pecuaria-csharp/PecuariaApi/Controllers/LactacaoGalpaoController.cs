using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PecuariaApi.Data;
using PecuariaApi.DTOs;
using PecuariaApi.Models;

namespace PecuariaApi.Controllers;

[ApiController]
[Route("api/lactacao-galpao")]
[Authorize]
public class LactacaoGalpaoController : ControllerBase
{
    private readonly PecuariaDbContext _db;

    public LactacaoGalpaoController(PecuariaDbContext db)
    {
        _db = db;
    }

    private static string HojeStr() => DateTime.Now.ToString("yyyy-MM-dd");

    // Soma dias de carência a uma data (YYYY-MM-DD), retornando também YYYY-MM-DD
    private static string? CalcularFimCarencia(string dataMedicacao, int? carenciaDias)
    {
        if (carenciaDias == null) return null;
        var data = DateTime.Parse(dataMedicacao);
        return data.AddDays(carenciaDias.Value).ToString("yyyy-MM-dd");
    }

    // Monta o DTO de resposta de uma medicação, já calculando data fim de carência
    // e se a carência já está vencida (sem que isso libere automaticamente o status).
    private static MedicacaoLactacaoResponse MapearMedicacao(MedicacaoLactacao m)
    {
        var dataFimCarencia = CalcularFimCarencia(m.DataMedicacao, m.CarenciaDias);
        var hoje = HojeStr();

        bool carenciaVencida = !m.PodeVenderLeite
            && m.DataLiberacaoManual == null
            && dataFimCarencia != null
            && string.Compare(hoje, dataFimCarencia, StringComparison.Ordinal) >= 0;

        return new MedicacaoLactacaoResponse
        {
            Id = m.Id,
            LactacaoGalpaoId = m.LactacaoGalpaoId,
            DataMedicacao = m.DataMedicacao,
            NomeMedicacao = m.NomeMedicacao,
            DoseMl = m.DoseMl,
            PodeVenderLeite = m.PodeVenderLeite,
            CarenciaDias = m.CarenciaDias,
            DataFimCarencia = dataFimCarencia,
            CarenciaVencida = carenciaVencida,
            DataLiberacaoManual = m.DataLiberacaoManual,
            Observacoes = m.Observacoes
        };
    }

    // Calcula o status do registro de lactação a partir das medicações e da data fim.
    // Prioridade: Medicado > Inativo > Ativo.
    private static (string status, MedicacaoLactacaoResponse? medicacaoAtiva) CalcularStatus(
        LactacaoGalpao lactacao, List<MedicacaoLactacaoResponse> medicacoesMapeadas)
    {
        // Uma medicação é "ativa" (bloqueia o leite) quando PodeVenderLeite=false
        // e ainda não foi liberada manualmente — independente da carência já ter
        // vencido ou não (vencida apenas sinaliza, conforme decidido com o cliente).
        var medicacaoAtiva = medicacoesMapeadas
            .Where(m => !m.PodeVenderLeite && m.DataLiberacaoManual == null)
            .OrderByDescending(m => m.DataMedicacao)
            .FirstOrDefault();

        if (medicacaoAtiva != null)
        {
            return ("Medicado", medicacaoAtiva);
        }

        if (!string.IsNullOrEmpty(lactacao.DataFim))
        {
            return ("Inativo", null);
        }

        return ("Ativo", null);
    }

    private LactacaoGalpaoResponse MapearLactacao(LactacaoGalpao l)
    {
        var medicacoesMapeadas = l.Medicacoes
            .OrderByDescending(m => m.DataMedicacao)
            .Select(MapearMedicacao)
            .ToList();

        var (status, medicacaoAtiva) = CalcularStatus(l, medicacoesMapeadas);

        return new LactacaoGalpaoResponse
        {
            Id = l.Id,
            AnimalId = l.AnimalId,
            NumeroBrinco = l.Animal?.NumeroBrinco ?? "",
            NomeAnimal = l.Animal?.Nome,
            DataInicio = l.DataInicio,
            DataFim = l.DataFim,
            Status = status,
            MedicacaoAtiva = medicacaoAtiva,
            Medicacoes = medicacoesMapeadas
        };
    }

    [HttpGet]
    public IActionResult Listar([FromQuery] string? status, [FromQuery] string? dataInicio, [FromQuery] string? dataFim)
    {
        var registros = _db.LactacoesGalpao
            .Include(l => l.Animal)
            .Include(l => l.Medicacoes)
            .ToList();

        var mapeados = registros.Select(MapearLactacao).ToList();

        // Filtro por status é aplicado em memória pois o status é calculado, não persistido
        if (!string.IsNullOrEmpty(status))
        {
            mapeados = mapeados.Where(m => m.Status == status).ToList();
        }

        if (!string.IsNullOrEmpty(dataInicio))
        {
            mapeados = mapeados.Where(m => string.Compare(m.DataInicio, dataInicio, StringComparison.Ordinal) >= 0).ToList();
        }

        if (!string.IsNullOrEmpty(dataFim))
        {
            // Considera registros cujo período tem qualquer interseção até a data informada
            mapeados = mapeados.Where(m => string.Compare(m.DataInicio, dataFim, StringComparison.Ordinal) <= 0).ToList();
        }

        var resultado = mapeados.OrderByDescending(m => m.DataInicio).ToList();
        return Ok(resultado);
    }

    [HttpGet("{id}")]
    public IActionResult BuscarPorId(int id)
    {
        var lactacao = _db.LactacoesGalpao
            .Include(l => l.Animal)
            .Include(l => l.Medicacoes)
            .FirstOrDefault(l => l.Id == id);

        if (lactacao == null)
        {
            return NotFound(new { erro = "Registro de lactação não encontrado." });
        }

        return Ok(MapearLactacao(lactacao));
    }

    [HttpPost]
    public IActionResult Criar([FromBody] LactacaoGalpaoRequest request)
    {
        if (request.AnimalId <= 0 || string.IsNullOrEmpty(request.DataInicio))
        {
            return BadRequest(new { erro = "Animal e data inicial são obrigatórios." });
        }

        var animal = _db.Animais.Find(request.AnimalId);
        if (animal == null)
        {
            return BadRequest(new { erro = "Animal não encontrado." });
        }

        if (!string.IsNullOrEmpty(request.DataFim) &&
            string.Compare(request.DataFim, request.DataInicio, StringComparison.Ordinal) < 0)
        {
            return BadRequest(new { erro = "A data final não pode ser anterior à data inicial." });
        }

        var lactacao = new LactacaoGalpao
        {
            AnimalId = request.AnimalId,
            DataInicio = request.DataInicio,
            DataFim = string.IsNullOrEmpty(request.DataFim) ? null : request.DataFim
        };

        _db.LactacoesGalpao.Add(lactacao);
        _db.SaveChanges();

        lactacao.Animal = animal;
        return StatusCode(201, MapearLactacao(lactacao));
    }

    [HttpPut("{id}")]
    public IActionResult Atualizar(int id, [FromBody] LactacaoGalpaoRequest request)
    {
        var lactacao = _db.LactacoesGalpao
            .Include(l => l.Animal)
            .Include(l => l.Medicacoes)
            .FirstOrDefault(l => l.Id == id);

        if (lactacao == null)
        {
            return NotFound(new { erro = "Registro de lactação não encontrado." });
        }

        if (string.IsNullOrEmpty(request.DataInicio))
        {
            return BadRequest(new { erro = "A data inicial é obrigatória." });
        }

        if (!string.IsNullOrEmpty(request.DataFim) &&
            string.Compare(request.DataFim, request.DataInicio, StringComparison.Ordinal) < 0)
        {
            return BadRequest(new { erro = "A data final não pode ser anterior à data inicial." });
        }

        lactacao.DataInicio = request.DataInicio;
        lactacao.DataFim = string.IsNullOrEmpty(request.DataFim) ? null : request.DataFim;

        _db.SaveChanges();

        return Ok(MapearLactacao(lactacao));
    }

    [HttpDelete("{id}")]
    public IActionResult Excluir(int id)
    {
        var lactacao = _db.LactacoesGalpao.Find(id);
        if (lactacao == null)
        {
            return NotFound(new { erro = "Registro de lactação não encontrado." });
        }

        _db.LactacoesGalpao.Remove(lactacao);
        _db.SaveChanges();

        return Ok(new { sucesso = true });
    }

    // ===== MEDICAÇÕES =====

    [HttpPost("{id}/medicacoes")]
    public IActionResult AdicionarMedicacao(int id, [FromBody] MedicacaoLactacaoRequest request)
    {
        var lactacao = _db.LactacoesGalpao
            .Include(l => l.Animal)
            .Include(l => l.Medicacoes)
            .FirstOrDefault(l => l.Id == id);

        if (lactacao == null)
        {
            return NotFound(new { erro = "Registro de lactação não encontrado." });
        }

        if (string.IsNullOrEmpty(request.DataMedicacao) || string.IsNullOrEmpty(request.NomeMedicacao))
        {
            return BadRequest(new { erro = "Data e nome da medicação são obrigatórios." });
        }

        if (!request.PodeVenderLeite && request.CarenciaDias is null or <= 0)
        {
            return BadRequest(new { erro = "Quando o leite não pode ser vendido, informe a quantidade de dias de carência." });
        }

        var medicacao = new MedicacaoLactacao
        {
            LactacaoGalpaoId = id,
            DataMedicacao = request.DataMedicacao,
            NomeMedicacao = request.NomeMedicacao,
            DoseMl = request.DoseMl,
            PodeVenderLeite = request.PodeVenderLeite,
            CarenciaDias = request.PodeVenderLeite ? null : request.CarenciaDias,
            Observacoes = request.Observacoes
        };

        _db.MedicacoesLactacao.Add(medicacao);
        _db.SaveChanges();

        // Recarrega o registro completo para devolver o status já recalculado
        lactacao.Medicacoes.Add(medicacao);
        return StatusCode(201, MapearLactacao(lactacao));
    }

    [HttpPut("medicacoes/{medicacaoId}/liberar")]
    public IActionResult LiberarMedicacao(int medicacaoId, [FromBody] LiberarMedicacaoRequest request)
    {
        var medicacao = _db.MedicacoesLactacao.Find(medicacaoId);
        if (medicacao == null)
        {
            return NotFound(new { erro = "Medicação não encontrada." });
        }

        if (medicacao.PodeVenderLeite)
        {
            return BadRequest(new { erro = "Esta medicação já permite a venda do leite, não há carência a liberar." });
        }

        medicacao.DataLiberacaoManual = request.DataLiberacao ?? HojeStr();
        _db.SaveChanges();

        var lactacao = _db.LactacoesGalpao
            .Include(l => l.Animal)
            .Include(l => l.Medicacoes)
            .First(l => l.Id == medicacao.LactacaoGalpaoId);

        return Ok(MapearLactacao(lactacao));
    }

    [HttpDelete("medicacoes/{medicacaoId}")]
    public IActionResult ExcluirMedicacao(int medicacaoId)
    {
        var medicacao = _db.MedicacoesLactacao.Find(medicacaoId);
        if (medicacao == null)
        {
            return NotFound(new { erro = "Medicação não encontrada." });
        }

        _db.MedicacoesLactacao.Remove(medicacao);
        _db.SaveChanges();

        return Ok(new { sucesso = true });
    }
}
