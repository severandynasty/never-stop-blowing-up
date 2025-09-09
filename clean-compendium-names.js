const fs = require('fs');

// Read the current group abilities
const groupAbilitiesPath = './packs/group-abilities.db';
const data = fs.readFileSync(groupAbilitiesPath, 'utf8');
const lines = data.trim().split('\n');

console.log(`Processing ${lines.length} group abilities...`);

// Parse all abilities
const abilities = lines.map(line => JSON.parse(line));

let updated = 0;

// Update each ability to move the sort prefix to a separate field and clean the display name
abilities.forEach(ability => {
  // Check if the name has a numeric prefix like "1_Criminal Conspiracy (d6) - Hot"
  const match = ability.name.match(/^(\d+)_(.+)$/);
  
  if (match) {
    const sortPrefix = match[1];
    const cleanName = match[2];
    
    // Update the display name to be clean
    ability.name = cleanName;
    
    // Store the sort prefix in a custom field for reference
    ability.system.sortPrefix = sortPrefix;
    
    updated++;
    console.log(`✓ Cleaned: ${cleanName}`);
  }
});

// Sort by the sort prefix we stored, maintaining the correct order
abilities.sort((a, b) => {
  const aSortPrefix = parseInt(a.system.sortPrefix || '999');
  const bSortPrefix = parseInt(b.system.sortPrefix || '999');
  
  if (aSortPrefix !== bSortPrefix) {
    return aSortPrefix - bSortPrefix;
  }
  
  // If same sort prefix, sort by name
  return a.name.localeCompare(b.name);
});

// Update sort values to maintain order
abilities.forEach((ability, index) => {
  ability.sort = index * 100;
});

// Write back to file
const output = abilities.map(ability => JSON.stringify(ability)).join('\n') + '\n';
fs.writeFileSync(groupAbilitiesPath, output);

console.log(`\n✅ Updated ${updated} group ability names`);
console.log('✅ Prefixes removed from display names');
console.log('✅ Sort order preserved using sortPrefix field');
console.log('✅ Compendium will now show clean names');

// Show the new order
console.log('\nFirst 6 abilities:');
abilities.slice(0, 6).forEach(ability => {
  console.log(`  - ${ability.name} (sort: ${ability.system.sortPrefix})`);
});

console.log('\nLast 3 abilities:');
abilities.slice(-3).forEach(ability => {
  console.log(`  - ${ability.name} (sort: ${ability.system.sortPrefix})`);
});
