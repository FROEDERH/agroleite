using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PecuariaApi.Data;
using PecuariaApi.DTOs;
using PecuariaApi.Models;

namespace PecuariaApi.Controllers;

[ApiController]
[Route("api/estoque-racao")]
[Authorize]
public class EstoqueRacaoController : ControllerBase
{
    private readonly PecuariaDbContext _db;

    public EstoqueRacaoController(PecuariaDbContext db)
    {
        _db = db;
    }

    private double CalcularSaldo()
    {
        var entradas = _db.EstoqueRacao.Sum(e => (double?)e.QuantidadeKg) ?? 0;
        var saidas = _db.ConsumoRacao.Sum(c => (double?)c.QuantidadeKg) ?? 0;
        return entradas - saidas;
    }

    [HttpGet("entradas")]
    public IActionResult ListarEntradas()
    {
        var entradas = _db.EstoqueRacao.OrderByDescending(e => e.DataChegada).ToList();
        return Ok(entradas);
    }

    [HttpGet("consumo")]
    public IActionResult ListarConsumo()
    {
        var consumo = _db.ConsumoRacao.OrderByDescending(c => c.Data).ToList();
        return Ok(consumo);
    }

    [HttpGet("saldo")]
    public IActionResult ObterSaldo()
    {
        return Ok(new { SaldoKg = CalcularSaldo() });
    }

    [HttpPost("entradas")]
    public IActionResult RegistrarEntrada([FromBody] EstoqueRacaoRequest request)
    {
        if (string.IsNullOrEmpty(request.DataChegada) || string.IsNullOrEmpty(request.TipoRacao)
            || request.QuantidadeKg <= 0 || request.ValorTotal < 0)
        {
            return BadRequest(new { erro = "Data, tipo de ração, quantidade e valor total são obrigatórios." });
        }

        var entrada = new EstoqueRacao
        {
            DataChegada = request.DataChegada,
            TipoRacao = request.TipoRacao,
            Fornecedor = request.Fornecedor,
            QuantidadeKg = request.QuantidadeKg,
            ValorTotal = request.ValorTotal,
            ValorKg = request.QuantidadeKg > 0 ? request.ValorTotal / request.QuantidadeKg : 0,
            NotaFiscal = request.NotaFiscal,
            Observacoes = request.Observacoes
        };

        _db.EstoqueRacao.Add(entrada);
        _db.SaveChanges();

        return StatusCode(201, entrada);
    }

    [HttpPost("consumo")]
    public IActionResult RegistrarConsumo([FromBody] ConsumoRacaoRequest request)
    {
        if (string.IsNullOrEmpty(request.Data) || request.QuantidadeKg <= 0)
        {
            return BadRequest(new { erro = "Data e quantidade são obrigatórios." });
        }

        var saldo = CalcularSaldo();
        if (request.QuantidadeKg > saldo)
        {
            return BadRequest(new { erro = $"Estoque insuficiente. Saldo atual: {saldo:F1} kg." });
        }

        var consumo = new ConsumoRacao
        {
            Data = request.Data,
            QuantidadeKg = request.QuantidadeKg,
            Observacoes = request.Observacoes
        };

        _db.ConsumoRacao.Add(consumo);
        _db.SaveChanges();

        return StatusCode(201, consumo);
    }

    [HttpPut("entradas/{id}")]
    public IActionResult AtualizarEntrada(int id, [FromBody] EstoqueRacaoRequest request)
    {
        var entrada = _db.EstoqueRacao.Find(id);
        if (entrada == null)
        {
            return NotFound(new { erro = "Entrada não encontrada." });
        }

        if (string.IsNullOrEmpty(request.DataChegada) || string.IsNullOrEmpty(request.TipoRacao)
            || request.QuantidadeKg <= 0 || request.ValorTotal < 0)
        {
            return BadRequest(new { erro = "Data, tipo de ração, quantidade e valor total são obrigatórios." });
        }

        // Diminuir uma entrada não pode deixar o saldo negativo (já houve consumo em cima dela)
        var novoSaldo = CalcularSaldo() - entrada.QuantidadeKg + request.QuantidadeKg;
        if (novoSaldo < 0)
        {
            return BadRequest(new { erro = $"Não é possível reduzir esta entrada: o saldo ficaria negativo ({novoSaldo:F1} kg)." });
        }

        entrada.DataChegada = request.DataChegada;
        entrada.TipoRacao = request.TipoRacao;
        entrada.Fornecedor = request.Fornecedor;
        entrada.QuantidadeKg = request.QuantidadeKg;
        entrada.ValorTotal = request.ValorTotal;
        entrada.ValorKg = request.ValorTotal / request.QuantidadeKg;
        entrada.NotaFiscal = request.NotaFiscal;
        entrada.Observacoes = request.Observacoes;

        _db.SaveChanges();

        return Ok(entrada);
    }

    [HttpPut("consumo/{id}")]
    public IActionResult AtualizarConsumo(int id, [FromBody] ConsumoRacaoRequest request)
    {
        var consumo = _db.ConsumoRacao.Find(id);
        if (consumo == null)
        {
            return NotFound(new { erro = "Consumo não encontrado." });
        }

        if (string.IsNullOrEmpty(request.Data) || request.QuantidadeKg <= 0)
        {
            return BadRequest(new { erro = "Data e quantidade são obrigatórios." });
        }

        // O próprio consumo sendo editado "devolve" sua quantidade ao saldo disponível
        var saldoDisponivel = CalcularSaldo() + consumo.QuantidadeKg;
        if (request.QuantidadeKg > saldoDisponivel)
        {
            return BadRequest(new { erro = $"Estoque insuficiente. Saldo disponível: {saldoDisponivel:F1} kg." });
        }

        consumo.Data = request.Data;
        consumo.QuantidadeKg = request.QuantidadeKg;
        consumo.Observacoes = request.Observacoes;

        _db.SaveChanges();

        return Ok(consumo);
    }

    [HttpDelete("entradas/{id}")]
    public IActionResult ExcluirEntrada(int id)
    {
        var entrada = _db.EstoqueRacao.Find(id);
        if (entrada == null)
        {
            return NotFound(new { erro = "Entrada não encontrada." });
        }

        _db.EstoqueRacao.Remove(entrada);
        _db.SaveChanges();

        return Ok(new { sucesso = true });
    }

    [HttpDelete("consumo/{id}")]
    public IActionResult ExcluirConsumo(int id)
    {
        var consumo = _db.ConsumoRacao.Find(id);
        if (consumo == null)
        {
            return NotFound(new { erro = "Consumo não encontrado." });
        }

        _db.ConsumoRacao.Remove(consumo);
        _db.SaveChanges();

        return Ok(new { sucesso = true });
    }
}
