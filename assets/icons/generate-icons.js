const fs = require('fs');
const path = require('path');

// Import the SVG generator
const SVGIconGenerator = require('./svg-generator.js');

// All abilities from the CSV data with their categories
const ABILITIES = {
    // Combat Abilities
    'Duelist': 'combat',
    'Grit': 'combat', 
    'Martial Artist': 'combat',
    'Menacing': 'combat',
    'Neck Snapper': 'combat',
    'Resilient': 'combat',
    
    // Stealth Abilities
    'Burglar': 'stealth',
    'Escape Artist': 'stealth',
    'Stealthy': 'stealth',
    
    // Social Abilities
    'Smokin\'': 'social',
    'Connected': 'social',
    'Flashy': 'social',
    'By the Book': 'social',
    'Poker Face': 'social',
    'Inspiring': 'social',
    
    // Technology Abilities
    'Hacker': 'tech',
    'Demolitions': 'tech',
    'Hotwire': 'tech',
    
    // Vehicle Abilities
    'Transporter': 'vehicle',
    
    // Token Management
    'Lucky': 'token',
    'Wealthy': 'token',
    'Loyal': 'token',
    'Trainer': 'token',
    
    // Utility Abilities
    'Prepared': 'utility',
    'Trained': 'utility',
    'Studied': 'utility',
    'Mastery': 'utility',
    'Skilled': 'utility',
    'Nerves of Steel': 'utility',
    'Protector': 'utility',
    'Suspicious': 'utility',
    'Leap of Faith': 'utility',
    'Interrogator': 'utility',
    'Wild Card': 'utility',
    'Trouble Maker': 'utility',
    'Relentless': 'utility'
};

// Group abilities by suite
const GROUP_ABILITIES = {
    'La Familia': ['Tough', 'Tokens', 'Skill Die'],
    'Criminal Conspiracy': ['Item', 'Tech', 'Hot'],
    'Diesel Circus': ['Injury Advantage', 'Double Explosion', 'Drive Check'],
    'The Continentals': ['Wits', 'Hot Checks', 'Melee'],
    'Alpha Squad': ['Group Explosion', 'Skill Add', 'Suit Up'],
    'Marauders': ['+10', 'Destroyer', 'Firestarter'],
    'The Ones': ['Max Roll', 'Reroll', 'Turbo Tokens'],
    'Tactical Command': ['Shared Tokens', 'Reroll', 'Token Gain'],
    'Bustin\' Makes Me Feel Good': ['Track Restart', 'Group Explosion', 'GM']
};

// Create abilities directory if it doesn't exist
const abilitiesDir = path.join(__dirname, 'abilities');
const groupAbilitiesDir = path.join(__dirname, 'group-abilities');

if (!fs.existsSync(abilitiesDir)) {
    fs.mkdirSync(abilitiesDir, { recursive: true });
}

if (!fs.existsSync(groupAbilitiesDir)) {
    fs.mkdirSync(groupAbilitiesDir, { recursive: true });
}

// Generate individual ability icons
console.log('🎬 Generating individual ability icons...');
let iconCount = 0;

Object.entries(ABILITIES).forEach(([abilityName, category]) => {
    const svgContent = SVGIconGenerator.generateIcon(abilityName, category);
    const fileName = abilityName.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') + '.svg';
    
    const filePath = path.join(abilitiesDir, fileName);
    fs.writeFileSync(filePath, svgContent);
    
    console.log(`✅ Created: ${fileName}`);
    iconCount++;
});

console.log(`\n🌟 Generated ${iconCount} individual ability icons!`);

// Generate group ability icons (suite icons)
console.log('\n🎬 Generating group ability suite icons...');
let groupIconCount = 0;

Object.keys(GROUP_ABILITIES).forEach(suiteName => {
    const svgContent = SVGIconGenerator.generateGroupIcon(suiteName);
    const fileName = suiteName.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') + '.svg';
    
    const filePath = path.join(groupAbilitiesDir, fileName);
    fs.writeFileSync(filePath, svgContent);
    
    console.log(`✅ Created: ${fileName}`);
    groupIconCount++;
});

console.log(`\n🌟 Generated ${groupIconCount} group ability suite icons!`);

// Generate individual group ability icons
console.log('\n🎬 Generating individual group ability icons...');
const individualGroupAbilitiesDir = path.join(__dirname, 'individual-group-abilities');

if (!fs.existsSync(individualGroupAbilitiesDir)) {
    fs.mkdirSync(individualGroupAbilitiesDir, { recursive: true });
}

