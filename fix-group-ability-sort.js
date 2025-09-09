const fs = require('fs');

// Define the proper die order
const dieOrder = ['d6', 'd8', 'd10', 'd12', 'd20'];

// Read the current group abilities
const groupAbilitiesPath = './packs/group-abilities.db';
const data = fs.readFileSync(groupAbilitiesPath, 'utf8');
const lines = data.trim().split('\n');

console.log(`Processing ${lines.length} group abilities...`);

// Parse all abilities
const abilities = lines.map(line => JSON.parse(line));

// Sort by die progression, then by group name, then by ability name
abilities.sort((a, b) => {
  // Extract die requirement from the name [d6] format
  const aDie = a.name.match(/\[([^\]]+)\]/)?.[1] || '';
  const bDie = b.name.match(/\[([^\]]+)\]/)?.[1] || '';
  
  // Get die order indices
  const aDieIndex = dieOrder.indexOf(aDie);
  const bDieIndex = dieOrder.indexOf(bDie);
  
  // If die sizes are different, sort by die progression
  if (aDieIndex !== bDieIndex) {
    return aDieIndex - bDieIndex;
  }
  
  // If same die size, sort by group name
  const aGroup = a.system.groupSuite || '';
  const bGroup = b.system.groupSuite || '';
  
  if (aGroup !== bGroup) {
    return aGroup.localeCompare(bGroup);
  }
  
  // If same group, sort by ability name
  const aName = a.system.originalName || a.name;
  const bName = b.system.originalName || b.name;
  return aName.localeCompare(bName);
});

// Update sort values to maintain order
abilities.forEach((ability, index) => {
  ability.sort = index * 100;
});

// Write back to file
const output = abilities.map(ability => JSON.stringify(ability)).join('\n') + '\n';
fs.writeFileSync(groupAbilitiesPath, output);

console.log('✅ Group abilities sorted by die progression:');
console.log('   d6 → d8 → d10 → d12 → d20');

// Show the new order
const dieGroups = {};
abilities.forEach(ability => {
  const die = ability.name.match(/\[([^\]]+)\]/)?.[1] || 'unknown';
  if (!dieGroups[die]) dieGroups[die] = [];
  dieGroups[die].push(ability.system.originalName || ability.name);
});

dieOrder.forEach(die => {
  if (dieGroups[die]) {
    console.log(`\n${die}: ${dieGroups[die].length} abilities`);
    dieGroups[die].forEach((name, idx) => {
      if (idx < 3) console.log(`  - ${name}`);
      else if (idx === 3) console.log(`  ... and ${dieGroups[die].length - 3} more`);
    });
  }
});
