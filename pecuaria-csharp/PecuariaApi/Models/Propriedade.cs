using System.ComponentModel.DataAnnotations;

namespace PecuariaApi.Models;

public class Propriedade
{
    public int Id { get; set; }

    [Required]
    public string Nome { get; set; } = string.Empty;

    public string? Proprietario { get; set; }
    public string? CnpjCpf { get; set; }
    public string? Endereco { get; set; }
    public string? Cidade { get; set; }
    public string? Estado { get; set; }
    public double? AreaHectares { get; set; }
    public string? InscricaoEstadual { get; set; }
    public string? Telefone { get; set; }
    public string? Email { get; set; }
    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.Now;
}
