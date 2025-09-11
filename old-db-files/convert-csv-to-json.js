const fs = require('fs');
const path = require('path');

// Helper function to generate a unique ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper function to extract die requirement from group suite
function extractDieRequirement(groupSuite) {
  const match = groupSuite.match(/d(\d+)/);
  return match ? `d${match[1]}` : '';
}

// Helper function to clean group name for folder
function getGroupFolder(groupSuite) {
  return groupSuite.replace(/ \(Unlocked at d\d+\)/, '').trim();
}

// Helper function to detect frequency from effect text
function detectFrequency(effect) {
  if (effect.includes('(Once Per Episode)')) {
    return 'Once Per Episode';
  } else if (effect.includes('(Minimum 3 People)')) {
    return 'Minimum 3 People';
  } else if (effect.includes('(On a Nat 20)')) {
    return 'On a Nat 20';
  } else if (effect.includes('(On a Nat 1)')) {
    return 'On a Nat 1';
  }
  return 'Passive';
}

// Helper function to clean effect text
function cleanEffect(effect) {
  return effect
    .replace(/\(Once Per Episode\)\s*/g, '')
    .replace(/\(Minimum 3 People\)\s*/g, '')
    .replace(/\(On a Nat 20\)\s*/g, '')
    .replace(/\(On a Nat 1\)\s*/g, '')
    .trim();
}

// Read the CSV file
const csvPath = path.join(__dirname, 'group_abilities.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV
const lines = csvContent.split('\n').filter(line => line.trim());
const headers = lines[0].split(',');
const data = lines.slice(1).map(line => {
  // Simple CSV parsing (assuming no commas in quoted strings for now)
  const parts = line.split(',');
  return {
    groupSuite: parts[0]?.trim(),
    name: parts[1]?.trim(),
    effect: parts[2]?.trim()
  };
});

// Convert to Foundry JSON format
const foundryItems = data.map(item => {
  const cleanedEffect = cleanEffect(item.effect);
  const frequency = detectFrequency(item.effect);
  const dieRequirement = extractDieRequirement(item.groupSuite);
  const folder = getGroupFolder(item.groupSuite);
  
  return {
    _id: generateId(),
    name: item.name,
    type: "group-ability",
    system: {
      groupSuite: item.groupSuite,
      dieRequirement: dieRequirement,
      effect: cleanedEffect,
      frequency: frequency,
      folder: folder
    },
    img: "icons/svg/item-bag.svg",
    effects: [],
    flags: {},
    sort: 0,
    ownership: {
      default: 0
    }
  };
});

// Group by folder for easier organization
const groupedItems = {};
foundryItems.forEach(item => {
  const folder = item.system.folder;
  if (!groupedItems[folder]) {
    groupedItems[folder] = [];
  }
  groupedItems[folder].push(item);
});

// Create the packs directory if it doesn't exist
const packsDir = path.join(__dirname, 'packs');
if (!fs.existsSync(packsDir)) {
  fs.mkdirSync(packsDir);
}

// Write the JSON file
const outputPath = path.join(packsDir, 'group-abilities.json');
fs.writeFileSync(outputPath, JSON.stringify(foundryItems, null, 2), 'utf-8');

console.log(`Converted ${foundryItems.length} group abilities to JSON format`);
console.log(`Output written to: ${outputPath}`);

// Log the groups found
console.log('\nGroups found:');
Object.keys(groupedItems).forEach(folder => {
  console.log(`- ${folder}: ${groupedItems[folder].length} abilities`);
});

console.log('\nDie requirements found:');
const dieTypes = [...new Set(foundryItems.map(item => item.system.dieRequirement))];
console.log(dieTypes.sort());

console.log('\nFrequencies found:');
const frequencies = [...new Set(foundryItems.map(item => item.system.frequency))];
console.log(frequencies);
