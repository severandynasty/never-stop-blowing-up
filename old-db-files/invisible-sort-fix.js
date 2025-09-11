const fs = require('fs');

// Define invisible Unicode characters for sorting (Zero Width Space variations)
const dieOrderMap = {
  'd6': '\u200B',      // Zero Width Space (1 character)
  'd8': '\u200B\u200B', // Two Zero Width Spaces  
  'd10': '\u200B\u200B\u200B', // Three Zero Width Spaces
  'd12': '\u200B\u200B\u200B\u200B', // Four Zero Width Spaces
  'd20': '\u200B\u200B\u200B\u200B\u200B' // Five Zero Width Spaces
};

// Read the current group abilities
const groupAbilitiesPath = './packs/group-abilities.db';
const data = fs.readFileSync(groupAbilitiesPath, 'utf8');
const lines = data.trim().split('\n');

console.log(`Processing ${lines.length} group abilities...`);

// Parse all abilities
const abilities = lines.map(line => JSON.parse(line));

let updated = 0;

// First, remove any existing numeric prefixes
abilities.forEach(ability => {
  if (ability.name.match(/^\d{2}_/)) {
    ability.name = ability.name.replace(/^\d{2}_/, '');
    console.log(`Removed prefix from: ${ability.name}`);
  }
});

// Update each ability to add invisible prefix for forced sorting
abilities.forEach(ability => {
  const dieRequirement = ability.system.dieRequirement;
  const currentName = ability.name;
  
  // Check if name already has invisible prefix (check for zero-width space at start)
  if (!currentName.startsWith('\u200B')) {
    const sortPrefix = dieOrderMap[dieRequirement];
    if (sortPrefix) {
      ability.name = `${sortPrefix}${currentName}`;
      updated++;
      console.log(`✓ Added invisible sort prefix to: ${currentName}`);
    }
  }
});

// Sort by the new names (which now have invisible prefixes)
abilities.sort((a, b) => {
  return a.name.localeCompare(b.name);
});

// Update sort values to maintain order
abilities.forEach((ability, index) => {
  ability.sort = index * 100;
});

// Write back to file
const output = abilities.map(ability => JSON.stringify(ability)).join('\n') + '\n';
fs.writeFileSync(groupAbilitiesPath, output);

console.log(`\n✅ Updated ${updated} group ability names with invisible sort prefixes`);
console.log('✅ Invisible Unicode characters force correct sort order');
console.log('✅ Names appear unchanged but sort correctly');

// Show the new order
const dieGroups = {};
abilities.forEach(ability => {
  const die = ability.system.dieRequirement || 'unknown';
  if (!dieGroups[die]) dieGroups[die] = [];
  // Remove invisible characters for display
  const displayName = ability.name.replace(/[\u200B]/g, '');
  dieGroups[die].push(displayName);
});

['d6', 'd8', 'd10', 'd12', 'd20'].forEach(die => {
  if (dieGroups[die]) {
    console.log(`\n${die}: ${dieGroups[die].length} abilities`);
    dieGroups[die].forEach((name, idx) => {
      if (idx < 2) console.log(`  - ${name}`);
      else if (idx === 2) console.log(`  ... and ${dieGroups[die].length - 2} more`);
    });
  }
});
