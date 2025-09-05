const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'packs', 'group-abilities.db');
const outputDir = path.join(__dirname, 'packs');

const suites = [
  "La Familia (Unlocked at d6)",
  "Criminal Conspiracy (Unlocked at d6)",
  "Diesel Circus (Unlocked at d8)",
  "The Continentals (Unlocked at d8)",
  "Alpha Squad (Unlocked at d10)",
  "Marauders (Unlocked at d10)",
  "The Ones (Unlocked at d12)",
  "Tactical Command (Unlocked at d12)",
  "Bustin' Makes Me Feel Good (Unlocked at d20)"
];

const suiteToFile = {
  "La Familia (Unlocked at d6)": "la-familia.db",
  "Criminal Conspiracy (Unlocked at d6)": "criminal-conspiracy.db",
  "Diesel Circus (Unlocked at d8)": "diesel-circus.db",
  "The Continentals (Unlocked at d8)": "the-continentals.db",
  "Alpha Squad (Unlocked at d10)": "alpha-squad.db",
  "Marauders (Unlocked at d10)": "marauders.db",
  "The Ones (Unlocked at d12)": "the-ones.db",
  "Tactical Command (Unlocked at d12)": "tactical-command.db",
  "Bustin' Makes Me Feel Good (Unlocked at d20)": "bustin.db"
};

const lines = fs.readFileSync(inputPath, 'utf-8').split('\n').filter(Boolean);

const out = {};
for (const suite of suites) out[suite] = [];

for (const line of lines) {
  const entry = JSON.parse(line);
  const suite = entry.system.groupSuite;
  if (suite && out[suite]) out[suite].push(line);
}

for (const suite of suites) {
  const file = suiteToFile[suite];
  if (out[suite].length) {
    fs.writeFileSync(path.join(outputDir, file), out[suite].join('\n'), 'utf-8');
    console.log(`Wrote ${out[suite].length} entries to ${file}`);
  }
}
