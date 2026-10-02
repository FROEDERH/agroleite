using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PecuariaApi.Data;
using PecuariaApi.DTOs;
using PecuariaApi.Models;

namespace PecuariaApi.Controllers;

[ApiController]
[Route("api/propriedade")]
[Authorize]
public class PropriedadeController : ControllerBase
{
    private readonly PecuariaDbContext _db;

    public PropriedadeController(PecuariaDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IActionResult Buscar()
    {
        var propriedade = _db.Propriedades.OrderBy(p => p.Id).FirstOrDefault();
        return Ok(propriedade);
    }

    [HttpPost]
    public IActionResult CriarOuAtualizar([FromBody] PropriedadeRequest request)
    {
        if (string.IsNullOrEmpty(request.Nome))
        {
            return BadRequest(new { erro = "O nome da propriedade é obrigatório." });
        }

        var existente = _db.Propriedades.OrderBy(p => p.Id).FirstOrDefault();

        if (existente != null)
        {
            existente.Nome = request.Nome;
            existente.Proprietario = request.Proprietario;
            existente.CnpjCpf = request.CnpjCpf;
            existente.Endereco = request.Endereco;
            existente.Cidade = request.Cidade;
            existente.Estado = request.Estado;
            existente.AreaHectares = request.AreaHectares;
            existente.InscricaoEstadual = request.InscricaoEstadual;
            existente.Telefone = request.Telefone;
            existente.Email = request.Email;
            existente.Observacoes = request.Observacoes;

            _db.SaveChanges();
            return Ok(existente);
        }

        var nova = new Propriedade
        {
            Nome = request.Nome,
            Proprietario = request.Proprietario,
            CnpjCpf = request.CnpjCpf,
            Endereco = request.Endereco,
            Cidade = request.Cidade,
            Estado = request.Estado,
            AreaHectares = request.AreaHectares,
            InscricaoEstadual = request.InscricaoEstadual,
            Telefone = request.Telefone,
            Email = request.Email,
            Observacoes = request.Observacoes
        };

        _db.Propriedades.Add(nova);
        _db.SaveChanges();

        return StatusCode(201, nova);
    }
}
