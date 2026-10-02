using Microsoft.EntityFrameworkCore;
using PecuariaApi.Models;

namespace PecuariaApi.Data;

public class PecuariaDbContext : DbContext
{
    public PecuariaDbContext(DbContextOptions<PecuariaDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Propriedade> Propriedades => Set<Propriedade>();
    public DbSet<Animal> Animais => Set<Animal>();
    public DbSet<Vacina> Vacinas => Set<Vacina>();
    public DbSet<Doenca> Doencas => Set<Doenca>();
    public DbSet<ProducaoLeite> ProducoesLeite => Set<ProducaoLeite>();
    public DbSet<VendaAnimal> VendasAnimais => Set<VendaAnimal>();
    public DbSet<Reproducao> Reproducoes => Set<Reproducao>();
    public DbSet<EstoqueRacao> EstoqueRacao => Set<EstoqueRacao>();
    public DbSet<ConsumoRacao> ConsumoRacao => Set<ConsumoRacao>();
    public DbSet<EstoqueFeno> EstoqueFeno => Set<EstoqueFeno>();
    public DbSet<ConsumoFeno> ConsumoFeno => Set<ConsumoFeno>();
    public DbSet<EstoqueSilagem> EstoqueSilagem => Set<EstoqueSilagem>();
    public DbSet<ConsumoSilagem> ConsumoSilagem => Set<ConsumoSilagem>();
    public DbSet<Despesa> Despesas => Set<Despesa>();
    public DbSet<Receita> Receitas => Set<Receita>();
    public DbSet<LactacaoGalpao> LactacoesGalpao => Set<LactacaoGalpao>();
    public DbSet<MedicacaoLactacao> MedicacoesLactacao => Set<MedicacaoLactacao>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Animal>()
            .HasIndex(a => a.NumeroBrinco)
            .IsUnique();

        modelBuilder.Entity<Animal>()
            .HasMany(a => a.Vacinas)
            .WithOne(v => v.Animal)
            .HasForeignKey(v => v.AnimalId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Animal>()
            .HasMany(a => a.Doencas)
            .WithOne(d => d.Animal)
            .HasForeignKey(d => d.AnimalId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Animal>()
            .HasMany(a => a.Vendas)
            .WithOne(v => v.Animal)
            .HasForeignKey(v => v.AnimalId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Animal>()
            .HasMany(a => a.Reproducoes)
            .WithOne(r => r.Animal)
            .HasForeignKey(r => r.AnimalId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Animal>()
            .HasMany(a => a.LactacoesGalpao)
            .WithOne(l => l.Animal)
            .HasForeignKey(l => l.AnimalId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<LactacaoGalpao>()
            .HasMany(l => l.Medicacoes)
            .WithOne(m => m.LactacaoGalpao)
            .HasForeignKey(m => m.LactacaoGalpaoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
