namespace PecuariaApi.DTOs;

public class LactacaoGalpaoRequest
{
    public int AnimalId { get; set; }
    public string DataInicio { get; set; } = string.Empty;
    public string? DataFim { get; set; }
}

public class LactacaoGalpaoResponse
{
    public int Id { get; set; }
    public int AnimalId { get; set; }
    public string NumeroBrinco { get; set; } = string.Empty;
    public string? NomeAnimal { get; set; }
    public string DataInicio { get; set; } = string.Empty;
    public string? DataFim { get; set; }

    // Calculado no servidor a cada leitura, nunca persistido:
    // "Ativo" (verde), "Inativo" (cinza) ou "Medicado" (vermelho/amarelo)
    public string Status { get; set; } = string.Empty;

    // Presente apenas quando existe uma medicação ativa bloqueando o leite,
    // para a tela poder mostrar avisos de carência vencida etc.
    public MedicacaoLactacaoResponse? MedicacaoAtiva { get; set; }

    public List<MedicacaoLactacaoResponse> Medicacoes { get; set; } = new();
}

public class MedicacaoLactacaoRequest
{
    public string DataMedicacao { get; set; } = string.Empty;
    public string NomeMedicacao { get; set; } = string.Empty;
    public double DoseMl { get; set; }
    public bool PodeVenderLeite { get; set; } = true;
    public int? CarenciaDias { get; set; }
    public string? Observacoes { get; set; }
}

public class MedicacaoLactacaoResponse
{
    public int Id { get; set; }
    public int LactacaoGalpaoId { get; set; }
    public string DataMedicacao { get; set; } = string.Empty;
    public string NomeMedicacao { get; set; } = string.Empty;
    public double DoseMl { get; set; }
    public bool PodeVenderLeite { get; set; }
    public int? CarenciaDias { get; set; }
    public string? DataFimCarencia { get; set; } // calculado: DataMedicacao + CarenciaDias
    public bool CarenciaVencida { get; set; }     // calculado: hoje >= DataFimCarencia e ainda não liberado
    public string? DataLiberacaoManual { get; set; }
    public string? Observacoes { get; set; }
}

public class LiberarMedicacaoRequest
{
    public string? DataLiberacao { get; set; }
}
