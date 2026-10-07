using Microsoft.EntityFrameworkCore;

namespace PecuariaApi.Data;

/// <summary>
/// Decide qual banco usar a partir da connection string:
/// - "Data Source=pecuaria.db"       → SQLite (uso local no PC)
/// - "postgresql://..." ou "Host=..." → PostgreSQL (hospedado, ex: Neon)
/// </summary>
public static class ConfiguracaoBanco
{
    public static bool EhPostgres(string connectionString) =>
        connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
        connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
        connectionString.Contains("Host=", StringComparison.OrdinalIgnoreCase);

    public static void Configurar(DbContextOptionsBuilder options, string connectionString)
    {
        if (EhPostgres(connectionString))
            options.UseNpgsql(ParaFormatoNpgsql(connectionString));
        else
            options.UseSqlite(connectionString);
    }

    /// <summary>
    /// O Neon (e a maioria dos serviços) entrega a conexão no formato URL
    /// (postgresql://usuario:senha@host/banco?sslmode=require), mas o Npgsql
    /// só entende o formato "Host=...;Username=...". Esta função converte.
    /// </summary>
    public static string ParaFormatoNpgsql(string connectionString)
    {
        if (!connectionString.Contains("://")) return connectionString;

        var uri = new Uri(connectionString);
        var credenciais = uri.UserInfo.Split(':', 2);
        var banco = uri.AbsolutePath.TrimStart('/');
        var porta = uri.Port > 0 ? uri.Port : 5432;

        var parametros = uri.Query.TrimStart('?')
            .Split('&', StringSplitOptions.RemoveEmptyEntries)
            .Select(p => p.Split('=', 2))
            .ToDictionary(p => p[0].ToLowerInvariant(), p => p.Length > 1 ? Uri.UnescapeDataString(p[1]) : "");

        var sslMode = parametros.TryGetValue("sslmode", out var modo) ? modo : "require";

        return $"Host={uri.Host};Port={porta};Database={banco};" +
               $"Username={Uri.UnescapeDataString(credenciais[0])};" +
               $"Password={(credenciais.Length > 1 ? Uri.UnescapeDataString(credenciais[1]) : "")};" +
               $"SSL Mode={sslMode}";
    }
}
