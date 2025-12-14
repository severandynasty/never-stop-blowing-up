# Never Stop Blowing Up - Icon Design Guide 🎬💥

## 🎯 Design Philosophy

### **80s Action Movie Aesthetic**
Our icons should capture the explosive, neon-soaked energy of 1980s action films. Think Miami Vice meets Terminator with a dash of Top Gun.

## 🎨 Visual Style Guidelines

### **Color Palette**
- **Primary**: Electric Blue (#00bcd4), Hot Pink (#e91e63), Neon Green (#4caf50)
- **Secondary**: Orange (#ff9800), Purple (#9c27b0), Yellow (#ffeb3b)
- **Accents**: Chrome Silver (#c0c0c0), Gunmetal (#2c3e50)
- **Background**: Dark Navy (#1a1a2e), Black (#000000)

### **Design Elements**
- **Gradients**: Linear gradients from dark to bright colors
- **Glow Effects**: Outer glow with 2-3px cyan or orange
- **Angular Shapes**: Sharp edges, triangular elements, geometric patterns
- **Tech Elements**: Circuit patterns, grid lines, digital aesthetics
- **Metallic Finishes**: Chrome and steel textures where appropriate

### **Typography Style**
- **Font Weight**: Bold, blocky letterforms
- **Effects**: Beveled edges, metallic gradients
- **Sizing**: Clear readability at 32x32px minimum

## 📐 Technical Specifications

### **Dimensions**
- **Standard Size**: 64x64px (scalable vector when possible)
- **Minimum Size**: 32x32px (must be readable)
- **Maximum Size**: 128x128px
- **Format**: PNG with transparency, SVG preferred

### **File Naming Convention**
```
abilities/
├── combat_duelist.png
├── stealth_burglar.png
├── social_flashy.png
├── tech_hacker.png
└── utility_mastery.png

group-abilities/
├── criminal_conspiracy_hot.png
├── la_familia_tokens.png
├── diesel_circus_explosion.png
└── alpha_squad_suit_up.png
```

## 🎭 Category-Specific Guidelines

### **Combat Abilities**
- **Colors**: Red/orange gradients with metallic accents
- **Elements**: Weapons, explosions, angular shields
- **Style**: Aggressive, sharp-edged designs
- **Examples**: Crossed swords, burst effects, armor pieces

### **Stealth Abilities**
- **Colors**: Deep blues/purples with subtle highlights
- **Elements**: Shadows, masks, night vision themes
- **Style**: Sleek, mysterious silhouettes
- **Examples**: Ninja stars, shadowy figures, lock picks

### **Social Abilities**
- **Colors**: Pink/magenta with gold accents
- **Elements**: Spotlight effects, microphones, networking
- **Style**: Glamorous, attention-grabbing
- **Examples**: Sunglasses, limousines, party lights

### **Technology Abilities**
- **Colors**: Cyan/green with circuit patterns
- **Elements**: Computer screens, digital grids, hacking themes
- **Style**: Futuristic, grid-based designs
- **Examples**: Keyboards, screens, data streams

### **Vehicle Abilities**
- **Colors**: Orange/red with chrome details
- **Elements**: Cars, motorcycles, speed lines
- **Style**: Fast, dynamic motion blur effects
- **Examples**: Racing stripes, exhaust flames, tire marks

### **Token Management**
- **Colors**: Gold/yellow with energy effects
- **Elements**: Currency symbols, energy orbs, power-ups
- **Style**: Valuable, glowing, precious
- **Examples**: Coins, gems, lightning bolts

### **Group Abilities**
- **Colors**: Multi-colored with team coordination themes
- **Elements**: Formation arrows, linked symbols, unity designs
- **Style**: Collaborative, interconnected
- **Examples**: Puzzle pieces, chain links, formation diagrams

## 🔧 Implementation Guidelines

### **CSS Integration**
Icons should work with the existing glow effects system:
```css
.ability-icon {
  filter: drop-shadow(0 0 3px var(--primary-glow));
  transition: all 0.3s ease;
}

.ability-icon:hover {
  filter: drop-shadow(0 0 6px var(--secondary-glow));
  transform: scale(1.1);
}
```

### **Foundry Integration**
- Icons must work in Foundry's compendium browser
- Should be readable in both light and dark themes
- Must maintain quality when scaled

## 🎪 80s Action Movie References

### **Visual References**
- **Neon Aesthetics**: Blade Runner, Tron, Miami Vice
- **Action Elements**: Terminator, Predator, Die Hard
- **Vehicle Themes**: Knight Rider, Top Gun, Fast Times
- **Tech Elements**: WarGames, Short Circuit, RoboCop

### **Design Motifs**
- **Synthwave Grids**: Perspective grid backgrounds
- **Chrome Text**: Metallic, beveled typography
- **Laser Effects**: Bright line highlights
- **VHS Glitch**: Subtle scan line effects
- **Neon Signs**: Bright color outlines with dark fills

## 📋 Quality Checklist

### **Before Finalizing Icons**
- [ ] Readable at 32x32px
- [ ] Matches 80s aesthetic
- [ ] Uses approved color palette
- [ ] Has appropriate glow effects
- [ ] Follows naming convention
- [ ] Transparent background
- [ ] Optimized file size
- [ ] Tested in Foundry VTT

## 🚀 Production Workflow

1. **Concept Sketch**: Rough design idea
2. **Vector Creation**: SVG or high-res design
3. **Color Application**: Apply 80s color scheme
4. **Effect Addition**: Add glows and gradients
5. **Export Optimization**: Create PNG versions
6. **Integration Testing**: Test in Foundry
7. **Final Polish**: Adjust based on testing

---

*Ready to create some totally radical icons that'll blow up the competition!* 💥🎬✨