# Never Stop Blowing Up - System Guide

## System Overview

Welcome to the **Never Stop Blowing Up** system for Foundry Virtual Tabletop! This guide covers how to use the digital implementation of this explosive action RPG system.

### What This Guide Covers

This system guide explains how to use the Foundry VTT implementation, including:

- Character creation and management
- Using the interactive dice roller
- Understanding turbo tokens and injury mechanics
- Character sheet features and edit mode
- Portrait management
- Compendium usage

***Note:** For the core game rules, mechanics, and lore, see the **Game Rules** compendium.*

### Quick Start

1. **Create a Character:** Use the Actor Directory to create a new character
2. **Set Up Stats:** All skills start at d4 - use the dice buttons to roll
3. **Add Abilities:** Drag abilities from the Player Abilities compendium
4. **Start Playing:** Click dice to roll, spend turbo tokens to enhance rolls

---

## Character Creation & Management

### Creating a New Character

1. Open the **Actors Directory** (sidebar)
2. Click **Create Actor**
3. Choose **Character** type
4. Give your character a name

### Character Sheet Features

#### Basic Information
- **Character Portrait:** Click the portrait area to upload an image
- **Character Name:** The main character identifier
- **Player Name:** Real-world player name
- **Catchphrase:** Your character's signature saying

#### Edit Mode Toggle

The **wrench icon** in the top-right toggles Edit Mode:

- **Edit Mode ON:** Text fields, stats, and abilities are editable
- **Edit Mode OFF:** Fields are read-only (default)

*This prevents accidental changes during play while allowing intentional editing.*

#### Character Portrait

- Click the portrait area to open Foundry's file picker
- Upload or select an image for your character
- Supports standard image formats (PNG, JPG, WEBP, etc.)
- Portrait automatically saves to your character

### Stats and Skills

Your character has 9 core skills, each represented by a die:

- **Weapons, Brawl, Hot** (Top row)
- **Drive, Stunts, Wits** (Middle row)
- **Tech, Tough, Sneak** (Bottom row)

#### Die Progression

Skills start at **d4** and can advance through: **d4 → d6 → d8 → d10 → d12 → d20**

Use the **+/-** buttons to manually change dice as needed.  For example an Ability may allow you to increase a skill die.

### Turbo Tokens

- **Turbo Tokens:** Use the **+/-** buttons to add or subtract tokens from the players pool.  Spend to add +1 per token to rolls.  Players can give tokens to each other when they are in teh same scene.  Do this by editing the token value on your sheet, then click the **Refresh** button in the dice roller to update the available amount.
- **Tokens Spent This Episode:** Tracks the number of tokens spent by the player this episode.

#### Injuries and Effects

- **Injury Level:** 0-3 scale affecting token costs
- **Level 0-1:** Normal token costs (1:1)
- **Level 2-3:** Increased token costs (2:1 ratio)

---

## Interactive Dice Roller

The heart of the system is the interactive dice rolling interface that appears in chat when you roll dice.

### Making a Roll

1. Click any **die icon** on your character sheet
2. A dice roller dialog appears in the chat
3. The system automatically rolls your current die size
4. Results appear with interactive controls

### Roll Result Display

Each roll shows:

- **Current Die:** The value you rolled (displayed in blue)
- **Cumulative Total:** Your running total if dice have blown up
- **Turbo Token Controls:** Add tokens to enhance your roll

### Turbo Token Controls

#### Token Input Area
- **Available Tokens:** Shows how many you currently have
- **Token Input Field:** Enter how many tokens to spend
- **+/- Buttons:** Adjust token count
- **Refresh Button (🔄):** Reset tokens to 0
- **Auto-Blow Up Button (💥):** Automatically spend tokens to reach die maximum

#### Injury Warning

When injured (level 2-3), you'll see a yellow warning:

**⚠️ Injured! Tokens cost 2:1**

The system automatically:
- Calculates actual token costs based on injury
- Prevents spending more than you can afford
- Shows adjusted costs in error messages

### Action Buttons

#### Accept Roll Button
- **Green button** when no tokens are spent
- **Blue button** when tokens are added
- **Red/Orange button** when tokens will cause blow-up
- Shows final total and action (Accept/Add Tokens/Blow Up)

#### Auto-Blow Up Button (💥)
- Automatically calculates tokens needed to reach die maximum
- Spends exact tokens required for blow-up
- Saves time calculating optimal token usage
- Considers injury ratios automatically

#### Refresh Button (🔄)
- Automatically updates the number of available tokens from your sheet.
- This is useful when another player gives you a token(s) to help with your roll.

### Blow-Up Mechanics

When your die result reaches the maximum value (naturally or with tokens):

1. Your skill die permanently upgrades to the next size
2. You immediately roll the new die
3. New result is added to your total
4. Process continues if you roll max again
5. Final result includes all dice + tokens

#### Example Blow-Up Sequence
- Roll d6 Weapons: Result 4
- Add 2 tokens: 4 + 2 = 6 (maximum!)
- Skill upgrades to d8, auto-roll new die
- Roll d8: Result 7
- Final result: 6 + 7 = 13

### Chat Integration
- **Real-time updates:** Chat message updates as you make changes
- **Final results:** Shows clean final result when accepted
- **Roll history:** All rolls preserved in chat log
- **Ownership control:** Only character owner can use controls

---

## Abilities & Items

### Using Compendiums

The system includes several compendiums with pre-built content:

