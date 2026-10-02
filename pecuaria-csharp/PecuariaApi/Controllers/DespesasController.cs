using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PecuariaApi.Data;
using PecuariaApi.DTOs;
using PecuariaApi.Models;

namespace PecuariaApi.Controllers;

[ApiController]
[Route("api/despesas")]
[Authorize]
public class DespesasController : ControllerBase
{
    private readonly PecuariaDbContext _db;

    public DespesasController(PecuariaDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IActionResult Listar([FromQuery] string? categoria, [FromQuery] string? dataInicio, [FromQuery] string? dataFim)
    {
        var query = _db.Despesas.AsQueryable();

        if (!string.IsNullOrEmpty(categoria))
            query = query.Where(d => d.Categoria == categoria);
        if (!string.IsNullOrEmpty(dataInicio))
            query = query.Where(d => string.Compare(d.Data, dataInicio) >= 0);
        if (!string.IsNullOrEmpty(dataFim))
            query = query.Where(d => string.Compare(d.Data, dataFim) <= 0);

        return Ok(query.OrderByDescending(d => d.Data).ToList());
    }

    [HttpPost]
    public IActionResult Criar([FromBody] DespesaRequest request)
    {
        if (string.IsNullOrEmpty(request.Descricao) || string.IsNullOrEmpty(request.Data))
        {
            return BadRequest(new { erro = "Descrição, valor e data são obrigatórios." });
        }

        var despesa = new Despesa
        {
            Descricao = request.Descricao,
            Categoria = request.Categoria ?? "Outros",
            Valor = request.Valor,
            Data = request.Data,
            FormaPagamento = request.FormaPagamento,
            Observacoes = request.Observacoes
        };

        _db.Despesas.Add(despesa);
        _db.SaveChanges();

        return StatusCode(201, despesa);
    }

    [HttpPut("{id}")]
    public IActionResult Atualizar(int id, [FromBody] DespesaRequest request)
    {
        var despesa = _db.Despesas.Find(id);
        if (despesa == null)
        {
            return NotFound(new { erro = "Despesa não encontrada." });
        }

        despesa.Descricao = request.Descricao;
        despesa.Categoria = request.Categoria ?? despesa.Categoria;
        despesa.Valor = request.Valor;
        despesa.Data = request.Data;
        despesa.FormaPagamento = request.FormaPagamento;
        despesa.Observacoes = request.Observacoes;

        _db.SaveChanges();
        return Ok(despesa);
    }

    [HttpDelete("{id}")]
    public IActionResult Excluir(int id)
    {
        var despesa = _db.Despesas.Find(id);
        if (despesa == null)
        {
            return NotFound(new { erro = "Despesa não encontrada." });
        }

        _db.Despesas.Remove(despesa);
        _db.SaveChanges();

        return Ok(new { sucesso = true });
    }
}
