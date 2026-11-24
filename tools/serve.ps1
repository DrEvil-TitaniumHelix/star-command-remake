$ErrorActionPreference = 'Stop'
$root = Join-Path (Split-Path $PSScriptRoot -Parent) 'game'
$launch = $args -contains '--launch'
$legacy = $args -contains '--play' -or $args -contains '--veteran'
$veteran = $launch -and $args -contains '--veteran'
$skip = $args -contains '--no-browser'
$fixed = $args -contains '--server'
$port = if ($launch) { 8089 } else { 8088 }
$srv = $null
$browser = $null
$child = $null
$remembered = $false
$test = 0
$game = ''
$code = 1

function Fail($n, $message) {
    $e = New-Object InvalidOperationException($message)
    $e.Data['code'] = $n
    throw $e
}

function Show-Error($message) {
    if ($skip -or $env:SC_QUIET -eq '1') { [Console]::Error.WriteLine($message) }
    else {
        Add-Type -AssemblyName System.Windows.Forms
        [System.Windows.Forms.MessageBox]::Show($message, 'Star Command', 'OK', 'Error') | Out-Null
    }
}

function Browser-Names($choiceFile) {
    $names = @('chrome', 'msedge')
    $choice = $env:SC_BROWSER
    if (!$choice -and (Test-Path -LiteralPath $choiceFile)) { $choice = [IO.File]::ReadAllText($choiceFile).Trim() }
    if ($choice -eq 'chrome') { $names = @('chrome') }
    elseif ($choice -eq 'edge') { $names = @('msedge') }
    elseif ($choice) { Fail 10 'The saved browser choice is invalid. Select chrome or edge with SC_BROWSER.' }
    return $names
}

function Find-Browser($choiceFile) {
    $names = @(Browser-Names $choiceFile)
    foreach ($name in $names) {
        $cmd = Get-Command "$name.exe" -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($cmd) { return $cmd.Source }
        $rel = if ($name -eq 'chrome') { 'Google\Chrome\Application\chrome.exe' } else { 'Microsoft\Edge\Application\msedge.exe' }
        foreach ($base in @($env:ProgramFiles, ${env:ProgramFiles(x86)}, $env:LOCALAPPDATA)) {
            if ($base) {
                $p = Join-Path $base $rel
                if (Test-Path -LiteralPath $p -PathType Leaf) { return $p }
            }
        }
    }
    Fail 12 'The browser used for this game could not be found. Repair it to keep using the same imported game and saves.'
}

function Remember-Browser($choiceFile, $exe) {
    if (!$env:SC_BROWSER) { [IO.File]::WriteAllText($choiceFile, $(if ((Split-Path $exe -Leaf) -eq 'msedge.exe') { 'edge' } else { 'chrome' })) }
}

function Launch-Url($n, $source, $copy) {
    $u = "http://$(if ($veteran) { 'localhost' } else { '127.0.0.1' }):$n/byoc/import/index.html?launch=1"
    if ($veteran) { $u += '&return=' + [Uri]::EscapeDataString('../../index.html?assets=opfs&save=veteran') }
    if ($source) { $u += "&source=$source&copy=$copy" }
    return $u
}

function App-Args($url, $profile = '') {
    $shape = if ($env:SC_WINDOW -match '^(-?\d+),(-?\d+),(\d+),(\d+)$') { @("--window-position=$($Matches[1]),$($Matches[2])", "--window-size=$($Matches[3]),$($Matches[4])") } else {
        Add-Type -AssemblyName System.Windows.Forms
        $area = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
        $k = [int][Math]::Max(1, [Math]::Min(2, [Math]::Floor([Math]::Min(($area.Width - 80) / 640, ($area.Height - 120) / 400))))
        $w = 640 * $k + 16; $h = 400 * $k + 40
        @("--window-position=$([int]($area.X + ($area.Width - $w) / 2)),$([int]($area.Y + ($area.Height - $h) / 2))", "--window-size=$w,$h")
    }
    if ($profile) {
        '--user-data-dir="' + $profile + '"'
        '--no-first-run'; '--no-default-browser-check'; '--disable-background-mode'
        if ((Split-Path $exe -Leaf) -eq 'msedge.exe') { '--disable-features=msImplicitSignin,msSingleSignOnOSForPrimaryAccountIsShared,msEdgeFRE'; '--disable-sync' }
    }
    '--app="' + $url + '"'
    if ($profile -and $env:RECOMPLAUNCHER_MODE -ceq 'bigpicture') { '--start-fullscreen' } else { $shape }
}

