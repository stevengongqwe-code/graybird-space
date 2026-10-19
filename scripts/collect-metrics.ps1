# SG-ONE 真实系统指标采集（Windows PowerShell）
# 被 server.py 调用，输出单行压缩 JSON（UTF-8）。
$OutputEncoding = [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
try {
  $os  = Get-CimInstance Win32_OperatingSystem
  $cpu = (Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
  if ($cpu -eq $null) { $cpu = 0 }
  $d   = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
  $up  = (Get-Date) - $os.LastBootUpTime
  $adapters = @(Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | Select-Object -ExpandProperty Name)
  $procs = (Get-Process).Count
  $totalMB = $os.TotalVisibleMemorySize / 1KB
  $freeMB  = $os.FreePhysicalMemory / 1KB
  $netStatus = "DOWN"
  if ($adapters.Count -gt 0) { $netStatus = "UP" }
  $upHuman = [string]$up.Days + "天 " + [string]$up.Hours + "小时 " + [string]$up.Minutes + "分"
  $obj = [ordered]@{
    cpu_percent    = [math]::Round([double]$cpu, 1)
    mem_used_gb    = [math]::Round(($totalMB - $freeMB) / 1024, 2)
    mem_total_gb   = [math]::Round($totalMB / 1024, 2)
    mem_percent    = [math]::Round((($totalMB - $freeMB) / $totalMB) * 100, 1)
    disk_free_gb   = [math]::Round($d.FreeSpace / 1GB, 2)
    disk_total_gb  = [math]::Round($d.Size / 1GB, 2)
    disk_percent   = [math]::Round((($d.Size - $d.FreeSpace) / $d.Size) * 100, 1)
    uptime_seconds = [math]::Round($up.TotalSeconds)
    uptime_human   = $upHuman
    process_count  = $procs
    net_status     = $netStatus
    net_adapters   = @($adapters)
    hostname       = $env:COMPUTERNAME
    os_caption     = $os.Caption
  }
  $obj | ConvertTo-Json -Compress -Depth 3
} catch {
  Write-Error $_.Exception.Message
  exit 1
}
