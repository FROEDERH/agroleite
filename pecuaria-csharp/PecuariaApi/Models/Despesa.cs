using System.ComponentModel.DataAnnotations;

namespace PecuariaApi.Models;

public class Despesa
{
    public int Id { get; set; }

    [Required]
    public string Descricao { get; set; } = string.Empty;

    public string Categoria { get; set; } = "Outros";

    public double Valor { get; set; }

    public string Data { get; set; } = string.Empty; // YYYY-MM-DD

    public string? FormaPagamento { get; set; }

    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.Now;
}
