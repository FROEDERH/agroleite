namespace PecuariaApi.DTOs;

public class ProducaoLeiteRequest
{
    public string DataInicio { get; set; } = string.Empty;
    public string DataFim { get; set; } = string.Empty;
    public double LitrosTotal { get; set; }
    public string? Observacoes { get; set; }
}