function Watch-Windows {
    Add-Type -TypeDefinition @'
using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
public static class SCWindows {
    delegate bool Visit(IntPtr w, IntPtr p);
    [DllImport("user32.dll")] static extern bool EnumWindows(Visit f, IntPtr p);
    [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr w);
    [DllImport("user32.dll", CharSet=CharSet.Unicode)] static extern int GetWindowText(IntPtr w, StringBuilder s, int n);
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr w, out uint p);
    public static bool Open() {
        bool found = false;
        EnumWindows(delegate(IntPtr w, IntPtr p) {
            if (!IsWindowVisible(w)) return true;
            var s = new StringBuilder(256);
            GetWindowText(w, s, s.Capacity);
            if (!s.ToString().StartsWith("Star Command", StringComparison.Ordinal)) return true;
            uint id; GetWindowThreadProcessId(w, out id);
            try { using (var q = Process.GetProcessById((int)id)) { found = q.ProcessName.Equals("chrome", StringComparison.OrdinalIgnoreCase) || q.ProcessName.Equals("msedge", StringComparison.OrdinalIgnoreCase); } }
            catch (ArgumentException) {} catch (InvalidOperationException) {} catch (System.ComponentModel.Win32Exception) {}
            return !found;
        }, IntPtr.Zero);
        return found;
    }
}
'@
}

function Window-Expired($s, $open, $now, $gap = 10, $limit = 120) {
    if ($open) { $s.seen = $true; $s.gone = $null }
    elseif ($s.seen) {
        if (!$s.gone) { $s.gone = $now }
        return ($now - $s.gone).TotalSeconds -ge $gap
    }
    return !$s.seen -and ($now - $s.start).TotalSeconds -ge $limit
}

function Listening($n) {
    $c = New-Object Net.Sockets.TcpClient
    try { $c.Connect('127.0.0.1', $n); return $true } catch [Net.Sockets.SocketException] { return $false } finally { $c.Dispose() }
}

function Own-Server($n, $mode = 'launch') {
    $r = $null; $reader = $null
    try {
        $q = [Net.HttpWebRequest]::Create("http://127.0.0.1:$n/byoc-status")
        $q.Proxy = $null; $q.Timeout = 500; $q.ReadWriteTimeout = 500; $q.KeepAlive = $false
        $r = $q.GetResponse()
        if ($r.ContentLength -lt 0 -or $r.ContentLength -gt 4096) { return $null }
        $reader = New-Object IO.StreamReader($r.GetResponseStream())
        $s = $reader.ReadToEnd() | ConvertFrom-Json
        if ($s.app -ceq 'star-command' -and $s.id -ceq $id -and $s.mode -ceq $mode -and (!$s.source -or $s.source -match '^[A-Za-z0-9_-]{43}$')) { return $s }
    } catch {} finally { if ($reader) { $reader.Dispose() }; if ($r) { $r.Dispose() } }
    return $null
}

function Source-Zip($folder) {
    Add-Type -AssemblyName System.IO.Compression
    $names = @{}
    (Get-Content -Raw -LiteralPath (Join-Path $root 'byoc/import/manifest.json') | ConvertFrom-Json).list | ForEach-Object { $names[$_.name] = $true }
    $mem = New-Object IO.MemoryStream
    $zip = New-Object IO.Compression.ZipArchive($mem, [IO.Compression.ZipArchiveMode]::Create, $true)
    try {
        foreach ($p in (Get-ChildItem -LiteralPath $folder -File | Sort-Object Name)) {
            if (!$names.ContainsKey($p.Name) -or $p.LinkType) { continue }
            $entry = $zip.CreateEntry($p.Name.ToUpperInvariant(), [IO.Compression.CompressionLevel]::NoCompression).Open()
            try { $b = [IO.File]::ReadAllBytes($p.FullName); $entry.Write($b, 0, $b.Length) } finally { $entry.Dispose() }
        }
    } finally { $zip.Dispose() }
    try { return ,$mem.ToArray() } finally { $mem.Dispose() }
}

