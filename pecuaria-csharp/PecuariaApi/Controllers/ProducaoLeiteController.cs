using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PecuariaApi.Data;
using PecuariaApi.DTOs;
using PecuariaApi.Models;

namespace PecuariaApi.Controllers;

[ApiController]
[Route("api/producao-leite")]
[Authorize]
public class ProducaoLeiteController : ControllerBase
{
    private readonly PecuariaDbContext _db;

    public ProducaoLeiteController(PecuariaDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IActionResult Listar([FromQuery] string? dataInicio, [FromQuery] string? dataFim)
    {
        var query = _db.ProducoesLeite.AsQueryable();

        if (!string.IsNullOrEmpty(dataInicio))
        {
            query = query.Where(p => string.Compare(p.DataInicio, dataInicio) >= 0);
        }
        if (!string.IsNullOrEmpty(dataFim))
        {
            query = query.Where(p => string.Compare(p.DataFim, dataFim) <= 0);
        }

        var registros = query.OrderByDescending(p => p.DataInicio).ToList();
        return Ok(registros);
    }

    [HttpPost]
    public IActionResult Criar([FromBody] ProducaoLeiteRequest request)
    {
        if (string.IsNullOrEmpty(request.DataInicio) || string.IsNullOrEmpty(request.DataFim))
        {
            return BadRequest(new { erro = "Data inicial e data final são obrigatórias." });
        }

        if (request.DataFim.CompareTo(request.DataInicio) < 0)
        {
            return BadRequest(new { erro = "A data final não pode ser anterior à data inicial." });
        }

        var producao = new ProducaoLeite
        {
            DataInicio = request.DataInicio,
            DataFim = request.DataFim,
            LitrosTotal = request.LitrosTotal,
            Observacoes = request.Observacoes
        };

        _db.ProducoesLeite.Add(producao);
        _db.SaveChanges();

        return StatusCode(201, producao);
    }

    [HttpPut("{id}")]
    public IActionResult Atualizar(int id, [FromBody] ProducaoLeiteRequest request)
    {
        var producao = _db.ProducoesLeite.Find(id);
        if (producao == null)
        {
            return NotFound(new { erro = "Registro de produção não encontrado." });
        }

        if (string.IsNullOrEmpty(request.DataInicio) || string.IsNullOrEmpty(request.DataFim))
        {
            return BadRequest(new { erro = "Data inicial e data final são obrigatórias." });
        }

        if (request.DataFim.CompareTo(request.DataInicio) < 0)
        {
            return BadRequest(new { erro = "A data final não pode ser anterior à data inicial." });
        }

        producao.DataInicio = request.DataInicio;
        producao.DataFim = request.DataFim;
        producao.LitrosTotal = request.LitrosTotal;
        producao.Observacoes = request.Observacoes;

        _db.SaveChanges();
        return Ok(producao);
    }

    [HttpDelete("{id}")]
    public IActionResult Excluir(int id)
    {
        var producao = _db.ProducoesLeite.Find(id);
        if (producao == null)
        {
            return NotFound(new { erro = "Registro de produção não encontrado." });
        }

        _db.ProducoesLeite.Remove(producao);
        _db.SaveChanges();

        return Ok(new { sucesso = true });
    }
}
