/**
 * SVG Icon Generator for Never Stop Blowing Up
 * Creates unique 80s-style SVG icons for abilities and group abilities
 */

// 80s Color Palette
const COLORS = {
    // Primary Neons
    CYAN: '#00bcd4',
    PINK: '#e91e63',
    PURPLE: '#9c27b0',
    ORANGE: '#ff9800',
    YELLOW: '#ffeb3b',
    GREEN: '#4caf50',
    RED: '#f44336',
    
    // Gradients
    COMBAT_GRAD: 'url(#combatGrad)',
    STEALTH_GRAD: 'url(#stealthGrad)',
    SOCIAL_GRAD: 'url(#socialGrad)',
    TECH_GRAD: 'url(#techGrad)',
    VEHICLE_GRAD: 'url(#vehicleGrad)',
    TOKEN_GRAD: 'url(#tokenGrad)',
    GROUP_GRAD: 'url(#groupGrad)',
    
    // Background
    DARK_BG: '#1a1a2e',
    GRID: 'rgba(0, 188, 212, 0.3)'
};

// SVG Template Components
class SVGIconGenerator {
    
    // Create standard 64x64 SVG container with gradients
    static createSVGBase() {
        return `<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <!-- Gradient Definitions -->
        <linearGradient id="combatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f44336;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ff9800;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="stealthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#9c27b0;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#3f51b5;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="socialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#e91e63;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ff4081;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="techGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00bcd4;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4caf50;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="vehicleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ff9800;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ffeb3b;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="tokenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffeb3b;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ffc107;stop-opacity:1" />
        </linearGradient>
        <linearGradient id="groupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#e91e63;stop-opacity:1" />
            <stop offset="33%" style="stop-color:#00bcd4;stop-opacity:1" />
            <stop offset="66%" style="stop-color:#ff9800;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#9c27b0;stop-opacity:1" />
        </linearGradient>
        
        <!-- Glow Effects -->
        <filter id="neonGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
        </filter>
        
        <!-- Retro Grid Pattern -->
        <pattern id="retroGrid" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="${COLORS.GRID}" stroke-width="0.5"/>
        </pattern>
    </defs>
    
    <!-- Background -->
    <rect width="64" height="64" fill="${COLORS.DARK_BG}" rx="4"/>
    
    <!-- Retro Grid Overlay -->
    <rect width="64" height="64" fill="url(#retroGrid)" opacity="0.3"/>`;
    }
    
    // Add scanlines effect
    static addScanlines() {
        return `
    <!-- Scanlines -->
    <g opacity="0.1">
        ${Array.from({length: 16}, (_, i) => 
            `<line x1="0" y1="${i * 4}" x2="64" y2="${i * 4}" stroke="${COLORS.CYAN}" stroke-width="0.5"/>`
        ).join('')}
    </g>`;
    }
    
    // Close SVG
    static closeSVG() {
        return `</svg>`;
    }
    
