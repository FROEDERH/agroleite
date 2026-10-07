using Microsoft.EntityFrameworkCore;

namespace PecuariaApi.Data;

/// <summary>
/// Copia todos os dados de um arquivo SQLite (pecuaria.db) para o PostgreSQL
/// configurado em ConnectionStrings:DefaultConnection, mantendo os mesmos Ids.
///
/// Uso (no terminal, na pasta PecuariaApi):
///   $env:ConnectionStrings__DefaultConnection = "postgresql://..."
///   dotnet run -- importar-sqlite pecuaria.db
///
/// ATENÇÃO: apaga tudo o que já existir no banco PostgreSQL antes de copiar.
/// </summary>
public static class ImportadorSqlite
{
    public static void Executar(PecuariaDbContext destino, string caminhoSqlite)
    {
        if (!File.Exists(caminhoSqlite))
            throw new FileNotFoundException($"Arquivo SQLite não encontrado: {caminhoSqlite}");

        if (destino.Database.ProviderName != "Npgsql.EntityFrameworkCore.PostgreSQL")
            throw new InvalidOperationException(
                "O destino da importação precisa ser PostgreSQL. Defina ConnectionStrings__DefaultConnection com a conexão do Neon.");

        var opcoesOrigem = new DbContextOptionsBuilder<PecuariaDbContext>()
            .UseSqlite($"Data Source={caminhoSqlite}")
            .Options;
        using var origem = new PecuariaDbContext(opcoesOrigem);

        destino.Database.Migrate();

        var tiposEntidade = destino.Model.GetEntityTypes()
            .Where(t => !t.IsOwned() && t.GetTableName() != null)
            .ToList();
        var tabelas = tiposEntidade.Select(t => $"\"{t.GetTableName()}\"").ToList();

        using var transacao = destino.Database.BeginTransaction();

        // Nomes das tabelas vêm do modelo do EF, não de entrada do usuário
        var sqlLimpar = $"TRUNCATE TABLE {string.Join(", ", tabelas)} RESTART IDENTITY CASCADE";
        destino.Database.ExecuteSqlRaw(sqlLimpar);

        var metodoCopiar = typeof(ImportadorSqlite).GetMethod(nameof(Copiar),
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!;

        foreach (var tipo in tiposEntidade)
        {
            var total = (int)metodoCopiar.MakeGenericMethod(tipo.ClrType).Invoke(null, new object[] { origem, destino })!;
            Console.WriteLine($"  {tipo.GetTableName()}: {total} registro(s)");
        }

        // EF ordena os INSERTs respeitando as chaves estrangeiras
        destino.SaveChanges();

        // Como os Ids foram copiados explicitamente, as sequências de auto-incremento
        // precisam continuar a partir do maior Id existente
        foreach (var tipo in tiposEntidade)
        {
            var tabela = tipo.GetTableName();
            destino.Database.ExecuteSqlRaw(
                $"SELECT setval(pg_get_serial_sequence('\"{tabela}\"', 'Id'), " +
                $"COALESCE((SELECT MAX(\"Id\") FROM \"{tabela}\"), 0) + 1, false)");
        }

        transacao.Commit();
    }

    private static int Copiar<T>(PecuariaDbContext origem, PecuariaDbContext destino) where T : class
    {
        var registros = origem.Set<T>().AsNoTracking().ToList();
        destino.Set<T>().AddRange(registros);
        return registros.Count;
    }
}
