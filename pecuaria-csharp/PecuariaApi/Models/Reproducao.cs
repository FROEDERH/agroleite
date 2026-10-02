namespace PecuariaApi.Models;

public class Reproducao
{
    public int Id { get; set; }

    public int AnimalId { get; set; }
    public Animal? Animal { get; set; }

    public string DataInseminacao { get; set; } = string.Empty; // YYYY-MM-DD

    public string Tipo { get; set; } = "Inseminação Artificial"; // ou Monta Natural

    public string? RacaSemen { get; set; }

    public string? IdentificacaoSemen { get; set; }

    public double ValorInseminacao { get; set; } = 0;

    public string? DataPrevistaParto { get; set; }

    // Inseminada, Confirmada Prenhe, Parto Realizado, Perda de Cria, Não Prenhe
    public string Status { get; set; } = "Inseminada";

    public string? DataConfirmacaoPrenhez { get; set; }

    public string? DataParto { get; set; }

    public string? DataPerdaCria { get; set; }

    public string? MotivoPerda { get; set; }

    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.Now;
}
