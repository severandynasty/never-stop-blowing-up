const fs = require('fs');

// Define the proper die order with numeric prefixes for forced sorting
const dieOrderMap = {
  'd6': '01',
  'd8': '02', 
  'd10': '03',
  'd12': '04',
  'd20': '05'
};

// Read the current group abilities
const groupAbilitiesPath = './packs/group-abilities.db';
const data = fs.readFileSync(groupAbilitiesPath, 'utf8');
const lines = data.trim().split('\n');

console.log(`Processing ${lines.length} group abilities...`);

// Parse all abilities
const abilities = lines.map(line => JSON.parse(line));

let updated = 0;

// Update each ability to add numeric prefix for forced sorting
abilities.forEach(ability => {
  const dieRequirement = ability.system.dieRequirement;
  const currentName = ability.name;
  
  // Check if name already has a numeric prefix
  if (!currentName.match(/^\d{2}_/)) {
    const sortPrefix = dieOrderMap[dieRequirement];
    if (sortPrefix) {
      ability.name = `${sortPrefix}_${currentName}`;
      updated++;
      console.log(`✓ ${ability.name}`);
    }
  }
});

// Sort by the new names (which now have numeric prefixes)
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

console.log(`\n✅ Updated ${updated} group ability names with sort prefixes`);
console.log('✅ Numeric prefixes force alphabetical sorting to match die progression');
console.log('✅ Format: "01_Criminal Conspiracy (d6) - Hot"');

// Show the new order
const dieGroups = {};
abilities.forEach(ability => {
  const die = ability.system.dieRequirement || 'unknown';
  if (!dieGroups[die]) dieGroups[die] = [];
  dieGroups[die].push(ability.name);
});

Object.keys(dieOrderMap).forEach(die => {
  if (dieGroups[die]) {
    console.log(`\n${die}: ${dieGroups[die].length} abilities`);
    dieGroups[die].forEach((name, idx) => {
      if (idx < 2) console.log(`  - ${name}`);
      else if (idx === 2) console.log(`  ... and ${dieGroups[die].length - 2} more`);
    });
  }
});
