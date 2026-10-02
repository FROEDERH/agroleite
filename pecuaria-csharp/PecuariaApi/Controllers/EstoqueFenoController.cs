using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PecuariaApi.Data;
using PecuariaApi.DTOs;
using PecuariaApi.Models;

namespace PecuariaApi.Controllers;

[ApiController]
[Route("api/estoque-feno")]
[Authorize]
public class EstoqueFenoController : ControllerBase
{
    private readonly PecuariaDbContext _db;

    public EstoqueFenoController(PecuariaDbContext db)
    {
        _db = db;
    }

    private double CalcularSaldo()
    {
        var entradas = _db.EstoqueFeno.Sum(e => (double?)e.QuantidadeFardos) ?? 0;
        var saidas = _db.ConsumoFeno.Sum(c => (double?)c.QuantidadeFardos) ?? 0;
        return entradas - saidas;
    }

    [HttpGet("entradas")]
    public IActionResult ListarEntradas()
    {
        return Ok(_db.EstoqueFeno.OrderByDescending(e => e.DataProducao).ToList());
    }

    [HttpGet("consumo")]
    public IActionResult ListarConsumo()
    {
        return Ok(_db.ConsumoFeno.OrderByDescending(c => c.Data).ToList());
    }

    [HttpGet("saldo")]
    public IActionResult ObterSaldo()
    {
        return Ok(new { SaldoFardos = CalcularSaldo() });
    }

    [HttpPost("entradas")]
    public IActionResult RegistrarEntrada([FromBody] EstoqueFenoRequest request)
    {
        if (string.IsNullOrEmpty(request.DataProducao) || request.QuantidadeFardos <= 0)
        {
            return BadRequest(new { erro = "Data e quantidade de fardos são obrigatórios." });
        }

        var entrada = new EstoqueFeno
        {
            DataProducao = request.DataProducao,
            TipoCapim = request.TipoCapim,
            QuantidadeFardos = request.QuantidadeFardos,
            PesoFardoKg = request.PesoFardoKg,
            ValorTotal = request.ValorTotal,
            Origem = request.Origem ?? "Produzido na propriedade",
            Observacoes = request.Observacoes
        };

        _db.EstoqueFeno.Add(entrada);
        _db.SaveChanges();

        return StatusCode(201, entrada);
    }

    [HttpPost("consumo")]
    public IActionResult RegistrarConsumo([FromBody] ConsumoFenoRequest request)
    {
        if (string.IsNullOrEmpty(request.Data) || request.QuantidadeFardos <= 0)
        {
            return BadRequest(new { erro = "Data e quantidade são obrigatórios." });
        }

        var saldo = CalcularSaldo();
        if (request.QuantidadeFardos > saldo)
        {
            return BadRequest(new { erro = $"Estoque insuficiente. Saldo atual: {saldo:F0} fardos." });
        }

        var consumo = new ConsumoFeno
        {
            Data = request.Data,
            QuantidadeFardos = request.QuantidadeFardos,
            Observacoes = request.Observacoes
        };

        _db.ConsumoFeno.Add(consumo);
        _db.SaveChanges();

        return StatusCode(201, consumo);
    }

    [HttpDelete("entradas/{id}")]
    public IActionResult ExcluirEntrada(int id)
    {
        var entrada = _db.EstoqueFeno.Find(id);
        if (entrada == null) return NotFound(new { erro = "Entrada não encontrada." });
        _db.EstoqueFeno.Remove(entrada);
        _db.SaveChanges();
        return Ok(new { sucesso = true });
    }

    [HttpDelete("consumo/{id}")]
    public IActionResult ExcluirConsumo(int id)
    {
        var consumo = _db.ConsumoFeno.Find(id);
        if (consumo == null) return NotFound(new { erro = "Consumo não encontrado." });
        _db.ConsumoFeno.Remove(consumo);
        _db.SaveChanges();
        return Ok(new { sucesso = true });
    }
}
