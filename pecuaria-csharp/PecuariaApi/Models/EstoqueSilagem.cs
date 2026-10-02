namespace PecuariaApi.Models;

public class EstoqueSilagem
{
    public int Id { get; set; }

    public string DataProducao { get; set; } = string.Empty;

    public string? TipoSilagem { get; set; }

    public double QuantidadeToneladas { get; set; }

    public double? ValorTotal { get; set; }

    public string? Origem { get; set; }

    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.Now;
}

public class ConsumoSilagem
{
    public int Id { get; set; }

    public string Data { get; set; } = string.Empty;

    public double QuantidadeToneladas { get; set; }

    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.Now;
}
