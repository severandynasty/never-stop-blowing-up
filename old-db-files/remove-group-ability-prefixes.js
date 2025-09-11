const fs = require('fs');

// Define the proper die order for verification
const dieOrder = ['d6', 'd8', 'd10', 'd12', 'd20'];

// Read the current group abilities
const groupAbilitiesPath = './packs/group-abilities.db';
const data = fs.readFileSync(groupAbilitiesPath, 'utf8');
const lines = data.trim().split('\n');

console.log(`Processing ${lines.length} group abilities...`);

// Parse all abilities
const abilities = lines.map(line => JSON.parse(line));

let updated = 0;

// Update each ability to move die size after the group name
abilities.forEach(ability => {
  // Check if the name is in current format: "Group - Ability (die)"
  const currentMatch = ability.name.match(/^(.+?)\s*-\s*(.+?)\s*\(([^)]+)\)$/);
  
  if (currentMatch) {
    const groupName = currentMatch[1];
    const abilityName = currentMatch[2];
    const dieRequirement = currentMatch[3];
    
    // Format as "Group (die) - Ability"
    ability.name = `${groupName} (${dieRequirement}) - ${abilityName}`;
    
    // Ensure the die requirement is properly stored in system data
    if (!ability.system.dieRequirement) {
      ability.system.dieRequirement = dieRequirement;
    }
    
    updated++;
    console.log(`✓ ${ability.name}`);
  } else {
    // Check if the name has the old die prefix format like [d6] Criminal Conspiracy - Hot
    const oldMatch = ability.name.match(/^\[([^\]]+)\]\s*(.+)$/);
    
    if (oldMatch) {
      const dieRequirement = oldMatch[1];
      const nameWithoutDie = oldMatch[2];
      
      // Split the name to get group and ability parts
      // Expected format: "Group Name - Ability Name"
      const parts = nameWithoutDie.split(' - ');
      if (parts.length >= 2) {
        const groupName = parts[0];
        const abilityName = parts.slice(1).join(' - '); // In case ability name has dashes
        
        // Format as "Group Name (die) - Ability Name"
        ability.name = `${groupName} (${dieRequirement}) - ${abilityName}`;
      } else {
        // Fallback if format doesn't match expected pattern
        ability.name = `${nameWithoutDie} (${dieRequirement})`;
      }
      
      // Ensure the die requirement is properly stored in system data
      if (!ability.system.dieRequirement) {
        ability.system.dieRequirement = dieRequirement;
      }
      
      updated++;
      console.log(`✓ ${ability.name}`);
    }
  }
});

// Re-sort by die progression to ensure proper order
abilities.sort((a, b) => {
  // Get die requirements
  const aDie = a.system.dieRequirement || '';
  const bDie = b.system.dieRequirement || '';
  
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

console.log(`\n✅ Updated ${updated} group ability names`);
console.log('✅ Die sizes moved after group names');
console.log('✅ Format: "Group Name (die) - Ability Name"');
console.log('✅ Sort order maintained by die progression');

// Show the new order
const dieGroups = {};
abilities.forEach(ability => {
  const die = ability.system.dieRequirement || 'unknown';
  if (!dieGroups[die]) dieGroups[die] = [];
  dieGroups[die].push(ability.name);
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
