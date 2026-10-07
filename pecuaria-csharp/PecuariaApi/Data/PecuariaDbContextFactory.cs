using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace PecuariaApi.Data;

/// <summary>
/// Usado só pelo comando "dotnet ef migrations add". As migrations são geradas
/// para o PostgreSQL (banco hospedado); o SQLite local continua usando
/// EnsureCreated e não depende delas. Não é preciso ter um Postgres rodando
/// para gerar uma migration.
/// </summary>
public class PecuariaDbContextFactory : IDesignTimeDbContextFactory<PecuariaDbContext>
{
    public PecuariaDbContext CreateDbContext(string[] args)
    {
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

        var options = new DbContextOptionsBuilder<PecuariaDbContext>()
            .UseNpgsql("Host=localhost;Database=pecuaria")
            .Options;

        return new PecuariaDbContext(options);
    }
}
