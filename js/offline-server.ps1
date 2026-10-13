# Servidor estático offline para Windows 10/11. Não requer Node.js ou internet.
param([int]$Port = 41731)

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$mime = @{
  '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.mjs'='text/javascript; charset=utf-8';
  '.css'='text/css; charset=utf-8'; '.json'='application/json; charset=utf-8'; '.png'='image/png';
  '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.webp'='image/webp'; '.wasm'='application/wasm'; '.wav'='audio/wav'; '.pdf'='application/pdf'
}
$listener = [System.Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $Port)
try { $listener.Start() } catch { Write-Error $_; exit 1 }
try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $client.ReceiveTimeout = 5000
      $client.SendTimeout = 5000
      $stream = $client.GetStream()
      $reader = [IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 4096, $true)
      $requestLine = $reader.ReadLine()
      # Uma conexão TCP sem uma requisição HTTP pode ocorrer durante diagnósticos.
      # Ela não deve derrubar o servidor que atende o navegador.
      if ([string]::IsNullOrWhiteSpace($requestLine)) { continue }
      while ($reader.ReadLine()) {}
      $rawPath = if ($requestLine -match '^[A-Z]+\s+([^\s?]+)') { $Matches[1] } else { '/' }
      $relative = [uri]::UnescapeDataString($rawPath.TrimStart('/'))
      if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }
      $candidate = [IO.Path]::GetFullPath((Join-Path $root $relative))
      if (-not $candidate.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not (Test-Path -LiteralPath $candidate -PathType Leaf)) {
        $body = [Text.Encoding]::UTF8.GetBytes('Not found')
        $head = "HTTP/1.1 404 Not Found`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
        $headBytes = [Text.Encoding]::ASCII.GetBytes($head)
        $stream.Write($headBytes,0,$headBytes.Length); $stream.Write($body,0,$body.Length); continue
      }
      $extension = [IO.Path]::GetExtension($candidate).ToLowerInvariant()
      $contentType = if ($mime.ContainsKey($extension)) { $mime[$extension] } else { 'application/octet-stream' }
      $bytes = [IO.File]::ReadAllBytes($candidate)
      $head = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($bytes.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
      $headBytes = [Text.Encoding]::ASCII.GetBytes($head)
      $stream.Write($headBytes,0,$headBytes.Length); $stream.Write($bytes,0,$bytes.Length)
    } catch {
      # Clientes que fecham a conexão cedo não são um erro fatal do servidor local.
    } finally {
      $client.Close()
    }
  }
} finally { $listener.Stop() }
