# SG-ONE 页面截图脚本（尽力而为）
# 在服务器桌面会话中用 Edge/Chrome 打开 http://127.0.0.1:8765 并截取窗口。
# 若无桌面会话/无浏览器，诚实报错退出码 2，不伪造截图。
$ErrorActionPreference = "Stop"
$root = "C:\SG-Lab\SG-ONE"
$evDir = "$root\evidence"
New-Item -ItemType Directory -Force $evDir | Out-Null
$url = "http://127.0.0.1:8765"

$ver = Invoke-RestMethod "$url/api/version" -TimeoutSec 8 -ErrorAction SilentlyContinue
if (-not $ver) { Write-Error "SG-ONE 服务未运行，先执行 start-sgone.ps1"; exit 1 }

function Find-BrowserWindow {
  $names = @("msedge", "chrome", "iexplore")
  foreach ($n in $names) {
    $list = Get-Process -Name $n -ErrorAction SilentlyContinue
    foreach ($pr in $list) {
      if ($pr.MainWindowHandle -ne 0) {
        $t = $pr.MainWindowTitle
        if ($t -like "*SG-ONE*") { return $pr }
      }
    }
  }
  return $null
}

$win = Find-BrowserWindow
if (-not $win) {
  $bPath = $null
  $c1 = Get-Command msedge.exe -ErrorAction SilentlyContinue
  if ($c1) { $bPath = $c1.Source }
  else {
    $c2 = Get-Command chrome.exe -ErrorAction SilentlyContinue
    if ($c2) { $bPath = $c2.Source }
    else {
      $c3 = Get-Command iexplore.exe -ErrorAction SilentlyContinue
      if ($c3) { $bPath = $c3.Source }
    }
  }
  if (-not $bPath) {
    "NO_BROWSER" | Out-File "$evDir\SCREENSHOT_FAILED.txt"
    Write-Error "无可用浏览器"
    exit 2
  }
  Start-Process $bPath -ArgumentList $url
  Start-Sleep -Seconds 12
  $win = Find-BrowserWindow
}
if (-not $win) {
  "NO_WINDOW" | Out-File "$evDir\SCREENSHOT_FAILED.txt"
  Write-Error "未找到 SG-ONE 浏览器窗口"
  exit 2
}

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class WinCap {
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr hwnd, IntPtr hdcBlt, int nFlags);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hwnd, out RECT rc);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hwnd);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
}
"@

[WinCap]::SetForegroundWindow($win.MainWindowHandle) | Out-Null
Start-Sleep -Seconds 2
$rc = New-Object WinCap+RECT
$got = [WinCap]::GetWindowRect($win.MainWindowHandle, [ref]$rc)
if (-not $got) { Write-Error "获取窗口矩形失败"; exit 2 }
$w = $rc.Right - $rc.Left
$h = $rc.Bottom - $rc.Top
if (($w -lt 100) -or ($h -lt 100)) { Write-Error "窗口尺寸异常"; exit 2 }
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$hdc = $g.GetHdc()
[WinCap]::PrintWindow($win.MainWindowHandle, $hdc, 0) | Out-Null
$g.ReleaseHdc($hdc)
$g.Dispose()
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$out = "$evDir\sg-one-page-$stamp.png"
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "OK screenshot saved"
Write-Host $out
