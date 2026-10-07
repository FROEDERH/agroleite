using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PecuariaApi.Migrations
{
    /// <inheritdoc />
    public partial class InicialPostgres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Animais",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NumeroBrinco = table.Column<string>(type: "text", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: true),
                    Raca = table.Column<string>(type: "text", nullable: false),
                    Sexo = table.Column<string>(type: "text", nullable: false),
                    DataNascimento = table.Column<string>(type: "text", nullable: true),
                    Categoria = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Origem = table.Column<string>(type: "text", nullable: true),
                    PesoKg = table.Column<double>(type: "double precision", nullable: true),
                    MaeId = table.Column<int>(type: "integer", nullable: true),
                    PaiInfo = table.Column<string>(type: "text", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Animais", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConsumoFeno",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Data = table.Column<string>(type: "text", nullable: false),
                    QuantidadeFardos = table.Column<double>(type: "double precision", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConsumoFeno", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConsumoRacao",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Data = table.Column<string>(type: "text", nullable: false),
                    QuantidadeKg = table.Column<double>(type: "double precision", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConsumoRacao", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ConsumoSilagem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Data = table.Column<string>(type: "text", nullable: false),
                    QuantidadeToneladas = table.Column<double>(type: "double precision", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConsumoSilagem", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Despesas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    Categoria = table.Column<string>(type: "text", nullable: false),
                    Valor = table.Column<double>(type: "double precision", nullable: false),
                    Data = table.Column<string>(type: "text", nullable: false),
                    FormaPagamento = table.Column<string>(type: "text", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Despesas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EstoqueFeno",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DataProducao = table.Column<string>(type: "text", nullable: false),
                    TipoCapim = table.Column<string>(type: "text", nullable: true),
                    QuantidadeFardos = table.Column<int>(type: "integer", nullable: false),
                    PesoFardoKg = table.Column<double>(type: "double precision", nullable: true),
                    ValorTotal = table.Column<double>(type: "double precision", nullable: true),
                    Origem = table.Column<string>(type: "text", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstoqueFeno", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EstoqueRacao",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DataChegada = table.Column<string>(type: "text", nullable: false),
                    TipoRacao = table.Column<string>(type: "text", nullable: false),
                    Fornecedor = table.Column<string>(type: "text", nullable: true),
                    QuantidadeKg = table.Column<double>(type: "double precision", nullable: false),
                    ValorTotal = table.Column<double>(type: "double precision", nullable: false),
                    ValorKg = table.Column<double>(type: "double precision", nullable: true),
                    NotaFiscal = table.Column<string>(type: "text", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstoqueRacao", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EstoqueSilagem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DataProducao = table.Column<string>(type: "text", nullable: false),
                    TipoSilagem = table.Column<string>(type: "text", nullable: true),
                    QuantidadeToneladas = table.Column<double>(type: "double precision", nullable: false),
                    ValorTotal = table.Column<double>(type: "double precision", nullable: true),
                    Origem = table.Column<string>(type: "text", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EstoqueSilagem", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProducoesLeite",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DataInicio = table.Column<string>(type: "text", nullable: false),
                    DataFim = table.Column<string>(type: "text", nullable: false),
                    LitrosTotal = table.Column<double>(type: "double precision", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProducoesLeite", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Propriedades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Proprietario = table.Column<string>(type: "text", nullable: true),
                    CnpjCpf = table.Column<string>(type: "text", nullable: true),
                    Endereco = table.Column<string>(type: "text", nullable: true),
                    Cidade = table.Column<string>(type: "text", nullable: true),
                    Estado = table.Column<string>(type: "text", nullable: true),
                    AreaHectares = table.Column<double>(type: "double precision", nullable: true),
                    InscricaoEstadual = table.Column<string>(type: "text", nullable: true),
                    Telefone = table.Column<string>(type: "text", nullable: true),
                    Email = table.Column<string>(type: "text", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Propriedades", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Receitas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    Categoria = table.Column<string>(type: "text", nullable: false),
                    Valor = table.Column<double>(type: "double precision", nullable: false),
                    Data = table.Column<string>(type: "text", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Receitas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    SenhaHash = table.Column<string>(type: "text", nullable: false),
                    Papel = table.Column<string>(type: "text", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Doencas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AnimalId = table.Column<int>(type: "integer", nullable: false),
                    NomeDoenca = table.Column<string>(type: "text", nullable: false),
                    DataDiagnostico = table.Column<string>(type: "text", nullable: false),
                    Tratamento = table.Column<string>(type: "text", nullable: true),
                    DataCura = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Doencas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Doencas_Animais_AnimalId",
                        column: x => x.AnimalId,
                        principalTable: "Animais",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LactacoesGalpao",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AnimalId = table.Column<int>(type: "integer", nullable: false),
                    DataInicio = table.Column<string>(type: "text", nullable: false),
                    DataFim = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LactacoesGalpao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LactacoesGalpao_Animais_AnimalId",
                        column: x => x.AnimalId,
                        principalTable: "Animais",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reproducoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AnimalId = table.Column<int>(type: "integer", nullable: false),
                    DataInseminacao = table.Column<string>(type: "text", nullable: false),
                    Tipo = table.Column<string>(type: "text", nullable: false),
                    RacaSemen = table.Column<string>(type: "text", nullable: true),
                    IdentificacaoSemen = table.Column<string>(type: "text", nullable: true),
                    ValorInseminacao = table.Column<double>(type: "double precision", nullable: false),
                    DataPrevistaParto = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    DataConfirmacaoPrenhez = table.Column<string>(type: "text", nullable: true),
                    DataParto = table.Column<string>(type: "text", nullable: true),
                    DataPerdaCria = table.Column<string>(type: "text", nullable: true),
                    MotivoPerda = table.Column<string>(type: "text", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reproducoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reproducoes_Animais_AnimalId",
                        column: x => x.AnimalId,
                        principalTable: "Animais",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Vacinas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AnimalId = table.Column<int>(type: "integer", nullable: false),
                    NomeVacina = table.Column<string>(type: "text", nullable: false),
                    DataAplicacao = table.Column<string>(type: "text", nullable: false),
                    ProximaDose = table.Column<string>(type: "text", nullable: true),
                    Responsavel = table.Column<string>(type: "text", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vacinas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Vacinas_Animais_AnimalId",
                        column: x => x.AnimalId,
                        principalTable: "Animais",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VendasAnimais",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AnimalId = table.Column<int>(type: "integer", nullable: false),
                    DataVenda = table.Column<string>(type: "text", nullable: false),
                    PesoKg = table.Column<double>(type: "double precision", nullable: false),
                    ValorKg = table.Column<double>(type: "double precision", nullable: false),
                    ValorFinal = table.Column<double>(type: "double precision", nullable: false),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    ReceitaId = table.Column<int>(type: "integer", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VendasAnimais", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VendasAnimais_Animais_AnimalId",
                        column: x => x.AnimalId,
                        principalTable: "Animais",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicacoesLactacao",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LactacaoGalpaoId = table.Column<int>(type: "integer", nullable: false),
                    DataMedicacao = table.Column<string>(type: "text", nullable: false),
                    NomeMedicacao = table.Column<string>(type: "text", nullable: false),
                    DoseMl = table.Column<double>(type: "double precision", nullable: false),
                    PodeVenderLeite = table.Column<bool>(type: "boolean", nullable: false),
                    CarenciaDias = table.Column<int>(type: "integer", nullable: true),
                    DataLiberacaoManual = table.Column<string>(type: "text", nullable: true),
                    Observacoes = table.Column<string>(type: "text", nullable: true),
                    CriadoEm = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicacoesLactacao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicacoesLactacao_LactacoesGalpao_LactacaoGalpaoId",
                        column: x => x.LactacaoGalpaoId,
                        principalTable: "LactacoesGalpao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Animais_NumeroBrinco",
                table: "Animais",
                column: "NumeroBrinco",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Doencas_AnimalId",
                table: "Doencas",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_LactacoesGalpao_AnimalId",
                table: "LactacoesGalpao",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicacoesLactacao_LactacaoGalpaoId",
                table: "MedicacoesLactacao",
                column: "LactacaoGalpaoId");

            migrationBuilder.CreateIndex(
                name: "IX_Reproducoes_AnimalId",
                table: "Reproducoes",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vacinas_AnimalId",
                table: "Vacinas",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_VendasAnimais_AnimalId",
                table: "VendasAnimais",
                column: "AnimalId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConsumoFeno");

            migrationBuilder.DropTable(
                name: "ConsumoRacao");

            migrationBuilder.DropTable(
                name: "ConsumoSilagem");

            migrationBuilder.DropTable(
                name: "Despesas");

            migrationBuilder.DropTable(
                name: "Doencas");

            migrationBuilder.DropTable(
                name: "EstoqueFeno");

            migrationBuilder.DropTable(
                name: "EstoqueRacao");

            migrationBuilder.DropTable(
                name: "EstoqueSilagem");

            migrationBuilder.DropTable(
                name: "MedicacoesLactacao");

            migrationBuilder.DropTable(
                name: "ProducoesLeite");

            migrationBuilder.DropTable(
                name: "Propriedades");

            migrationBuilder.DropTable(
                name: "Receitas");

            migrationBuilder.DropTable(
                name: "Reproducoes");

            migrationBuilder.DropTable(
                name: "Usuarios");

            migrationBuilder.DropTable(
                name: "Vacinas");

            migrationBuilder.DropTable(
                name: "VendasAnimais");

            migrationBuilder.DropTable(
                name: "LactacoesGalpao");

            migrationBuilder.DropTable(
                name: "Animais");
        }
    }
}
