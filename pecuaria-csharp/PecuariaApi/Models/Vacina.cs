using System.ComponentModel.DataAnnotations;

namespace PecuariaApi.Models;

public class Vacina
{
    public int Id { get; set; }

    public int AnimalId { get; set; }
    public Animal? Animal { get; set; }

    [Required]
    public string NomeVacina { get; set; } = string.Empty;

    [Required]
    public string DataAplicacao { get; set; } = string.Empty; // YYYY-MM-DD

    public string? ProximaDose { get; set; }

    public string? Responsavel { get; set; }

    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.Now;
}
