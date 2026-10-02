using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PecuariaApi.Data;
using PecuariaApi.DTOs;
using PecuariaApi.Models;

namespace PecuariaApi.Controllers;

[ApiController]
[Route("api/animais")]
[Authorize]
public class AnimaisController : ControllerBase
{
    private readonly PecuariaDbContext _db;

    public AnimaisController(PecuariaDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public IActionResult Listar([FromQuery] string? status, [FromQuery] string? categoria, [FromQuery] string? sexo, [FromQuery] string? busca)
    {
        var query = _db.Animais.AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(a => a.Status == status);

        if (!string.IsNullOrEmpty(categoria))
            query = query.Where(a => a.Categoria == categoria);

        if (!string.IsNullOrEmpty(sexo))
            query = query.Where(a => a.Sexo == sexo);

        if (!string.IsNullOrEmpty(busca))
        {
            query = query.Where(a =>
                a.NumeroBrinco.Contains(busca) ||
                (a.Nome != null && a.Nome.Contains(busca)) ||
                a.Raca.Contains(busca));
        }

        var animais = query.OrderBy(a => a.NumeroBrinco).ToList();
        return Ok(animais);
    }

    [HttpGet("{id}")]
    public IActionResult BuscarPorId(int id)
    {
        var animal = _db.Animais.Find(id);
        if (animal == null)
        {
            return NotFound(new { erro = "Animal não encontrado." });
        }

        var vacinas = _db.Vacinas.Where(v => v.AnimalId == id).OrderByDescending(v => v.DataAplicacao).ToList();
        var doencas = _db.Doencas.Where(d => d.AnimalId == id).OrderByDescending(d => d.DataDiagnostico).ToList();
        var reproducao = _db.Reproducoes.Where(r => r.AnimalId == id).OrderByDescending(r => r.DataInseminacao).ToList();
        var vendas = _db.VendasAnimais.Where(v => v.AnimalId == id).OrderByDescending(v => v.DataVenda).ToList();

        Animal? mae = animal.MaeId.HasValue ? _db.Animais.Find(animal.MaeId.Value) : null;

        return Ok(new
        {
            animal.Id,
            animal.NumeroBrinco,
            animal.Nome,
            animal.Raca,
            animal.Sexo,
            animal.DataNascimento,
            animal.Categoria,
            animal.Status,
            animal.Origem,
            animal.PesoKg,
            animal.MaeId,
            NumeroBrincoMae = mae?.NumeroBrinco,
            NomeMae = mae?.Nome,
            animal.PaiInfo,
            animal.Observacoes,
            vacinas,
            doencas,
            reproducao,
            vendas
        });
    }

    [HttpPost]
    public IActionResult Criar([FromBody] AnimalRequest request)
    {
        if (string.IsNullOrEmpty(request.NumeroBrinco) || string.IsNullOrEmpty(request.Raca))
        {
            return BadRequest(new { erro = "Número do brinco e raça são obrigatórios." });
        }

        var existente = _db.Animais.FirstOrDefault(a => a.NumeroBrinco == request.NumeroBrinco);
        if (existente != null)
        {
            return BadRequest(new { erro = "Já existe um animal cadastrado com este número de brinco." });
        }

        if (request.MaeId.HasValue)
        {
            var mae = _db.Animais.Find(request.MaeId.Value);
            if (mae == null)
            {
                return BadRequest(new { erro = "O animal selecionado como mãe não foi encontrado." });
            }
        }

        var animal = new Animal
        {
            NumeroBrinco = request.NumeroBrinco,
            Nome = request.Nome,
            Raca = request.Raca,
            Sexo = request.Sexo ?? "Fêmea",
            DataNascimento = request.DataNascimento,
            Categoria = request.Categoria ?? "Vaca",
            Status = request.Status ?? "Ativo",
            Origem = request.Origem,
            PesoKg = request.PesoKg,
            MaeId = request.MaeId,
            PaiInfo = request.PaiInfo,
            Observacoes = request.Observacoes
        };

        _db.Animais.Add(animal);
        _db.SaveChanges();

        return StatusCode(201, animal);
    }

    [HttpPut("{id}")]
    public IActionResult Atualizar(int id, [FromBody] AnimalRequest request)
    {
        var animal = _db.Animais.Find(id);
        if (animal == null)
        {
            return NotFound(new { erro = "Animal não encontrado." });
        }

        if (request.MaeId.HasValue)
        {
            if (request.MaeId.Value == id)
            {
                return BadRequest(new { erro = "Um animal não pode ser selecionado como mãe de si mesmo." });
            }

            var mae = _db.Animais.Find(request.MaeId.Value);
            if (mae == null)
            {
                return BadRequest(new { erro = "O animal selecionado como mãe não foi encontrado." });
            }
        }

        animal.NumeroBrinco = request.NumeroBrinco;
        animal.Nome = request.Nome;
        animal.Raca = request.Raca;
        animal.Sexo = request.Sexo ?? animal.Sexo;
        animal.DataNascimento = request.DataNascimento;
        animal.Categoria = request.Categoria ?? animal.Categoria;
        animal.Status = request.Status ?? animal.Status;
        animal.Origem = request.Origem;
        animal.PesoKg = request.PesoKg;
        animal.MaeId = request.MaeId;
        animal.PaiInfo = request.PaiInfo;
        animal.Observacoes = request.Observacoes;

        _db.SaveChanges();
        return Ok(animal);
    }

    // ===== VACINAS =====

    [HttpPost("{id}/vacinas")]
    public IActionResult AdicionarVacina(int id, [FromBody] VacinaRequest request)
    {
        if (string.IsNullOrEmpty(request.NomeVacina) || string.IsNullOrEmpty(request.DataAplicacao))
        {
            return BadRequest(new { erro = "Nome da vacina e data de aplicação são obrigatórios." });
        }

        var animal = _db.Animais.Find(id);
        if (animal == null)
        {
            return NotFound(new { erro = "Animal não encontrado." });
        }

        var vacina = new Vacina
        {
            AnimalId = id,
            NomeVacina = request.NomeVacina,
            DataAplicacao = request.DataAplicacao,
            ProximaDose = request.ProximaDose,
            Responsavel = request.Responsavel,
            Observacoes = request.Observacoes
        };

        _db.Vacinas.Add(vacina);
        _db.SaveChanges();

        return StatusCode(201, vacina);
    }

    [HttpDelete("vacinas/{vacinaId}")]
    public IActionResult ExcluirVacina(int vacinaId)
    {
        var vacina = _db.Vacinas.Find(vacinaId);
        if (vacina == null)
        {
            return NotFound(new { erro = "Vacina não encontrada." });
        }

        _db.Vacinas.Remove(vacina);
        _db.SaveChanges();

        return Ok(new { sucesso = true });
    }

    // ===== DOENÇAS =====

    [HttpPost("{id}/doencas")]
    public IActionResult AdicionarDoenca(int id, [FromBody] DoencaRequest request)
    {
        if (string.IsNullOrEmpty(request.NomeDoenca) || string.IsNullOrEmpty(request.DataDiagnostico))
        {
            return BadRequest(new { erro = "Nome da doença e data de diagnóstico são obrigatórios." });
        }

        var animal = _db.Animais.Find(id);
        if (animal == null)
        {
            return NotFound(new { erro = "Animal não encontrado." });
        }

        var doenca = new Doenca
        {
            AnimalId = id,
            NomeDoenca = request.NomeDoenca,
            DataDiagnostico = request.DataDiagnostico,
            Tratamento = request.Tratamento,
            DataCura = request.DataCura,
            Status = request.Status ?? "Em tratamento",
            Observacoes = request.Observacoes
        };

        _db.Doencas.Add(doenca);
        _db.SaveChanges();

        return StatusCode(201, doenca);
    }

    [HttpPut("doencas/{doencaId}")]
    public IActionResult AtualizarDoenca(int doencaId, [FromBody] DoencaRequest request)
    {
        var doenca = _db.Doencas.Find(doencaId);
        if (doenca == null)
        {
            return NotFound(new { erro = "Doença não encontrada." });
        }

        doenca.NomeDoenca = request.NomeDoenca;
        doenca.DataDiagnostico = request.DataDiagnostico;
        doenca.Tratamento = request.Tratamento;
        doenca.DataCura = request.DataCura;
        doenca.Status = request.Status ?? doenca.Status;
        doenca.Observacoes = request.Observacoes;

        _db.SaveChanges();
        return Ok(doenca);
    }

    [HttpDelete("doencas/{doencaId}")]
    public IActionResult ExcluirDoenca(int doencaId)
    {
        var doenca = _db.Doencas.Find(doencaId);
        if (doenca == null)
        {
            return NotFound(new { erro = "Doença não encontrada." });
        }

        _db.Doencas.Remove(doenca);
        _db.SaveChanges();

        return Ok(new { sucesso = true });
    }

    // EXCLUIR ANIMAL (rota genérica /{id} -- deve vir DEPOIS das rotas específicas de
    // vacinas/doencas acima. No ASP.NET Core a ordem de roteamento é resolvida por
    // especificidade de template, então isso não causa o mesmo problema do Express,
    // mas mantemos a declaração nesta posição por clareza e consistência.)
    [HttpDelete("{id}")]
    public IActionResult Excluir(int id)
    {
        var animal = _db.Animais.Find(id);
        if (animal == null)
        {
            return NotFound(new { erro = "Animal não encontrado." });
        }

        _db.Animais.Remove(animal);
        _db.SaveChanges();

        return Ok(new { sucesso = true });
    }
}
