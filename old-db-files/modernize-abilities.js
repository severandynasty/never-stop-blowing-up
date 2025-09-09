const fs = require('fs');
const path = require('path');

// Helper function to generate a proper Foundry ID (16 characters)
function generateFoundryId() {
  return Array.from({length: 16}, () => Math.random().toString(36)[2] || '0').join('');
}

// Helper function to detect frequency from description text
function detectFrequency(description) {
  if (description.includes('(Once Per Episode)')) {
    return 'Once Per Episode';
  } else if (description.includes('(GM\'s Discretion)')) {
    return 'GM\'s Discretion';
  }
  return 'Passive';
}

// Helper function to clean description text
function cleanDescription(description) {
  // Fix the "Leap of Faith" corruption issue
  if (description.includes('Neck Snapper Roll a Brawl Check')) {
    // Split on the corruption and take only the first part
    return description.split('Neck Snapper Roll a Brawl Check')[0].trim();
  }
  
  return description
    .replace(/\(Once Per Episode\)\s*/g, '')
    .replace(/\(GM's Discretion\)\s*/g, '')
    .trim();
}

// Helper function to categorize abilities by type
function categorizeAbility(name, description) {
  const lowerName = name.toLowerCase();
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('lower the dc') && lowerDesc.includes('sneak')) {
    return 'Stealth';
  } else if (lowerDesc.includes('lower the dc') && lowerDesc.includes('hot')) {
    return 'Social';
  } else if (lowerDesc.includes('lower the dc') && lowerDesc.includes('weapons')) {
    return 'Combat';
  } else if (lowerDesc.includes('lower the dc') && lowerDesc.includes('tough')) {
    return 'Defense';
  } else if (lowerDesc.includes('lower the dc') && lowerDesc.includes('drive')) {
    return 'Vehicle';
  } else if (lowerDesc.includes('lower the dc') && lowerDesc.includes('tech')) {
    return 'Technology';
  } else if (lowerDesc.includes('lower the dc') && lowerDesc.includes('wits')) {
    return 'Mental';
  } else if (lowerDesc.includes('lower the dc') && lowerDesc.includes('stunts')) {
    return 'Physical';
  } else if (lowerDesc.includes('lower the dc') && lowerDesc.includes('brawl')) {
    return 'Melee';
  } else if (lowerDesc.includes('turbo token')) {
    return 'Token';
  } else if (lowerName.includes('wild card')) {
    return 'Special';
  } else {
    return 'Utility';
  }
}

// Read the existing abilities.db file
const abilitiesPath = path.join(__dirname, 'packs', 'abilities.db');
const abilitiesContent = fs.readFileSync(abilitiesPath, 'utf-8');

// Parse each line as JSON
const lines = abilitiesContent.split('\n').filter(line => line.trim());
const existingAbilities = [];
const seenIds = new Set();

lines.forEach(line => {
  try {
    const ability = JSON.parse(line);
    // Remove duplicates by checking ID
    if (!seenIds.has(ability._id)) {
      seenIds.add(ability._id);
      existingAbilities.push(ability);
    } else {
      console.log(`Removing duplicate: ${ability.name} (${ability._id})`);
    }
  } catch (error) {
    console.error('Error parsing line:', line, error);
  }
});

console.log(`Found ${existingAbilities.length} unique abilities (removed ${lines.length - existingAbilities.length} duplicates)`);

// Clean and modernize the abilities
const modernizedAbilities = existingAbilities.map((ability, index) => {
  const cleanedDescription = cleanDescription(ability.system.description || '');
  const frequency = detectFrequency(ability.system.description || '');
  const category = categorizeAbility(ability.name, cleanedDescription);
  
  // Create a better display name with category
  const displayName = `[${category}] ${ability.name}`;
  
  return {
    _id: ability._id || generateFoundryId(),
    name: displayName,
    type: "upgrade",
    img: "icons/svg/book.svg",
    system: {
      originalName: ability.name,
      description: cleanedDescription,
      frequency: frequency,
      category: category,
      // Keep legacy fields for compatibility
      bonus: "",
      appliesTo: ""
    },
    effects: [],
    folder: null,
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

// Sort abilities by category, then by name
const categoryOrder = [
  'Combat', 'Melee', 'Defense', 'Physical', 'Stealth', 
  'Social', 'Mental', 'Technology', 'Vehicle', 
  'Token', 'Utility', 'Special'
];

modernizedAbilities.sort((a, b) => {
  const categoryA = categoryOrder.indexOf(a.system.category);
  const categoryB = categoryOrder.indexOf(b.system.category);
  
  if (categoryA !== categoryB) {
    return categoryA - categoryB;
  }
  
  return a.system.originalName.localeCompare(b.system.originalName);
});

// Update sort values after sorting
modernizedAbilities.forEach((ability, index) => {
  ability.sort = index * 100;
});

// Write the cleaned abilities back to the file
const outputPath = path.join(__dirname, 'packs', 'abilities.db');
const jsonContent = modernizedAbilities.map(item => JSON.stringify(item)).join('\n');
fs.writeFileSync(outputPath, jsonContent, 'utf-8');

console.log(`Modernized ${modernizedAbilities.length} abilities with category organization`);
console.log(`Total entries written to: ${outputPath}`);

// Log the categories found
console.log('\nAbilities by category:');
categoryOrder.forEach(category => {
  const itemCount = modernizedAbilities.filter(ability => ability.system.category === category).length;
  if (itemCount > 0) {
    console.log(`- ${category}: ${itemCount} abilities`);
  }
});

console.log('\nFrequencies found:');
const frequencies = [...new Set(modernizedAbilities.map(ability => ability.system.frequency))];
console.log(frequencies);

console.log('\nSample modernized abilities:');
modernizedAbilities.slice(0, 6).forEach(ability => {
  console.log(`"${ability.name}": "${ability.system.description}"`);
});

console.log('\nFixed issues:');
const fixedAbilities = modernizedAbilities.filter(ability => 
  ability.system.originalName === 'Leap of Faith'
);
if (fixedAbilities.length > 0) {
  console.log('- Fixed "Leap of Faith" corruption');
}

console.log('\nTotal entries in file:', modernizedAbilities.length);
