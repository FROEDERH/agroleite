using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PecuariaApi.Data;
using PecuariaApi.DTOs;
using PecuariaApi.Models;

namespace PecuariaApi.Controllers;

[ApiController]
[Route("api/vendas-animais")]
[Authorize]
public class VendasAnimaisController : ControllerBase
{
    private readonly PecuariaDbContext _db;

    public VendasAnimaisController(PecuariaDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IActionResult Listar()
    {
        var vendas = _db.VendasAnimais
            .Include(v => v.Animal)
            .OrderByDescending(v => v.DataVenda)
            .Select(v => new VendaAnimalResponse
            {
                Id = v.Id,
                AnimalId = v.AnimalId,
                NumeroBrinco = v.Animal!.NumeroBrinco,
                NomeAnimal = v.Animal.Nome,
                DataVenda = v.DataVenda,
                PesoKg = v.PesoKg,
                ValorKg = v.ValorKg,
                ValorFinal = v.ValorFinal,
                Observacoes = v.Observacoes,
                ReceitaId = v.ReceitaId
            })
            .ToList();

        return Ok(vendas);
    }

    [HttpPost]
    public IActionResult Criar([FromBody] VendaAnimalRequest request)
    {
        if (request.AnimalId <= 0 || string.IsNullOrEmpty(request.DataVenda))
        {
            return BadRequest(new { erro = "Animal e data da venda são obrigatórios." });
        }

        var animal = _db.Animais.Find(request.AnimalId);
        if (animal == null)
        {
            return BadRequest(new { erro = "Animal não encontrado." });
        }

        if (request.ValorFinal <= 0)
        {
            return BadRequest(new { erro = "Informe o valor final da venda." });
        }

        // Cria a receita automaticamente a partir da venda
        var receita = new Receita
        {
            Descricao = $"Venda do animal de brinco {animal.NumeroBrinco}",
            Categoria = "Venda de Animal",
            Valor = request.ValorFinal,
            Data = request.DataVenda,
            Observacoes = request.Observacoes
        };
        _db.Receitas.Add(receita);
        _db.SaveChanges(); // salva para obter o Id da receita antes de vincular

        var venda = new VendaAnimal
        {
            AnimalId = request.AnimalId,
            DataVenda = request.DataVenda,
            PesoKg = request.PesoKg,
            ValorKg = request.ValorKg,
            ValorFinal = request.ValorFinal,
            Observacoes = request.Observacoes,
            ReceitaId = receita.Id
        };
        _db.VendasAnimais.Add(venda);

        // Atualiza o status do animal para Vendido
        animal.Status = "Vendido";

        _db.SaveChanges();

        var resposta = new VendaAnimalResponse
        {
            Id = venda.Id,
            AnimalId = venda.AnimalId,
            NumeroBrinco = animal.NumeroBrinco,
            NomeAnimal = animal.Nome,
            DataVenda = venda.DataVenda,
            PesoKg = venda.PesoKg,
            ValorKg = venda.ValorKg,
            ValorFinal = venda.ValorFinal,
            Observacoes = venda.Observacoes,
            ReceitaId = venda.ReceitaId
        };

        return StatusCode(201, resposta);
    }

    [HttpDelete("{id}")]
    public IActionResult Excluir(int id)
    {
        var venda = _db.VendasAnimais.Find(id);
        if (venda == null)
        {
            return NotFound(new { erro = "Venda não encontrada." });
        }

        // Remove também a receita gerada automaticamente por esta venda, se existir
        if (venda.ReceitaId.HasValue)
        {
            var receita = _db.Receitas.Find(venda.ReceitaId.Value);
            if (receita != null)
            {
                _db.Receitas.Remove(receita);
            }
        }

        _db.VendasAnimais.Remove(venda);
        _db.SaveChanges();

        return Ok(new { sucesso = true });
    }
}
