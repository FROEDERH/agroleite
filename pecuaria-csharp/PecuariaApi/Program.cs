using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PecuariaApi.Data;
using PecuariaApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Escuta em todos os adaptadores de rede (não só localhost), permitindo
// que outros computadores/celulares na mesma rede Wi-Fi acessem o backend
// pelo IP local da máquina (ex: http://192.168.0.105:5000).
// Na hospedagem (Render), a porta vem da variável de ambiente PORT.
var porta = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://0.0.0.0:{porta}");

// ===== BANCO DE DADOS (SQLite local ou PostgreSQL hospedado) =====
// Com o PostgreSQL, grava datas como "timestamp without time zone", igual ao
// comportamento do SQLite (o código usa DateTime.Now em todo lugar).
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=pecuaria.db";
var usandoPostgres = ConfiguracaoBanco.EhPostgres(connectionString);

builder.Services.AddDbContext<PecuariaDbContext>(options =>
    ConfiguracaoBanco.Configurar(options, connectionString));

// ===== AUTENTICAÇÃO JWT =====
builder.Services.AddSingleton<TokenService>();

const string chaveSecretaPadrao = "pecuaria_chave_secreta_local_2026_troque_em_producao";
var chaveSecreta = builder.Configuration["Jwt:ChaveSecreta"] ?? chaveSecretaPadrao;

// A chave padrão está no GitHub; no servidor hospedado, ela permitiria a
// qualquer pessoa gerar um login válido.
if (usandoPostgres && chaveSecreta == chaveSecretaPadrao)
{
    throw new InvalidOperationException(
        "Defina a variável de ambiente Jwt__ChaveSecreta com uma chave própria antes de rodar com PostgreSQL.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(chaveSecreta))
        };

        // Retorna erros de autenticação no mesmo formato JSON do resto da API
        options.Events = new JwtBearerEvents
        {
            OnChallenge = context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                return context.Response.WriteAsync("{\"erro\":\"Token não fornecido. Faça login novamente.\"}");
            },
            OnForbidden = context =>
            {
                context.Response.StatusCode = 403;
                context.Response.ContentType = "application/json";
                return context.Response.WriteAsync("{\"erro\":\"Sessão inválida ou expirada. Faça login novamente.\"}");
            }
        };
    });

builder.Services.AddAuthorization();

// ===== CORS (para o frontend React acessar o backend, inclusive de outros
// computadores/celulares na mesma rede local da fazenda) =====
// Na hospedagem, o endereço do frontend (ex: https://agroleite.pages.dev) é
// informado na variável Cors__OrigensPermitidas (vários separados por vírgula).
var origensPermitidas = (builder.Configuration["Cors:OrigensPermitidas"] ?? "")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    .Select(o => o.TrimEnd('/'))
    .ToHashSet(StringComparer.OrdinalIgnoreCase);

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .SetIsOriginAllowed(origin =>
            {
                // Aceita localhost (uso no próprio PC) e qualquer endereço de rede
                // local privada (192.168.x.x, 10.x.x.x, 172.16-31.x.x), nas portas
                // padrão do frontend (5173 em dev, 4173 em preview).
                if (string.IsNullOrEmpty(origin)) return false;
                if (origensPermitidas.Contains(origin)) return true;

                try
                {
                    var uri = new Uri(origin);
                    var host = uri.Host;

                    bool ehLocalhost = host is "localhost" or "127.0.0.1";
                    bool ehRedePrivada =
                        host.StartsWith("192.168.") ||
                        host.StartsWith("10.") ||
                        System.Text.RegularExpressions.Regex.IsMatch(host, @"^172\.(1[6-9]|2[0-9]|3[0-1])\.");

                    return ehLocalhost || ehRedePrivada;
                }
                catch
                {
                    return false;
                }
            })
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ===== CONTROLLERS + SWAGGER =====
// IgnoreCycles: entidades com navegação (ex: Vacina.Animal -> Animal.Vacinas) não
// geram erro 500 de "object cycle" ao serem devolvidas pela API
builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ===== MIGRATIONS E SEED DO BANCO NA INICIALIZAÇÃO =====
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PecuariaDbContext>();

    // Comando de uso único para levar os dados do PC para o banco hospedado:
    //   dotnet run -- importar-sqlite pecuaria.db
    if (args.Length >= 2 && args[0] == "importar-sqlite")
    {
        Console.WriteLine($"Importando dados de {args[1]} para o PostgreSQL...");
        ImportadorSqlite.Executar(db, args[1]);
        Console.WriteLine("Importação concluída.");
        return;
    }

    // PostgreSQL: aplica as migrations pendentes (pasta Migrations), preservando os dados.
    // SQLite local: cria o banco a partir do modelo, como antes.
    if (usandoPostgres)
        db.Database.Migrate();
    else
        db.Database.EnsureCreated();

    // Cria o usuário admin padrão se não houver nenhum usuário cadastrado
    // Na hospedagem, a senha inicial pode vir da variável Admin__SenhaInicial
    if (!db.Usuarios.Any())
    {
        var senhaInicial = builder.Configuration["Admin:SenhaInicial"] ?? "admin123";

        db.Usuarios.Add(new PecuariaApi.Models.Usuario
        {
            Nome = "Administrador",
            Email = "admin@fazenda.com",
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(senhaInicial),
            Papel = "admin",
            Ativo = true
        });
        db.SaveChanges();

        Console.WriteLine("========================================");
        Console.WriteLine("  Usuário administrador padrão criado:");
        Console.WriteLine("    E-mail: admin@fazenda.com");
        Console.WriteLine(senhaInicial == "admin123"
            ? "    Senha:  admin123"
            : "    Senha:  a definida em Admin__SenhaInicial");
        Console.WriteLine("  Altere a senha após o primeiro login!");
        Console.WriteLine("========================================");
    }
}

// ===== MIDDLEWARES =====
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

// Serve os arquivos estáticos do build do frontend React (pasta wwwroot)
// Para usar: copie o conteúdo de frontend/dist para PecuariaApi/wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Fallback para o index.html do React (SPA routing)
app.MapFallbackToFile("index.html");

Console.WriteLine("========================================");
Console.WriteLine("  AgroLeite rodando!");
Console.WriteLine("  Neste computador: http://localhost:5000");
Console.WriteLine("  Na rede local:    http://SEU_IP_LOCAL:5000");
Console.WriteLine("  (veja como descobrir seu IP local no README)");
Console.WriteLine("  Swagger (docs da API): http://localhost:5000/swagger");
Console.WriteLine("========================================");

app.Run();
