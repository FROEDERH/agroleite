namespace PecuariaApi.Models;

public class MedicacaoLactacao
{
    public int Id { get; set; }

    public int LactacaoGalpaoId { get; set; }
    public LactacaoGalpao? LactacaoGalpao { get; set; }

    public string DataMedicacao { get; set; } = string.Empty; // YYYY-MM-DD

    public string NomeMedicacao { get; set; } = string.Empty;

    public double DoseMl { get; set; }

    // true = pode continuar vendendo o leite (ex: medicação para cio)
    // false = leite não pode ser vendido (período de carência)
    public bool PodeVenderLeite { get; set; } = true;

    // Só relevante quando PodeVenderLeite = false. Dias de carência informados
    // manualmente pelo usuário (não há cálculo automático nem tabela de referência).
    public int? CarenciaDias { get; set; }

    // Preenchido manualmente pelo usuário quando ele confirma que o leite já
    // pode voltar a ser vendido. Enquanto estiver nulo (e PodeVenderLeite=false),
    // esta medicação é considerada "ativa" e bloqueia a venda do leite do animal.
    public string? DataLiberacaoManual { get; set; }

    public string? Observacoes { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.Now;
}
