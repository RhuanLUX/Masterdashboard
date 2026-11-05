$ErrorActionPreference = 'Stop'
$port = 41731
$url = "http://127.0.0.1:$port/"
$workspace = Split-Path -Parent $PSScriptRoot
function Test-RPG {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 -Uri $url
        return $response.StatusCode -eq 200 -and $response.Content.Contains('data/roster-data.js')
    } catch { return $false }
}
try {
    if (-not (Test-RPG)) {
        $probe = New-Object Net.Sockets.TcpClient
        try { $probe.Connect('127.0.0.1',$port); $occupied=$true } catch { $occupied=$false } finally { $probe.Dispose() }
        if ($occupied) { throw 'A porta 41731 esta ocupada por outro programa. Feche-o e tente novamente. O endereco foi mantido para preservar seus dados.' }
        $server = Join-Path $PSScriptRoot 'offline-server.ps1'
        $arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + $server + '" -Port ' + $port
        Start-Process -FilePath 'powershell.exe' -WindowStyle Hidden -WorkingDirectory $workspace -ArgumentList $arguments
        $ready = $false
        for ($attempt=0; $attempt -lt 20; $attempt++) {
            if (Test-RPG) { $ready=$true; break }
            Start-Sleep -Milliseconds 300
        }
        if (-not $ready) { throw 'O servidor local nao respondeu. Consulte README_USO.md ou utilize o aplicativo instalado.' }
    }
    Start-Process $url
} catch {
    Add-Type -AssemblyName System.Windows.Forms
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message,'RPG Master') | Out-Null
    exit 1
}
