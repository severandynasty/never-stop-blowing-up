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

// Proper CSV parser that handles quoted strings with commas
function parseCSV(csvContent) {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const result = [];
  
  for (let i = 1; i < lines.length; i++) { // Skip header
    const line = lines[i];
    const columns = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        columns.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    columns.push(current.trim()); // Add the last column
    
    if (columns.length >= 3) {
      result.push({
        groupSuite: columns[0],
        name: columns[1],
        effect: columns[2]
      });
    }
  }
  
  return result;
}

// Read the CSV file
const csvPath = path.join(__dirname, 'group_abilities.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// Parse CSV properly
const data = parseCSV(csvContent);

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

// Create the packs directory if it doesn't exist
const packsDir = path.join(__dirname, 'packs');
if (!fs.existsSync(packsDir)) {
  fs.mkdirSync(packsDir);
}

// Write as .db file (which Foundry expects, but with JSON content)
const outputPath = path.join(packsDir, 'group-abilities.db');
const jsonContent = foundryItems.map(item => JSON.stringify(item)).join('\n');
fs.writeFileSync(outputPath, jsonContent, 'utf-8');

console.log(`Converted ${foundryItems.length} group abilities to .db format`);
console.log(`Output written to: ${outputPath}`);

// Log the groups found
const groupedItems = {};
foundryItems.forEach(item => {
  const folder = item.system.folder;
  if (!groupedItems[folder]) {
    groupedItems[folder] = [];
  }
  groupedItems[folder].push(item);
});

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

// Show a sample of the parsed data to verify
console.log('\nSample parsed data:');
foundryItems.slice(0, 3).forEach(item => {
  console.log(`${item.name}: "${item.system.effect}"`);
});
