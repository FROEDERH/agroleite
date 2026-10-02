using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PecuariaApi.Data;
using PecuariaApi.DTOs;
using PecuariaApi.Models;

namespace PecuariaApi.Controllers;

[ApiController]
[Route("api/receitas")]
[Authorize]
public class ReceitasController : ControllerBase
{
    private readonly PecuariaDbContext _db;

    public ReceitasController(PecuariaDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IActionResult Listar([FromQuery] string? categoria, [FromQuery] string? dataInicio, [FromQuery] string? dataFim)
    {
        var query = _db.Receitas.AsQueryable();

        if (!string.IsNullOrEmpty(categoria))
            query = query.Where(r => r.Categoria == categoria);
        if (!string.IsNullOrEmpty(dataInicio))
            query = query.Where(r => string.Compare(r.Data, dataInicio) >= 0);
        if (!string.IsNullOrEmpty(dataFim))
            query = query.Where(r => string.Compare(r.Data, dataFim) <= 0);

        return Ok(query.OrderByDescending(r => r.Data).ToList());
    }

    [HttpPost]
    public IActionResult Criar([FromBody] ReceitaRequest request)
    {
        if (string.IsNullOrEmpty(request.Descricao) || string.IsNullOrEmpty(request.Data))
        {
            return BadRequest(new { erro = "Descrição, valor e data são obrigatórios." });
        }

        var receita = new Receita
        {
            Descricao = request.Descricao,
            Categoria = request.Categoria ?? "Venda de Leite",
            Valor = request.Valor,
            Data = request.Data,
            Observacoes = request.Observacoes
        };

        _db.Receitas.Add(receita);
        _db.SaveChanges();

        return StatusCode(201, receita);
    }

    [HttpPut("{id}")]
    public IActionResult Atualizar(int id, [FromBody] ReceitaRequest request)
    {
        // Proteção: receitas geradas automaticamente por vendas de animais
        // não devem ser editadas manualmente — verificar se vínculo existe
        var vendaVinculada = _db.VendasAnimais.FirstOrDefault(v => v.ReceitaId == id);
        if (vendaVinculada != null)
        {
            return BadRequest(new { erro = "Esta receita foi gerada automaticamente por uma venda de animal. Para editá-la, acesse o módulo de Vendas de Animais." });
        }

        var receita = _db.Receitas.Find(id);
        if (receita == null)
        {
            return NotFound(new { erro = "Receita não encontrada." });
        }

        receita.Descricao = request.Descricao;
        receita.Categoria = request.Categoria ?? receita.Categoria;
        receita.Valor = request.Valor;
        receita.Data = request.Data;
        receita.Observacoes = request.Observacoes;

        _db.SaveChanges();
        return Ok(receita);
    }

    [HttpDelete("{id}")]
    public IActionResult Excluir(int id)
    {
        var vendaVinculada = _db.VendasAnimais.FirstOrDefault(v => v.ReceitaId == id);
        if (vendaVinculada != null)
        {
            return BadRequest(new { erro = "Esta receita foi gerada automaticamente por uma venda de animal e não pode ser excluída diretamente. Exclua a venda correspondente." });
        }

        var receita = _db.Receitas.Find(id);
        if (receita == null)
        {
            return NotFound(new { erro = "Receita não encontrada." });
        }

        _db.Receitas.Remove(receita);
        _db.SaveChanges();

        return Ok(new { sucesso = true });
    }
}
