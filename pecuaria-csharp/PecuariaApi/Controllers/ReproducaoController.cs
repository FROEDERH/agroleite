using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PecuariaApi.Data;
using PecuariaApi.DTOs;
using PecuariaApi.Models;

namespace PecuariaApi.Controllers;

[ApiController]
[Route("api/reproducao")]
[Authorize]
public class ReproducaoController : ControllerBase
{
    private readonly PecuariaDbContext _db;

    public ReproducaoController(PecuariaDbContext db)
    {
        _db = db;
    }

    // Soma 283 dias (gestação média bovina) à data de inseminação
    private static string CalcularPrevisaoParto(string dataInseminacao)
    {
        var data = DateTime.Parse(dataInseminacao);
        return data.AddDays(283).ToString("yyyy-MM-dd");
    }

    private static string HojeStr() => DateTime.Now.ToString("yyyy-MM-dd");

    [HttpGet]
    public IActionResult Listar([FromQuery] string? status, [FromQuery] int? animalId)
    {
        var query = _db.Reproducoes
            .Include(r => r.Animal)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(r => r.Status == status);

        if (animalId.HasValue)
            query = query.Where(r => r.AnimalId == animalId.Value);

        var registros = query
            .OrderByDescending(r => r.DataInseminacao)
            .Select(r => new
            {
                r.Id,
                r.AnimalId,
                NumeroBrinco = r.Animal!.NumeroBrinco,
                NomeAnimal = r.Animal.Nome,
                r.DataInseminacao,
                r.Tipo,
                r.RacaSemen,
                r.IdentificacaoSemen,
                r.ValorInseminacao,
                r.DataPrevistaParto,
                r.Status,
                r.DataConfirmacaoPrenhez,
                r.DataParto,
                r.DataPerdaCria,
                r.MotivoPerda,
                r.Observacoes
            })
            .ToList();

        return Ok(registros);
    }

    [HttpGet("prenhes")]
    public IActionResult ListarPrenhes()
    {
        var registros = _db.Reproducoes
            .Include(r => r.Animal)
            .Where(r => r.Status == "Inseminada" || r.Status == "Confirmada Prenhe")
            .OrderBy(r => r.DataPrevistaParto)
            .Select(r => new
            {
                r.Id,
                r.AnimalId,
                NumeroBrinco = r.Animal!.NumeroBrinco,
                NomeAnimal = r.Animal.Nome,
                r.DataInseminacao,
                r.Tipo,
                r.RacaSemen,
                r.DataPrevistaParto,
                r.Status
            })
            .ToList();

        return Ok(registros);
    }

    [HttpPost]
    public IActionResult Criar([FromBody] ReproducaoRequest request)
    {
        if (request.AnimalId <= 0 || string.IsNullOrEmpty(request.DataInseminacao))
        {
            return BadRequest(new { erro = "Animal e data da inseminação são obrigatórios." });
        }

        var animal = _db.Animais.Find(request.AnimalId);
        if (animal == null)
        {
            return BadRequest(new { erro = "Animal não encontrado." });
        }

        var dataPrevista = CalcularPrevisaoParto(request.DataInseminacao);

        var reproducao = new Reproducao
        {
            AnimalId = request.AnimalId,
            DataInseminacao = request.DataInseminacao,
            Tipo = request.Tipo ?? "Inseminação Artificial",
            RacaSemen = request.RacaSemen,
            IdentificacaoSemen = request.IdentificacaoSemen,
            ValorInseminacao = request.ValorInseminacao,
            DataPrevistaParto = dataPrevista,
            Status = "Inseminada",
            Observacoes = request.Observacoes
        };

        _db.Reproducoes.Add(reproducao);
        _db.SaveChanges();

        return StatusCode(201, reproducao);
    }

    [HttpPut("{id}")]
    public IActionResult Atualizar(int id, [FromBody] ReproducaoRequest request)
    {
        var reproducao = _db.Reproducoes.Find(id);
        if (reproducao == null)
        {
            return NotFound(new { erro = "Registro não encontrado." });
        }

        reproducao.DataInseminacao = request.DataInseminacao;
        reproducao.Tipo = request.Tipo ?? reproducao.Tipo;
        reproducao.RacaSemen = request.RacaSemen;
        reproducao.IdentificacaoSemen = request.IdentificacaoSemen;
        reproducao.ValorInseminacao = request.ValorInseminacao;
        reproducao.DataPrevistaParto = CalcularPrevisaoParto(request.DataInseminacao);
        reproducao.Observacoes = request.Observacoes;

        _db.SaveChanges();
        return Ok(reproducao);
    }

    [HttpPut("{id}/confirmar-prenhez")]
    public IActionResult ConfirmarPrenhez(int id, [FromBody] ConfirmarPrenhezRequest request)
    {
        var reproducao = _db.Reproducoes.Find(id);
        if (reproducao == null)
        {
            return NotFound(new { erro = "Registro não encontrado." });
        }

        reproducao.Status = "Confirmada Prenhe";
        reproducao.DataConfirmacaoPrenhez = request.DataConfirmacaoPrenhez ?? HojeStr();

        _db.SaveChanges();
        return Ok(reproducao);
    }

    [HttpPut("{id}/nao-prenhe")]
    public IActionResult MarcarNaoPrenhe(int id)
    {
        var reproducao = _db.Reproducoes.Find(id);
        if (reproducao == null)
        {
            return NotFound(new { erro = "Registro não encontrado." });
        }

        reproducao.Status = "Não Prenhe";

        _db.SaveChanges();
        return Ok(reproducao);
    }

    [HttpPut("{id}/parto")]
    public IActionResult RegistrarParto(int id, [FromBody] RegistrarPartoRequest request)
    {
        var reproducao = _db.Reproducoes.Find(id);
        if (reproducao == null)
        {
            return NotFound(new { erro = "Registro não encontrado." });
        }

        reproducao.Status = "Parto Realizado";
        reproducao.DataParto = request.DataParto ?? HojeStr();
        if (!string.IsNullOrEmpty(request.Observacoes))
        {
            reproducao.Observacoes = request.Observacoes;
        }

        _db.SaveChanges();
        return Ok(reproducao);
    }

    // Rota dedicada para marcar perda de cria (aborto) — requisito explícito do cliente
    [HttpPut("{id}/perda-cria")]
    public IActionResult MarcarPerdaCria(int id, [FromBody] PerdaCriaRequest request)
    {
        var reproducao = _db.Reproducoes.Find(id);
        if (reproducao == null)
        {
            return NotFound(new { erro = "Registro não encontrado." });
        }

        reproducao.Status = "Perda de Cria";
        reproducao.DataPerdaCria = request.DataPerdaCria ?? HojeStr();
        reproducao.MotivoPerda = request.MotivoPerda;

        _db.SaveChanges();
        return Ok(reproducao);
    }

    [HttpDelete("{id}")]
    public IActionResult Excluir(int id)
    {
        var reproducao = _db.Reproducoes.Find(id);
        if (reproducao == null)
        {
            return NotFound(new { erro = "Registro não encontrado." });
        }

        _db.Reproducoes.Remove(reproducao);
        _db.SaveChanges();

        return Ok(new { sucesso = true });
    }
}