    // Generate specific icon shapes based on ability type - STICK FIGURE VERSION
    static generateIconShape(abilityName, category) {
        const shapes = {
            // Combat Abilities - Stick figures in combat poses
            'Duelist': `<!-- Two stick figures sword fighting -->
                       <!-- Fighter 1 -->
                       <circle cx="22" cy="18" r="3" fill="${COLORS.COMBAT_GRAD}" filter="url(#neonGlow)"/>
                       <path d="M22 21 L22 32" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                       <path d="M22 26 L18 30" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                       <path d="M22 26 L26 30" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                       <path d="M22 32 L18 40" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                       <path d="M22 32 L26 40" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                       <!-- Fighter 1 sword -->
                       <path d="M18 22 L32 36" stroke="${COLORS.YELLOW}" stroke-width="3"/>
                       
                       <!-- Fighter 2 -->
                       <circle cx="42" cy="18" r="3" fill="${COLORS.COMBAT_GRAD}" filter="url(#neonGlow)"/>
                       <path d="M42 21 L42 32" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                       <path d="M42 26 L38 30" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                       <path d="M42 26 L46 30" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                       <path d="M42 32 L38 40" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                       <path d="M42 32 L46 40" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                       <!-- Fighter 2 sword -->
                       <path d="M46 22 L32 36" stroke="${COLORS.YELLOW}" stroke-width="3"/>
                       <!-- Sparks where swords clash -->
                       <circle cx="32" cy="29" r="1" fill="${COLORS.YELLOW}"/>
                       <circle cx="31" cy="31" r="1" fill="${COLORS.ORANGE}"/>
                       <circle cx="33" cy="31" r="1" fill="${COLORS.ORANGE}"/>`,
            
            'Grit': `<!-- Stick figure gritting teeth, clenched fists, determined stance -->
                    <circle cx="32" cy="16" r="4" fill="${COLORS.COMBAT_GRAD}" filter="url(#neonGlow)"/>
                    <!-- Determined/angry face -->
                    <path d="M30 14 L30 12 M34 14 L34 12" stroke="${COLORS.YELLOW}" stroke-width="1"/>
                    <path d="M30 18 L34 18" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                    <!-- Body -->
                    <path d="M32 20 L32 36" stroke="${COLORS.COMBAT_GRAD}" stroke-width="3"/>
                    <!-- Clenched fists -->
                    <circle cx="26" cy="28" r="2" fill="${COLORS.COMBAT_GRAD}"/>
                    <circle cx="38" cy="28" r="2" fill="${COLORS.COMBAT_GRAD}"/>
                    <path d="M32 24 L26 28" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                    <path d="M32 24 L38 28" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                    <!-- Legs -->
                    <path d="M32 36 L28 48" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                    <path d="M32 36 L36 48" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                    <!-- Determination lines -->
                    <path d="M24 32 L22 30 M40 32 L42 30" stroke="${COLORS.YELLOW}" stroke-width="1" opacity="0.7"/>`,
            
            'Martial Artist': `<!-- Stick figure in karate chop pose -->
                              <circle cx="32" cy="14" r="3" fill="${COLORS.COMBAT_GRAD}" filter="url(#neonGlow)"/>
                              <!-- Body -->
                              <path d="M32 17 L32 32" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                              <!-- Karate chop arm -->
                              <path d="M32 20 L42 26" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                              <path d="M42 26 L46 24" stroke="${COLORS.COMBAT_GRAD}" stroke-width="3"/>
                              <!-- Other arm -->
                              <path d="M32 20 L26 24" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                              <!-- Legs in fighting stance -->
                              <path d="M32 32 L26 44" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                              <path d="M32 32 L38 44" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                              <!-- Motion lines -->
                              <path d="M48 22 L52 20 M48 26 L52 28 M48 30 L52 32" stroke="${COLORS.YELLOW}" stroke-width="2" opacity="0.7"/>`,
            
            'Menacing': `<!-- Stick figure with intimidating pose - arms spread wide, large stance -->
                        <circle cx="32" cy="16" r="4" fill="${COLORS.COMBAT_GRAD}" filter="url(#neonGlow)"/>
                        <!-- Angry face -->
                        <path d="M29 14 L31 12 M35 12 L33 14" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                        <path d="M29 18 L35 18" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                        <!-- Body -->
                        <path d="M32 20 L32 34" stroke="${COLORS.COMBAT_GRAD}" stroke-width="3"/>
                        <!-- Intimidating arms spread wide -->
                        <path d="M32 22 L20 26" stroke="${COLORS.COMBAT_GRAD}" stroke-width="3"/>
                        <path d="M32 22 L44 26" stroke="${COLORS.COMBAT_GRAD}" stroke-width="3"/>
                        <path d="M20 26 L16 30" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                        <path d="M44 26 L48 30" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                        <!-- Wide intimidating stance -->
                        <path d="M32 34 L24 48" stroke="${COLORS.COMBAT_GRAD}" stroke-width="3"/>
                        <path d="M32 34 L40 48" stroke="${COLORS.COMBAT_GRAD}" stroke-width="3"/>
                        <!-- Fear aura -->
                        <circle cx="32" cy="30" r="20" fill="none" stroke="${COLORS.RED}" stroke-width="1" opacity="0.4"/>`,
            
            'Neck Snapper': `<!-- Stick figure in choking/grappling motion -->
                            <circle cx="24" cy="16" r="3" fill="${COLORS.COMBAT_GRAD}" filter="url(#neonGlow)"/>
                            <!-- Body -->
                            <path d="M24 19 L24 32" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                            <!-- Arms reaching/grappling -->
                            <path d="M24 22 L36 18" stroke="${COLORS.COMBAT_GRAD}" stroke-width="3"/>
                            <path d="M24 22 L36 26" stroke="${COLORS.COMBAT_GRAD}" stroke-width="3"/>
                            <!-- Hands grasping -->
                            <circle cx="36" cy="18" r="2" fill="${COLORS.RED}"/>
                            <circle cx="36" cy="26" r="2" fill="${COLORS.RED}"/>
                            <!-- Legs -->
                            <path d="M24 32 L20 44" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                            <path d="M24 32 L28 44" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                            <!-- Victim (smaller, overwhelmed) -->
                            <circle cx="44" cy="20" r="2" fill="${COLORS.PURPLE}" opacity="0.7"/>
                            <path d="M44 22 L44 30" stroke="${COLORS.PURPLE}" stroke-width="1" opacity="0.7"/>
                            <!-- Force lines -->
                            <path d="M40 16 L42 14 M40 28 L42 30" stroke="${COLORS.RED}" stroke-width="2"/>`,
            
            'Resilient': `<!-- Stick figure standing strong with shield, arrows bouncing off -->
                         <circle cx="32" cy="16" r="3" fill="${COLORS.COMBAT_GRAD}" filter="url(#neonGlow)"/>
                         <!-- Body -->
                         <path d="M32 19 L32 34" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                         <!-- Shield arm -->
                         <path d="M32 22 L26 24" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                         <!-- Shield -->
                         <path d="M22 20 L18 24 L18 32 L22 36 L26 32 L26 24 Z" fill="${COLORS.YELLOW}" filter="url(#neonGlow)"/>
                         <!-- Other arm -->
                         <path d="M32 22 L36 26" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                         <!-- Legs in strong stance -->
                         <path d="M32 34 L28 46" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                         <path d="M32 34 L36 46" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                         <!-- Arrows bouncing off shield -->
                         <path d="M12 28 L16 28" stroke="${COLORS.RED}" stroke-width="2"/>
                         <path d="M10 24 L14 26" stroke="${COLORS.RED}" stroke-width="2"/>
                         <path d="M14 32 L18 30" stroke="${COLORS.RED}" stroke-width="2"/>`,
            
            // Stealth Abilities - Stick figures in sneaky poses
            'Burglar': `<!-- Stick figure crouching with lockpick tools -->
                       <circle cx="26" cy="16" r="2.5" fill="${COLORS.STEALTH_GRAD}" filter="url(#neonGlow)"/>
                       <!-- Crouched body -->
                       <path d="M26 18.5 L26 28" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                       <!-- Arms working on lock -->
                       <path d="M26 20 L34 22" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                       <path d="M26 22 L34 26" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                       <!-- Tools in hands -->
                       <path d="M34 22 L38 20" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                       <path d="M34 26 L38 28" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                       <!-- Lock being picked -->
                       <rect x="40" y="22" width="6" height="8" fill="none" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2" rx="1"/>
                       <circle cx="43" cy="26" r="1" fill="${COLORS.PURPLE}"/>
                       <!-- Crouched legs -->
                       <path d="M26 28 L22 36" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                       <path d="M26 28 L30 36" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                       <path d="M22 36 L20 40" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                       <path d="M30 36 L32 40" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>`,
            
            'Escape Artist': `<!-- Stick figure breaking free from restraints -->
                             <circle cx="32" cy="16" r="3" fill="${COLORS.STEALTH_GRAD}" filter="url(#neonGlow)"/>
                             <!-- Body -->
                             <path d="M32 19 L32 32" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                             <!-- Arms breaking free (dramatic pose) -->
                             <path d="M32 22 L22 18" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                             <path d="M32 22 L42 18" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                             <!-- Broken restraints -->
                             <path d="M20 18 L16 20" stroke="${COLORS.PURPLE}" stroke-width="3"/>
                             <path d="M44 18 L48 20" stroke="${COLORS.PURPLE}" stroke-width="3"/>
                             <!-- Break marks -->
                             <path d="M18 16 L22 20 M22 16 L18 20" stroke="${COLORS.YELLOW}" stroke-width="1"/>
                             <path d="M42 16 L46 20 M46 16 L42 20" stroke="${COLORS.YELLOW}" stroke-width="1"/>
                             <!-- Legs -->
                             <path d="M32 32 L28 44" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                             <path d="M32 32 L36 44" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                             <!-- Freedom motion lines -->
                             <path d="M16 24 L20 24 M44 24 L48 24" stroke="${COLORS.PURPLE}" stroke-width="1" opacity="0.7"/>`,
            
            'Stealthy': `<!-- Stick figure in sneaking pose with finger to lips -->
                        <circle cx="30" cy="18" r="3" fill="${COLORS.STEALTH_GRAD}" filter="url(#neonGlow)"/>
                        <!-- Finger to lips (shh gesture) -->
                        <path d="M32 18 L34 18" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                        <!-- Body hunched over sneaking -->
                        <path d="M30 21 L34 32" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                        <!-- Arms in sneaky position -->
                        <path d="M32 24 L28 26" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                        <path d="M34 26 L38 28" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                        <!-- Tip-toe legs -->
                        <path d="M34 32 L30 42" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                        <path d="M34 32 L38 42" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                        <!-- Tip-toe feet -->
                        <circle cx="30" cy="42" r="1" fill="${COLORS.STEALTH_GRAD}"/>
                        <circle cx="38" cy="42" r="1" fill="${COLORS.STEALTH_GRAD}"/>
                        <!-- Stealth shadow -->
                        <ellipse cx="34" cy="46" rx="8" ry="2" fill="${COLORS.PURPLE}" opacity="0.3"/>`,
            
            // Social Abilities - Stick figures in social interactions
            'Smokin\'': `<!-- Stick figure striking an attractive pose with admirers -->
                        <circle cx="32" cy="16" r="4" fill="${COLORS.SOCIAL_GRAD}" filter="url(#neonGlow)"/>
                        <!-- Confident pose - hand on hip -->
                        <path d="M32 20 L32 34" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="3"/>
                        <path d="M32 22 L26 26" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                        <path d="M32 22 L38 24" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                        <!-- Hand on hip -->
                        <circle cx="26" cy="26" r="2" fill="${COLORS.SOCIAL_GRAD}"/>
                        <!-- Confident stance -->
                        <path d="M32 34 L28 46" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                        <path d="M32 34 L36 46" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                        <!-- Admirers (smaller figures) -->
                        <circle cx="16" cy="24" r="2" fill="${COLORS.PINK}" opacity="0.7"/>
                        <path d="M16 26 L16 32" stroke="${COLORS.PINK}" stroke-width="1" opacity="0.7"/>
                        <circle cx="48" cy="24" r="2" fill="${COLORS.PINK}" opacity="0.7"/>
                        <path d="M48 26 L48 32" stroke="${COLORS.PINK}" stroke-width="1" opacity="0.7"/>
                        <!-- Heart symbols -->
                        <path d="M18 20 Q20 18 22 20 Q24 18 26 20 Q24 22 22 24 Q20 22 18 20" fill="${COLORS.PINK}" opacity="0.6"/>`,
            
            'Flashy': `<!-- Stick figure in dramatic spotlight pose with arms spread -->
                      <circle cx="32" cy="18" r="4" fill="${COLORS.SOCIAL_GRAD}" filter="url(#neonGlow)"/>
                      <!-- Body -->
                      <path d="M32 22 L32 36" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="3"/>
                      <!-- Arms spread dramatically -->
                      <path d="M32 24 L20 20" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="3"/>
                      <path d="M32 24 L44 20" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="3"/>
                      <!-- Legs in performance stance -->
                      <path d="M32 36 L26 48" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                      <path d="M32 36 L38 48" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                      <!-- Spotlight beams -->
                      <path d="M32 8 L32 18" stroke="${COLORS.YELLOW}" stroke-width="6" opacity="0.8"/>
                      <path d="M24 12 L20 20" stroke="${COLORS.YELLOW}" stroke-width="3" opacity="0.6"/>
                      <path d="M40 12 L44 20" stroke="${COLORS.YELLOW}" stroke-width="3" opacity="0.6"/>
                      <!-- Stage lights -->
                      <circle cx="24" cy="8" r="2" fill="${COLORS.YELLOW}"/>
                      <circle cx="40" cy="8" r="2" fill="${COLORS.YELLOW}"/>`,
            
            'Connected': `<!-- Stick figure with multiple people connected by lines -->
                         <circle cx="32" cy="24" r="4" fill="${COLORS.SOCIAL_GRAD}" filter="url(#neonGlow)"/>
                         <path d="M32 28 L32 40" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="3"/>
                         <path d="M32 30 L26 32" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                         <path d="M32 30 L38 32" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                         <!-- Connected people around -->
                         <circle cx="16" cy="16" r="3" fill="${COLORS.PINK}" opacity="0.8"/>
                         <circle cx="48" cy="16" r="3" fill="${COLORS.PINK}" opacity="0.8"/>
                         <circle cx="16" cy="40" r="3" fill="${COLORS.PINK}" opacity="0.8"/>
                         <circle cx="48" cy="40" r="3" fill="${COLORS.PINK}" opacity="0.8"/>
                         <!-- Connection lines -->
                         <path d="M19 16 L29 22" stroke="${COLORS.PINK}" stroke-width="2" opacity="0.7"/>
                         <path d="M45 16 L35 22" stroke="${COLORS.PINK}" stroke-width="2" opacity="0.7"/>
                         <path d="M19 40 L29 34" stroke="${COLORS.PINK}" stroke-width="2" opacity="0.7"/>
                         <path d="M45 40 L35 34" stroke="${COLORS.PINK}" stroke-width="2" opacity="0.7"/>
                         <!-- Phone/communication device -->
                         <rect x="36" y="28" width="3" height="6" fill="${COLORS.YELLOW}" rx="1"/>`,
            
            'By the Book': `<!-- Stick figure saluting with official book -->
                           <circle cx="28" cy="16" r="3" fill="${COLORS.SOCIAL_GRAD}" filter="url(#neonGlow)"/>
                           <!-- Body -->
                           <path d="M28 19 L28 34" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                           <!-- Saluting arm -->
                           <path d="M28 20 L24 18" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                           <path d="M24 18 L22 16" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                           <!-- Other arm holding book -->
                           <path d="M28 22 L34 24" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                           <!-- Official rulebook -->
                           <rect x="34" y="20" width="8" height="12" fill="${COLORS.YELLOW}" filter="url(#neonGlow)" rx="1"/>
                           <rect x="35" y="21" width="6" height="1" fill="${COLORS.DARK_BG}"/>
                           <rect x="35" y="23" width="5" height="1" fill="${COLORS.DARK_BG}"/>
                           <rect x="35" y="25" width="4" height="1" fill="${COLORS.DARK_BG}"/>
                           <!-- Official badge -->
                           <circle cx="38" cy="28" r="1.5" fill="${COLORS.RED}"/>
                           <!-- Straight posture legs -->
                           <path d="M28 34 L28 46" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                           <path d="M28 46 L24 48" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                           <path d="M28 46 L32 48" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>`,
            
            'Poker Face': `<!-- Stick figure with completely neutral expression and stance -->
                          <circle cx="32" cy="16" r="4" fill="${COLORS.SOCIAL_GRAD}" filter="url(#neonGlow)"/>
                          <!-- Completely neutral face (no expression) -->
                          <circle cx="30" cy="15" r="0.5" fill="${COLORS.DARK_BG}"/>
                          <circle cx="34" cy="15" r="0.5" fill="${COLORS.DARK_BG}"/>
                          <path d="M30 18 L34 18" stroke="${COLORS.DARK_BG}" stroke-width="1"/>
                          <!-- Neutral body posture -->
                          <path d="M32 20 L32 36" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                          <!-- Arms at sides (neutral) -->
                          <path d="M32 22 L28 28" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                          <path d="M32 22 L36 28" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                          <!-- Straight stance -->
                          <path d="M32 36 L30 48" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                          <path d="M32 36 L34 48" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                          <!-- Cards floating nearby (poker context) -->
                          <rect x="16" y="24" width="4" height="6" fill="${COLORS.YELLOW}" rx="1"/>
                          <rect x="44" y="28" width="4" height="6" fill="${COLORS.YELLOW}" rx="1"/>`,
            
            'Inspiring': `<!-- Stick figure with arms raised, motivating others -->
                         <circle cx="32" cy="16" r="4" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                         <!-- Body -->
                         <path d="M32 20 L32 34" stroke="${COLORS.TOKEN_GRAD}" stroke-width="3"/>
                         <!-- Arms raised in inspiring gesture -->
                         <path d="M32 22 L26 14" stroke="${COLORS.TOKEN_GRAD}" stroke-width="3"/>
                         <path d="M32 22 L38 14" stroke="${COLORS.TOKEN_GRAD}" stroke-width="3"/>
                         <!-- Hands raised up -->
                         <circle cx="26" cy="14" r="2" fill="${COLORS.YELLOW}"/>
                         <circle cx="38" cy="14" r="2" fill="${COLORS.YELLOW}"/>
                         <!-- Confident stance -->
                         <path d="M32 34 L28 46" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                         <path d="M32 34 L36 46" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                         <!-- Inspired people around -->
                         <circle cx="18" cy="32" r="2" fill="${COLORS.PINK}" opacity="0.7"/>
                         <path d="M18 30 L20 28" stroke="${COLORS.PINK}" stroke-width="1"/>
                         <circle cx="46" cy="32" r="2" fill="${COLORS.PINK}" opacity="0.7"/>
                         <path d="M46 30 L44 28" stroke="${COLORS.PINK}" stroke-width="1"/>
                         <!-- Inspiration rays -->
                         <path d="M24 10 L20 6 M40 10 L44 6" stroke="${COLORS.YELLOW}" stroke-width="2" opacity="0.7"/>`,
            
            'Inspiring': `<circle cx="32" cy="32" r="16" fill="none" stroke="${COLORS.TOKEN_GRAD}" stroke-width="3" filter="url(#neonGlow)"/>
                         <polygon points="32,20 35,27 42,27 36,31 38,38 32,34 26,38 28,31 22,27 29,27" fill="${COLORS.YELLOW}"/>
                         <circle cx="20" cy="20" r="2" fill="${COLORS.YELLOW}" opacity="0.7"/>
                         <circle cx="44" cy="20" r="2" fill="${COLORS.YELLOW}" opacity="0.7"/>
                         <circle cx="44" cy="44" r="2" fill="${COLORS.YELLOW}" opacity="0.7"/>`,
            
            // Technology Icons
            'Hacker': `<!-- Stick figure at computer with code streaming -->
                       <circle cx="32" cy="16" r="3" fill="${COLORS.TECH_GRAD}" filter="url(#neonGlow)"/>
                       <!-- Body hunched over keyboard -->
                       <path d="M32 19 L32 30" stroke="${COLORS.TECH_GRAD}" stroke-width="2"/>
                       <!-- Arms typing -->
                       <path d="M32 22 L26 26" stroke="${COLORS.TECH_GRAD}" stroke-width="2"/>
                       <path d="M32 22 L38 26" stroke="${COLORS.TECH_GRAD}" stroke-width="2"/>
                       <!-- Hands on keyboard -->
                       <circle cx="26" cy="26" r="1" fill="${COLORS.TECH_GRAD}"/>
                       <circle cx="38" cy="26" r="1" fill="${COLORS.TECH_GRAD}"/>
                       <!-- Computer screen -->
                       <rect x="16" y="20" width="16" height="12" fill="${COLORS.DARK_BG}" stroke="${COLORS.CYAN}" stroke-width="1"/>
                       <!-- Code streaming -->
                       <rect x="18" y="22" width="2" height="1" fill="${COLORS.GREEN}"/>
                       <rect x="18" y="24" width="3" height="1" fill="${COLORS.GREEN}"/>
                       <rect x="18" y="26" width="4" height="1" fill="${COLORS.GREEN}"/>
                       <rect x="18" y="28" width="2" height="1" fill="${COLORS.GREEN}"/>
                       <!-- Matrix-style data -->
                       <text x="20" y="25" font-size="2" fill="${COLORS.GREEN}" opacity="0.8">01</text>
                       <text x="24" y="27" font-size="2" fill="${COLORS.GREEN}" opacity="0.8">10</text>
                       <!-- Keyboard -->
                       <rect x="22" y="30" width="20" height="4" fill="${COLORS.DARK_BG}" stroke="${COLORS.CYAN}" stroke-width="1"/>`,
            
            'Demolitions': `<!-- Stick figure placing explosives -->
                           <circle cx="28" cy="16" r="3" fill="${COLORS.RED}" filter="url(#neonGlow)"/>
                           <!-- Body crouched down -->
                           <path d="M28 19 L28 28" stroke="${COLORS.RED}" stroke-width="2"/>
                           <!-- Arms placing bomb -->
                           <path d="M28 20 L24 24" stroke="${COLORS.RED}" stroke-width="2"/>
                           <path d="M28 22 L34 28" stroke="${COLORS.RED}" stroke-width="2"/>
                           <!-- Dynamite/bomb being placed -->
                           <rect x="32" y="26" width="6" height="10" fill="${COLORS.RED}" rx="1"/>
                           <text x="35" y="30" font-size="2" fill="${COLORS.YELLOW}" text-anchor="middle">TNT</text>
                           <!-- Fuse -->
                           <path d="M35 26 Q38 22 42 18" stroke="${COLORS.ORANGE}" stroke-width="2"/>
                           <!-- Sparks -->
                           <circle cx="40" cy="20" r="1" fill="${COLORS.YELLOW}"/>
                           <circle cx="42" cy="18" r="0.5" fill="${COLORS.ORANGE}"/>
                           <!-- Crouched legs -->
                           <path d="M28 28 L24 34" stroke="${COLORS.RED}" stroke-width="2"/>
                           <path d="M28 28 L32 34" stroke="${COLORS.RED}" stroke-width="2"/>
                           <!-- Warning gesture (hand up) -->
                           <path d="M24 24 L20 20" stroke="${COLORS.RED}" stroke-width="2"/>
                           <circle cx="20" cy="20" r="1" fill="${COLORS.YELLOW}"/>`,
            
            'Hotwire': `<!-- Stick figure under car dashboard with wires -->
                       <circle cx="24" cy="20" r="3" fill="${COLORS.TECH_GRAD}" filter="url(#neonGlow)"/>
                       <!-- Body crammed under dashboard -->
                       <path d="M24 23 L28 32" stroke="${COLORS.TECH_GRAD}" stroke-width="2"/>
                       <!-- Arms working with wires -->
                       <path d="M24 24 L32 28" stroke="${COLORS.TECH_GRAD}" stroke-width="2"/>
                       <path d="M24 26 L30 32" stroke="${COLORS.TECH_GRAD}" stroke-width="2"/>
                       <!-- Car dashboard/steering area -->
                       <rect x="30" y="16" width="20" height="8" fill="${COLORS.DARK_BG}" stroke="${COLORS.ORANGE}" stroke-width="1"/>
                       <circle cx="45" cy="20" r="3" fill="${COLORS.DARK_BG}" stroke="${COLORS.ORANGE}"/>
                       <!-- Exposed wires -->
                       <path d="M32 24 L36 26" stroke="${COLORS.RED}" stroke-width="2"/>
                       <path d="M32 26 L38 24" stroke="${COLORS.BLUE}" stroke-width="2"/>
                       <path d="M34 28 L40 28" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                       <!-- Sparks from connection -->
                       <circle cx="36" cy="26" r="1" fill="${COLORS.YELLOW}" opacity="0.8"/>
                       <circle cx="38" cy="24" r="0.5" fill="${COLORS.YELLOW}" opacity="0.6"/>
                       <circle cx="40" cy="28" r="0.5" fill="${COLORS.YELLOW}" opacity="0.6"/>
                       <!-- Tools -->
                       <rect x="18" y="28" width="6" height="1" fill="${COLORS.CYAN}"/>`,
            
            // Vehicle Icons
            'Transporter': `<!-- Stick figure driving/racing -->
                           <circle cx="28" cy="16" r="3" fill="${COLORS.VEHICLE_GRAD}" filter="url(#neonGlow)"/>
                           <!-- Body in driving position -->
                           <path d="M28 19 L28 28" stroke="${COLORS.VEHICLE_GRAD}" stroke-width="2"/>
                           <!-- Arms gripping steering wheel -->
                           <path d="M28 20 L24 22" stroke="${COLORS.VEHICLE_GRAD}" stroke-width="2"/>
                           <path d="M28 20 L32 22" stroke="${COLORS.VEHICLE_GRAD}" stroke-width="2"/>
                           <!-- Steering wheel -->
                           <circle cx="28" cy="22" r="3" fill="none" stroke="${COLORS.ORANGE}" stroke-width="2"/>
                           <!-- Car body around figure -->
                           <path d="M20 24 Q22 20 28 20 L32 20 Q38 20 40 24 L40 32 Q38 34 36 34 L20 34 Q18 34 16 32 Q16 28 20 24" fill="none" stroke="${COLORS.VEHICLE_GRAD}" stroke-width="2"/>
                           <!-- Wheels -->
                           <circle cx="22" cy="34" r="3" fill="${COLORS.DARK_BG}" stroke="${COLORS.VEHICLE_GRAD}"/>
                           <circle cx="38" cy="34" r="3" fill="${COLORS.DARK_BG}" stroke="${COLORS.VEHICLE_GRAD}"/>
                           <!-- Speed lines -->
                           <path d="M8 20 L16 22 M8 24 L16 26 M8 28 L16 30" stroke="${COLORS.ORANGE}" stroke-width="2" opacity="0.7"/>
                           <!-- Fast motion blur -->
                           <path d="M44 22 L52 24 M44 26 L52 28" stroke="${COLORS.ORANGE}" stroke-width="1" opacity="0.5"/>`,
            
            // Token Management Icons
            'Lucky': `<!-- Stick figure with fortune/dice -->
                     <circle cx="32" cy="16" r="3" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                     <!-- Body -->
                     <path d="M32 19 L32 32" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                     <!-- Arms in lucky gesture -->
                     <path d="M32 20 L28 24" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                     <path d="M32 20 L36 24" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                     <!-- Crossed fingers gesture -->
                     <path d="M26 24 L28 26" stroke="${COLORS.TOKEN_GRAD}" stroke-width="1"/>
                     <path d="M28 22 L26 26" stroke="${COLORS.TOKEN_GRAD}" stroke-width="1"/>
                     <!-- Dice showing lucky numbers -->
                     <rect x="20" y="28" width="4" height="4" fill="${COLORS.YELLOW}" rx="0.5"/>
                     <circle cx="21" cy="29" r="0.3" fill="${COLORS.DARK_BG}"/>
                     <circle cx="23" cy="31" r="0.3" fill="${COLORS.DARK_BG}"/>
                     <rect x="40" y="26" width="4" height="4" fill="${COLORS.YELLOW}" rx="0.5"/>
                     <circle cx="42" cy="28" r="0.3" fill="${COLORS.DARK_BG}"/>
                     <!-- Four-leaf clover -->
                     <circle cx="36" cy="32" r="2" fill="${COLORS.GREEN}" opacity="0.7"/>
                     <circle cx="40" cy="32" r="2" fill="${COLORS.GREEN}" opacity="0.7"/>
                     <circle cx="36" cy="36" r="2" fill="${COLORS.GREEN}" opacity="0.7"/>
                     <circle cx="40" cy="36" r="2" fill="${COLORS.GREEN}" opacity="0.7"/>
                     <!-- Lucky sparkles -->
                     <circle cx="24" cy="16" r="0.5" fill="${COLORS.YELLOW}"/>
                     <circle cx="44" cy="20" r="0.5" fill="${COLORS.YELLOW}"/>`,
            
            'Wealthy': `<!-- Stick figure with money/luxury -->
                       <circle cx="32" cy="16" r="3" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                       <!-- Body in fancy pose -->
                       <path d="M32 19 L32 32" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                       <!-- One arm showing off wealth -->
                       <path d="M32 20 L26 24" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                       <!-- Other arm holding money -->
                       <path d="M32 22 L38 26" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                       <!-- Stack of money -->
                       <rect x="36" y="24" width="8" height="6" fill="${COLORS.YELLOW}" rx="1"/>
                       <rect x="37" y="23" width="8" height="6" fill="${COLORS.YELLOW}" opacity="0.8" rx="1"/>
                       <text x="40" y="27" font-size="2" fill="${COLORS.DARK_BG}" text-anchor="middle">$</text>
                       <!-- Expensive suit (vest) -->
                       <rect x="30" y="24" width="4" height="8" fill="${COLORS.YELLOW}" opacity="0.6"/>
                       <!-- Confident stance -->
                       <path d="M32 32 L28 46" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                       <path d="M32 32 L36 46" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                       <!-- Expensive shoes -->
                       <ellipse cx="28" cy="46" rx="2" ry="1" fill="${COLORS.YELLOW}"/>
                       <ellipse cx="36" cy="46" rx="2" ry="1" fill="${COLORS.YELLOW}"/>
                       <!-- Money symbols floating -->
                       <text x="20" y="20" font-size="3" fill="${COLORS.YELLOW}" opacity="0.7">$</text>
                       <text x="48" y="32" font-size="3" fill="${COLORS.YELLOW}" opacity="0.7">$</text>`,
            
            'Loyal': `<!-- Two stick figures showing loyalty/solidarity -->
                     <circle cx="26" cy="16" r="3" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                     <circle cx="38" cy="16" r="3" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                     <!-- Bodies -->
                     <path d="M26 19 L26 32" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                     <path d="M38 19 L38 32" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                     <!-- Arms reaching toward each other (handshake) -->
                     <path d="M26 22 L32 24" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                     <path d="M38 22 L32 24" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                     <!-- Clasped hands -->
                     <circle cx="32" cy="24" r="2" fill="${COLORS.YELLOW}"/>
                     <!-- Other arms showing support -->
                     <path d="M26 20 L22 26" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                     <path d="M38 20 L42 26" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                     <!-- Standing together stance -->
                     <path d="M26 32 L24 44" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                     <path d="M26 32 L28 44" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                     <path d="M38 32 L36 44" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                     <path d="M38 32 L40 44" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                     <!-- Bond/connection symbol -->
                     <path d="M28 18 L36 18" stroke="${COLORS.PINK}" stroke-width="1" opacity="0.7"/>
                     <circle cx="32" cy="18" r="1" fill="${COLORS.PINK}" opacity="0.7"/>`,
            
            'Trainer': `<!-- Stick figure with whistle coaching/teaching -->
                       <circle cx="32" cy="16" r="3" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                       <!-- Body -->
                       <path d="M32 19 L32 32" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                       <!-- One arm raised (teaching gesture) -->
                       <path d="M32 20 L28 16" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                       <!-- Other arm holding whistle to mouth -->
                       <path d="M32 22 L36 20" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                       <path d="M36 20 L38 18" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                       <!-- Whistle -->
                       <circle cx="38" cy="18" r="1" fill="${COLORS.YELLOW}"/>
                       <!-- Whistle sound waves -->
                       <path d="M40 16 Q42 16 40 18 Q44 18 42 20" stroke="${COLORS.YELLOW}" stroke-width="1" opacity="0.7"/>
                       <!-- Student/trainee (smaller figure) -->
                       <circle cx="20" cy="24" r="2" fill="${COLORS.PINK}" opacity="0.7"/>
                       <path d="M20 26 L20 34" stroke="${COLORS.PINK}" stroke-width="1" opacity="0.7"/>
                       <!-- Pointing gesture toward student -->
                       <circle cx="28" cy="16" r="1" fill="${COLORS.YELLOW}"/>
                       <!-- Training equipment (clipboard/notes) -->
                       <rect x="16" y="20" width="3" height="4" fill="${COLORS.YELLOW}" opacity="0.6"/>
                       <!-- Legs in confident stance -->
                       <path d="M32 32 L28 44" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                       <path d="M32 32 L36 44" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>`,
            
            // Utility Abilities - Stick figures demonstrating preparedness and skills
            'Prepared': `<!-- Stick figure with utility belt and tools ready -->
                        <circle cx="32" cy="16" r="3" fill="${COLORS.GREEN}" filter="url(#neonGlow)"/>
                        <!-- Body -->
                        <path d="M32 19 L32 32" stroke="${COLORS.GREEN}" stroke-width="2"/>
                        <!-- Arms reaching for tools -->
                        <path d="M32 20 L28 24" stroke="${COLORS.GREEN}" stroke-width="2"/>
                        <path d="M32 22 L36 26" stroke="${COLORS.GREEN}" stroke-width="2"/>
                        <!-- Utility belt around waist -->
                        <rect x="28" y="26" width="8" height="3" fill="${COLORS.YELLOW}" rx="1"/>
                        <!-- Various tools hanging from belt -->
                        <rect x="29" y="24" width="1" height="4" fill="${COLORS.CYAN}"/>
                        <rect x="31" y="23" width="1" height="5" fill="${COLORS.RED}"/>
                        <circle cx="33" cy="25" r="1" fill="${COLORS.ORANGE}"/>
                        <rect x="34" y="24" width="1" height="4" fill="${COLORS.PURPLE}"/>
                        <!-- Hand reaching for specific tool -->
                        <circle cx="28" cy="24" r="1" fill="${COLORS.GREEN}"/>
                        <circle cx="36" cy="26" r="1" fill="${COLORS.GREEN}"/>
                        <!-- Confident stance -->
                        <path d="M32 32 L28 44" stroke="${COLORS.GREEN}" stroke-width="2"/>
                        <path d="M32 32 L36 44" stroke="${COLORS.GREEN}" stroke-width="2"/>
                        <!-- Ready for anything stance -->
                        <circle cx="24" cy="18" r="0.5" fill="${COLORS.YELLOW}" opacity="0.8"/>
                        <circle cx="40" cy="22" r="0.5" fill="${COLORS.YELLOW}" opacity="0.8"/>`,
            
            'Interrogator': `<!-- Stick figure leaning in aggressively questioning another -->
                            <circle cx="28" cy="16" r="3" fill="${COLORS.TECH_GRAD}" filter="url(#neonGlow)"/>
                            <!-- Interrogator body leaning forward -->
                            <path d="M28 19 L30 32" stroke="${COLORS.TECH_GRAD}" stroke-width="2"/>
                            <!-- Pointing accusingly -->
                            <path d="M28 20 L36 24" stroke="${COLORS.TECH_GRAD}" stroke-width="2"/>
                            <path d="M36 24 L40 24" stroke="${COLORS.TECH_GRAD}" stroke-width="2"/>
                            <!-- Suspect figure -->
                            <circle cx="44" cy="18" r="3" fill="${COLORS.PINK}" opacity="0.7"/>
                            <path d="M44 21 L44 32" stroke="${COLORS.PINK}" stroke-width="2" opacity="0.7"/>
                            <!-- Suspect looking nervous -->
                            <path d="M44 22 L40 26" stroke="${COLORS.PINK}" stroke-width="1" opacity="0.7"/>
                            <path d="M44 22 L48 26" stroke="${COLORS.PINK}" stroke-width="1" opacity="0.7"/>
                            <!-- Intense stare lines -->
                            <path d="M31 16 L41 18" stroke="${COLORS.RED}" stroke-width="1" opacity="0.8"/>
                            <!-- Question marks -->
                            <text x="24" y="12" font-size="4" fill="${COLORS.YELLOW}">?</text>
                            <text x="36" y="14" font-size="3" fill="${COLORS.YELLOW}" opacity="0.7">?</text>
                            <!-- Bright light (interrogation lamp) -->
                            <circle cx="32" cy="8" r="2" fill="${COLORS.YELLOW}" filter="url(#neonGlow)"/>
                            <path d="M32 10 L44 18" stroke="${COLORS.YELLOW}" stroke-width="3" opacity="0.6"/>`,
            
            'Trained': `<!-- Stick figure reading manual while practicing -->
                       <circle cx="28" cy="16" r="3" fill="${COLORS.GREEN}" filter="url(#neonGlow)"/>
                       <!-- Body -->
                       <path d="M28 19 L28 32" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <!-- One arm holding manual -->
                       <path d="M28 20 L22 24" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <rect x="18" y="22" width="6" height="8" fill="${COLORS.YELLOW}" stroke="${COLORS.DARK_BG}" stroke-width="1"/>
                       <rect x="19" y="23" width="4" height="1" fill="${COLORS.DARK_BG}"/>
                       <rect x="19" y="25" width="3" height="1" fill="${COLORS.DARK_BG}"/>
                       <!-- Other arm practicing skill -->
                       <path d="M28 22 L36 26" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <!-- Practice target/object -->
                       <circle cx="40" cy="28" r="4" fill="${COLORS.CYAN}" opacity="0.6" stroke="${COLORS.CYAN}"/>
                       <path d="M38 26 L42 30 M42 26 L38 30" stroke="${COLORS.CYAN}" stroke-width="1"/>
                       <!-- Knowledge symbols -->
                       <text x="24" y="12" font-size="3" fill="${COLORS.YELLOW}">!</text>
                       <!-- Practice arrows -->
                       <path d="M32 26 L36 26" stroke="${COLORS.GREEN}" stroke-width="1" opacity="0.7"/>
                       <polygon points="36,26 34,25 34,27" fill="${COLORS.GREEN}" opacity="0.7"/>`,
            
            'Studied': `<!-- Stick figure with graduation cap and diploma -->
                       <circle cx="32" cy="20" r="3" fill="${COLORS.GREEN}" filter="url(#neonGlow)"/>
                       <!-- Graduation cap -->
                       <rect x="28" y="16" width="8" height="2" fill="${COLORS.CYAN}"/>
                       <!-- Cap tassel -->
                       <path d="M36 16 Q38 14 36 12" stroke="${COLORS.YELLOW}" stroke-width="1"/>
                       <circle cx="36" cy="12" r="0.5" fill="${COLORS.YELLOW}"/>
                       <!-- Body -->
                       <path d="M32 23 L32 36" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <!-- Arms holding diploma -->
                       <path d="M32 24 L26 28" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <path d="M32 24 L38 28" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <!-- Diploma scroll -->
                       <rect x="26" y="26" width="8" height="4" fill="${COLORS.YELLOW}" rx="1"/>
                       <circle cx="24" cy="28" r="0.5" fill="${COLORS.RED}"/>
                       <circle cx="36" cy="28" r="0.5" fill="${COLORS.RED}"/>
                       <!-- Academic robes (graduation gown) -->
                       <path d="M28 30 Q32 32 36 30 L36 40 Q32 42 28 40" fill="none" stroke="${COLORS.PURPLE}" stroke-width="2"/>
                       <!-- Proud stance -->
                       <path d="M32 36 L28 48" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <path d="M32 36 L36 48" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <!-- Knowledge symbols -->
                       <text x="20" y="16" font-size="3" fill="${COLORS.YELLOW}" opacity="0.7">📚</text>
                       <text x="44" y="24" font-size="3" fill="${COLORS.YELLOW}" opacity="0.7">A+</text>`,
            
            'Mastery': `<!-- Stick figure wearing crown of expertise -->
                       <circle cx="32" cy="20" r="3" fill="${COLORS.GREEN}" filter="url(#neonGlow)"/>
                       <!-- Crown of mastery -->
                       <path d="M26 16 L28 12 L32 14 L36 12 L38 16" stroke="${COLORS.YELLOW}" stroke-width="2" fill="none"/>
                       <circle cx="32" cy="14" r="1" fill="${COLORS.YELLOW}"/>
                       <circle cx="28" cy="15" r="0.5" fill="${COLORS.RED}"/>
                       <circle cx="36" cy="15" r="0.5" fill="${COLORS.BLUE}"/>
                       <!-- Body in confident pose -->
                       <path d="M32 23 L32 36" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <!-- Arms crossed confidently -->
                       <path d="M32 24 L26 28" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <path d="M32 24 L38 28" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <path d="M26 28 L38 26" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <path d="M38 28 L26 26" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <!-- Master's stance -->
                       <path d="M32 36 L28 48" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <path d="M32 36 L36 48" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <!-- Excellence aura -->
                       <circle cx="32" cy="28" r="20" fill="none" stroke="${COLORS.YELLOW}" stroke-width="1" opacity="0.4"/>
                       <!-- Mastery symbols -->
                       <text x="16" y="12" font-size="3" fill="${COLORS.YELLOW}" opacity="0.7">★</text>
                       <text x="48" y="16" font-size="3" fill="${COLORS.YELLOW}" opacity="0.7">★</text>`,
            
            'Skilled': `<!-- Stick figure demonstrating precise skill with tool -->
                       <circle cx="32" cy="16" r="3" fill="${COLORS.GREEN}" filter="url(#neonGlow)"/>
                       <!-- Body -->
                       <path d="M32 19 L32 32" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <!-- One arm holding precision tool -->
                       <path d="M32 20 L36 24" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <!-- Precise tool (screwdriver/instrument) -->
                       <rect x="36" y="22" width="1" height="8" fill="${COLORS.CYAN}"/>
                       <circle cx="36.5" cy="22" r="1" fill="${COLORS.YELLOW}"/>
                       <!-- Other arm supporting work -->
                       <path d="M32 22 L28 26" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <!-- Work piece being skillfully handled -->
                       <rect x="26" y="24" width="4" height="4" fill="${COLORS.PURPLE}" opacity="0.6"/>
                       <!-- Precise work lines -->
                       <path d="M30 26 L34 26" stroke="${COLORS.CYAN}" stroke-width="1"/>
                       <path d="M30 28 L34 28" stroke="${COLORS.CYAN}" stroke-width="1"/>
                       <!-- Confident stance -->
                       <path d="M32 32 L28 44" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <path d="M32 32 L36 44" stroke="${COLORS.GREEN}" stroke-width="2"/>
                       <!-- Skill mastery indicators -->
                       <circle cx="40" cy="20" r="0.5" fill="${COLORS.YELLOW}"/>
                       <circle cx="42" cy="24" r="0.5" fill="${COLORS.YELLOW}"/>
                       <circle cx="44" cy="28" r="0.5" fill="${COLORS.YELLOW}"/>`,
            
            'Nerves of Steel': `<!-- Stick figure in steady, unshakeable pose -->
                               <circle cx="32" cy="16" r="3" fill="${COLORS.PURPLE}" filter="url(#neonGlow)"/>
                               <!-- Body perfectly straight -->
                               <path d="M32 19 L32 32" stroke="${COLORS.PURPLE}" stroke-width="3"/>
                               <!-- Arms at sides, perfectly steady -->
                               <path d="M32 20 L28 28" stroke="${COLORS.PURPLE}" stroke-width="2"/>
                               <path d="M32 20 L36 28" stroke="${COLORS.PURPLE}" stroke-width="2"/>
                               <!-- Hands steady as rock -->
                               <circle cx="28" cy="28" r="1.5" fill="${COLORS.CYAN}"/>
                               <circle cx="36" cy="28" r="1.5" fill="${COLORS.CYAN}"/>
                               <!-- Perfect balance stance -->
                               <path d="M32 32 L30 44" stroke="${COLORS.PURPLE}" stroke-width="2"/>
                               <path d="M32 32 L34 44" stroke="${COLORS.PURPLE}" stroke-width="2"/>
                               <!-- Steel reinforcement visual -->
                               <rect x="30" y="24" width="4" height="1" fill="${COLORS.CYAN}"/>
                               <rect x="30" y="30" width="4" height="1" fill="${COLORS.CYAN}"/>
                               <!-- Steady lines (no tremor) -->
                               <path d="M16 20 L24 20 M40 20 L48 20" stroke="${COLORS.CYAN}" stroke-width="1" opacity="0.8"/>
                               <path d="M16 32 L24 32 M40 32 L48 32" stroke="${COLORS.CYAN}" stroke-width="1" opacity="0.8"/>
                               <!-- Unshakeable indicator -->
                               <text x="20" y="12" font-size="3" fill="${COLORS.CYAN}">💪</text>
                               <text x="44" y="40" font-size="3" fill="${COLORS.CYAN}">⛰️</text>`,
            
            'Protector': `<!-- Stick figure with shield protecting another -->
                         <circle cx="28" cy="16" r="3" fill="${COLORS.GREEN}" filter="url(#neonGlow)"/>
                         <!-- Body in protective stance -->
                         <path d="M28 19 L28 32" stroke="${COLORS.GREEN}" stroke-width="2"/>
                         <!-- Arm holding large shield -->
                         <path d="M28 20 L22 24" stroke="${COLORS.GREEN}" stroke-width="2"/>
                         <!-- Large protective shield -->
                         <path d="M18 20 L14 24 L14 36 L18 44 L22 44 L26 36 L26 24 L22 20 Z" fill="${COLORS.GREEN}" opacity="0.8" stroke="${COLORS.GREEN}" stroke-width="2"/>
                         <!-- Shield cross emblem -->
                         <path d="M20 22 L20 42 M16 32 L24 32" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                         <!-- Other arm extended protectively -->
                         <path d="M28 22 L34 26" stroke="${COLORS.GREEN}" stroke-width="2"/>
                         <!-- Protected person behind -->
                         <circle cx="38" cy="24" r="2" fill="${COLORS.YELLOW}" opacity="0.7"/>
                         <path d="M38 26 L38 34" stroke="${COLORS.YELLOW}" stroke-width="1" opacity="0.7"/>
                         <path d="M38 28 L36 30" stroke="${COLORS.YELLOW}" stroke-width="1" opacity="0.7"/>
                         <path d="M38 28 L40 30" stroke="${COLORS.YELLOW}" stroke-width="1" opacity="0.7"/>
                         <!-- Protective stance legs -->
                         <path d="M28 32 L24 44" stroke="${COLORS.GREEN}" stroke-width="2"/>
                         <path d="M28 32 L32 44" stroke="${COLORS.GREEN}" stroke-width="2"/>
                         <!-- Protection aura -->
                         <circle cx="32" cy="28" r="18" fill="none" stroke="${COLORS.GREEN}" stroke-width="1" opacity="0.4"/>`,
            
            'Suspicious': `<!-- Stick figure looking skeptical with squinting eyes -->
                          <circle cx="32" cy="16" r="3" fill="${COLORS.PURPLE}" filter="url(#neonGlow)"/>
                          <!-- Skeptical face with squinted eyes -->
                          <path d="M30 15 L31 14 L30 16" stroke="${COLORS.DARK_BG}" stroke-width="1"/>
                          <path d="M34 15 L33 14 L34 16" stroke="${COLORS.DARK_BG}" stroke-width="1"/>
                          <!-- Raised eyebrow -->
                          <path d="M29 14 L31 13" stroke="${COLORS.YELLOW}" stroke-width="1"/>
                          <!-- Suspicious frown -->
                          <path d="M30 17 L32 18 L34 17" stroke="${COLORS.DARK_BG}" stroke-width="1"/>
                          <!-- Body leaning forward suspiciously -->
                          <path d="M32 19 L34 32" stroke="${COLORS.PURPLE}" stroke-width="2"/>
                          <!-- Arms crossed skeptically -->
                          <path d="M32 20 L28 26" stroke="${COLORS.PURPLE}" stroke-width="2"/>
                          <path d="M32 22 L36 28" stroke="${COLORS.PURPLE}" stroke-width="2"/>
                          <path d="M28 26 L36 24" stroke="${COLORS.PURPLE}" stroke-width="1"/>
                          <path d="M36 28 L28 24" stroke="${COLORS.PURPLE}" stroke-width="1"/>
                          <!-- Defensive stance -->
                          <path d="M34 32 L32 44" stroke="${COLORS.PURPLE}" stroke-width="2"/>
                          <path d="M34 32 L38 44" stroke="${COLORS.PURPLE}" stroke-width="2"/>
                          <!-- Question marks of doubt -->
                          <text x="20" y="20" font-size="3" fill="${COLORS.YELLOW}" opacity="0.7">?</text>
                          <text x="44" y="24" font-size="2" fill="${COLORS.YELLOW}" opacity="0.5">?</text>`,
            
            'Leap of Faith': `<!-- Stick figure jumping across gap with arms spread -->
                             <circle cx="24" cy="16" r="3" fill="${COLORS.GREEN}" filter="url(#neonGlow)"/>
                             <!-- Body in mid-jump -->
                             <path d="M24 19 L26 28" stroke="${COLORS.GREEN}" stroke-width="2"/>
                             <!-- Arms spread for balance/faith -->
                             <path d="M24 20 L18 18" stroke="${COLORS.GREEN}" stroke-width="2"/>
                             <path d="M24 20 L30 18" stroke="${COLORS.GREEN}" stroke-width="2"/>
                             <!-- Legs in jumping motion -->
                             <path d="M26 28 L22 32" stroke="${COLORS.GREEN}" stroke-width="2"/>
                             <path d="M26 28 L30 34" stroke="${COLORS.GREEN}" stroke-width="2"/>
                             <!-- Jump trajectory arc -->
                             <path d="M24 20 Q32 12 40 20" stroke="${COLORS.YELLOW}" stroke-width="2" fill="none" opacity="0.8"/>
                             <!-- Starting platform -->
                             <rect x="16" y="36" width="12" height="4" fill="${COLORS.CYAN}"/>
                             <!-- Gap/chasm -->
                             <rect x="28" y="40" width="12" height="8" fill="${COLORS.DARK_BG}"/>
                             <!-- Landing platform -->
                             <rect x="40" y="36" width="12" height="4" fill="${COLORS.CYAN}"/>
                             <!-- Motion lines -->
                             <path d="M20 22 L16 24 M28 22 L32 24" stroke="${COLORS.GREEN}" stroke-width="1" opacity="0.6"/>
                             <!-- Faith/courage symbols -->
                             <text x="32" y="12" font-size="3" fill="${COLORS.YELLOW}" opacity="0.7">✨</text>
                             <text x="44" y="28" font-size="2" fill="${COLORS.YELLOW}" opacity="0.5">🙏</text>`,
            
            'Interrogator': `<!-- Spotlight and questioning -->
                           <circle cx="32" cy="24" r="8" fill="${COLORS.YELLOW}" filter="url(#neonGlow)" opacity="0.8"/>
                           <!-- Intense light beam -->
                           <path d="M32 32 L32 48" stroke="${COLORS.YELLOW}" stroke-width="8" opacity="0.6"/>
                           <path d="M24 40 L40 40" stroke="${COLORS.YELLOW}" stroke-width="6" opacity="0.4"/>
                           <!-- Person being questioned (silhouette) -->
                           <circle cx="32" cy="44" r="3" fill="${COLORS.PURPLE}"/>
                           <ellipse cx="32" cy="52" rx="4" ry="6" fill="${COLORS.PURPLE}"/>
                           <!-- Question marks -->
                           <text x="20" y="20" text-anchor="middle" fill="${COLORS.PURPLE}" font-family="monospace" font-size="6" font-weight="bold">?</text>
                           <text x="44" y="16" text-anchor="middle" fill="${COLORS.PURPLE}" font-family="monospace" font-size="6" font-weight="bold">?</text>
                           <!-- Pressure lines -->
                           <path d="M16 32 L20 32 M44 32 L48 32" stroke="${COLORS.YELLOW}" stroke-width="2" opacity="0.7"/>`,
            
            'Wild Card': `<!-- Playing card with joker symbol -->
                         <rect x="20" y="16" width="24" height="32" fill="${COLORS.GROUP_GRAD}" filter="url(#neonGlow)" rx="4"/>
                         <rect x="22" y="18" width="20" height="28" fill="${COLORS.DARK_BG}" rx="2"/>
                         <!-- Joker face -->
                         <circle cx="32" cy="28" r="6" fill="${COLORS.PINK}"/>
                         <circle cx="29" cy="26" r="1" fill="${COLORS.DARK_BG}"/>
                         <circle cx="35" cy="26" r="1" fill="${COLORS.DARK_BG}"/>
                         <path d="M29 30 Q32 34 35 30" stroke="${COLORS.YELLOW}" stroke-width="2" fill="none"/>
                         <!-- Card suits in corners -->
                         <text x="24" y="22" text-anchor="middle" fill="${COLORS.RED}" font-family="monospace" font-size="4" font-weight="bold">♠</text>
                         <text x="40" y="22" text-anchor="middle" fill="${COLORS.RED}" font-family="monospace" font-size="4" font-weight="bold">♥</text>
                         <text x="24" y="42" text-anchor="middle" fill="${COLORS.RED}" font-family="monospace" font-size="4" font-weight="bold">♣</text>
                         <text x="40" y="42" text-anchor="middle" fill="${COLORS.RED}" font-family="monospace" font-size="4" font-weight="bold">♦</text>
                         <!-- Chaos sparkles -->
                         <circle cx="16" cy="12" r="1" fill="${COLORS.YELLOW}"/>
                         <circle cx="48" cy="52" r="1" fill="${COLORS.PINK}"/>`,
            
            'Trouble Maker': `<!-- Stick figure with mischievous pose and devil horns -->
                             <circle cx="32" cy="16" r="3" fill="${COLORS.RED}" filter="url(#neonGlow)"/>
                             <!-- Devil horns -->
                             <path d="M28 13 L30 10" stroke="${COLORS.ORANGE}" stroke-width="2"/>
                             <path d="M36 13 L34 10" stroke="${COLORS.ORANGE}" stroke-width="2"/>
                             <!-- Mischievous eyes (winking) -->
                             <circle cx="30" cy="15" r="0.5" fill="${COLORS.DARK_BG}"/>
                             <path d="M33 15 L35 15" stroke="${COLORS.DARK_BG}" stroke-width="1"/>
                             <!-- Troublemaker grin -->
                             <path d="M30 17 Q32 19 34 17" stroke="${COLORS.YELLOW}" stroke-width="1"/>
                             <!-- Body in mischievous pose -->
                             <path d="M32 19 L32 32" stroke="${COLORS.RED}" stroke-width="2"/>
                             <!-- Arms in "up to no good" gesture -->
                             <path d="M32 20 L28 24" stroke="${COLORS.RED}" stroke-width="2"/>
                             <path d="M32 22 L38 18" stroke="${COLORS.RED}" stroke-width="2"/>
                             <!-- One hand behind back (hiding something) -->
                             <circle cx="28" cy="24" r="1" fill="${COLORS.ORANGE}"/>
                             <!-- Other hand pointing/scheming -->
                             <circle cx="38" cy="18" r="1" fill="${COLORS.ORANGE}"/>
                             <!-- Mischievous stance -->
                             <path d="M32 32 L28 44" stroke="${COLORS.RED}" stroke-width="2"/>
                             <path d="M32 32 L36 44" stroke="${COLORS.RED}" stroke-width="2"/>
                             <!-- Trouble symbols -->
                             <text x="20" y="20" font-size="2" fill="${COLORS.ORANGE}" opacity="0.7">💥</text>
                             <text x="44" y="28" font-size="2" fill="${COLORS.ORANGE}" opacity="0.7">⚡</text>`,
            
            'Relentless': `<!-- Stick figure charging forward unstoppably -->
                          <circle cx="32" cy="16" r="3" fill="${COLORS.ORANGE}" filter="url(#neonGlow)"/>
                          <!-- Body leaning forward in relentless charge -->
                          <path d="M32 19 L36 32" stroke="${COLORS.ORANGE}" stroke-width="3"/>
                          <!-- Arms pumping in determined motion -->
                          <path d="M32 20 L26 22" stroke="${COLORS.ORANGE}" stroke-width="2"/>
                          <path d="M32 22 L38 18" stroke="${COLORS.ORANGE}" stroke-width="2"/>
                          <!-- Determined facial expression -->
                          <path d="M30 15 L31 14" stroke="${COLORS.DARK_BG}" stroke-width="1"/>
                          <path d="M33 15 L34 14" stroke="${COLORS.DARK_BG}" stroke-width="1"/>
                          <path d="M30 17 L34 17" stroke="${COLORS.DARK_BG}" stroke-width="1"/>
                          <!-- Legs in running/charging motion -->
                          <path d="M36 32 L34 44" stroke="${COLORS.ORANGE}" stroke-width="2"/>
                          <path d="M36 32 L40 46" stroke="${COLORS.ORANGE}" stroke-width="2"/>
                          <!-- Motion blur/speed lines -->
                          <path d="M20 18 L28 20 M18 22 L26 24 M16 26 L24 28" stroke="${COLORS.YELLOW}" stroke-width="2" opacity="0.7"/>
                          <!-- Unstoppable force indicators -->
                          <path d="M44 16 L48 18 M44 20 L48 22 M44 24 L48 26" stroke="${COLORS.ORANGE}" stroke-width="2" opacity="0.6"/>
                          <!-- Never gives up symbol -->
                          <text x="20" y="12" font-size="2" fill="${COLORS.YELLOW}" opacity="0.7">🔥</text>
                          <text x="44" y="36" font-size="2" fill="${COLORS.YELLOW}" opacity="0.7">💪</text>`,
            
            // Default fallback
            'default': `<!-- Generic ability symbol -->
                       <circle cx="32" cy="32" r="12" fill="${COLORS.CYAN}" filter="url(#neonGlow)"/>
                       <text x="32" y="36" text-anchor="middle" fill="${COLORS.DARK_BG}" font-family="monospace" font-size="6" font-weight="bold">?</text>`
        };
        
        return shapes[abilityName] || shapes['default'];
    }
    
