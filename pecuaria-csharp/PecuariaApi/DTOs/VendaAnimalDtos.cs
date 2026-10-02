namespace PecuariaApi.DTOs;

public class VendaAnimalRequest
{
    public int AnimalId { get; set; }
    public string DataVenda { get; set; } = string.Empty;
    public double PesoKg { get; set; }
    public double ValorKg { get; set; }
    public double ValorFinal { get; set; }
    public string? Observacoes { get; set; }
}

public class VendaAnimalResponse
{
    public int Id { get; set; }
    public int AnimalId { get; set; }
    public string NumeroBrinco { get; set; } = string.Empty;
    public string? NomeAnimal { get; set; }
    public string DataVenda { get; set; } = string.Empty;
    public double PesoKg { get; set; }
    public double ValorKg { get; set; }
    public double ValorFinal { get; set; }
    public string? Observacoes { get; set; }
    public int? ReceitaId { get; set; }
}
