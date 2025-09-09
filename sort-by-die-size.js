const fs = require('fs');
const path = require('path');

// Helper function to generate a proper Foundry ID (16 characters)
function generateFoundryId() {
  return Array.from({length: 16}, () => Math.random().toString(36)[2] || '0').join('');
}

// Helper function to extract die requirement from group suite
function extractDieRequirement(groupSuite) {
  const match = groupSuite.match(/d(\d+)/);
  return match ? `d${match[1]}` : '';
}

// Helper function to get numeric die value for sorting
function getDieValue(groupSuite) {
  const match = groupSuite.match(/d(\d+)/);
  return match ? parseInt(match[1]) : 0;
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

// Sort data by die size first, then by group name, then by ability name
data.sort((a, b) => {
  const dieValueA = getDieValue(a.groupSuite);
  const dieValueB = getDieValue(b.groupSuite);
  
  // First sort by die size
  if (dieValueA !== dieValueB) {
    return dieValueA - dieValueB;
  }
  
  // If same die size, sort by group name
  const folderA = getGroupFolder(a.groupSuite);
  const folderB = getGroupFolder(b.groupSuite);
  if (folderA !== folderB) {
    return folderA.localeCompare(folderB);
  }
  
  // If same group, sort by ability name
  return a.name.localeCompare(b.name);
});

// Convert to Foundry JSON format with die size in the naming
const foundryItems = data.map((item, index) => {
  const cleanedEffect = cleanEffect(item.effect);
  const frequency = detectFrequency(item.effect);
  const dieRequirement = extractDieRequirement(item.groupSuite);
  const folder = getGroupFolder(item.groupSuite);
  
  // Create a clear display name that includes the die size and group
  const displayName = `[${dieRequirement}] ${folder} - ${item.name}`;
  
  return {
    _id: generateFoundryId(),
    name: displayName,
    type: "group-ability",
    img: "icons/svg/item-bag.svg",
    system: {
      originalName: item.name,
      groupSuite: item.groupSuite,
      dieRequirement: dieRequirement,
      effect: cleanedEffect,
      frequency: frequency,
      folder: folder,
      description: cleanedEffect // Add description field for compatibility
    },
    effects: [],
    folder: null, // No folder references since Foundry compendiums don't support them well
    sort: index * 100,
    ownership: {
      default: 0
    },
    flags: {},
    _stats: {
      systemId: "never-stop-blowing-up",
      systemVersion: "1.0.0",
      coreVersion: "12.343",
      createdTime: Date.now(),
      modifiedTime: Date.now(),
      lastModifiedBy: "foundryUser"
    }
  };
});

// Create the packs directory if it doesn't exist
const packsDir = path.join(__dirname, 'packs');
if (!fs.existsSync(packsDir)) {
  fs.mkdirSync(packsDir);
}

// Write as .db file (items sorted by die size)
const outputPath = path.join(packsDir, 'group-abilities.db');
const jsonContent = foundryItems.map(item => JSON.stringify(item)).join('\n');
fs.writeFileSync(outputPath, jsonContent, 'utf-8');

console.log(`Created ${foundryItems.length} group abilities sorted by die size`);
console.log(`Total entries written to: ${outputPath}`);

// Log the groups found organized by die size
console.log('\nItems created by die size and group:');
const dieTypes = ['d6', 'd8', 'd10', 'd12', 'd20'];
dieTypes.forEach(dieType => {
  const itemsForDie = foundryItems.filter(item => item.system.dieRequirement === dieType);
  if (itemsForDie.length > 0) {
    console.log(`\n${dieType.toUpperCase()} Groups:`);
    
    // Group by folder within each die type
    const groupsForDie = {};
    itemsForDie.forEach(item => {
      const group = item.system.folder;
      if (!groupsForDie[group]) {
        groupsForDie[group] = [];
      }
      groupsForDie[group].push(item);
    });
    
    Object.keys(groupsForDie).forEach(group => {
      console.log(`  - ${group}: ${groupsForDie[group].length} abilities`);
    });
  }
});

console.log('\nFrequencies found:');
const frequencies = [...new Set(foundryItems.map(item => item.system.frequency))];
console.log(frequencies);

console.log('\nSample items with new die-based naming:');
foundryItems.slice(0, 9).forEach(item => {
  console.log(`"${item.name}"`);
});

console.log('\nTotal entries in file:', foundryItems.length);
