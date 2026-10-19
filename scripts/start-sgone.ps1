# SG-ONE 启动脚本（在服务器 PowerShell 中运行）
$ErrorActionPreference = "Stop"
$root = "C:\SG-Lab\SG-ONE"
Set-Location $root
New-Item -ItemType Directory -Force "$root\logs" | Out-Null

$pyCmd = $null
$pyArgs = @()
if (Get-Command py -ErrorAction SilentlyContinue) { $pyCmd = "py"; $pyArgs = @("-3") }
elseif (Get-Command python -ErrorAction SilentlyContinue) { $pyCmd = "python" }
elseif (Test-Path "$root\python-embed\python.exe") { $pyCmd = "$root\python-embed\python.exe" }
else { Write-Error "未找到 Python"; exit 1 }

if (Test-Path "$root\sg-one.pid") {
  $old = Get-Content "$root\sg-one.pid" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($old -match '^\d+$') { Stop-Process -Id ([int]$old) -Force -ErrorAction SilentlyContinue }
  Remove-Item "$root\sg-one.pid" -Force -ErrorAction SilentlyContinue
}

$allArgs = $pyArgs + @("server.py")
$argStr = $allArgs -join " "
$p = Start-Process -FilePath $pyCmd -ArgumentList $argStr -WorkingDirectory $root -WindowStyle Hidden -PassThru
$p.Id | Out-File "$root\sg-one.pid" -Encoding ascii -NoNewline
Start-Sleep -Seconds 4
$v = Invoke-RestMethod "http://127.0.0.1:8765/api/version" -TimeoutSec 10 -ErrorAction SilentlyContinue
if ($v -and $v.version) {
  $msg = "OK: SG-ONE 已启动 PID=" + $p.Id + " 版本=" + $v.version + " 地址=http://127.0.0.1:8765（仅本机）"
  Write-Host $msg
} else {
  Write-Error "启动后健康检查失败"
  exit 1
}