    // Generate individual group ability icons (specific abilities within group suites)
    static generateGroupAbilityIconShape(abilityName, groupSuite) {
        const groupAbilityShapes = {
            // La Familia (d6) individual abilities
            'La Familia - Tough': `<!-- Stick figure helping another stand strong -->
                                  <circle cx="26" cy="16" r="3" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                                  <path d="M26 19 L26 30" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                  <path d="M26 22 L32 20" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                  <!-- Helping another person -->
                                  <circle cx="38" cy="20" r="3" fill="${COLORS.PINK}" opacity="0.8"/>
                                  <path d="M38 23 L38 34" stroke="${COLORS.PINK}" stroke-width="2" opacity="0.8"/>
                                  <!-- Support connection -->
                                  <path d="M32 20 L35 22" stroke="${COLORS.YELLOW}" stroke-width="3"/>
                                  <!-- Legs -->
                                  <path d="M26 30 L22 42" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                  <path d="M26 30 L30 42" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                  <path d="M38 34 L34 46" stroke="${COLORS.PINK}" stroke-width="2" opacity="0.8"/>
                                  <path d="M38 34 L42 46" stroke="${COLORS.PINK}" stroke-width="2" opacity="0.8"/>`,
            
            'La Familia - Tokens': `<!-- Stick figure sharing tokens with others -->
                                   <circle cx="22" cy="16" r="3" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                                   <path d="M22 19 L22 30" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                   <!-- Arms giving tokens -->
                                   <path d="M22 22 L32 24" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                   <path d="M22 22 L42 26" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                   <!-- Recipients -->
                                   <circle cx="36" cy="20" r="2" fill="${COLORS.PINK}" opacity="0.7"/>
                                   <circle cx="46" cy="22" r="2" fill="${COLORS.PINK}" opacity="0.7"/>
                                   <!-- Tokens being shared -->
                                   <circle cx="28" cy="20" r="1.5" fill="${COLORS.YELLOW}"/>
                                   <circle cx="32" cy="22" r="1.5" fill="${COLORS.YELLOW}"/>
                                   <circle cx="38" cy="24" r="1.5" fill="${COLORS.YELLOW}"/>
                                   <!-- Legs -->
                                   <path d="M22 30 L18 42" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                   <path d="M22 30 L26 42" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>`,
            
            'La Familia - Skill Die': `<!-- Stick figure lending/passing a glowing die -->
                                      <circle cx="24" cy="16" r="3" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                                      <path d="M24 19 L24 30" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                      <!-- Arm extending die -->
                                      <path d="M24 22 L36 24" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                      <!-- Glowing die being passed -->
                                      <rect x="34" y="22" width="6" height="6" fill="${COLORS.YELLOW}" filter="url(#neonGlow)" rx="1"/>
                                      <circle cx="36" cy="24" r="1" fill="${COLORS.DARK_BG}"/>
                                      <circle cx="38" cy="26" r="1" fill="${COLORS.DARK_BG}"/>
                                      <!-- Recipient -->
                                      <circle cx="46" cy="20" r="2.5" fill="${COLORS.PINK}" opacity="0.8"/>
                                      <path d="M44 22 L42 24" stroke="${COLORS.PINK}" stroke-width="2" opacity="0.8"/>
                                      <!-- Legs -->
                                      <path d="M24 30 L20 42" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                      <path d="M24 30 L28 42" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>`,
            
            // Criminal Conspiracy (d6) individual abilities
            'Criminal Conspiracy - Item': `<!-- Stick figure pulling item from coat/bag -->
                                          <circle cx="28" cy="16" r="3" fill="${COLORS.STEALTH_GRAD}" filter="url(#neonGlow)"/>
                                          <path d="M28 19 L28 32" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                                          <!-- Coat/bag -->
                                          <path d="M24 22 L32 22 L34 30 L22 30 Z" fill="${COLORS.PURPLE}" opacity="0.7"/>
                                          <!-- Arm reaching into coat -->
                                          <path d="M28 22 L30 26" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                                          <!-- Item being pulled out -->
                                          <path d="M32 24 L38 20" stroke="${COLORS.YELLOW}" stroke-width="3"/>
                                          <circle cx="40" cy="18" r="2" fill="${COLORS.YELLOW}" filter="url(#neonGlow)"/>
                                          <!-- Legs -->
                                          <path d="M28 32 L24 44" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                                          <path d="M28 32 L32 44" stroke="${COLORS.STEALTH_GRAD}" stroke-width="2"/>
                                          <!-- Surprise sparkles -->
                                          <circle cx="44" cy="16" r="0.5" fill="${COLORS.YELLOW}"/>
                                          <circle cx="42" cy="14" r="0.5" fill="${COLORS.YELLOW}"/>`,
            
            'Criminal Conspiracy - Tech': `<!-- Stick figure combining tech and stealth -->
                                         <circle cx="28" cy="16" r="3" fill="${COLORS.TECH_GRAD}" filter="url(#neonGlow)"/>
                                         <path d="M28 19 L28 32" stroke="${COLORS.TECH_GRAD}" stroke-width="2"/>
                                         <!-- Tech device -->
                                         <rect x="20" y="22" width="6" height="4" fill="${COLORS.CYAN}" rx="1"/>
                                         <path d="M28 22 L26 24" stroke="${COLORS.TECH_GRAD}" stroke-width="2"/>
                                         <!-- Stealth element merging -->
                                         <path d="M32 20 L40 18" stroke="${COLORS.PURPLE}" stroke-width="2"/>
                                         <circle cx="42" cy="16" r="2" fill="${COLORS.PURPLE}" opacity="0.8"/>
                                         <!-- Combination effect -->
                                         <path d="M26 20 L42 16" stroke="${COLORS.YELLOW}" stroke-width="1" stroke-dasharray="2,2"/>
                                         <!-- Legs -->
                                         <path d="M28 32 L24 44" stroke="${COLORS.TECH_GRAD}" stroke-width="2"/>
                                         <path d="M28 32 L32 44" stroke="${COLORS.TECH_GRAD}" stroke-width="2"/>`,
            
            'Criminal Conspiracy - Hot': `<!-- Stick figure talking down opponent -->
                                        <circle cx="22" cy="16" r="3" fill="${COLORS.SOCIAL_GRAD}" filter="url(#neonGlow)"/>
                                        <path d="M22 19 L22 30" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                                        <!-- Calming gesture -->
                                        <path d="M22 22 L28 20" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                                        <circle cx="28" cy="20" r="1" fill="${COLORS.PINK}"/>
                                        <!-- Aggressive opponent being calmed -->
                                        <circle cx="42" cy="18" r="3" fill="${COLORS.RED}" opacity="0.8"/>
                                        <path d="M42 21 L42 32" stroke="${COLORS.RED}" stroke-width="2" opacity="0.8"/>
                                        <!-- Angry to calm transition -->
                                        <path d="M39 16 L41 14" stroke="${COLORS.RED}" stroke-width="1"/>
                                        <path d="M45 16 L43 14" stroke="${COLORS.RED}" stroke-width="1"/>
                                        <!-- But calming down -->
                                        <path d="M40 20 L44 20" stroke="${COLORS.PINK}" stroke-width="1"/>
                                        <!-- Speech/persuasion waves -->
                                        <path d="M30 18 L34 16 M32 20 L36 18" stroke="${COLORS.PINK}" stroke-width="1" opacity="0.7"/>
                                        <!-- Legs -->
                                        <path d="M22 30 L18 42" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                                        <path d="M22 30 L26 42" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>`,
            
            // Diesel Circus (d8) individual abilities
            'Diesel Circus - Injury Advantage': `<!-- Stick figure getting stronger after injury -->
                                               <circle cx="32" cy="16" r="3" fill="${COLORS.COMBAT_GRAD}" filter="url(#neonGlow)"/>
                                               <!-- Bandaged but determined -->
                                               <path d="M29 14 L35 18" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                                               <path d="M32 19 L32 32" stroke="${COLORS.COMBAT_GRAD}" stroke-width="3"/>
                                               <!-- Flexing arms (stronger after injury) -->
                                               <path d="M32 22 L26 18" stroke="${COLORS.COMBAT_GRAD}" stroke-width="3"/>
                                               <path d="M32 22 L38 18" stroke="${COLORS.COMBAT_GRAD}" stroke-width="3"/>
                                               <!-- Muscle definition -->
                                               <circle cx="24" cy="18" r="2" fill="${COLORS.RED}"/>
                                               <circle cx="40" cy="18" r="2" fill="${COLORS.RED}"/>
                                               <!-- Power legs -->
                                               <path d="M32 32 L28 44" stroke="${COLORS.COMBAT_GRAD}" stroke-width="3"/>
                                               <path d="M32 32 L36 44" stroke="${COLORS.COMBAT_GRAD}" stroke-width="3"/>
                                               <!-- Double roll dice -->
                                               <rect x="16" y="24" width="4" height="4" fill="${COLORS.YELLOW}" rx="1"/>
                                               <rect x="44" y="24" width="4" height="4" fill="${COLORS.YELLOW}" rx="1"/>`,
            
            'Diesel Circus - Double Explosion': `<!-- Stick figure with explosive energy doubled -->
                                               <circle cx="32" cy="16" r="3" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                                               <path d="M32 19 L32 30" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                               <!-- Arms spread in explosion pose -->
                                               <path d="M32 22 L22 18" stroke="${COLORS.TOKEN_GRAD}" stroke-width="3"/>
                                               <path d="M32 22 L42 18" stroke="${COLORS.TOKEN_GRAD}" stroke-width="3"/>
                                               <!-- Double explosion effects -->
                                               <circle cx="20" cy="16" r="6" fill="none" stroke="${COLORS.ORANGE}" stroke-width="2" opacity="0.7"/>
                                               <circle cx="44" cy="16" r="6" fill="none" stroke="${COLORS.ORANGE}" stroke-width="2" opacity="0.7"/>
                                               <!-- Extra tokens -->
                                               <circle cx="18" cy="12" r="1" fill="${COLORS.YELLOW}"/>
                                               <circle cx="22" cy="10" r="1" fill="${COLORS.YELLOW}"/>
                                               <circle cx="46" cy="12" r="1" fill="${COLORS.YELLOW}"/>
                                               <circle cx="42" cy="10" r="1" fill="${COLORS.YELLOW}"/>
                                               <!-- Legs -->
                                               <path d="M32 30 L28 42" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                               <path d="M32 30 L36 42" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>`,
            
            'Diesel Circus - Drive Check': `<!-- Stick figure driving, then doing another action -->
                                          <circle cx="20" cy="16" r="3" fill="${COLORS.VEHICLE_GRAD}" filter="url(#neonGlow)"/>
                                          <!-- Steering wheel -->
                                          <circle cx="20" cy="24" r="4" fill="none" stroke="${COLORS.VEHICLE_GRAD}" stroke-width="3"/>
                                          <path d="M20 19 L20 20" stroke="${COLORS.VEHICLE_GRAD}" stroke-width="2"/>
                                          <!-- Arrow showing sequence -->
                                          <path d="M28 20 L36 20" stroke="${COLORS.YELLOW}" stroke-width="3"/>
                                          <path d="M34 18 L36 20 L34 22" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                                          <!-- Second action figure -->
                                          <circle cx="44" cy="16" r="3" fill="${COLORS.UTILITY_GRAD}" filter="url(#neonGlow)"/>
                                          <path d="M44 19 L44 30" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                          <!-- Different skill action -->
                                          <path d="M44 22 L48 18" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                          <rect x="48" y="16" width="3" height="4" fill="${COLORS.CYAN}" rx="1"/>
                                          <!-- Bonus effect -->
                                          <text x="32" y="32" text-anchor="middle" fill="${COLORS.YELLOW}" font-size="6" font-weight="bold">+</text>`,

            // The Continentals (d8) individual abilities  
            'The Continentals - Wits': `<!-- Stick figure with enhanced intelligence/die boost -->
                                       <circle cx="32" cy="14" r="4" fill="${COLORS.UTILITY_GRAD}" filter="url(#neonGlow)"/>
                                       <!-- Brain power lines -->
                                       <path d="M28 10 L24 6 M36 10 L40 6 M32 10 L32 6" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                                       <path d="M32 18 L32 30" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                       <!-- Intelligence gesture -->
                                       <path d="M32 22 L28 20" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                       <circle cx="26" cy="18" r="1" fill="${COLORS.YELLOW}"/>
                                       <!-- Token enhancing die -->
                                       <polygon points="40,20 44,22 44,26 40,28 36,26 36,22" fill="${COLORS.CYAN}" filter="url(#neonGlow)"/>
                                       <circle cx="40" cy="24" r="1" fill="${COLORS.YELLOW}"/>
                                       <!-- Connection line -->
                                       <path d="M32 22 L38 24" stroke="${COLORS.YELLOW}" stroke-width="1" stroke-dasharray="2,2"/>
                                       <!-- Legs -->
                                       <path d="M32 30 L28 42" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                       <path d="M32 30 L36 42" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>`,
            
            'The Continentals - Hot Checks': `<!-- Stick figure performing two successful social actions -->
                                            <circle cx="24" cy="16" r="3" fill="${COLORS.SOCIAL_GRAD}" filter="url(#neonGlow)"/>
                                            <path d="M24 19 L24 30" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                                            <!-- First successful social action -->
                                            <path d="M24 22 L32 20" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                                            <circle cx="34" cy="18" r="2" fill="${COLORS.PINK}" opacity="0.8"/>
                                            <!-- Second successful social action -->
                                            <path d="M24 26 L32 28" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                                            <circle cx="34" cy="30" r="2" fill="${COLORS.PINK}" opacity="0.8"/>
                                            <!-- Theft target -->
                                            <rect x="42" y="22" width="4" height="6" fill="${COLORS.YELLOW}" rx="1"/>
                                            <!-- Success arrows -->
                                            <path d="M36 18 L40 20" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                                            <path d="M36 30 L40 28" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                                            <!-- Legs -->
                                            <path d="M24 30 L20 42" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>
                                            <path d="M24 30 L28 42" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="2"/>`,
            
            'The Continentals - Melee': `<!-- Stick figure with melee weapon, lower DC indication -->
                                       <circle cx="28" cy="16" r="3" fill="${COLORS.COMBAT_GRAD}" filter="url(#neonGlow)"/>
                                       <path d="M28 19 L28 32" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                                       <!-- Melee weapon (sword) -->
                                       <path d="M28 22 L38 18" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                                       <path d="M38 16 L44 14" stroke="${COLORS.YELLOW}" stroke-width="4"/>
                                       <circle cx="44" cy="14" r="1" fill="${COLORS.YELLOW}"/>
                                       <!-- Easier success indicator -->
                                       <path d="M46 18 L50 14" stroke="${COLORS.CYAN}" stroke-width="2"/>
                                       <text x="52" y="16" fill="${COLORS.CYAN}" font-size="4" font-weight="bold">-3</text>
                                       <!-- Target -->
                                       <circle cx="46" cy="28" r="3" fill="${COLORS.RED}" opacity="0.6"/>
                                       <path d="M44 26 L48 30 M48 26 L44 30" stroke="${COLORS.YELLOW}" stroke-width="1"/>
                                       <!-- Legs -->
                                       <path d="M28 32 L24 44" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                                       <path d="M28 32 L32 44" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>`,

            // Continue with remaining group abilities...
            // Alpha Squad (d10)
            'Alpha Squad - Group Explosion': `<!-- Multiple stick figures working together -->
                                            <circle cx="20" cy="16" r="2" fill="${COLORS.COMBAT_GRAD}" filter="url(#neonGlow)"/>
                                            <circle cx="32" cy="14" r="2" fill="${COLORS.SOCIAL_GRAD}" filter="url(#neonGlow)"/>
                                            <circle cx="44" cy="16" r="2" fill="${COLORS.TECH_GRAD}" filter="url(#neonGlow)"/>
                                            <!-- Different skills being used -->
                                            <path d="M20 18 L20 26" stroke="${COLORS.COMBAT_GRAD}" stroke-width="1"/>
                                            <path d="M32 16 L32 26" stroke="${COLORS.SOCIAL_GRAD}" stroke-width="1"/>
                                            <path d="M44 18 L44 26" stroke="${COLORS.TECH_GRAD}" stroke-width="1"/>
                                            <!-- Cooperation circle -->
                                            <circle cx="32" cy="24" r="12" fill="none" stroke="${COLORS.YELLOW}" stroke-width="2" opacity="0.7"/>
                                            <!-- Explosion range reduction -->
                                            <text x="32" y="36" text-anchor="middle" fill="${COLORS.YELLOW}" font-size="6" font-weight="bold">-1</text>
                                            <!-- Team unity lines -->
                                            <path d="M20 20 L32 22 L44 20" stroke="${COLORS.YELLOW}" stroke-width="1" opacity="0.5"/>`,
            
            'Alpha Squad - Skill Add': `<!-- Two stick figures combining their efforts -->
                                      <circle cx="24" cy="16" r="3" fill="${COLORS.UTILITY_GRAD}" filter="url(#neonGlow)"/>
                                      <circle cx="40" cy="16" r="3" fill="${COLORS.UTILITY_GRAD}" filter="url(#neonGlow)"/>
                                      <!-- Both working on same skill -->
                                      <path d="M24 19 L24 28" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                      <path d="M40 19 L40 28" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                      <!-- Arms reaching toward common goal -->
                                      <path d="M24 22 L30 24" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                      <path d="M40 22 L34 24" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                      <!-- Combined result -->
                                      <circle cx="32" cy="24" r="4" fill="${COLORS.YELLOW}" filter="url(#neonGlow)"/>
                                      <text x="32" y="28" text-anchor="middle" fill="${COLORS.DARK_BG}" font-size="4" font-weight="bold">+</text>
                                      <!-- Legs -->
                                      <path d="M24 28 L20 40" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                      <path d="M24 28 L28 40" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                      <path d="M40 28 L36 40" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                      <path d="M40 28 L44 40" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>`,
            
            'Alpha Squad - Suit Up': `<!-- Group of stick figures getting powered up -->
                                    <circle cx="18" cy="16" r="2" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                                    <circle cx="28" cy="14" r="2" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                                    <circle cx="38" cy="16" r="2" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                                    <circle cx="48" cy="14" r="2" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                                    <!-- Power-up aura around group -->
                                    <circle cx="33" cy="20" r="20" fill="none" stroke="${COLORS.YELLOW}" stroke-width="2" opacity="0.6"/>
                                    <!-- Tokens appearing -->
                                    <circle cx="15" cy="24" r="1" fill="${COLORS.YELLOW}"/>
                                    <circle cx="20" cy="26" r="1" fill="${COLORS.YELLOW}"/>
                                    <circle cx="30" cy="24" r="1" fill="${COLORS.YELLOW}"/>
                                    <circle cx="35" cy="26" r="1" fill="${COLORS.YELLOW}"/>
                                    <circle cx="45" cy="24" r="1" fill="${COLORS.YELLOW}"/>
                                    <circle cx="50" cy="26" r="1" fill="${COLORS.YELLOW}"/>
                                    <!-- Team formation -->
                                    <text x="33" y="35" text-anchor="middle" fill="${COLORS.YELLOW}" font-size="5" font-weight="bold">SUIT UP!</text>`,

            // Marauders (d10)
            'Marauders - +10': `<!-- Stick figure defeating multiple opponents -->
                              <circle cx="26" cy="16" r="3" fill="${COLORS.COMBAT_GRAD}" filter="url(#neonGlow)"/>
                              <path d="M26 19 L26 30" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                              <!-- Combat action -->
                              <path d="M26 22 L34 20" stroke="${COLORS.COMBAT_GRAD}" stroke-width="3"/>
                              <!-- First defeated opponent -->
                              <circle cx="38" cy="18" r="2" fill="${COLORS.RED}" opacity="0.5"/>
                              <path d="M36 16 L40 20 M40 16 L36 20" stroke="${COLORS.RED}" stroke-width="1"/>
                              <!-- Additional opponent defeated -->
                              <circle cx="46" cy="24" r="2" fill="${COLORS.RED}" opacity="0.5"/>
                              <path d="M44 22 L48 26 M48 22 L44 26" stroke="${COLORS.RED}" stroke-width="1"/>
                              <!-- +10 damage indicator -->
                              <text x="34" y="32" text-anchor="middle" fill="${COLORS.YELLOW}" font-size="6" font-weight="bold">+10</text>
                              <!-- Legs -->
                              <path d="M26 30 L22 42" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                              <path d="M26 30 L30 42" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>`,
            
            'Marauders - Destroyer': `<!-- Stick figure destroying object, gaining token -->
                                    <circle cx="24" cy="16" r="3" fill="${COLORS.COMBAT_GRAD}" filter="url(#neonGlow)"/>
                                    <path d="M24 19 L24 30" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                                    <!-- Destruction action -->
                                    <path d="M24 22 L36 20" stroke="${COLORS.COMBAT_GRAD}" stroke-width="3"/>
                                    <circle cx="38" cy="18" r="2" fill="${COLORS.RED}"/>
                                    <!-- Object being destroyed -->
                                    <rect x="40" y="24" width="6" height="8" fill="none" stroke="${COLORS.PURPLE}" stroke-width="2"/>
                                    <path d="M38 22 L48 32 M48 22 L38 32" stroke="${COLORS.ORANGE}" stroke-width="2"/>
                                    <!-- Token reward -->
                                    <circle cx="44" cy="14" r="2" fill="${COLORS.YELLOW}" filter="url(#neonGlow)"/>
                                    <path d="M42 12 L46 16 M46 12 L42 16" stroke="${COLORS.YELLOW}" stroke-width="1"/>
                                    <!-- Legs -->
                                    <path d="M24 30 L20 42" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                                    <path d="M24 30 L28 42" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>`,
            
            'Marauders - Firestarter': `<!-- Stick figure causing fire/destruction as part of action -->
                                      <circle cx="28" cy="16" r="3" fill="${COLORS.COMBAT_GRAD}" filter="url(#neonGlow)"/>
                                      <path d="M28 19 L28 30" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                                      <!-- Action with fire element -->
                                      <path d="M28 22 L36 24" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                                      <!-- Fire effects -->
                                      <path d="M38 20 L42 16 L40 24 L44 18 L42 26" stroke="${COLORS.ORANGE}" stroke-width="2" fill="none"/>
                                      <path d="M42 28 L46 24 L44 32 L48 26 L46 34" stroke="${COLORS.RED}" stroke-width="2" fill="none"/>
                                      <!-- Sparks -->
                                      <circle cx="40" cy="14" r="0.5" fill="${COLORS.YELLOW}"/>
                                      <circle cx="44" cy="12" r="0.5" fill="${COLORS.YELLOW}"/>
                                      <circle cx="38" cy="18" r="0.5" fill="${COLORS.ORANGE}"/>
                                      <!-- Legs -->
                                      <path d="M28 30 L24 42" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>
                                      <path d="M28 30 L32 42" stroke="${COLORS.COMBAT_GRAD}" stroke-width="2"/>`,

            // The Ones (d12)
            'The Ones - Max Roll': `<!-- Stick figure turning bad luck into perfect luck -->
                                  <circle cx="32" cy="16" r="3" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                                  <path d="M32 19 L32 30" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                  <!-- Bad roll transforming -->
                                  <rect x="20" y="20" width="4" height="4" fill="${COLORS.RED}" rx="1"/>
                                  <circle cx="22" cy="22" r="1" fill="${COLORS.DARK_BG}"/>
                                  <!-- Transformation arrow -->
                                  <path d="M26 22 L34 22" stroke="${COLORS.YELLOW}" stroke-width="3"/>
                                  <path d="M32 20 L34 22 L32 24" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                                  <!-- Perfect roll -->
                                  <polygon points="40,18 42,20 44,18 44,22 42,24 40,22 38,24 38,20" fill="${COLORS.YELLOW}" filter="url(#neonGlow)"/>
                                  <text x="41" y="23" text-anchor="middle" fill="${COLORS.DARK_BG}" font-size="3" font-weight="bold">MAX</text>
                                  <!-- Legs -->
                                  <path d="M32 30 L28 42" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                  <path d="M32 30 L36 42" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>`,
            
            'The Ones - Reroll': `<!-- Stick figure trying again with different skill -->
                                <circle cx="26" cy="16" r="3" fill="${COLORS.UTILITY_GRAD}" filter="url(#neonGlow)"/>
                                <path d="M26 19 L26 30" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                <!-- First failed attempt -->
                                <path d="M26 22 L32 20" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                <rect x="32" y="18" width="4" height="4" fill="${COLORS.RED}" rx="1"/>
                                <path d="M32 20 L36 24 M36 20 L32 24" stroke="${COLORS.RED}" stroke-width="1"/>
                                <!-- Switch to different skill -->
                                <path d="M38 22 L42 18" stroke="${COLORS.CYAN}" stroke-width="2"/>
                                <path d="M40 16 L42 18 L40 20" stroke="${COLORS.CYAN}" stroke-width="2"/>
                                <!-- Second attempt with new skill -->
                                <path d="M26 26 L38 28" stroke="${COLORS.CYAN}" stroke-width="2"/>
                                <circle cx="40" cy="30" r="2" fill="${COLORS.CYAN}"/>
                                <!-- Legs -->
                                <path d="M26 30 L22 42" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                <path d="M26 30 L30 42" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>`,
            
            'The Ones - Turbo Tokens': `<!-- Stick figure accepting failure for massive token gain -->
                                      <circle cx="28" cy="16" r="3" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                                      <path d="M28 19 L28 30" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                      <!-- Accepting the nat 1 -->
                                      <rect x="20" y="22" width="4" height="4" fill="${COLORS.RED}" rx="1"/>
                                      <circle cx="22" cy="24" r="1" fill="${COLORS.DARK_BG}"/>
                                      <path d="M28 22 L24 24" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                      <!-- Token explosion -->
                                      <circle cx="38" cy="20" r="1.5" fill="${COLORS.YELLOW}"/>
                                      <circle cx="42" cy="18" r="1.5" fill="${COLORS.YELLOW}"/>
                                      <circle cx="40" cy="24" r="1.5" fill="${COLORS.YELLOW}"/>
                                      <circle cx="44" cy="22" r="1.5" fill="${COLORS.YELLOW}"/>
                                      <circle cx="36" cy="26" r="1.5" fill="${COLORS.YELLOW}"/>
                                      <!-- Token flow -->
                                      <path d="M26 26 L36 24" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                                      <!-- Legs -->
                                      <path d="M28 30 L24 42" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                      <path d="M28 30 L32 42" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>`,

            // Tactical Command (d12)
            'Tactical Command - Shared Tokens': `<!-- Stick figures sharing tokens across time/space -->
                                               <circle cx="20" cy="16" r="2" fill="${COLORS.UTILITY_GRAD}" filter="url(#neonGlow)"/>
                                               <circle cx="44" cy="16" r="2" fill="${COLORS.UTILITY_GRAD}" filter="url(#neonGlow)"/>
                                               <!-- Time/space separation -->
                                               <path d="M32 12 L32 36" stroke="${COLORS.PURPLE}" stroke-width="1" stroke-dasharray="2,2"/>
                                               <!-- Tokens being shared -->
                                               <circle cx="24" cy="20" r="1" fill="${COLORS.YELLOW}"/>
                                               <circle cx="26" cy="22" r="1" fill="${COLORS.YELLOW}"/>
                                               <!-- Transfer across scenes -->
                                               <path d="M28 20 L36 20" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                                               <path d="M34 18 L36 20 L34 22" stroke="${COLORS.YELLOW}" stroke-width="1"/>
                                               <!-- Received tokens -->
                                               <circle cx="40" cy="20" r="1" fill="${COLORS.YELLOW}"/>
                                               <circle cx="42" cy="22" r="1" fill="${COLORS.YELLOW}"/>
                                               <!-- Scene labels -->
                                               <text x="20" y="32" text-anchor="middle" fill="${COLORS.PURPLE}" font-size="3">Scene 1</text>
                                               <text x="44" y="32" text-anchor="middle" fill="${COLORS.PURPLE}" font-size="3">Scene 2</text>`,
            
            'Tactical Command - Reroll': `<!-- Stick figure getting second chance on failure -->
                                        <circle cx="32" cy="16" r="3" fill="${COLORS.UTILITY_GRAD}" filter="url(#neonGlow)"/>
                                        <path d="M32 19 L32 30" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                        <!-- Failed roll -->
                                        <rect x="24" y="22" width="4" height="4" fill="${COLORS.RED}" rx="1"/>
                                        <path d="M24 24 L28 28 M28 24 L24 28" stroke="${COLORS.RED}" stroke-width="1"/>
                                        <!-- Command decision to reroll -->
                                        <path d="M32 22 L28 24" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                        <!-- Reroll arrow -->
                                        <path d="M30 26 Q34 24 38 26 Q34 28 30 26" fill="none" stroke="${COLORS.CYAN}" stroke-width="2"/>
                                        <path d="M36 24 L38 26 L36 28" stroke="${COLORS.CYAN}" stroke-width="1"/>
                                        <!-- New successful roll -->
                                        <rect x="40" y="22" width="4" height="4" fill="${COLORS.CYAN}" rx="1"/>
                                        <circle cx="42" cy="24" r="1" fill="${COLORS.DARK_BG}"/>
                                        <!-- Legs -->
                                        <path d="M32 30 L28 42" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>
                                        <path d="M32 30 L36 42" stroke="${COLORS.UTILITY_GRAD}" stroke-width="2"/>`,
            
            'Tactical Command - Token Gain': `<!-- Stick figures getting tokens when empty -->
                                            <circle cx="20" cy="16" r="2" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                                            <circle cx="32" cy="16" r="2" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                                            <circle cx="44" cy="16" r="2" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                                            <!-- Empty token indicators -->
                                            <circle cx="20" cy="24" r="2" fill="none" stroke="${COLORS.RED}" stroke-width="1"/>
                                            <circle cx="32" cy="24" r="2" fill="none" stroke="${COLORS.RED}" stroke-width="1"/>
                                            <circle cx="44" cy="24" r="2" fill="none" stroke="${COLORS.RED}" stroke-width="1"/>
                                            <!-- Scene end transition -->
                                            <text x="32" y="34" text-anchor="middle" fill="${COLORS.PURPLE}" font-size="4">Scene End</text>
                                            <!-- Tokens being gained -->
                                            <circle cx="20" cy="40" r="1.5" fill="${COLORS.YELLOW}" filter="url(#neonGlow)"/>
                                            <circle cx="32" cy="40" r="1.5" fill="${COLORS.YELLOW}" filter="url(#neonGlow)"/>
                                            <circle cx="44" cy="40" r="1.5" fill="${COLORS.YELLOW}" filter="url(#neonGlow)"/>`,

            // Bustin' Makes Me Feel Good (d20)
            'Bustin\' Makes Me Feel Good - Track Restart': `<!-- Stick figure with nat 20, track restarting -->
                                                          <circle cx="26" cy="16" r="3" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                                                          <path d="M26 19 L26 30" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                                          <!-- Nat 20 roll -->
                                                          <polygon points="34,14 36,16 38,14 38,18 36,20 34,18 32,20 32,16" fill="${COLORS.YELLOW}" filter="url(#neonGlow)"/>
                                                          <text x="35" y="19" text-anchor="middle" fill="${COLORS.DARK_BG}" font-size="3" font-weight="bold">20</text>
                                                          <!-- Track restart -->
                                                          <path d="M40 16 Q46 12 52 16 Q46 20 40 16" fill="none" stroke="${COLORS.CYAN}" stroke-width="2"/>
                                                          <path d="M48 14 L52 16 L48 18" stroke="${COLORS.CYAN}" stroke-width="1"/>
                                                          <!-- Two dice now -->
                                                          <rect x="44" y="22" width="3" height="3" fill="${COLORS.CYAN}" rx="1"/>
                                                          <rect x="48" y="24" width="3" height="3" fill="${COLORS.CYAN}" rx="1"/>
                                                          <text x="32" y="36" text-anchor="middle" fill="${COLORS.CYAN}" font-size="4">Best Result</text>
                                                          <!-- Legs -->
                                                          <path d="M26 30 L22 42" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                                          <path d="M26 30 L30 42" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>`,
            
            'Bustin\' Makes Me Feel Good - Group Explosion': `<!-- One figure boosting everyone else -->
                                                            <circle cx="32" cy="16" r="3" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                                                            <!-- Nat 20 roll -->
                                                            <polygon points="28,12 30,14 32,12 32,16 30,18 28,16 26,18 26,14" fill="${COLORS.YELLOW}" filter="url(#neonGlow)"/>
                                                            <text x="29" y="17" text-anchor="middle" fill="${COLORS.DARK_BG}" font-size="2" font-weight="bold">20</text>
                                                            <!-- Everyone else around -->
                                                            <circle cx="16" cy="20" r="2" fill="${COLORS.PINK}" opacity="0.8"/>
                                                            <circle cx="48" cy="20" r="2" fill="${COLORS.PINK}" opacity="0.8"/>
                                                            <circle cx="16" cy="36" r="2" fill="${COLORS.PINK}" opacity="0.8"/>
                                                            <circle cx="48" cy="36" r="2" fill="${COLORS.PINK}" opacity="0.8"/>
                                                            <!-- Boost rays -->
                                                            <path d="M32 16 L18 22" stroke="${COLORS.YELLOW}" stroke-width="2" opacity="0.7"/>
                                                            <path d="M32 16 L46 22" stroke="${COLORS.YELLOW}" stroke-width="2" opacity="0.7"/>
                                                            <path d="M32 20 L18 34" stroke="${COLORS.YELLOW}" stroke-width="2" opacity="0.7"/>
                                                            <path d="M32 20 L46 34" stroke="${COLORS.YELLOW}" stroke-width="2" opacity="0.7"/>
                                                            <!-- Graduation symbols -->
                                                            <text x="16" y="30" text-anchor="middle" fill="${COLORS.YELLOW}" font-size="3">↑</text>
                                                            <text x="48" y="30" text-anchor="middle" fill="${COLORS.YELLOW}" font-size="3">↑</text>
                                                            <text x="16" y="46" text-anchor="middle" fill="${COLORS.YELLOW}" font-size="3">↑</text>
                                                            <text x="48" y="46" text-anchor="middle" fill="${COLORS.YELLOW}" font-size="3">↑</text>`,
            
            'Bustin\' Makes Me Feel Good - GM': `<!-- Stick figure taking control, director's chair -->
                                               <circle cx="28" cy="16" r="4" fill="${COLORS.TOKEN_GRAD}" filter="url(#neonGlow)"/>
                                               <path d="M28 20 L28 32" stroke="${COLORS.TOKEN_GRAD}" stroke-width="3"/>
                                               <!-- Director's chair -->
                                               <path d="M20 26 L36 26" stroke="${COLORS.YELLOW}" stroke-width="3"/>
                                               <path d="M22 26 L22 36" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                                               <path d="M34 26 L34 36" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                                               <path d="M20 36 L36 36" stroke="${COLORS.YELLOW}" stroke-width="2"/>
                                               <!-- Director label -->
                                               <text x="28" y="24" text-anchor="middle" fill="${COLORS.YELLOW}" font-size="3" font-weight="bold">GM</text>
                                               <!-- Nat 20 that triggered it -->
                                               <polygon points="42,18 44,20 46,18 46,22 44,24 42,22 40,24 40,20" fill="${COLORS.YELLOW}" filter="url(#neonGlow)"/>
                                               <text x="43" y="23" text-anchor="middle" fill="${COLORS.DARK_BG}" font-size="2" font-weight="bold">20</text>
                                               <!-- Timer -->
                                               <circle cx="48" cy="32" r="4" fill="none" stroke="${COLORS.CYAN}" stroke-width="2"/>
                                               <text x="48" y="36" text-anchor="middle" fill="${COLORS.CYAN}" font-size="3">60s</text>
                                               <!-- Legs -->
                                               <path d="M28 32 L24 44" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>
                                               <path d="M28 32 L32 44" stroke="${COLORS.TOKEN_GRAD}" stroke-width="2"/>`,
            
            // Default fallback for unknown group abilities
            'default': `<!-- Generic group ability symbol -->
                       <circle cx="32" cy="32" r="12" fill="${COLORS.GROUP_GRAD}" filter="url(#neonGlow)"/>
                       <text x="32" y="36" text-anchor="middle" fill="${COLORS.DARK_BG}" font-family="monospace" font-size="6" font-weight="bold">GA</text>`
        };
        
        const key = `${groupSuite} - ${abilityName}`;
        return groupAbilityShapes[key] || groupAbilityShapes['default'];
    }
    
