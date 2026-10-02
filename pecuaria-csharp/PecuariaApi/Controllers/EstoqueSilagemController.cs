using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PecuariaApi.Data;
using PecuariaApi.DTOs;
using PecuariaApi.Models;

namespace PecuariaApi.Controllers;

[ApiController]
[Route("api/estoque-silagem")]
[Authorize]
public class EstoqueSilagemController : ControllerBase
{
    private readonly PecuariaDbContext _db;

    public EstoqueSilagemController(PecuariaDbContext db)
    {
        _db = db;
    }

    private double CalcularSaldo()
    {
        var entradas = _db.EstoqueSilagem.Sum(e => (double?)e.QuantidadeToneladas) ?? 0;
        var saidas = _db.ConsumoSilagem.Sum(c => (double?)c.QuantidadeToneladas) ?? 0;
        return entradas - saidas;
    }

    [HttpGet("entradas")]
    public IActionResult ListarEntradas()
    {
        return Ok(_db.EstoqueSilagem.OrderByDescending(e => e.DataProducao).ToList());
    }

    [HttpGet("consumo")]
    public IActionResult ListarConsumo()
    {
        return Ok(_db.ConsumoSilagem.OrderByDescending(c => c.Data).ToList());
    }

    [HttpGet("saldo")]
    public IActionResult ObterSaldo()
    {
        return Ok(new { SaldoToneladas = CalcularSaldo() });
    }

    [HttpPost("entradas")]
    public IActionResult RegistrarEntrada([FromBody] EstoqueSilagemRequest request)
    {
        if (string.IsNullOrEmpty(request.DataProducao) || request.QuantidadeToneladas <= 0)
        {
            return BadRequest(new { erro = "Data e quantidade em toneladas são obrigatórios." });
        }

        var entrada = new EstoqueSilagem
        {
            DataProducao = request.DataProducao,
            TipoSilagem = request.TipoSilagem,
            QuantidadeToneladas = request.QuantidadeToneladas,
            ValorTotal = request.ValorTotal,
            Origem = request.Origem ?? "Produzido na propriedade",
            Observacoes = request.Observacoes
        };

        _db.EstoqueSilagem.Add(entrada);
        _db.SaveChanges();

        return StatusCode(201, entrada);
    }

    [HttpPost("consumo")]
    public IActionResult RegistrarConsumo([FromBody] ConsumoSilagemRequest request)
    {
        if (string.IsNullOrEmpty(request.Data) || request.QuantidadeToneladas <= 0)
        {
            return BadRequest(new { erro = "Data e quantidade são obrigatórios." });
        }

        var saldo = CalcularSaldo();
        if (request.QuantidadeToneladas > saldo)
        {
            return BadRequest(new { erro = $"Estoque insuficiente. Saldo atual: {saldo:F1} toneladas." });
        }

        var consumo = new ConsumoSilagem
        {
            Data = request.Data,
            QuantidadeToneladas = request.QuantidadeToneladas,
            Observacoes = request.Observacoes
        };

        _db.ConsumoSilagem.Add(consumo);
        _db.SaveChanges();

        return StatusCode(201, consumo);
    }

    [HttpPut("entradas/{id}")]
    public IActionResult AtualizarEntrada(int id, [FromBody] EstoqueSilagemRequest request)
    {
        var entrada = _db.EstoqueSilagem.Find(id);
        if (entrada == null) return NotFound(new { erro = "Entrada não encontrada." });

        if (string.IsNullOrEmpty(request.DataProducao) || request.QuantidadeToneladas <= 0)
        {
            return BadRequest(new { erro = "Data e quantidade em toneladas são obrigatórios." });
        }

        // Diminuir uma entrada não pode deixar o saldo negativo (já houve consumo em cima dela)
        var novoSaldo = CalcularSaldo() - entrada.QuantidadeToneladas + request.QuantidadeToneladas;
        if (novoSaldo < 0)
        {
            return BadRequest(new { erro = $"Não é possível reduzir esta entrada: o saldo ficaria negativo ({novoSaldo:F1} toneladas)." });
        }

        entrada.DataProducao = request.DataProducao;
        entrada.TipoSilagem = request.TipoSilagem;
        entrada.QuantidadeToneladas = request.QuantidadeToneladas;
        entrada.ValorTotal = request.ValorTotal;
        entrada.Origem = request.Origem ?? "Produzido na propriedade";
        entrada.Observacoes = request.Observacoes;

        _db.SaveChanges();
        return Ok(entrada);
    }

    [HttpPut("consumo/{id}")]
    public IActionResult AtualizarConsumo(int id, [FromBody] ConsumoSilagemRequest request)
    {
        var consumo = _db.ConsumoSilagem.Find(id);
        if (consumo == null) return NotFound(new { erro = "Consumo não encontrado." });

        if (string.IsNullOrEmpty(request.Data) || request.QuantidadeToneladas <= 0)
        {
            return BadRequest(new { erro = "Data e quantidade são obrigatórios." });
        }

        // O próprio consumo sendo editado "devolve" sua quantidade ao saldo disponível
        var saldoDisponivel = CalcularSaldo() + consumo.QuantidadeToneladas;
        if (request.QuantidadeToneladas > saldoDisponivel)
        {
            return BadRequest(new { erro = $"Estoque insuficiente. Saldo disponível: {saldoDisponivel:F1} toneladas." });
        }

        consumo.Data = request.Data;
        consumo.QuantidadeToneladas = request.QuantidadeToneladas;
        consumo.Observacoes = request.Observacoes;

        _db.SaveChanges();
        return Ok(consumo);
    }

    [HttpDelete("entradas/{id}")]
    public IActionResult ExcluirEntrada(int id)
    {
        var entrada = _db.EstoqueSilagem.Find(id);
        if (entrada == null) return NotFound(new { erro = "Entrada não encontrada." });
        _db.EstoqueSilagem.Remove(entrada);
        _db.SaveChanges();
        return Ok(new { sucesso = true });
    }

    [HttpDelete("consumo/{id}")]
    public IActionResult ExcluirConsumo(int id)
    {
        var consumo = _db.ConsumoSilagem.Find(id);
        if (consumo == null) return NotFound(new { erro = "Consumo não encontrado." });
        _db.ConsumoSilagem.Remove(consumo);
        _db.SaveChanges();
        return Ok(new { sucesso = true });
    }
}
