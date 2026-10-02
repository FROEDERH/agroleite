namespace PecuariaApi.DTOs;

public class ReproducaoRequest
{
    public int AnimalId { get; set; }
    public string DataInseminacao { get; set; } = string.Empty;
    public string? Tipo { get; set; }
    public string? RacaSemen { get; set; }
    public string? IdentificacaoSemen { get; set; }
    public double ValorInseminacao { get; set; }
    public string? Observacoes { get; set; }

    // Usados apenas na edição (PUT), para corrigir datas de eventos já registrados
    public string? DataConfirmacaoPrenhez { get; set; }
    public string? DataParto { get; set; }
    public string? DataPerdaCria { get; set; }
    public string? MotivoPerda { get; set; }
}

public class ConfirmarPrenhezRequest
{
    public string? DataConfirmacaoPrenhez { get; set; }
}

public class RegistrarPartoRequest
{
    public string? DataParto { get; set; }
    public string? Observacoes { get; set; }
}

public class PerdaCriaRequest
{
    public string? DataPerdaCria { get; set; }
    public string? MotivoPerda { get; set; }
}
