const fs = require('fs');

// Read the current abilities
const abilitiesPath = './packs/abilities.db';
const data = fs.readFileSync(abilitiesPath, 'utf8');
const lines = data.trim().split('\n');

console.log(`Processing ${lines.length} abilities...`);

// Parse all abilities
const abilities = lines.map(line => JSON.parse(line));

let updated = 0;

// Update each ability to remove category prefix from name
abilities.forEach(ability => {
  // Check if the name has a category prefix like [Combat] Duelist
  const match = ability.name.match(/^\[([^\]]+)\]\s*(.+)$/);
  
  if (match) {
    const category = match[1];
    const originalName = match[2];
    
    // Update the name to just be the original name
    ability.name = originalName;
    
    // Make sure we preserve the original name and category in system data
    if (!ability.system.originalName) {
      ability.system.originalName = originalName;
    }
    if (!ability.system.category) {
      ability.system.category = category;
    }
    
    updated++;
    console.log(`✓ ${originalName} (category: ${category})`);
  }
});

// Write back to file
const output = abilities.map(ability => JSON.stringify(ability)).join('\n') + '\n';
fs.writeFileSync(abilitiesPath, output);

console.log(`\n✅ Updated ${updated} ability names`);
console.log('✅ Category prefixes removed from display names');
console.log('✅ Category data preserved in system.category field');
