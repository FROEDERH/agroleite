using System.ComponentModel.DataAnnotations;

namespace PecuariaApi.Models;

public class Doenca
{
    public int Id { get; set; }

    public int AnimalId { get; set; }
    public Animal? Animal { get; set; }

    [Required]
    public string NomeDoenca { get; set; } = string.Empty;

    [Required]
    public string DataDiagnostico { get; set; } = string.Empty; // YYYY-MM-DD

    public string? Tratamento { get; set; }

    public string? DataCura { get; set; }

    public string Status { get; set; } = "Em tratamento"; // Em tratamento, Curado, Crônico

    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.Now;
}
