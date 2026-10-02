using System.ComponentModel.DataAnnotations;

namespace PecuariaApi.Models;

public class VendaAnimal
{
    public int Id { get; set; }

    public int AnimalId { get; set; }
    public Animal? Animal { get; set; }

    [Required]
    public string DataVenda { get; set; } = string.Empty; // YYYY-MM-DD

    public double PesoKg { get; set; }

    public double ValorKg { get; set; }

    public double ValorFinal { get; set; } // digitado manualmente, independente do cálculo peso x valor_kg

    public string? Observacoes { get; set; }

    // Referência à receita gerada automaticamente a partir desta venda,
    // para podermos mantê-la sincronizada (ex: se a venda for excluída)
    public int? ReceitaId { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.Now;
}
