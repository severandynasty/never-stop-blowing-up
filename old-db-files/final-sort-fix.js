const fs = require('fs');

// Define the proper die order with simple numeric prefixes
const dieOrderMap = {
  'd6': '1',
  'd8': '2', 
  'd10': '3',
  'd12': '4',
  'd20': '5'
};

// Read the current group abilities
const groupAbilitiesPath = './packs/group-abilities.db';
const data = fs.readFileSync(groupAbilitiesPath, 'utf8');
const lines = data.trim().split('\n');

console.log(`Processing ${lines.length} group abilities...`);

// Parse all abilities
const abilities = lines.map(line => JSON.parse(line));

let updated = 0;

// First, remove any existing prefixes (invisible characters or numeric)
abilities.forEach(ability => {
  // Remove invisible Unicode characters
  ability.name = ability.name.replace(/[\u200B]/g, '');
  
  // Remove numeric prefixes if they exist
  if (ability.name.match(/^\d{1,2}_/)) {
    ability.name = ability.name.replace(/^\d{1,2}_/, '');
  }
});

// Update each ability to add simple numeric prefix for forced sorting
abilities.forEach(ability => {
  const dieRequirement = ability.system.dieRequirement;
  const currentName = ability.name;
  
  const sortPrefix = dieOrderMap[dieRequirement];
  if (sortPrefix && !currentName.startsWith(sortPrefix + '_')) {
    ability.name = `${sortPrefix}_${currentName}`;
    updated++;
    console.log(`✓ ${ability.name}`);
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
console.log('✅ Format: "1_Criminal Conspiracy (d6) - Hot"');
console.log('✅ Template will display clean names by stripping prefixes');

// Show the new order
const dieGroups = {};
abilities.forEach(ability => {
  const die = ability.system.dieRequirement || 'unknown';
  if (!dieGroups[die]) dieGroups[die] = [];
  dieGroups[die].push(ability.name);
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
