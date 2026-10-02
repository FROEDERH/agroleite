namespace PecuariaApi.Models;

public class EstoqueRacao
{
    public int Id { get; set; }

    public string DataChegada { get; set; } = string.Empty; // YYYY-MM-DD

    public string TipoRacao { get; set; } = string.Empty;

    public string? Fornecedor { get; set; }

    public double QuantidadeKg { get; set; }

    public double ValorTotal { get; set; }

    public double? ValorKg { get; set; }

    public string? NotaFiscal { get; set; }

    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.Now;
}

public class ConsumoRacao
{
    public int Id { get; set; }

    public string Data { get; set; } = string.Empty;

    public double QuantidadeKg { get; set; }

    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.Now;
}
