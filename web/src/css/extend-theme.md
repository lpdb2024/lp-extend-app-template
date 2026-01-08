# eXtend Theme Design System

## Overview

**eXtend** is LivePerson's 3rd party innovation platform where teams collaborate and bring ideas to life. The visual identity captures the essence of creative explosion, cosmic possibility, and community collaboration.

### Design Philosophy
- **Collaborative Energy**: Like paint splashing together to create something new
- **Cosmic Depth**: Deep, expansive backgrounds representing infinite possibilities
- **Flowing Connection**: Ribbon-like gradients symbolizing the intertwining of ideas
- **Community Focus**: People coming together under a shared creative vision

---

## Typography

### Font Family Stack

#### Primary: Sohne Breit (Headlines & Display)
The bold, confident presence of Sohne Breit conveys professionalism and forward-thinking innovation.

| Weight | German Name | Usage |
|--------|-------------|-------|
| 200 | Extraleicht | Subtle labels, watermarks |
| 300 | Leicht | Secondary text, captions |
| 400 | Buch | Body text alternative |
| 500 | Kraftig | Emphasized body text |
| 600 | Halbfett | Subheadings, buttons |
| 700 | Dreiviertelfett | Section headings |
| 800 | Fett | Hero titles, primary headings |

#### Secondary: Inter (Body & UI)
Clean, highly legible sans-serif for extended reading and interface elements.

#### Monospace: Fira Code
For code blocks, technical content, and data displays.

### Typography Scale

```scss
// Display (Hero titles)
$ext-display-1: 4rem;      // 64px - Major hero headlines
$ext-display-2: 3rem;      // 48px - Section heroes
$ext-display-3: 2.5rem;    // 40px - Page titles

// Headings
$ext-h1: 2rem;             // 32px
$ext-h2: 1.5rem;           // 24px
$ext-h3: 1.25rem;          // 20px
$ext-h4: 1.125rem;         // 18px
$ext-h5: 1rem;             // 16px
$ext-h6: 0.875rem;         // 14px

// Body
$ext-body-lg: 1.125rem;    // 18px
$ext-body: 1rem;           // 16px
$ext-body-sm: 0.875rem;    // 14px
$ext-caption: 0.75rem;     // 12px
$ext-overline: 0.625rem;   // 10px
```

---

## Color System

### Brand Colors (LivePerson Base)
```scss
$lp-blue: #3863e5;      // Trust, stability
$lp-purple: #8d46eb;    // Innovation, creativity
$lp-pink: #e849b7;      // Energy, passion
$lp-orange: #ff6d00;    // Action, enthusiasm
```

### eXtend Extended Palette

#### Primary - Cosmic Blue
Deep, sophisticated blues that form the foundation of dark themes.

| Token | Hex | Usage |
|-------|-----|-------|
| `ext-cosmic-950` | #070820 | Deepest dark background |
| `ext-cosmic-900` | #0c1035 | Dark mode base |
| `ext-cosmic-800` | #12184a | Cards, elevated surfaces |
| `ext-cosmic-700` | #1c2464 | Interactive hover states |
| `ext-cosmic-600` | #283380 | Borders, dividers |
| `ext-cosmic-500` | #3548a0 | Muted elements |
| `ext-cosmic-400` | #5068c0 | Secondary text |
| `ext-cosmic-300` | #7890d8 | Placeholder text |
| `ext-cosmic-200` | #a8b8e8 | Disabled states |
| `ext-cosmic-100` | #d8e0f5 | Light theme muted |
| `ext-cosmic-50` | #f0f4fb | Light theme background |

#### Accent - Nebula Gradient
The signature gradient flowing from electric blue through purple and pink to vibrant orange.

| Token | Hex | Usage |
|-------|-----|-------|
| `ext-nebula-blue` | #4169e8 | Starting point, trust |
| `ext-nebula-purple` | #8d46eb | Mid-point 1, innovation |
| `ext-nebula-pink` | #e849b7 | Mid-point 2, energy |
| `ext-nebula-coral` | #ff6b6b | Accent, warmth |
| `ext-nebula-orange` | #ff8c42 | End point, action |

