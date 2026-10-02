using System.ComponentModel.DataAnnotations;

namespace PecuariaApi.Models;

public class Animal
{
    public int Id { get; set; }

    [Required]
    public string NumeroBrinco { get; set; } = string.Empty;

    public string? Nome { get; set; }

    [Required]
    public string Raca { get; set; } = string.Empty;

    public string Sexo { get; set; } = "Fêmea"; // Fêmea ou Macho

    public string? DataNascimento { get; set; } // formato YYYY-MM-DD

    public string Categoria { get; set; } = "Vaca"; // Vaca, Novilha, Bezerra, Touro, Boi

    public string Status { get; set; } = "Ativo"; // Ativo, Vendido, Morto, Descartado

    public string? Origem { get; set; }

    public double? PesoKg { get; set; }

    public int? MaeId { get; set; }

    public string? PaiInfo { get; set; }

    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.Now;

    // Navegação
    public List<Vacina> Vacinas { get; set; } = new();
    public List<Doenca> Doencas { get; set; } = new();
    public List<Reproducao> Reproducoes { get; set; } = new();
    public List<VendaAnimal> Vendas { get; set; } = new();
    public List<LactacaoGalpao> LactacoesGalpao { get; set; } = new();
}
