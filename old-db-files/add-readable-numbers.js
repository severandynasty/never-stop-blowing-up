const fs = require('fs');

// Define the proper die order with readable numbers
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

// Update each ability to add readable number prefix
abilities.forEach(ability => {
  const dieRequirement = ability.system.dieRequirement;
  const currentName = ability.name;
  
  // Check if name already has a number prefix
  if (!currentName.match(/^\d\s/)) {
    const sortNumber = dieOrderMap[dieRequirement];
    if (sortNumber) {
      ability.name = `${sortNumber} ${currentName}`;
      updated++;
      console.log(`✓ ${ability.name}`);
    }
  }
});

// Sort by the new names (which now start with numbers)
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

console.log(`\n✅ Updated ${updated} group ability names with readable numbers`);
console.log('✅ Format: "1 Criminal Conspiracy (d6) - Hot"');
console.log('✅ Compendium will sort correctly by number');

// Show the new order
console.log('\nFirst 6 abilities:');
abilities.slice(0, 6).forEach(ability => {
  console.log(`  - ${ability.name}`);
});

console.log('\nLast 3 abilities:');
abilities.slice(-3).forEach(ability => {
  console.log(`  - ${ability.name}`);
});