- **Player Abilities:** Individual character abilities
- **Group Abilities:** Team-based coordination abilities
- **Game Rules:** Complete core game rules and mechanics
- **System Guide:** This guide for using Foundry VTT features

### Adding Abilities to Characters

#### From Player Abilities Compendium

1. Open the **Compendium Directory**
2. Click **Player Abilities**
3. Browse available abilities
4. Drag desired abilities to your character sheet
5. Abilities appear in the "Abilities" section

### Group Abilities

Team-based abilities unlock as your group advances, all members of the party must have at least one skill die at the required level in order for the group to purchase an ability.


#### Using Group Abilities

1. All team members must reach the required die level
2. GM or players drag abilities from Group Abilities compendium
3. Abilities can be shared among team members
4. Coordinate usage during play

---

## GM Tools & Features

### NPC Management

#### Creating NPCs

1. Create new Actor, choose **NPC** type
2. NPCs have simplified sheets compared to PCs
3. Focus on essential stats and abilities
4. Use same dice rolling mechanics

#### NPC Features
- **Streamlined sheet:** Less clutter than PC sheets
- **Portrait support:** Add images for important NPCs
- **Same dice mechanics:** Full compatibility with PC rules
- **Quick stats:** Easy to set up on-the-fly

### Managing Player Characters

#### Stat Adjustments
- Use **+/-** buttons to change die sizes
- Manually adjust turbo tokens for rewards/penalties
- Set injury levels based on story outcomes
- Track episode token spending

### Optional Rule: D100 Blow Ups
- Available in the settings menu, the GM can change the D20 blow up behavior to roll a D100.
- This leads to more exciting action and prevents players from gaming certain abilities to farm turbo tokens.

### Debug and Settings

#### Debug Logging

In **Game Settings > System Settings**:

- Toggle **NSBU Debug Logging** on/off
- When enabled, detailed console output for troubleshooting
- Covers dice rolls, token spending, and system operations
- Useful for debugging issues or understanding mechanics

#### System Information

The system displays startup information in console:

- Available compendiums and their contents
- System initialization status
- Debug logging status

### Campaign Management

#### Session Setup

1. Ensure all players have current character sheets
2. Verify turbo token counts at session start
3. Reset tokens using the "New Episode" button as needed
4. Review any ongoing injuries or status effects

### Troubleshooting

#### Common Issues
- **Dice not rolling:** Check character ownership and permissions
- **Tokens not working:** Verify character has available tokens
- **Portraits not loading:** Ensure image files are accessible
- **Edit mode stuck:** Toggle the wrench icon to reset

#### Debug Mode

Enable debug logging to see detailed console output for:

- Dice roll calculations and blow-ups
- Token spending and injury calculations
- Character sheet operations
- Portrait and edit mode functionality

---

## Tips & Best Practices

### Efficient Play

#### Character Sheet Usage
- **Use Edit Mode:** Turn on when making character changes, off during play
- **Portrait Setup:** Add character portraits early for visual identification
- **Catchphrases:** Use memorable quotes that fit your character concept

#### Dice Rolling Strategy
- **Auto-Blow Up:** Use when you want maximum effect and have tokens
- **Conservative Rolling:** Accept modest results to save tokens for crucial moments
- **Token Planning:** Consider injury ratios when planning token expenditure

### Token Management

#### Strategic Spending
- **Blow-Up Timing:** Use tokens to blow up dice when stakes are high
- **Injury Awareness:** Remember 2:1 costs when injured - plan accordingly
- **Session Pacing:** Balance early spending vs. saving for climactic moments

#### Token Economy
- **Failure Rewards:** Don't fear failure - it gives you tokens
- **Group Coordination:** Communicate token usage in team situations
- **Episode Tracking:** Monitor spending to understand your play patterns

### Character Development

#### Ability Selection
- **Synergy:** Choose abilities that work well together
- **Character Concept:** Pick abilities that match your character's theme
- **Group Balance:** Consider team composition when selecting abilities

#### Stat Advancement
- **Natural Progression:** Let dice blow up organically through play
- **Focused Development:** Consider specializing vs. being well-rounded
- **Story Integration:** Tie advancement to character growth and story beats

### Table Organization

#### Digital Best Practices
- **Screen Space:** Keep character sheet and chat visible simultaneously
- **Chat Management:** Use Foundry's chat tools to manage roll history
- **Compendium Access:** Keep relevant compendiums easily accessible

#### Communication
- **Roll Narration:** Describe actions before and after rolls
- **Token Decisions:** Announce token spending intentions clearly
- **Blow-Up Excitement:** Celebrate dice explosions and advancement!

### GM Guidance

#### Session Management
- **Token Refresh:** Establish clear rules for when players gain tokens
- **Injury Consequences:** Make injury mechanics narratively meaningful
- **Difficulty Scaling:** Adjust DCs based on character advancement

#### System Mastery
- **Learn the Tools:** Familiarize yourself with all dice roller features
- **Debug Mode:** Use logging to understand system calculations
- **Player Training:** Help players learn the digital interface effectively

### Customization

#### House Rules
- **Custom Abilities:** Create items for house rule abilities
- **Modified Mechanics:** Use debug mode to understand system behavior
- **Compendium Organization:** Create folders for campaign-specific content

#### Campaign Integration
- **World Building:** Use journal entries for campaign notes
- **NPC Libraries:** Build compendiums of recurring NPCs
- **Session Notes:** Track character development and story beats

***Remember:** The system is designed to support fast-paced, explosive action. Don't let the digital tools slow down the excitement - when in doubt, roll dice and embrace the chaos!*