    // Generate group ability suite icons
    static generateGroupIconShape(suiteName) {
        const groupShapes = {
            // D6 Groups (La Familia & Criminal Conspiracy)
            'La Familia': `<!-- D6 Die for d6 unlock requirement -->
                          <rect x="16" y="16" width="32" height="32" fill="${COLORS.GROUP_GRAD}" filter="url(#neonGlow)" rx="4"/>
                          <rect x="18" y="18" width="28" height="28" fill="${COLORS.DARK_BG}" rx="3"/>
                          <!-- Six dots in classic d6 pattern -->
                          <circle cx="26" cy="26" r="2" fill="${COLORS.YELLOW}"/>
                          <circle cx="38" cy="26" r="2" fill="${COLORS.YELLOW}"/>
                          <circle cx="26" cy="32" r="2" fill="${COLORS.YELLOW}"/>
                          <circle cx="38" cy="32" r="2" fill="${COLORS.YELLOW}"/>
                          <circle cx="26" cy="38" r="2" fill="${COLORS.YELLOW}"/>
                          <circle cx="38" cy="38" r="2" fill="${COLORS.YELLOW}"/>
                          <!-- 80s glow effect -->
                          <rect x="16" y="16" width="32" height="32" fill="none" stroke="${COLORS.PINK}" stroke-width="1" opacity="0.6" rx="4"/>`,
            
            'Criminal Conspiracy': `<!-- D6 Die for d6 unlock requirement -->
                                   <rect x="16" y="16" width="32" height="32" fill="${COLORS.GROUP_GRAD}" filter="url(#neonGlow)" rx="4"/>
                                   <rect x="18" y="18" width="28" height="28" fill="${COLORS.DARK_BG}" rx="3"/>
                                   <!-- Six dots in classic d6 pattern -->
                                   <circle cx="26" cy="26" r="2" fill="${COLORS.RED}"/>
                                   <circle cx="38" cy="26" r="2" fill="${COLORS.RED}"/>
                                   <circle cx="26" cy="32" r="2" fill="${COLORS.RED}"/>
                                   <circle cx="38" cy="32" r="2" fill="${COLORS.RED}"/>
                                   <circle cx="26" cy="38" r="2" fill="${COLORS.RED}"/>
                                   <circle cx="38" cy="38" r="2" fill="${COLORS.RED}"/>
                                   <!-- Criminal theme accent -->
                                   <rect x="16" y="16" width="32" height="32" fill="none" stroke="${COLORS.PURPLE}" stroke-width="1" opacity="0.6" rx="4"/>`,
            
            // D8 Groups (Diesel Circus & The Continentals)  
            'Diesel Circus': `<!-- D8 Die for d8 unlock requirement -->
                             <polygon points="32,12 44,24 44,40 32,52 20,40 20,24" fill="${COLORS.GROUP_GRAD}" filter="url(#neonGlow)"/>
                             <polygon points="32,16 40,26 40,38 32,48 24,38 24,26" fill="${COLORS.DARK_BG}"/>
                             <!-- Eight in center -->
                             <text x="32" y="36" text-anchor="middle" fill="${COLORS.ORANGE}" font-family="monospace" font-size="12" font-weight="bold">8</text>
                             <!-- Diesel/engine accent lines -->
                             <path d="M20 20 L16 16 M44 20 L48 16 M44 44 L48 48 M20 44 L16 48" stroke="${COLORS.ORANGE}" stroke-width="2" opacity="0.7"/>`,
            
            'The Continentals': `<!-- D8 Die for d8 unlock requirement -->
                                <polygon points="32,12 44,24 44,40 32,52 20,40 20,24" fill="${COLORS.GROUP_GRAD}" filter="url(#neonGlow)"/>
                                <polygon points="32,16 40,26 40,38 32,48 24,38 24,26" fill="${COLORS.DARK_BG}"/>
                                <!-- Eight in center -->
                                <text x="32" y="36" text-anchor="middle" fill="${COLORS.CYAN}" font-family="monospace" font-size="12" font-weight="bold">8</text>
                                <!-- Continental/elite accent -->
                                <polygon points="32,20 34,22 36,20 34,24 30,24" fill="${COLORS.YELLOW}" opacity="0.8"/>`,
            
            // D10 Groups (Alpha Squad & Marauders)
            'Alpha Squad': `<!-- D10 Die for d10 unlock requirement -->
                           <polygon points="32,8 48,20 44,32 48,44 32,56 16,44 20,32 16,20" fill="${COLORS.GROUP_GRAD}" filter="url(#neonGlow)"/>
                           <polygon points="32,12 44,22 41,32 44,42 32,52 20,42 23,32 20,22" fill="${COLORS.DARK_BG}"/>
                           <!-- Ten in center -->
                           <text x="32" y="36" text-anchor="middle" fill="${COLORS.CYAN}" font-family="monospace" font-size="10" font-weight="bold">10</text>
                           <!-- Alpha/military accent -->
                           <polygon points="32,16 34,18 36,16 34,20 30,20" fill="${COLORS.YELLOW}"/>`,
            
            'Marauders': `<!-- D10 Die for d10 unlock requirement -->
                         <polygon points="32,8 48,20 44,32 48,44 32,56 16,44 20,32 16,20" fill="${COLORS.GROUP_GRAD}" filter="url(#neonGlow)"/>
                         <polygon points="32,12 44,22 41,32 44,42 32,52 20,42 23,32 20,22" fill="${COLORS.DARK_BG}"/>
                         <!-- Subtle marauder accent lines positioned away from center -->
                         <path d="M20 20 L26 26 M42 20 L36 26 M20 44 L26 38 M42 44 L36 38" stroke="${COLORS.ORANGE}" stroke-width="1.5" opacity="0.4"/>
                         <!-- Ten in center with high contrast -->
                         <text x="32" y="36" text-anchor="middle" fill="${COLORS.RED}" font-family="monospace" font-size="10" font-weight="bold">10</text>
                         <!-- Dark outline for better text readability -->
                         <text x="32" y="36" text-anchor="middle" fill="${COLORS.DARK_BG}" font-family="monospace" font-size="10" font-weight="bold" stroke="${COLORS.DARK_BG}" stroke-width="0.5">10</text>`,
            
            // D12 Groups (The Ones & Tactical Command)
            'The Ones': `<!-- D12 Die for d12 unlock requirement -->
                        <polygon points="32,8 44,16 52,24 52,40 44,48 32,56 20,48 12,40 12,24 20,16" fill="${COLORS.GROUP_GRAD}" filter="url(#neonGlow)"/>
                        <polygon points="32,12 42,18 48,26 48,38 42,46 32,52 22,46 16,38 16,26 22,18" fill="${COLORS.DARK_BG}"/>
                        <!-- Twelve in center -->
                        <text x="32" y="36" text-anchor="middle" fill="${COLORS.YELLOW}" font-family="monospace" font-size="9" font-weight="bold">12</text>
                        <!-- Elite/special accent -->
                        <circle cx="32" cy="20" r="2" fill="${COLORS.YELLOW}" opacity="0.8"/>
                        <circle cx="32" cy="44" r="2" fill="${COLORS.YELLOW}" opacity="0.8"/>`,
            
            'Tactical Command': `<!-- D12 Die for d12 unlock requirement -->
                               <polygon points="32,8 44,16 52,24 52,40 44,48 32,56 20,48 12,40 12,24 20,16" fill="${COLORS.GROUP_GRAD}" filter="url(#neonGlow)"/>
                               <polygon points="32,12 42,18 48,26 48,38 42,46 32,52 22,46 16,38 16,26 22,18" fill="${COLORS.DARK_BG}"/>
                               <!-- Twelve in center -->
                               <text x="32" y="36" text-anchor="middle" fill="${COLORS.CYAN}" font-family="monospace" font-size="9" font-weight="bold">12</text>
                               <!-- Command/tactical accent -->
                               <polygon points="32,16 34,18 36,16 34,20 30,20" fill="${COLORS.CYAN}" opacity="0.8"/>
                               <polygon points="32,48 30,46 28,48 30,44 34,44" fill="${COLORS.CYAN}" opacity="0.8"/>`,
            
            // D20 Group (Bustin' Makes Me Feel Good)
            'Bustin\' Makes Me Feel Good': `<!-- D20 Die for d20 unlock requirement -->
                                          <polygon points="32,4 52,16 58,32 52,48 32,60 12,48 6,32 12,16" fill="${COLORS.GROUP_GRAD}" filter="url(#neonGlow)"/>
                                          <polygon points="32,8 48,18 54,32 48,46 32,56 16,46 10,32 16,18" fill="${COLORS.DARK_BG}"/>
                                          <!-- Twenty in center -->
                                          <text x="32" y="36" text-anchor="middle" fill="${COLORS.YELLOW}" font-family="monospace" font-size="8" font-weight="bold">20</text>
                                          <!-- Ultimate/legendary accent -->
                                          <polygon points="32,12 34,14 36,12 34,16 30,16" fill="${COLORS.YELLOW}"/>
                                          <polygon points="32,52 30,50 28,52 30,48 34,48" fill="${COLORS.YELLOW}"/>
                                          <circle cx="20" cy="20" r="1" fill="${COLORS.YELLOW}" opacity="0.6"/>
                                          <circle cx="44" cy="20" r="1" fill="${COLORS.YELLOW}" opacity="0.6"/>
                                          <circle cx="20" cy="44" r="1" fill="${COLORS.YELLOW}" opacity="0.6"/>
                                          <circle cx="44" cy="44" r="1" fill="${COLORS.YELLOW}" opacity="0.6"/>`
        };
        
        return groupShapes[suiteName] || groupShapes['default'] || `<circle cx="32" cy="32" r="16" fill="${COLORS.GROUP_GRAD}" filter="url(#neonGlow)"/>
                                                                  <text x="32" y="36" text-anchor="middle" fill="${COLORS.DARK_BG}" font-family="monospace" font-size="6" font-weight="bold">GRP</text>`;
    }

    // Generate complete SVG icon
    static generateIcon(abilityName, category = 'default') {
        return this.createSVGBase() + 
               this.addScanlines() + 
               this.generateIconShape(abilityName, category) + 
               this.closeSVG();
    }
    
    // Generate group ability icon
    static generateGroupIcon(suiteName) {
        return this.createSVGBase() + 
               this.addScanlines() + 
               this.generateGroupIconShape(suiteName) + 
               this.closeSVG();
    }
    // Generate individual group ability icon
    static generateIndividualGroupAbilityIcon(abilityName, groupSuite) {
        return this.createSVGBase() + 
               this.addScanlines() + 
               this.generateGroupAbilityIconShape(abilityName, groupSuite) + 
               this.closeSVG();
    }
}

// Export the generator for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SVGIconGenerator;
}