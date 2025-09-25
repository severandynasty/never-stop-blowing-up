# Never Stop Blowing Up

A custom tabletop RPG system for Foundry Virtual Tabletop, inspired by Kids on Bikes and focused on explosive action and collaborative storytelling.

## Features

- Custom character sheets for PCs and NPCs, each with unique layouts and fields
- **Player Abilities compendium** - 36 abilities organized by category for individual characters
- **Group Abilities compendium** - 27 team-based abilities organized by die progression (d6-d20)
- **Rules Reference Journal** - Quick access to core mechanics and full PDF rulebook
- Dice macros for fast gameplay with exploding dice mechanics
- Die progression system (d4 → d6 → d8 → d10 → d12 → d20)
- Option to use either a d20 or d100 when a player blows up a d20 stat, configure in the Game Settings menu
- Turbo Token tracking and management
- Designed for Foundry VTT v12.343

## Compendiums

### Player Abilities
36 individual abilities that can be dragged onto the character sheets

### Group Abilities  
27 team abilities organized by group suite and die requirement:
- **d6:** Criminal Conspiracy, La Familia
- **d8:** Diesel Circus, Tactical Command
- **d10:** Alpha Squad, Marauders
- **d12:** The Continentals, The Ones
- **d20:** Bustin' Makes Me Feel Good

### Rules Reference
Complete game reference including:
- Core mechanics and stats
- Quick reference tables
- Turbo Token rules
- Player Abilities
- Group Abilities

## Installation

1. Download or clone this repository.
2. Place the folder in your Foundry VTT `Data/systems` directory.
3. Enable "Never Stop Blowing Up" in your Foundry VTT game settings.

## Usage

- Create actors using the character or NPC sheet templates.  Click the Edit Mode button (Wrench) to unlock the sheet for editing.
- Drag and drop abilities from the appropriate compendium onto actor sheets.
- Click the appropriate dice button for any check.  They will blow up if:
    - A natural maximum value is rolled (e.g. 4 on a d4)
    - The player adds available Turbo Tokens to the roll using the +/- buttons in the roll dialog to increase the roll value to the max.
    - The player clicks the 💥 Auto Blow Up button.
- The player can add tokens to their sheet (for example if another player in the scene gives them to the player) and then click the 🔄 Refresh button to update the available number of tokens.
- Once the player is satisfied with the roll they complete it by clicking the button at the bottom of the roll dialog.

## Credits

Core Game system designed by Dimension20.
Foundry game system created by Blake Keller.

## License

See [LICENSE](LICENSE) for details.


# To Do:

- style/art