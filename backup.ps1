# Backup do banco de dados do AgroLeite para uma pasta sincronizada com a nuvem
# (Google Drive, OneDrive, etc).
#
# Uso:
#   .\backup.ps1
#   .\backup.ps1 -Destino "D:\OutraPasta\Backups"
#   .\backup.ps1 -ManterUltimos 60

param(
    # Pasta para onde as cópias vão. Por padrão, a pasta do Google Drive para computador.
    [string]$Destino = "G:\Meu Drive\AgroLeite-Backups",

    # Quantos backups manter. Os mais antigos são apagados.
    [int]$ManterUltimos = 30
)

$ErrorActionPreference = "Stop"

$banco = Join-Path $PSScriptRoot "pecuaria-csharp\PecuariaApi\pecuaria.db"

if (-not (Test-Path $banco)) {
    Write-Host "Banco de dados não encontrado em: $banco" -ForegroundColor Red
    exit 1
}

# Copiar o banco com o backend rodando pode gerar um backup incompleto,
# porque parte dos dados ainda pode estar no arquivo pecuaria.db-wal.
if (Get-Process -Name "PecuariaApi" -ErrorAction SilentlyContinue) {
    Write-Host "O backend (PecuariaApi) está rodando." -ForegroundColor Yellow
    Write-Host "Pare o servidor (Ctrl+C no terminal do 'dotnet run') e rode o backup de novo." -ForegroundColor Yellow
    exit 1
}

$raizDestino = Split-Path $Destino -Qualifier -ErrorAction SilentlyContinue
if ($raizDestino -and -not (Test-Path $raizDestino)) {
    Write-Host "Unidade $raizDestino não encontrada. O Google Drive para computador está instalado e aberto?" -ForegroundColor Red
    Write-Host "Ou informe outra pasta: .\backup.ps1 -Destino 'C:\caminho\da\pasta'" -ForegroundColor Red
    exit 1
}

New-Item -ItemType Directory -Force -Path $Destino | Out-Null

$dataHora = Get-Date -Format "yyyy-MM-dd_HH-mm"
$arquivoBackup = Join-Path $Destino "pecuaria_$dataHora.db"

# Se ainda sobrou um -wal de uma execução anterior, ele é copiado junto
# para não perder dados que ainda não foram gravados no .db principal.
Copy-Item $banco $arquivoBackup -Force
if (Test-Path "$banco-wal") {
    Copy-Item "$banco-wal" "$arquivoBackup-wal" -Force
}

$tamanhoKb = [math]::Round((Get-Item $arquivoBackup).Length / 1KB, 1)
Write-Host "Backup criado: $arquivoBackup ($tamanhoKb KB)" -ForegroundColor Green

# Remove os backups mais antigos, mantendo apenas os últimos $ManterUltimos
$antigos = Get-ChildItem $Destino -Filter "pecuaria_*.db" |
    Sort-Object Name -Descending |
    Select-Object -Skip $ManterUltimos

foreach ($antigo in $antigos) {
    Remove-Item $antigo.FullName -Force
    Remove-Item "$($antigo.FullName)-wal" -Force -ErrorAction SilentlyContinue
    Write-Host "Backup antigo removido: $($antigo.Name)"
}
