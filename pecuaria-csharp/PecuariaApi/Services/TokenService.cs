using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using PecuariaApi.Models;

namespace PecuariaApi.Services;

public class TokenService
{
    private readonly string _chaveSecreta;

    public TokenService(IConfiguration configuration)
    {
        _chaveSecreta = configuration["Jwt:ChaveSecreta"]
            ?? "pecuaria_chave_secreta_local_2026_troque_em_producao";
    }

    public string GerarToken(Usuario usuario)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Nome),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Role, usuario.Papel),
        };

        var chave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_chaveSecreta));
        var credenciais = new SigningCredentials(chave, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: credenciais
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string ChaveSecreta => _chaveSecreta;
}
