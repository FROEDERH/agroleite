namespace PecuariaApi.DTOs;

public class DespesaRequest
{
    public string Descricao { get; set; } = string.Empty;
    public string? Categoria { get; set; }
    public double Valor { get; set; }
    public string Data { get; set; } = string.Empty;
    public string? FormaPagamento { get; set; }
    public string? Observacoes { get; set; }
}

public class ReceitaRequest
{
    public string Descricao { get; set; } = string.Empty;
    public string? Categoria { get; set; }
    public double Valor { get; set; }
    public string Data { get; set; } = string.Empty;
    public string? Observacoes { get; set; }
}

public class PropriedadeRequest
{
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
}
