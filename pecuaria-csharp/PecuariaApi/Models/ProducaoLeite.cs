namespace PecuariaApi.Models;

public class ProducaoLeite
{
    public int Id { get; set; }

    public string DataInicio { get; set; } = string.Empty; // YYYY-MM-DD
    public string DataFim { get; set; } = string.Empty;    // YYYY-MM-DD

    public double LitrosTotal { get; set; } = 0;

    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.Now;
}