#### Status Colors
| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `ext-success` | #10b981 | #34d399 | Positive outcomes |
| `ext-warning` | #f59e0b | #fbbf24 | Caution, attention |
| `ext-error` | #ef4444 | #f87171 | Errors, destructive |
| `ext-info` | #31ccec | #67e8f9 | Information, highlights |

### Semantic Tokens

#### Light Theme
```scss
--ext-bg-base: #f0f4fb;           // Page background
--ext-bg-surface: #ffffff;         // Card backgrounds
--ext-bg-elevated: #f8fafc;        // Elevated surfaces
--ext-bg-muted: #e8eef6;          // Muted sections

--ext-text-primary: #0f172a;       // Primary text
--ext-text-secondary: #475569;     // Secondary text
--ext-text-muted: #94a3b8;         // Disabled/placeholder
--ext-text-inverse: #ffffff;       // Text on dark bg

--ext-border-default: #e2e8f0;     // Standard borders
--ext-border-subtle: #f1f5f9;      // Subtle dividers
--ext-border-strong: #cbd5e1;      // Emphasized borders
```

#### Dark Theme
```scss
--ext-bg-base: #0c1035;            // Page background
--ext-bg-surface: rgba(18, 24, 74, 0.8);  // Card backgrounds
--ext-bg-elevated: #1c2464;        // Elevated surfaces
--ext-bg-muted: rgba(28, 36, 100, 0.5);   // Muted sections

--ext-text-primary: #f8fafc;       // Primary text
--ext-text-secondary: #a8b8e8;     // Secondary text
--ext-text-muted: #5068c0;         // Disabled/placeholder
--ext-text-inverse: #0f172a;       // Text on light bg

--ext-border-default: #283380;     // Standard borders
--ext-border-subtle: rgba(40, 51, 128, 0.5);  // Subtle dividers
--ext-border-strong: #3548a0;      // Emphasized borders
```

---

## Gradients

### Signature Gradients

#### Nebula Flow (Primary brand gradient)
```scss
$ext-gradient-nebula: linear-gradient(90deg, #4169e8, #8d46eb, #e849b7, #ff8c42);
$ext-gradient-nebula-reverse: linear-gradient(270deg, #4169e8, #8d46eb, #e849b7, #ff8c42);
$ext-gradient-nebula-diagonal: linear-gradient(135deg, #4169e8, #8d46eb, #e849b7, #ff8c42);
```

#### Aurora (Subtle backgrounds)
```scss
$ext-gradient-aurora-light: linear-gradient(180deg, #f0f4fb 0%, #e8eef6 100%);
$ext-gradient-aurora-dark: linear-gradient(180deg, #0c1035 0%, #12184a 100%);
```

#### Cosmic Radial (For hero sections)
```scss
$ext-gradient-cosmic: radial-gradient(ellipse at center, #1c2464 0%, #0c1035 70%);
```

#### Glass overlay
```scss
$ext-gradient-glass-light: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
$ext-gradient-glass-dark: linear-gradient(135deg, rgba(18,24,74,0.8) 0%, rgba(12,16,53,0.9) 100%);
```

---

## Effects & Treatments

### Shadows

#### Light Theme
```scss
$ext-shadow-xs: 0 1px 2px rgba(15, 23, 42, 0.05);
$ext-shadow-sm: 0 2px 4px rgba(15, 23, 42, 0.06);
$ext-shadow-md: 0 4px 12px rgba(15, 23, 42, 0.08);
$ext-shadow-lg: 0 8px 24px rgba(15, 23, 42, 0.10);
$ext-shadow-xl: 0 16px 48px rgba(15, 23, 42, 0.12);
```

