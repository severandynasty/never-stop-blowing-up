# PowerShell script to fix formatting issues
$filePath = "c:\Users\bkeller\OneDrive - Ellucian Company L.P\Desktop\never-stop-blowing-up\scripts\nsbu.js"
$content = Get-Content $filePath -Raw

# Fix the newline characters that got encoded
$content = $content -replace '`n', "`n"

Set-Content $filePath $content -NoNewline