let individualGroupIconCount = 0;

Object.entries(GROUP_ABILITIES).forEach(([suiteName, abilities]) => {
    abilities.forEach(abilityName => {
        const svgContent = SVGIconGenerator.generateIndividualGroupAbilityIcon(abilityName, suiteName);
        const fileName = `${suiteName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}-${abilityName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}.svg`;
        
        const filePath = path.join(individualGroupAbilitiesDir, fileName);
        fs.writeFileSync(filePath, svgContent);
        
        console.log(`✅ Created: ${fileName}`);
        individualGroupIconCount++;
    });
});

console.log(`\n🌟 Generated ${individualGroupIconCount} individual group ability icons!`);

// Generate icon index HTML for testing
const indexHTML = generateIconIndex();
fs.writeFileSync(path.join(__dirname, 'icon-gallery.html'), indexHTML);

console.log('\n🎯 Generated icon gallery at icon-gallery.html');
console.log(`\n💥 TOTAL: ${iconCount + groupIconCount + individualGroupIconCount} SVG icons created!`);
console.log(`   📋 Individual Abilities: ${iconCount}`);
console.log(`   🌟 Group Ability Suites: ${groupIconCount}`);
console.log(`   ⭐ Individual Group Abilities: ${individualGroupIconCount}`);

function generateIconIndex() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Never Stop Blowing Up - Icon Gallery</title>
    <style>
        body {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            color: #00bcd4;
            font-family: 'Courier New', monospace;
            padding: 20px;
            min-height: 100vh;
        }
        
        h1 {
            text-align: center;
            font-size: 2.5em;
            text-shadow: 0 0 20px #00bcd4;
            margin-bottom: 40px;
        }
        
        .section {
            margin-bottom: 40px;
            padding: 20px;
            background: rgba(0, 188, 212, 0.05);
            border: 1px solid rgba(0, 188, 212, 0.2);
            border-radius: 10px;
        }
        
        .section-title {
            color: #ffeb3b;
            font-size: 1.5em;
            margin-bottom: 20px;
            text-shadow: 0 0 10px #ffeb3b;
        }
        
        .icon-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 20px;
        }
        
        .icon-item {
            text-align: center;
            padding: 10px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            border: 1px solid rgba(233, 30, 99, 0.3);
            transition: all 0.3s ease;
        }
        
        .icon-item:hover {
            border-color: #e91e63;
            box-shadow: 0 0 15px rgba(233, 30, 99, 0.5);
            transform: scale(1.05);
        }
        
        .icon-name {
            margin-top: 10px;
            font-size: 0.9em;
            color: #c0c0c0;
        }
        
        .category-tag {
            font-size: 0.7em;
            padding: 2px 6px;
            border-radius: 3px;
            margin-top: 5px;
            display: inline-block;
        }
        
        .combat { background: rgba(244, 67, 54, 0.3); }
        .stealth { background: rgba(156, 39, 176, 0.3); }
        .social { background: rgba(233, 30, 99, 0.3); }
        .tech { background: rgba(0, 188, 212, 0.3); }
        .vehicle { background: rgba(255, 152, 0, 0.3); }
        .token { background: rgba(255, 235, 59, 0.3); }
        .utility { background: rgba(76, 175, 80, 0.3); }
        .group { background: linear-gradient(90deg, #e91e63, #00bcd4, #ff9800); }
    </style>
</head>
<body>
    <h1>🎬 NEVER STOP BLOWING UP 💥</h1>
    
    <div class="section">
        <div class="section-title">⚔️ Individual Abilities</div>
        <div class="icon-grid">
            ${Object.entries(ABILITIES).map(([name, category]) => {
                const fileName = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '.svg';
                return `
                    <div class="icon-item">
                        <img src="abilities/${fileName}" width="64" height="64" alt="${name}"/>
                        <div class="icon-name">${name}</div>
                        <div class="category-tag ${category}">${category}</div>
                    </div>
                `;
            }).join('')}
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">👥 Group Ability Suites</div>
        <div class="icon-grid">
            ${Object.keys(GROUP_ABILITIES).map(suiteName => {
                const fileName = suiteName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '.svg';
                return `
                    <div class="icon-item">
                        <img src="group-abilities/${fileName}" width="64" height="64" alt="${suiteName}"/>
                        <div class="icon-name">${suiteName}</div>
                        <div class="category-tag group">group</div>
                    </div>
                `;
            }).join('')}
        </div>
    </div>
</body>
</html>`;
}