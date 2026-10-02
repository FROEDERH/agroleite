using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PecuariaApi.Data;
using PecuariaApi.DTOs;
using PecuariaApi.Models;
using PecuariaApi.Services;
using System.Security.Claims;

namespace PecuariaApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly PecuariaDbContext _db;
    private readonly TokenService _tokenService;

    public AuthController(PecuariaDbContext db, TokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Senha))
        {
            return BadRequest(new { erro = "E-mail e senha são obrigatórios." });
        }

        var emailNormalizado = request.Email.Trim().ToLower();
        var usuario = _db.Usuarios.FirstOrDefault(u => u.Email == emailNormalizado);

        if (usuario == null)
        {
            return Unauthorized(new { erro = "E-mail ou senha incorretos." });
        }

        if (!usuario.Ativo)
        {
            return StatusCode(403, new { erro = "Este usuário está desativado. Contate o administrador." });
        }

        bool senhaCorreta = BCrypt.Net.BCrypt.Verify(request.Senha, usuario.SenhaHash);
        if (!senhaCorreta)
        {
            return Unauthorized(new { erro = "E-mail ou senha incorretos." });
        }

        var token = _tokenService.GerarToken(usuario);

        return Ok(new LoginResponse
        {
            Token = token,
            Usuario = new UsuarioResponse
            {
                Id = usuario.Id,
                Nome = usuario.Nome,
                Email = usuario.Email,
                Papel = usuario.Papel
            }
        });
    }

    [HttpPost("usuarios")]
    [Authorize(Roles = "admin")]
    public IActionResult CriarUsuario([FromBody] CriarUsuarioRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Nome) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Senha))
        {
            return BadRequest(new { erro = "Nome, e-mail e senha são obrigatórios." });
        }

        var emailNormalizado = request.Email.Trim().ToLower();
        var existente = _db.Usuarios.FirstOrDefault(u => u.Email == emailNormalizado);
        if (existente != null)
        {
            return BadRequest(new { erro = "Já existe um usuário com este e-mail." });
        }

        var papelFinal = request.Papel == "admin" ? "admin" : "operador";

        var usuario = new Usuario
        {
            Nome = request.Nome.Trim(),
            Email = emailNormalizado,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.Senha),
            Papel = papelFinal,
            Ativo = true
        };

        _db.Usuarios.Add(usuario);
        _db.SaveChanges();

        return StatusCode(201, new UsuarioListItem
        {
            Id = usuario.Id,
            Nome = usuario.Nome,
            Email = usuario.Email,
            Papel = usuario.Papel,
            Ativo = usuario.Ativo,
            CriadoEm = usuario.CriadoEm
        });
    }

    [HttpGet("usuarios")]
    [Authorize(Roles = "admin")]
    public IActionResult ListarUsuarios()
    {
        var usuarios = _db.Usuarios
            .OrderBy(u => u.Nome)
            .Select(u => new UsuarioListItem
            {
                Id = u.Id,
                Nome = u.Nome,
                Email = u.Email,
                Papel = u.Papel,
                Ativo = u.Ativo,
                CriadoEm = u.CriadoEm
            })
            .ToList();

        return Ok(usuarios);
    }

    [HttpPut("usuarios/{id}")]
    [Authorize(Roles = "admin")]
    public IActionResult AtualizarUsuario(int id, [FromBody] AtualizarUsuarioRequest request)
    {
        var usuario = _db.Usuarios.Find(id);
        if (usuario == null)
        {
            return NotFound(new { erro = "Usuário não encontrado." });
        }

        if (string.IsNullOrWhiteSpace(request.Nome) || string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { erro = "Nome e e-mail são obrigatórios." });
        }

        var emailNormalizado = request.Email.Trim().ToLower();
        if (_db.Usuarios.Any(u => u.Email == emailNormalizado && u.Id != id))
        {
            return BadRequest(new { erro = "Já existe um usuário com este e-mail." });
        }

        var papelFinal = request.Papel == "admin" ? "admin" : "operador";

        // Impede que o sistema fique sem nenhum administrador ativo
        if (usuario.Papel == "admin" && papelFinal != "admin"
            && !_db.Usuarios.Any(u => u.Papel == "admin" && u.Ativo && u.Id != id))
        {
            return BadRequest(new { erro = "Este é o único administrador ativo. Promova outro usuário antes de alterar o papel deste." });
        }

        usuario.Nome = request.Nome.Trim();
        usuario.Email = emailNormalizado;
        usuario.Papel = papelFinal;

        if (!string.IsNullOrWhiteSpace(request.NovaSenha))
        {
            usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.NovaSenha);
        }

        _db.SaveChanges();

        return Ok(new UsuarioListItem
        {
            Id = usuario.Id,
            Nome = usuario.Nome,
            Email = usuario.Email,
            Papel = usuario.Papel,
            Ativo = usuario.Ativo,
            CriadoEm = usuario.CriadoEm
        });
    }

    [HttpPut("usuarios/{id}/status")]
    [Authorize(Roles = "admin")]
    public IActionResult AtualizarStatus(int id, [FromBody] AtualizarStatusRequest request)
    {
        var usuario = _db.Usuarios.Find(id);
        if (usuario == null)
        {
            return NotFound(new { erro = "Usuário não encontrado." });
        }

        usuario.Ativo = request.Ativo;
        _db.SaveChanges();

        return Ok(new { sucesso = true });
    }

    [HttpPut("minha-senha")]
    [Authorize]
    public IActionResult TrocarSenha([FromBody] TrocarSenhaRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SenhaAtual) || string.IsNullOrWhiteSpace(request.NovaSenha))
        {
            return BadRequest(new { erro = "Informe a senha atual e a nova senha." });
        }

        var idUsuario = ObterIdUsuarioLogado();
        var usuario = _db.Usuarios.Find(idUsuario);
        if (usuario == null)
        {
            return NotFound(new { erro = "Usuário não encontrado." });
        }

        bool senhaCorreta = BCrypt.Net.BCrypt.Verify(request.SenhaAtual, usuario.SenhaHash);
        if (!senhaCorreta)
        {
            return Unauthorized(new { erro = "Senha atual incorreta." });
        }

        usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(request.NovaSenha);
        _db.SaveChanges();

        return Ok(new { sucesso = true });
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var idUsuario = ObterIdUsuarioLogado();
        var usuario = _db.Usuarios.Find(idUsuario);
        if (usuario == null)
        {
            return NotFound(new { erro = "Usuário não encontrado." });
        }

        return Ok(new UsuarioResponse
        {
            Id = usuario.Id,
            Nome = usuario.Nome,
            Email = usuario.Email,
            Papel = usuario.Papel
        });
    }

    private int ObterIdUsuarioLogado()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.Parse(idClaim ?? "0");
    }
}