function Reply($stream, $method, $status, $type, [byte[]]$body, $extra = '') {
    if ($env:SC_LOG) {
        try { [IO.File]::AppendAllText($env:SC_LOG, ([DateTime]::UtcNow.ToString('o') + " $method $($req[1]) $status" + [Environment]::NewLine)) }
        catch { [Console]::Error.WriteLine('Could not append to SC_LOG.') }
    }
    $reason = @{200='OK';301='Moved Permanently';400='Bad Request';404='Not Found';405='Method Not Allowed';409='Conflict';431='Request Header Fields Too Large';503='Service Unavailable'}[$status]
    $head = "HTTP/1.1 $status $reason`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nReferrer-Policy: no-referrer`r`nDate: $([DateTime]::UtcNow.ToString('R'))`r`nConnection: close`r`n$extra`r`n"
    $b = [Text.Encoding]::ASCII.GetBytes($head)
    $stream.Write($b, 0, $b.Length)
    if ($method -ne 'HEAD') { $stream.Write($body, 0, $body.Length) }
}

function Serve($client) {
    $stream = $client.GetStream()
    $stream.ReadTimeout = 2000
    $stream.WriteTimeout = 5000
    $buf = New-Object Collections.Generic.List[byte]
    while ($buf.Count -lt 16384) {
        $n = $stream.ReadByte()
        if ($n -lt 0) { return }
        $buf.Add([byte]$n)
        if ($buf.Count -ge 4 -and $buf[$buf.Count-4] -eq 13 -and $buf[$buf.Count-3] -eq 10 -and $buf[$buf.Count-2] -eq 13 -and $buf[$buf.Count-1] -eq 10) { break }
    }
    $lines = [Text.Encoding]::ASCII.GetString($buf.ToArray()) -split "`r`n"
    $req = $lines[0] -split ' '
    $method = $req[0]
    $status = 404
    $type = 'text/html; charset=utf-8'
    $extra = ''
    $body = [Text.Encoding]::UTF8.GetBytes('Not Found')
    if ($buf.Count -ge 16384) { $status = 431 }
    elseif ($req.Count -ne 3 -or $req[1] -notmatch '^/[^\r\n]*$') { $status = 400 }
    elseif ($method -notin @('GET', 'HEAD')) { $status = 405; $extra = "Allow: GET, HEAD`r`n" }
    elseif (!($lines -match ('^Host:\s*(127\.0\.0\.1|localhost)(:' + $port + ')?\s*$')) -and $req[2] -ne 'HTTP/1.0') { $status = 400 }
    elseif ($req[1] -ceq '/byoc-status') {
        $status = 200; $type = 'application/json'
        $body = [Text.Encoding]::UTF8.GetBytes((@{app='star-command';id=$id;mode=$(if ($launch) { 'launch' } else { 'server' });source=$token;copy=$sourceId} | ConvertTo-Json -Compress))
    }
    elseif ($req[1].StartsWith('/byoc-source/')) {
        if ($sourcePath -and $req[1] -ceq $sourcePath) {
            try { $body = Source-Zip $src; $status = 200; $type = 'application/zip' }
            catch { $status = 503; $body = [Text.Encoding]::UTF8.GetBytes('The selected folder is unavailable. Choose a locally available copy, or play the imported copy.') }
        }
    } else {
        $path = [Uri]::UnescapeDataString(($req[1] -split '[?#]', 2)[0])
        $parts = @($path -split '/' | Where-Object { $_ -ne '' -and $_ -ne '.' })
        $p = $root
        $valid = $true
        foreach ($part in $parts) {
            if ($part -eq '..' -or $part.IndexOfAny([IO.Path]::GetInvalidFileNameChars()) -ge 0 -or $part.EndsWith('.') -or $part.EndsWith(' ')) { $valid = $false; break }
            $p = Join-Path $p $part
            if (!(Test-Path -LiteralPath $p) -or ((Get-Item -Force -LiteralPath $p).Attributes -band [IO.FileAttributes]::ReparsePoint)) { $valid = $false; break }
        }
        if ($valid -and (Test-Path -LiteralPath $p -PathType Container)) {
            if (!$path.EndsWith('/')) {
                $loc = ($req[1] -split '\?', 2)
                $location = $loc[0] + '/'
                if ($loc.Count -gt 1) { $location += '?' + $loc[1] }
                Reply $stream $method 301 $type ([byte[]]@()) "Location: $location`r`n"
                return
            }
            $index = @('index.html', 'index.htm') | ForEach-Object { Join-Path $p $_ } | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } | Select-Object -First 1
            if ($index) { $p = $index }
            else {
                $items = Get-ChildItem -Force -LiteralPath $p | Sort-Object Name | ForEach-Object {
                    $name = $_.Name + $(if ($_.PSIsContainer) { '/' })
                    '<li><a href="' + [Uri]::EscapeDataString($_.Name) + $(if ($_.PSIsContainer) { '/' }) + '">' + [Net.WebUtility]::HtmlEncode($name) + '</a></li>'
                }
                $body = [Text.Encoding]::UTF8.GetBytes('<!doctype html><title>Directory listing</title><ul>' + ($items -join '') + '</ul>')
                Reply $stream $method 200 $type $body
                return
            }
        }
        if ($valid -and (Test-Path -LiteralPath $p -PathType Leaf) -and !((Get-Item -Force -LiteralPath $p).Attributes -band [IO.FileAttributes]::ReparsePoint)) {
            $types = @{'.js'='text/javascript';'.mjs'='text/javascript';'.json'='application/json';'.html'='text/html';'.htm'='text/html';'.css'='text/css';'.png'='image/png';'.wasm'='application/wasm';'.svg'='image/svg+xml';'.ico'='image/x-icon';'.jpg'='image/jpeg';'.jpeg'='image/jpeg';'.gif'='image/gif';'.txt'='text/plain';'.zip'='application/zip'}
            $type = $types[[IO.Path]::GetExtension($p).ToLowerInvariant()]
            if (!$type) { $type = 'application/octet-stream' }
            $body = [IO.File]::ReadAllBytes($p)
            $status = 200
            $extra = 'Last-Modified: ' + [IO.File]::GetLastWriteTimeUtc($p).ToString('R') + "`r`n"
        }
    }
    Reply $stream $method $status $type $body $extra
}

