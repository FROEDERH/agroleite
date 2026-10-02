namespace PecuariaApi.Models;

public class LactacaoGalpao
{
    public int Id { get; set; }

    public int AnimalId { get; set; }
    public Animal? Animal { get; set; }

    public string DataInicio { get; set; } = string.Empty; // YYYY-MM-DD

    public string? DataFim { get; set; } // YYYY-MM-DD, nulo enquanto está ativo

    public DateTime CriadoEm { get; set; } = DateTime.Now;

    // Navegação
    public List<MedicacaoLactacao> Medicacoes { get; set; } = new();
}
