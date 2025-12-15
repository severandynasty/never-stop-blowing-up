const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Helper function to convert CSV to array of objects with proper quote handling
function parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    
    return lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index] || '';
        });
        return obj;
    });
}

// Helper function to parse a single CSV line handling quotes properly
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i += 2;
            } else {
                // Start or end of quoted field
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === ',' && !inQuotes) {
            // Field separator
            result.push(current.trim());
            current = '';
            i++;
        } else {
            current += char;
            i++;
        }
    }
    
    // Add the last field
    result.push(current.trim());
    
    return result;
}

// Helper function to create a slug from a name
function createSlug(name) {
    return name.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9\-]/g, '')
        .replace(/\-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Build individual abilities compendium
function buildAbilitiesCompendium() {
    console.log('📋 Building abilities compendium...');
    
    const csvPath = path.join(__dirname, '../game_data/abilities.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const abilities = parseCSV(csvContent);
    
    const compendiumEntries = abilities.map((ability, index) => {
        const name = ability['Ability Name'];
        const slug = createSlug(name);
        const iconPath = `systems/never-stop-blowing-up/assets/abilities/${slug}.svg`;
        
        return {
            _id: uuidv4().replace(/-/g, ''),
            name: name,
            type: 'ability',
            img: iconPath,
            system: {
                description: ability['Effect'],
                category: 'individual'
            },
            effects: [],
            flags: {},
            sort: index * 100000,
            ownership: { default: 0 },
            folder: null
        };
    });
    
    // Write compendium entries to .db file (NeDB format)
    const outputPath = path.join(__dirname, '../packs/abilities.db');
    const content = compendiumEntries.map(entry => JSON.stringify(entry)).join('\n');
    fs.writeFileSync(outputPath, content);
    
    console.log(`✅ Created ${compendiumEntries.length} ability entries`);
    return compendiumEntries.length;
}

// Build group abilities compendium (consolidated - individual abilities organized by unlock dice size)
function buildGroupAbilitiesCompendium() {
    console.log('🌟 Building consolidated group abilities compendium...');
    
    const csvPath = path.join(__dirname, '../game_data/group_abilities.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const groupAbilities = parseCSV(csvContent);
    
    // Define dice order for sorting
    const diceOrder = { 'd6': 1, 'd8': 2, 'd10': 3, 'd12': 4, 'd20': 5 };
    
    // Sort abilities by dice requirement then by suite name
    const sortedAbilities = groupAbilities.sort((a, b) => {
        const aDice = a['Group Suite'].match(/d(\d+)/)?.[0] || 'd6';
        const bDice = b['Group Suite'].match(/d(\d+)/)?.[0] || 'd6';
        const aDiceOrder = diceOrder[aDice] || 999;
        const bDiceOrder = diceOrder[bDice] || 999;
        
        if (aDiceOrder !== bDiceOrder) {
            return aDiceOrder - bDiceOrder;
        }
        
        // If same dice requirement, sort by suite name
        const aSuite = a['Group Suite'].split(' (')[0];
        const bSuite = b['Group Suite'].split(' (')[0];
        return aSuite.localeCompare(bSuite);
    });
    
    const compendiumEntries = sortedAbilities.map((ability, index) => {
        const suiteName = ability['Group Suite'].split(' (')[0]; // Remove unlock requirement from name
        const abilityName = ability['Ability Name'];
        const unlockRequirement = ability['Group Suite'].match(/\(([^)]+)\)/)?.[1] || '';
        const diceRequirement = ability['Group Suite'].match(/d(\d+)/)?.[0] || 'd6';
        
        // Create simple numeric sort prefix based on dice order and index
        const diceOrderNumber = diceOrder[diceRequirement] || 999;
        const sortPrefix = diceOrderNumber * 10 + (index % 10);
        
        const suiteSlug = createSlug(suiteName);
        const abilitySlug = createSlug(abilityName);
        const fileName = `${suiteSlug}-${abilitySlug}.svg`;
        const iconPath = `systems/never-stop-blowing-up/assets/individual-group-abilities/${fileName}`;
        
        return {
            _id: uuidv4().replace(/-/g, ''),
            name: `${sortPrefix} ${suiteName}: ${abilityName}`,
            type: 'group-ability',
            img: iconPath,
            system: {
                description: ability['Effect'],
                groupSuite: suiteName,
                unlockRequirement: unlockRequirement,
                diceRequirement: diceRequirement,
                category: 'group',
                originalName: `${suiteName}: ${abilityName}` // Store the clean name for display
            },
            effects: [],
            flags: {},
            sort: index * 100000,
            ownership: { default: 0 },
            folder: null
        };
    });
    
    // Write compendium entries to .db file (NeDB format)
    const outputPath = path.join(__dirname, '../packs/group-abilities.db');
    const content = compendiumEntries.map(entry => JSON.stringify(entry)).join('\n');
    fs.writeFileSync(outputPath, content);
    
    console.log(`✅ Created ${compendiumEntries.length} group ability entries (organized by dice requirement)`);
    return compendiumEntries.length;
}

// Main execution
function main() {
    console.log('🎬 Building NSBU Compendiums with Icons...\n');
    
    try {
        const abilitiesCount = buildAbilitiesCompendium();
        const groupAbilitiesCount = buildGroupAbilitiesCompendium();
        
        console.log('\n🎯 Compendium Build Complete!');
        console.log(`📋 Individual Abilities: ${abilitiesCount}`);
        console.log(`🌟 Group Abilities (by dice requirement): ${groupAbilitiesCount}`);
        console.log(`💥 Total: ${abilitiesCount + groupAbilitiesCount} entries`);
        
        console.log('\n📂 Icon Paths Used:');
        console.log('   Individual: systems/never-stop-blowing-up/assets/abilities/*.svg');
        console.log('   Group Abilities: systems/never-stop-blowing-up/assets/individual-group-abilities/*.svg');
        
    } catch (error) {
        console.error('❌ Error building compendiums:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { buildAbilitiesCompendium, buildGroupAbilitiesCompendium, main };