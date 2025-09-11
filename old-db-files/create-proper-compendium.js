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

// Create folders first - Foundry expects folders to be defined before items
const folders = {};
const folderOrder = [
  'La Familia',
  'Criminal Conspiracy', 
  'Diesel Circus',
  'The Continentals',
  'Alpha Squad',
  'Marauders',
  'The Ones',
  'Tactical Command',
  "Bustin' Makes Me Feel Good"
];

// Create folder entries
folderOrder.forEach((folderName, index) => {
  const folderId = generateFoundryId();
  folders[folderName] = {
    _id: folderId,
    name: folderName,
    type: "Folder",
    description: "",
    parent: null,
    pack: null,
    sort: index * 1000,
    color: null,
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

// Convert to Foundry JSON format
const foundryItems = data.map((item, index) => {
  const cleanedEffect = cleanEffect(item.effect);
  const frequency = detectFrequency(item.effect);
  const dieRequirement = extractDieRequirement(item.groupSuite);
  const folder = getGroupFolder(item.groupSuite);
  const folderId = folders[folder] ? folders[folder]._id : null;
  
  return {
    _id: generateFoundryId(),
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
    sort: (folderOrder.indexOf(folder) * 1000) + index,
    ownership: {
      default: 0
    },
    folder: folderId,
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

// Combine folders and items
const allEntries = [...Object.values(folders), ...foundryItems];

// Create the packs directory if it doesn't exist
const packsDir = path.join(__dirname, 'packs');
if (!fs.existsSync(packsDir)) {
  fs.mkdirSync(packsDir);
}

// Write as .db file (each entry on its own line)
const outputPath = path.join(packsDir, 'group-abilities.db');
const jsonContent = allEntries.map(item => JSON.stringify(item)).join('\n');
fs.writeFileSync(outputPath, jsonContent, 'utf-8');

console.log(`Created ${Object.keys(folders).length} folders and ${foundryItems.length} group abilities`);
console.log(`Total entries written to: ${outputPath}`);

// Log the groups found
console.log('\nFolders created:');
folderOrder.forEach(folder => {
  const itemCount = foundryItems.filter(item => item.system.folder === folder).length;
  console.log(`- ${folder}: ${itemCount} abilities`);
});

console.log('\nDie requirements found:');
const dieTypes = [...new Set(foundryItems.map(item => item.system.dieRequirement))];
console.log(dieTypes.sort());

console.log('\nFrequencies found:');
const frequencies = [...new Set(foundryItems.map(item => item.system.frequency))];
console.log(frequencies);

console.log('\nTotal entries in file:', allEntries.length);
