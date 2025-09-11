# PowerShell script to replace dice rolling handlers
$filePath = "c:\Users\bkeller\OneDrive - Ellucian Company L.P\Desktop\never-stop-blowing-up\scripts\nsbu.js"
$content = Get-Content $filePath -Raw

# Replace the toMessage calls with direct value extraction
$content = $content -replace 'await roll\.toMessage\(\{flavor: `\$\{stat\.toUpperCase\(\)\} roll \(d\$\{currentDie\}\)`\}\);', ''

# Replace rolls.push(value) with rolls.push({value: value, die: currentDie})
$content = $content -replace 'rolls\.push\(value\);', 'rolls.push({value: value, die: currentDie});'

# Add originalDieIdx variable after dieIdx initialization
$content = $content -replace '(if \(dieIdx === -1\) dieIdx = 0;)', '$1`n      const originalDieIdx = dieIdx;'

# Add the createInteractiveDiceRoll call before stat upgrade check
$content = $content -replace '(\} while \(blowUp\);)\s*(\/\/ If the die blew up)', '$1`n      `n      // Create interactive dice roll message`n      await createInteractiveDiceRoll(this.actor, stat, rolls, total, dieIdx, originalDieIdx);`n      `n      $2'

# Fix the stat upgrade check to use originalDieIdx
$content = $content -replace 'if \(dieIdx > dieSteps\.indexOf\(statValue\)\)', 'if (dieIdx > originalDieIdx)'

Set-Content $filePath $content -NoNewline
