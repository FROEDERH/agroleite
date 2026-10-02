namespace PecuariaApi.Models;

public class EstoqueFeno
{
    public int Id { get; set; }

    public string DataProducao { get; set; } = string.Empty;

    public string? TipoCapim { get; set; }

    public int QuantidadeFardos { get; set; }

    public double? PesoFardoKg { get; set; }

    public double? ValorTotal { get; set; }

    public string? Origem { get; set; }

    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.Now;
}

public class ConsumoFeno
{
    public int Id { get; set; }

    public string Data { get; set; } = string.Empty;

    public double QuantidadeFardos { get; set; }

    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.Now;
}