#### Dark Theme
```scss
$ext-shadow-dark-xs: 0 1px 2px rgba(0, 0, 0, 0.2);
$ext-shadow-dark-sm: 0 2px 4px rgba(0, 0, 0, 0.25);
$ext-shadow-dark-md: 0 4px 12px rgba(0, 0, 0, 0.3);
$ext-shadow-dark-lg: 0 8px 24px rgba(0, 0, 0, 0.35);
$ext-shadow-dark-xl: 0 16px 48px rgba(0, 0, 0, 0.4);
```

#### Glow Effects (Accent)
```scss
$ext-glow-blue: 0 0 20px rgba(65, 105, 232, 0.4);
$ext-glow-purple: 0 0 20px rgba(141, 70, 235, 0.4);
$ext-glow-pink: 0 0 20px rgba(232, 73, 183, 0.4);
$ext-glow-nebula: 0 0 30px rgba(141, 70, 235, 0.3), 0 0 60px rgba(232, 73, 183, 0.2);
```

### Glass/Blur Effects
```scss
$ext-blur-sm: blur(4px);
$ext-blur-md: blur(8px);
$ext-blur-lg: blur(16px);
$ext-blur-xl: blur(24px);
```

### Border Radius
```scss
$ext-radius-xs: 4px;
$ext-radius-sm: 6px;
$ext-radius-md: 8px;
$ext-radius-lg: 12px;
$ext-radius-xl: 16px;
$ext-radius-2xl: 24px;
$ext-radius-full: 9999px;
```

---

## Iconography & Imagery

### Icon Style
- **Primary icons**: Material Symbols Outlined (consistent with existing app)
- **Weight**: 300-400 for light theme, 200-300 for dark theme
- **Size scale**: 16px, 20px, 24px, 32px, 48px

### Image Treatments

#### Hero Images
- Full bleed with gradient overlay
- Cosmic/nebula backgrounds with subtle grain
- Paint splash effects for creative energy

#### Content Images
- Rounded corners (ext-radius-lg)
- Subtle shadow lift
- Optional gradient border on dark theme

#### Avatar/Profile
- Circular with gradient border ring
- Optional glow effect for active/online status

---

## Component Patterns

### Cards
- **Light**: White background, subtle shadow, border-radius-lg
- **Dark**: Glass effect background, stronger border, glow option

### Buttons
- **Primary**: Nebula gradient background, white text
- **Secondary**: Bordered, gradient text on hover
- **Ghost**: Transparent, subtle hover effect

### Inputs
- **Light**: White fill, subtle border, focus ring
- **Dark**: Dark glass fill, glowing focus border

### Navigation
- **Light**: Clean white header, gradient accent underlines
- **Dark**: Glass header with backdrop blur, gradient highlights

---

## Motion & Animation

### Timing Functions
```scss
$ext-ease-out: cubic-bezier(0.33, 1, 0.68, 1);
$ext-ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
$ext-ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Durations
```scss
$ext-duration-fast: 150ms;
$ext-duration-normal: 250ms;
$ext-duration-slow: 400ms;
$ext-duration-slower: 600ms;
```

### Key Animations
- **Gradient shift**: Subtle movement in gradient backgrounds
- **Glow pulse**: Breathing effect on accent elements
- **Float**: Gentle vertical movement for hero elements

---

## Usage Guidelines

### When to use gradients
- Hero sections and key CTAs
- Brand elements (logo, ribbons)
- Accent borders and highlights
- NOT for body text backgrounds

### Dark vs Light
- Respect user system preference
- Quasar's `.body--dark` class toggles themes
- All components should have both theme variants

### Accessibility
- Maintain 4.5:1 contrast for text
- 3:1 for large text and UI components
- Provide focus indicators
- Don't rely solely on color for meaning

---

## File Structure
```
css/
├── extend-theme.md          # This documentation
├── extend-theme.scss        # Main theme implementation
├── quasar.variables.scss    # Quasar variable overrides
└── app.scss                 # Global application styles
```
