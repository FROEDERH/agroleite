namespace PecuariaApi.DTOs;

public class AnimalRequest
{
    public string NumeroBrinco { get; set; } = string.Empty;
    public string? Nome { get; set; }
    public string Raca { get; set; } = string.Empty;
    public string? Sexo { get; set; }
    public string? DataNascimento { get; set; }
    public string? Categoria { get; set; }
    public string? Status { get; set; }
    public string? Origem { get; set; }
    public double? PesoKg { get; set; }
    public int? MaeId { get; set; }
    public string? PaiInfo { get; set; }
    public string? Observacoes { get; set; }
}

public class VacinaRequest
{
    public string NomeVacina { get; set; } = string.Empty;
    public string DataAplicacao { get; set; } = string.Empty;
    public string? ProximaDose { get; set; }
    public string? Responsavel { get; set; }
    public string? Observacoes { get; set; }
}

public class DoencaRequest
{
    public string NomeDoenca { get; set; } = string.Empty;
    public string DataDiagnostico { get; set; } = string.Empty;
    public string? Tratamento { get; set; }
    public string? DataCura { get; set; }
    public string? Status { get; set; }
    public string? Observacoes { get; set; }
}
