namespace PecuariaApi.DTOs;

// ===== RAÇÃO =====

public class EstoqueRacaoRequest
{
    public string DataChegada { get; set; } = string.Empty;
    public string TipoRacao { get; set; } = string.Empty;
    public string? Fornecedor { get; set; }
    public double QuantidadeKg { get; set; }
    public double ValorTotal { get; set; }
    public string? NotaFiscal { get; set; }
    public string? Observacoes { get; set; }
}

public class ConsumoRacaoRequest
{
    public string Data { get; set; } = string.Empty;
    public double QuantidadeKg { get; set; }
    public string? Observacoes { get; set; }
}

// ===== FENO =====

public class EstoqueFenoRequest
{
    public string DataProducao { get; set; } = string.Empty;
    public string? TipoCapim { get; set; }
    public int QuantidadeFardos { get; set; }
    public double? PesoFardoKg { get; set; }
    public double? ValorTotal { get; set; }
    public string? Origem { get; set; }
    public string? Observacoes { get; set; }
}

public class ConsumoFenoRequest
{
    public string Data { get; set; } = string.Empty;
    public double QuantidadeFardos { get; set; }
    public string? Observacoes { get; set; }
}

// ===== SILAGEM =====

public class EstoqueSilagemRequest
{
    public string DataProducao { get; set; } = string.Empty;
    public string? TipoSilagem { get; set; }
    public double QuantidadeToneladas { get; set; }
    public double? ValorTotal { get; set; }
    public string? Origem { get; set; }
    public string? Observacoes { get; set; }
}

public class ConsumoSilagemRequest
{
    public string Data { get; set; } = string.Empty;
    public double QuantidadeToneladas { get; set; }
    public string? Observacoes { get; set; }
}