try {
    $code = 10
    for ($i = 0; $i -lt $args.Count; $i++) {
        $arg = $args[$i]
        if ($arg -in @('--launch', '--play', '--veteran', '--no-browser', '--server')) { continue }
        if ($arg -eq '--game') {
            $i++
            if ($i -ge $args.Count -or !$args[$i]) { Fail 10 '--game requires the game folder.' }
            $game = $args[$i]
            continue
        }
        if ($arg -eq '--test-timeout') {
            $i++
            if (!$skip -or $i -ge $args.Count -or ![int]::TryParse($args[$i], [ref]$test) -or $test -lt 1 -or $test -gt 120) { Fail 10 '--test-timeout requires --no-browser and a value from 1 to 120 seconds.' }
            continue
        }
        if ($arg -notmatch '^\d+$' -or ![int]::TryParse($arg, [ref]$port) -or $port -lt 0 -or $port -gt 65535) { Fail 10 'Usage: serve.ps1 [port] [--launch|--play|--veteran] [--game folder] [--no-browser] [--test-timeout seconds]' }
    }
    $hash = [Security.Cryptography.SHA256]::Create()
    try { $id = [Convert]::ToBase64String($hash.ComputeHash([Text.Encoding]::UTF8.GetBytes($root.ToUpperInvariant()))) } finally { $hash.Dispose() }
    $src = if ($game) { $game } elseif ($launch) { $env:SC_GAME } else { '' }
    $sourceId = ''
    if ($src) {
        $hash = [Security.Cryptography.SHA256]::Create()
        try { $sourceId = [Convert]::ToBase64String($hash.ComputeHash([Text.Encoding]::UTF8.GetBytes([IO.Path]::GetFullPath($src).TrimEnd('\').ToUpperInvariant()))).TrimEnd('=').Replace('+', '-').Replace('/', '_') } finally { $hash.Dispose() }
    }
    if ($legacy -and !$launch) {
        $code = 12
        $choiceFile = Join-Path (Split-Path $PSScriptRoot -Parent) 'browser-choice'
        if (!$skip) { $port = 8088; $exe = Find-Browser $choiceFile }
        if (!$port) { Fail 10 'A fixed port is required.' }
        $code = 14
        if (!(Listening $port)) {
            $a = @('-NoProfile', '-WindowStyle', 'Hidden', '-ExecutionPolicy', 'Bypass', '-File', ('"' + $PSCommandPath + '"'), '--server', $port)
            if ($skip) { $a += '--no-browser' }
            if ($test) { $a += @('--test-timeout', $test) }
            if ($game) { $a += @('--game', ('"' + [IO.Path]::GetFullPath($game).TrimEnd('\') + '"')) }
            $child = Start-Process -FilePath (Join-Path $PSHOME 'powershell.exe') -ArgumentList $a -WindowStyle Hidden -PassThru
            $until = [DateTime]::UtcNow.AddSeconds(10)
            while (!(Listening $port)) {
                if ($child.HasExited -or [DateTime]::UtcNow -gt $until) { Fail 14 "Could not start the server on port $port." }
                Start-Sleep -Milliseconds 30
            }
        }
        $own = Own-Server $port 'server'
        if (!$own) { Fail 13 "Another program is using port $port. Close that program and retry; the game address has not changed." }
        if ($sourceId -and $own.copy -cne $sourceId) { Fail 13 'Close the running game before selecting a different original copy, then retry.' }
        $url = "http://localhost:$port/index.html"
        if ($args -contains '--veteran') { $url = "http://127.0.0.1:$port/index.html?save=veteran" }
        if ($sourceId) {
            $u = [Uri]$url
            $url = "http://$($u.Authority)/byoc/import/index.html?launch=1&source=$($own.source)&copy=$($own.copy)&return=" + [Uri]::EscapeDataString('../..' + $u.PathAndQuery)
        }
        $code = 17
        if (!$skip) { Start-Process -FilePath $exe -ArgumentList (App-Args $url); Remember-Browser $choiceFile $exe }
        $code = 0
        exit 0
    }
    if ($launch) {
        $code = 16
        $profile = Join-Path (Split-Path $PSScriptRoot -Parent) 'recomp-profile'
        [IO.Directory]::CreateDirectory($profile) | Out-Null
        $choiceFile = Join-Path $profile 'browser'
        $code = 12
        if (!$skip) { $exe = Find-Browser $choiceFile }
        $portFile = Join-Path $profile 'port'
        $remembered = Test-Path -LiteralPath $portFile
        if ($remembered) {
            $saved = 0
            if (![int]::TryParse([IO.File]::ReadAllText($portFile).Trim(), [ref]$saved) -or $saved -lt 1 -or $saved -gt 65535) { Fail 18 'The saved server port is invalid. Restore recomp-profile/port from your backup to keep the same save address.' }
            $port = $saved
        }
        if ($remembered -and (Listening $port)) {
            $own = Own-Server $port
            if (!$own) { Fail 13 "Star Command is already running, or port $port is in use by another program." }
            if ($sourceId -and $own.copy -cne $sourceId) { Fail 13 'Close the running game before selecting a different original copy, then retry.' }
            $code = 17
            if (!$skip) { Start-Process -FilePath $exe -ArgumentList (App-Args (Launch-Url $port $own.source $own.copy) $profile); Remember-Browser $choiceFile $exe }
            $code = 0
            exit 0
        }
    }
    $code = 15
    if ($src) {
        $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
        $bytes = New-Object byte[] 32
        try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
        $token = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
        $sourcePath = '/byoc-source/' + $token
    }
    $code = 19
    if ($fixed -and !$skip) { Watch-Windows }
    $code = 14
    $srv = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback, $port)
    $srv.Server.ExclusiveAddressUse = $true
    try { $srv.Start() } catch [Net.Sockets.SocketException] {
        $srv.Stop()
        if ($remembered) { Fail 13 "Star Command is already running, or port $port is in use by another program." }
        if ($fixed) {
            if (Own-Server $port 'server') { exit 0 }
            if (Listening $port) { Fail 13 "Another program is using port $port. Close it and retry." }
            throw
        }
        $srv = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback, 0)
        $srv.Server.ExclusiveAddressUse = $true
        $srv.Start()
    }
    $port = $srv.LocalEndpoint.Port
    Write-Output "serving at http://127.0.0.1:$port/"
    if ($launch) {
        $code = 16
        if (!$remembered) {
            try { $record = [IO.File]::Open($portFile, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None) }
            catch [IO.IOException] {
                if (Test-Path -LiteralPath $portFile) { Fail 13 'Another Star Command session has already selected the save address. Close the other session, then retry.' }
                throw
            }
            try { $b = [Text.Encoding]::UTF8.GetBytes([string]$port); $record.Write($b, 0, $b.Length) } finally { $record.Dispose() }
        }
        $url = Launch-Url $port $token $sourceId
        $code = 17
        if (!$skip) {
            $browser = Start-Process -FilePath $exe -ArgumentList (App-Args $url $profile) -PassThru
            $browser.Handle | Out-Null
            Remember-Browser $choiceFile $exe
        }
    }
    $state = @{start=[DateTime]::UtcNow;seen=$false;gone=$null}
    $gap = 10; $limit = 120
    if ($test) { $gap = $test; $limit = $test }
    $seen = $false; $gone = $null; $look = [DateTime]::MinValue
    $code = 19
    while (!$browser -or !$browser.HasExited) {
        if ($fixed -and ([DateTime]::UtcNow - $look).TotalMilliseconds -ge 250) {
            $look = [DateTime]::UtcNow
            $open = if ($skip) { $false } else { [SCWindows]::Open() }
            if (Window-Expired $state $open $look $gap $limit) { break }
        }
        if ($skip -and $test -and !$fixed -and ([DateTime]::UtcNow - $state.start).TotalSeconds -ge $test) { break }
        if ($browser -and ([DateTime]::UtcNow - $look).TotalMilliseconds -ge 1000) {
            $look = [DateTime]::UtcNow; $browser.Refresh()
            if ($browser.MainWindowHandle -ne [IntPtr]::Zero) { $seen = $true; $gone = $null }
            elseif ($seen) { if (!$gone) { $gone = $look } elseif (($look - $gone).TotalSeconds -ge 3) { break } }
        }
        if (!$srv.Pending()) { Start-Sleep -Milliseconds 30; continue }
        $client = $srv.AcceptTcpClient()
        try { Serve $client } catch [IO.IOException] {} catch [Net.Sockets.SocketException] {} finally { $client.Close() }
    }
    $code = 0
    if ($browser) {
        if ($browser.HasExited) {
            $browser.WaitForExit()
            if ($browser.ExitCode -ne 0) { Fail 17 "The browser closed with error $($browser.ExitCode). Restart it, then press Play again." }
        } else {
            & (Join-Path $env:SystemRoot 'System32\taskkill.exe') /PID $browser.Id /T /F | Out-Null
            if ($LASTEXITCODE -ne 0) { Fail 21 'The game browser could not close. Close its remaining processes before starting again.' }
        }
    }
} catch {
    if ($_.Exception.Data.Contains('code')) { $code = [int]$_.Exception.Data['code'] }
    if (!$code) { $code = 1 }
    $reason = $_.Exception.Message
    $prefix = @{14='Could not start the local server. ';15='Could not read the selected game folder. ';16='Could not read or save the browser profile. ';17='Could not start or keep the game browser running. ';19='Could not watch the game window. '}
    if ($launch) {
        try {
            $log = Join-Path (Split-Path $PSScriptRoot -Parent) 'logs'
            [IO.Directory]::CreateDirectory($log) | Out-Null
            $log = Join-Path $log 'launcher.log'
            $line = [DateTime]::UtcNow.ToString('o') + " exit $code " + $prefix[$code] + $reason
            if ((Test-Path -LiteralPath $log) -and (Get-Item -LiteralPath $log).Length -gt 65536) { Set-Content -LiteralPath $log -Value $line } else { Add-Content -LiteralPath $log -Value $line }
        } catch {}
    }
    Show-Error ($prefix[$code] + $reason)
} finally {
    if ($srv) { $srv.Stop() }
    if ($browser) { $browser.Dispose() }
    if ($child) { if ($code -ne 0 -and !$child.HasExited) { $child.Kill(); $child.WaitForExit() }; $child.Dispose() }
}
exit $code
