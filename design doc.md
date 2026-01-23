# DevTeam AI - Design Documentation

## Complete UI/UX Design System & Specification

---

# Table of Contents

1. [Design Philosophy & Principles](#1-design-philosophy--principles)
2. [Design System Foundation](#2-design-system-foundation)
3. [Component Library](#3-component-library)
4. [Page Layouts & Wireframes](#4-page-layouts--wireframes)
5. [User Flows](#5-user-flows)
6. [Interaction Patterns](#6-interaction-patterns)
7. [Responsive Design](#7-responsive-design)
8. [Accessibility Guidelines](#8-accessibility-guidelines)
9. [Animation & Motion](#9-animation--motion)
10. [Design Tokens & Implementation](#10-design-tokens--implementation)

---

# 1. Design Philosophy & Principles

## 1.1 Design Vision

> _"A professional-grade development environment that feels like having a world-class engineering team at your fingertips - powerful yet approachable, complex yet clear."_

## 1.2 Design References & Inspirations

| Aspect                 | Primary Reference | What We Take                                  |
| ---------------------- | ----------------- | --------------------------------------------- |
| **Overall IDE Layout** | VS Code + Cursor  | Panel system, command palette, keyboard-first |
| **AI Chat Interface**  | Claude.ai         | Clean conversation UI, code blocks, artifacts |
| **Project Management** | Linear            | Minimal task cards, keyboard shortcuts, speed |
| **Collaboration**      | Figma             | Multiplayer presence, cursors, real-time sync |
| **Dashboard**          | Vercel Dashboard  | Clean metrics, dark theme, status indicators  |
| **Design System**      | Geist (Vercel)    | Typography, spacing, component patterns       |

## 1.3 Core Design Principles

### Principle 1: Clarity Over Cleverness

```
❌ Don't: Use abstract icons that require learning
✅ Do: Use clear labels with optional icons

❌ Don't: Hide important actions in menus
✅ Do: Surface frequent actions prominently

❌ Don't: Use jargon only developers understand
✅ Do: Balance technical accuracy with accessibility
```

### Principle 2: Progressive Disclosure

```
Level 1: Essential information visible by default
Level 2: Important details available on hover/click
Level 3: Advanced options in settings/menus

Example - Agent Card:
├── Level 1: Agent name, status, current task
├── Level 2: Task progress, recent activity (on hover)
└── Level 3: Agent settings, history (in modal)
```

### Principle 3: Keyboard-First, Mouse-Friendly

```
All actions should be:
1. Accessible via keyboard shortcut
2. Discoverable via command palette (⌘K)
3. Clickable with mouse as alternative

Reference: Linear's keyboard navigation
```

### Principle 4: Real-Time Awareness

```
Users should always know:
• What each agent is doing RIGHT NOW
• What changed in the last few seconds
• What's coming next

Visual indicators:
• Pulsing dots for active work
• Streaming text for AI output
• Progress bars for long tasks
```

### Principle 5: Dark Mode Native

```
Primary: Dark theme (developer preference)
Secondary: Light theme (optional)

Dark theme reduces eye strain during long coding sessions
Better contrast for syntax highlighting
Professional, modern appearance
```

---

# 2. Design System Foundation

## 2.1 Color System

### Primary Palette (Dark Theme)

```scss
// Background Colors (Layered approach like Figma/Linear)
$bg-base: #09090b; // Zinc 950 - Deepest background
$bg-surface: #18181b; // Zinc 900 - Primary surface
$bg-elevated: #27272a; // Zinc 800 - Elevated elements
$bg-overlay: #3f3f46; // Zinc 700 - Hover states

// Foreground/Text Colors
$text-primary: #fafafa; // Zinc 50 - Primary text
$text-secondary: #a1a1aa; // Zinc 400 - Secondary text
$text-muted: #71717a; // Zinc 500 - Muted text
$text-disabled: #52525b; // Zinc 600 - Disabled text

// Border Colors
$border-default: #27272a; // Zinc 800
$border-muted: #3f3f46; // Zinc 700
$border-focus: #a1a1aa; // Zinc 400
```

### Agent Color System

```scss
// Each agent has a unique, recognizable color
// Used for: avatars, activity indicators, file badges, borders

$agent-colors: (
  pm: #8b5cf6,
  // Violet 500 - Project Manager (Leadership)
  frontend: #3b82f6,
  // Blue 500 - Frontend (Creative/UI)
  backend: #22c55e,
  // Green 500 - Backend (Logic/Systems)
  database: #f59e0b,
  // Amber 500 - Database (Data/Storage)
  security: #ef4444,
  // Red 500 - Security (Critical/Alert)
  testing: #06b6d4,
  // Cyan 500 - Testing (Quality/Check)
  devops: #ec4899,
  // Pink 500 - DevOps (Infrastructure)
  ml: #a855f7, // Purple 500 - AI/ML (Intelligence)
);

// Light variants for backgrounds
$agent-colors-light: (
  pm: #8b5cf610,
  frontend: #3b82f610,
  backend: #22c55e10, // ... etc
);
```

### Semantic Colors

```scss
// Status Colors
$success: #22c55e; // Green 500
$success-light: #22c55e20;
$warning: #f59e0b; // Amber 500
$warning-light: #f59e0b20;
$error: #ef4444; // Red 500
$error-light: #ef444420;
$info: #3b82f6; // Blue 500
$info-light: #3b82f620;

// Interactive Colors
$primary: #ffffff; // Primary actions (white in dark mode)
$primary-hover: #e4e4e7;
$accent: #8b5cf6; // Accent/Brand color (Violet)
$accent-hover: #7c3aed;
```

### Light Theme (Alternate)

```scss
// Background Colors
$bg-base-light: #ffffff;
$bg-surface-light: #fafafa;
$bg-elevated-light: #f4f4f5;
$bg-overlay-light: #e4e4e7;

// Text Colors
$text-primary-light: #09090b;
$text-secondary-light: #52525b;
$text-muted-light: #71717a;
```

## 2.2 Typography

### Font Stack

```scss
// Primary Font: Geist Sans (Vercel) or Inter
$font-sans:
  'Geist Sans',
  'Inter',
  -apple-system,
  BlinkMacSystemFont,
  'Segoe UI',
  Roboto,
  sans-serif;

// Monospace Font: Geist Mono or JetBrains Mono
$font-mono:
  'Geist Mono', 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
```

### Type Scale

```scss
// Based on 16px base, 1.25 ratio (Major Third)
$text-xs: 0.75rem; // 12px - Labels, badges
$text-sm: 0.875rem; // 14px - Secondary text, UI elements
$text-base: 1rem; // 16px - Body text
$text-lg: 1.125rem; // 18px - Emphasized body
$text-xl: 1.25rem; // 20px - Section headers
$text-2xl: 1.5rem; // 24px - Page headers
$text-3xl: 1.875rem; // 30px - Large headers
$text-4xl: 2.25rem; // 36px - Hero text

// Line Heights
$leading-none: 1;
$leading-tight: 1.25;
$leading-snug: 1.375;
$leading-normal: 1.5;
$leading-relaxed: 1.625;

// Font Weights
$font-normal: 400;
$font-medium: 500;
$font-semibold: 600;
$font-bold: 700;
```

### Typography Usage

```
┌─────────────────────────────────────────────────────────────┐
│  TYPOGRAPHY HIERARCHY                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Page Title          2xl / Semibold / Primary               │
│  E-Commerce Platform                                         │
│                                                              │
│  Section Header      xl / Semibold / Primary                │
│  Agent Activity                                              │
│                                                              │
│  Card Title          base / Medium / Primary                │
│  ProductCard.tsx                                             │
│                                                              │
│  Body Text           sm / Normal / Secondary                │
│  Building responsive product card component...               │
│                                                              │
│  Label               xs / Medium / Muted (uppercase)        │
│  STATUS                                                      │
│                                                              │
│  Code                sm / Normal / Mono                     │
│  const ProductCard = () => {...}                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 2.3 Spacing System

```scss
// 4px base unit system (like Tailwind)
$space-0: 0;
$space-px: 1px;
$space-0.5: 0.125rem; // 2px
$space-1: 0.25rem; // 4px
$space-1.5: 0.375rem; // 6px
$space-2: 0.5rem; // 8px
$space-2.5: 0.625rem; // 10px
$space-3: 0.75rem; // 12px
$space-4: 1rem; // 16px
$space-5: 1.25rem; // 20px
$space-6: 1.5rem; // 24px
$space-8: 2rem; // 32px
$space-10: 2.5rem; // 40px
$space-12: 3rem; // 48px
$space-16: 4rem; // 64px
$space-20: 5rem; // 80px
$space-24: 6rem; // 96px
```

### Spacing Usage Guidelines

```
Component Internal Padding:
├── Buttons: 8px 16px (space-2 space-4)
├── Input fields: 8px 12px (space-2 space-3)
├── Cards: 16px (space-4)
├── Modals: 24px (space-6)
└── Page sections: 32px (space-8)

Component Gaps:
├── Icon to text: 8px (space-2)
├── Related elements: 8px (space-2)
├── Form fields: 16px (space-4)
├── Cards in grid: 16px (space-4)
├── Sections: 32px (space-8)
└── Page areas: 48px (space-12)
```

## 2.4 Border Radius

```scss
$radius-none: 0;
$radius-sm: 0.25rem; // 4px - Small elements, badges
$radius-md: 0.375rem; // 6px - Buttons, inputs (DEFAULT)
$radius-lg: 0.5rem; // 8px - Cards, dropdowns
$radius-xl: 0.75rem; // 12px - Modals, large cards
$radius-2xl: 1rem; // 16px - Large containers
$radius-full: 9999px; // Pills, avatars
```

## 2.5 Shadows

```scss
// Subtle shadows for dark theme (using lighter shadows)
$shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.5);
$shadow-md:
  0 4px 6px -1px rgb(0 0 0 / 0.5),
  0 2px 4px -2px rgb(0 0 0 / 0.5);
$shadow-lg:
  0 10px 15px -3px rgb(0 0 0 / 0.5),
  0 4px 6px -4px rgb(0 0 0 / 0.5);
$shadow-xl:
  0 20px 25px -5px rgb(0 0 0 / 0.5),
  0 8px 10px -6px rgb(0 0 0 / 0.5);

// Glow effects for focus states
$glow-accent: 0 0 0 2px $accent / 0.3;
$glow-error: 0 0 0 2px $error / 0.3;
```

## 2.6 Z-Index Scale

```scss
$z-base: 0;
$z-dropdown: 10;
$z-sticky: 20;
$z-overlay: 30;
$z-modal: 40;
$z-popover: 50;
$z-toast: 60;
$z-tooltip: 70;
$z-command: 80; // Command palette (highest)
```

---

# 3. Component Library

## 3.1 Buttons

### Button Variants

```
┌─────────────────────────────────────────────────────────────────┐
│  BUTTON VARIANTS                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Primary (Solid)         Secondary (Outline)     Ghost          │
│  ┌──────────────────┐   ┌──────────────────┐   ┌─────────────┐ │
│  │   Create Project │   │   Learn More     │   │   Cancel    │ │
│  └──────────────────┘   └──────────────────┘   └─────────────┘ │
│  White bg, dark text    Border only, white     No border       │
│                         text                    Hover: light bg │
│                                                                  │
│  Destructive             Success                Icon Only       │
│  ┌──────────────────┐   ┌──────────────────┐   ┌───┐ ┌───┐    │
│  │   Delete         │   │   ✓ Deploy       │   │ + │ │ ⚙ │    │
│  └──────────────────┘   └──────────────────┘   └───┘ └───┘    │
│  Red bg                  Green bg                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Button Specifications

```scss
// Base Button
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;

  font-family: $font-sans;
  font-size: $text-sm;
  font-weight: $font-medium;
  line-height: $leading-none;

  padding: $space-2 $space-4; // 8px 16px
  border-radius: $radius-md;

  transition: all 150ms ease;
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow: $glow-accent;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

// Sizes
.button-sm {
  padding: $space-1.5 $space-3;
  font-size: $text-xs;
}
.button-md {
  padding: $space-2 $space-4;
  font-size: $text-sm;
} // Default
.button-lg {
  padding: $space-2.5 $space-5;
  font-size: $text-base;
}

// Variants
.button-primary {
  background: $text-primary;
  color: $bg-base;
  &:hover {
    background: $primary-hover;
  }
}

.button-secondary {
  background: transparent;
  color: $text-primary;
  border: 1px solid $border-muted;
  &:hover {
    background: $bg-elevated;
  }
}

.button-ghost {
  background: transparent;
  color: $text-secondary;
  &:hover {
    background: $bg-elevated;
    color: $text-primary;
  }
}

.button-destructive {
  background: $error;
  color: white;
  &:hover {
    background: darken($error, 10%);
  }
}
```

## 3.2 Input Fields

### Input Specifications

```
┌─────────────────────────────────────────────────────────────────┐
│  INPUT STATES                                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Default                          Focus                          │
│  ┌────────────────────────────┐  ┌────────────────────────────┐ │
│  │ Project name               │  │ Project name            |  │ │
│  └────────────────────────────┘  └────────────────────────────┘ │
│  Border: zinc-800                 Border: zinc-400 + glow       │
│                                                                  │
│  With Value                       Error                          │
│  ┌────────────────────────────┐  ┌────────────────────────────┐ │
│  │ E-Commerce Platform        │  │ abc                       │ │
│  └────────────────────────────┘  └────────────────────────────┘ │
│  Text: zinc-50                    Border: red-500 + glow        │
│                                   ⚠ Name must be 3+ characters  │
│                                                                  │
│  With Icon                        With Action                    │
│  ┌────────────────────────────┐  ┌────────────────────────────┐ │
│  │ 🔍 Search files...         │  │ api-key-xxx...        👁️  │ │
│  └────────────────────────────┘  └────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

```scss
.input {
  width: 100%;
  padding: $space-2 $space-3;

  font-family: $font-sans;
  font-size: $text-sm;
  color: $text-primary;

  background: $bg-surface;
  border: 1px solid $border-default;
  border-radius: $radius-md;

  transition:
    border-color 150ms,
    box-shadow 150ms;

  &::placeholder {
    color: $text-muted;
  }

  &:focus {
    outline: none;
    border-color: $border-focus;
    box-shadow: $glow-accent;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.error {
    border-color: $error;
    &:focus {
      box-shadow: $glow-error;
    }
  }
}

.input-with-icon {
  position: relative;

  .icon {
    position: absolute;
    left: $space-3;
    top: 50%;
    transform: translateY(-50%);
    color: $text-muted;
  }

  input {
    padding-left: $space-10;
  }
}
```

## 3.3 Cards

### Card Variants

```
┌─────────────────────────────────────────────────────────────────┐
│  CARD VARIANTS                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Default Card                     Interactive Card               │
│  ┌──────────────────────────┐    ┌──────────────────────────┐   │
│  │  Card Title              │    │  Project Name         →  │   │
│  │                          │    │                          │   │
│  │  Card content goes here  │    │  Click to open project   │   │
│  │  with description text.  │    │                          │   │
│  └──────────────────────────┘    └──────────────────────────┘   │
│  Static display                   Hover: elevated bg, pointer   │
│                                                                  │
│  Agent Card                       Task Card                      │
│  ┌──────────────────────────┐    ┌──────────────────────────┐   │
│  │ 🎨 Frontend Developer    │    │ □ Implement ProductCard  │   │
│  │ ● Working                │    │                          │   │
│  │                          │    │ 🎨 Frontend  •  In Progress │
│  │ Building ProductCard...  │    │ ━━━━━━━━░░░░ 65%         │   │
│  │ ━━━━━━━━░░░░░ 45%       │    └──────────────────────────┘   │
│  └──────────────────────────┘                                    │
│  Colored left border                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

```scss
.card {
  background: $bg-surface;
  border: 1px solid $border-default;
  border-radius: $radius-lg;
  padding: $space-4;
}

.card-interactive {
  @extend .card;
  cursor: pointer;
  transition:
    background 150ms,
    border-color 150ms;

  &:hover {
    background: $bg-elevated;
    border-color: $border-muted;
  }
}

.card-agent {
  @extend .card;
  border-left: 3px solid var(--agent-color);

  &[data-agent='frontend'] {
    --agent-color: #{$agent-frontend};
  }
  &[data-agent='backend'] {
    --agent-color: #{$agent-backend};
  }
  // ... etc
}
```

## 3.4 Agent Components

### Agent Avatar

```
┌─────────────────────────────────────────────────────────────────┐
│  AGENT AVATARS                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  With Status Indicator                                           │
│                                                                  │
│    ┌───┐          ┌───┐          ┌───┐          ┌───┐          │
│    │🎨 │●         │🔧 │●         │🗄️ │○         │🔒 │●          │
│    └───┘          └───┘          └───┘          └───┘          │
│  Frontend       Backend        Database      Security          │
│  (Active)       (Active)       (Idle)        (Active)          │
│                                                                  │
│  ● = Pulsing green (active)                                     │
│  ○ = Gray (idle)                                                │
│  🔴 = Red (error/blocked)                                       │
│                                                                  │
│  Size Variants:                                                  │
│  ┌──┐    ┌────┐    ┌──────┐                                    │
│  │sm│    │ md │    │  lg  │                                    │
│  └──┘    └────┘    └──────┘                                    │
│  24px     32px      48px                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

```scss
.agent-avatar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: $radius-lg;
  background: var(--agent-color-light);
  color: var(--agent-color);
  font-size: 1em;

  &.size-sm {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }
  &.size-md {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
  &.size-lg {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .status-indicator {
    position: absolute;
    bottom: -2px;
    right: -2px;
    width: 10px;
    height: 10px;
    border-radius: $radius-full;
    border: 2px solid $bg-surface;

    &.active {
      background: $success;
      animation: pulse 2s infinite;
    }
    &.idle {
      background: $text-muted;
    }
    &.error {
      background: $error;
    }
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### Agent Activity Card

```
┌─────────────────────────────────────────────────────────────────┐
│  AGENT ACTIVITY CARD (Expanded)                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ┌────┐                                                     │ │
│  │ │ 🎨 │  Frontend Developer                    ● Active     │ │
│  │ └────┘                                                     │ │
│  │                                                            │ │
│  │  Current Task                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ FE-003: Build ProductCard Component                  │ │ │
│  │  │ ━━━━━━━━━━━━━━░░░░░░ 72%                            │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  Recent Activity                          2 mins ago      │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Created ProductCard.tsx                              │ │ │
│  │  │ Added responsive image handling                      │ │ │
│  │  │ Implementing add-to-cart button...                   │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────────────┐   │ │
│  │  │ ⏸ Pause │  │ 📝 Guide │  │ View Full Activity →   │   │ │
│  │  └─────────┘  └─────────┘  └─────────────────────────┘   │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 3.5 Chat/Message Components

### Message Bubbles

```
┌─────────────────────────────────────────────────────────────────┐
│  MESSAGE TYPES                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User Message (Right-aligned)                                    │
│                          ┌────────────────────────────────────┐ │
│                          │ I want to add a wishlist feature   │ │
│                          │ to the product pages.              │ │
│                          └────────────────────────────────────┘ │
│                                                        You 2:34 │
│                                                                  │
│  Agent Message (Left-aligned with avatar)                        │
│  ┌────┐ ┌─────────────────────────────────────────────────────┐ │
│  │ 👔 │ │ I'll coordinate this with the team. Here's the     │ │
│  └────┘ │ breakdown:                                          │ │
│    PM   │                                                     │ │
│         │ • Frontend: Add wishlist button and page            │ │
│         │ • Backend: Create wishlist API endpoints            │ │
│         │ • Database: Add wishlist table                      │ │
│         │                                                     │ │
│         │ Estimated time: 4 hours                             │ │
│         └─────────────────────────────────────────────────────┘ │
│                                                      PM AI 2:35 │
│                                                                  │
│  Code Block in Message                                           │
│  ┌────┐ ┌─────────────────────────────────────────────────────┐ │
│  │ 🎨 │ │ Here's the WishlistButton component:               │ │
│  └────┘ │                                                     │ │
│    FE   │ ┌─────────────────────────────────────────────────┐ │ │
│         │ │ // WishlistButton.tsx               [Copy] [▶]  │ │ │
│         │ │                                                 │ │ │
│         │ │ export const WishlistButton = ({                │ │ │
│         │ │   productId,                                    │ │ │
│         │ │   isWishlisted                                  │ │ │
│         │ │ }) => {                                         │ │ │
│         │ │   return (                                      │ │ │
│         │ │     <button onClick={...}>                      │ │ │
│         │ │       {isWishlisted ? '❤️' : '🤍'}              │ │ │
│         │ │     </button>                                   │ │ │
│         │ │   );                                            │ │ │
│         │ │ };                                              │ │ │
│         │ └─────────────────────────────────────────────────┘ │ │
│         └─────────────────────────────────────────────────────┘ │
│                                                    Frontend 2:40 │
│                                                                  │
│  System Message (Centered)                                       │
│           ─────────── ● ───────────                             │
│           Backend joined the thread                              │
│           ─────────────────────────                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Message Input

```
┌─────────────────────────────────────────────────────────────────┐
│  MESSAGE INPUT VARIANTS                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Default State                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ┌──────────────────────────────────────────────────┐ ┌───┐│ │
│  │ │ Message the team...                              │ │ → ││ │
│  │ └──────────────────────────────────────────────────┘ └───┘│ │
│  │  📎  @  /                                           ⌘ ↵  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  With Agent Mention                                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ┌──────────────────────────────────────────────────┐ ┌───┐│ │
│  │ │ @Frontend can you use a heart icon instead|      │ │ → ││ │
│  │ └──────────────────────────────────────────────────┘ └───┘│ │
│  │  📎  @  /                                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Agent Mention Dropdown                                          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ┌──────────────────────────────────────────────────┐ ┌───┐│ │
│  │ │ @back|                                           │ │ → ││ │
│  │ └──────────────────────────────────────────────────┘ └───┘│ │
│  │  ┌─────────────────────────────────────┐                   │ │
│  │  │ 🔧 Backend Developer                │ ← Highlighted    │ │
│  │  │ 🗄️ Database Engineer                │                   │ │
│  │  └─────────────────────────────────────┘                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Expanded (Multiline)                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ┌──────────────────────────────────────────────────────┐   │ │
│  │ │ I need to make some changes to the authentication    │   │ │
│  │ │ flow. Currently users are redirected to the home     │   │ │
│  │ │ page after login, but I want them to go back to      │   │ │
│  │ │ where they were before.                              │   │ │
│  │ │                                                      │   │ │
│  │ │ Can the backend team help with this?|                │   │ │
│  │ └──────────────────────────────────────────────────────┘   │ │
│  │  📎  @  /                                         ┌─────┐  │ │
│  │                                                   │ Send │  │ │
│  │                                                   └─────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 3.6 Progress Indicators

```
┌─────────────────────────────────────────────────────────────────┐
│  PROGRESS INDICATORS                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Linear Progress Bar                                             │
│  ━━━━━━━━━━━━━━━━░░░░░░░░░░ 65%                                │
│  (Filled: accent color, Empty: zinc-800)                        │
│                                                                  │
│  Segmented Progress (Tasks)                                      │
│  ████ ████ ████ ░░░░ ░░░░ ░░░░  3/6 tasks complete             │
│  (Each segment = 1 task)                                        │
│                                                                  │
│  Circular Progress                                               │
│      ╭───╮                                                      │
│     ╱     ╲        Used for: Agent avatars, loading states      │
│    │  72%  │                                                    │
│     ╲     ╱                                                     │
│      ╰───╯                                                      │
│                                                                  │
│  Indeterminate (Loading)                                         │
│  ░░░████░░░░░░░░░░████░░░  (Animated shimmer)                  │
│                                                                  │
│  Step Progress                                                   │
│  ● ─────── ● ─────── ○ ─────── ○                               │
│  Setup    Config    Build    Deploy                             │
│  ✓        ✓        Current  Pending                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 3.7 Code Editor Components

### File Tree

```
┌─────────────────────────────────────────────────────────────────┐
│  FILE TREE                                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────┐                       │
│  │ E-COMMERCE-PLATFORM          [↻] [+] │ ← Project header     │
│  ├──────────────────────────────────────┤                       │
│  │ 🔍 Search files...             ⌘P    │ ← Quick search       │
│  ├──────────────────────────────────────┤                       │
│  │ ▼ 📁 src                             │                       │
│  │   ▼ 📁 components                    │                       │
│  │     ├─ 📄 ProductCard.tsx    🎨      │ ← Agent indicator    │
│  │     ├─ 📄 CartButton.tsx             │                       │
│  │     └─ 📄 SearchBar.tsx              │                       │
│  │   ▼ 📁 api                           │                       │
│  │     ├─ 📄 products.ts        🔧      │                       │
│  │     └─ 📄 auth.ts            🔧      │                       │
│  │   ▶ 📁 hooks                         │ ← Collapsed          │
│  │   ▶ 📁 utils                         │                       │
│  │ ▶ 📁 prisma                  🗄️      │                       │
│  │ ├─ 📄 package.json                   │                       │
│  │ ├─ 📄 .env.example                   │                       │
│  │ └─ 📄 README.md                      │                       │
│  └──────────────────────────────────────┘                       │
│                                                                  │
│  Legend:                                                         │
│  🎨 = Frontend working    🔧 = Backend working                  │
│  🗄️ = Database working    🔒 = Security working                 │
│                                                                  │
│  File States:                                                    │
│  Normal text = Unchanged                                         │
│  Yellow text = Modified (unsaved)                               │
│  Green text = New file                                          │
│  Strikethrough = Deleted                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Editor Tabs

```
┌─────────────────────────────────────────────────────────────────┐
│  EDITOR TABS                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┬────────────────┬────────────────┬─────────┐ │
│  │ ProductCard.tsx│ products.ts    │ schema.prisma  │    +    │ │
│  │ 🎨 ●          │ 🔧            │ 🗄️            │         │ │
│  └────────────────┴────────────────┴────────────────┴─────────┘ │
│   ↑ Active tab     ↑ Modified       ↑ Normal                    │
│   (Highlighted)    (● indicator)                                │
│                                                                  │
│  Tab States:                                                     │
│  • Active: Bright text, bottom border accent                    │
│  • Inactive: Muted text, no border                              │
│  • Modified: ● dot before close button                          │
│  • Agent working: Agent emoji badge                             │
│                                                                  │
│  Hover reveals:                                                  │
│  • Full file path tooltip                                       │
│  • Close button (×)                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Editor with Agent Presence

```
┌─────────────────────────────────────────────────────────────────┐
│  CODE EDITOR WITH AGENT PRESENCE                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ProductCard.tsx                              🎨 Editing... │ │
│  ├────┬───────────────────────────────────────────────────────┤ │
│  │    │                                                       │ │
│  │  1 │ import React from 'react';                            │ │
│  │  2 │ import { Product } from '@/types';                    │ │
│  │  3 │                                                       │ │
│  │  4 │ interface ProductCardProps {                          │ │
│  │  5 │   product: Product;                                   │ │
│  │🎨 6│░  onAddToCart: () => void;  ←─── Agent cursor here  │ │
│  │  7 │░}                            │                        │ │
│  │  8 │░                             │ Highlighted zone      │ │
│  │  9 │░export const ProductCard = ({│ (agent working area)  │ │
│  │ 10 │░  product,                   │                        │ │
│  │ 11 │░  onAddToCart               ←┘                        │ │
│  │ 12 │ }: ProductCardProps) => {                             │ │
│  │ 13 │   return (                                            │ │
│  │ 14 │     <div className="...">                             │ │
│  │    │                                                       │ │
│  └────┴───────────────────────────────────────────────────────┘ │
│                                                                  │
│  Visual Elements:                                                │
│  • 🎨 in gutter = Agent working on this line                   │
│  • ░ highlight = Lines being modified by agent                 │
│  • Colored cursor = Agent's cursor position                    │
│  • Status in tab = "🎨 Editing..." real-time status           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 3.8 Modal & Dialog

```
┌─────────────────────────────────────────────────────────────────┐
│  MODAL VARIANTS                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Standard Modal                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ │
│  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ │
│  │░░░░░┌─────────────────────────────────────────────┐░░░░░░│ │
│  │░░░░░│  Create New Project                      ✕  │░░░░░░│ │
│  │░░░░░├─────────────────────────────────────────────┤░░░░░░│ │
│  │░░░░░│                                             │░░░░░░│ │
│  │░░░░░│  Project Name                               │░░░░░░│ │
│  │░░░░░│  ┌─────────────────────────────────────┐   │░░░░░░│ │
│  │░░░░░│  │ My Awesome Project                  │   │░░░░░░│ │
│  │░░░░░│  └─────────────────────────────────────┘   │░░░░░░│ │
│  │░░░░░│                                             │░░░░░░│ │
│  │░░░░░│  Description                                │░░░░░░│ │
│  │░░░░░│  ┌─────────────────────────────────────┐   │░░░░░░│ │
│  │░░░░░│  │ Describe your project idea...       │   │░░░░░░│ │
│  │░░░░░│  │                                     │   │░░░░░░│ │
│  │░░░░░│  └─────────────────────────────────────┘   │░░░░░░│ │
│  │░░░░░│                                             │░░░░░░│ │
│  │░░░░░│            ┌────────┐  ┌────────────────┐  │░░░░░░│ │
│  │░░░░░│            │ Cancel │  │ Create Project │  │░░░░░░│ │
│  │░░░░░│            └────────┘  └────────────────┘  │░░░░░░│ │
│  │░░░░░│                                             │░░░░░░│ │
│  │░░░░░└─────────────────────────────────────────────┘░░░░░░│ │
│  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ │
│  └────────────────────────────────────────────────────────────┘ │
│  (░ = Backdrop overlay with blur)                               │
│                                                                  │
│  Confirmation Dialog                                             │
│  ┌────────────────────────────────────────┐                     │
│  │  ⚠️ Delete Project?                    │                     │
│  │                                        │                     │
│  │  This action cannot be undone.         │                     │
│  │  All files and history will be         │                     │
│  │  permanently deleted.                  │                     │
│  │                                        │                     │
│  │        ┌────────┐  ┌──────────────┐   │                     │
│  │        │ Cancel │  │ Delete       │   │                     │
│  │        └────────┘  └──────────────┘   │                     │
│  │                     (Red/Destructive)  │                     │
│  └────────────────────────────────────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 3.9 Command Palette

```
┌─────────────────────────────────────────────────────────────────┐
│  COMMAND PALETTE (⌘K)                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ │
│  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ │
│  │░░░░░┌─────────────────────────────────────────────┐░░░░░░│ │
│  │░░░░░│ 🔍 Type a command or search...              │░░░░░░│ │
│  │░░░░░├─────────────────────────────────────────────┤░░░░░░│ │
│  │░░░░░│                                             │░░░░░░│ │
│  │░░░░░│ SUGGESTED                                   │░░░░░░│ │
│  │░░░░░│ ┌─────────────────────────────────────────┐│░░░░░░│ │
│  │░░░░░│ │ 📄 ProductCard.tsx              Recent ││░░░░░░│ │
│  │░░░░░│ └─────────────────────────────────────────┘│░░░░░░│ │
│  │░░░░░│ ┌─────────────────────────────────────────┐│░░░░░░│ │
│  │░░░░░│ │ 🎨 Ask Frontend Agent           ⌘⇧F   ││░░░░░░│ │
│  │░░░░░│ └─────────────────────────────────────────┘│░░░░░░│ │
│  │░░░░░│ ┌─────────────────────────────────────────┐│░░░░░░│ │
│  │░░░░░│ │ ➕ Create New File               ⌘N    ││░░░░░░│ │
│  │░░░░░│ └─────────────────────────────────────────┘│░░░░░░│ │
│  │░░░░░│                                             │░░░░░░│ │
│  │░░░░░│ ACTIONS                                     │░░░░░░│ │
│  │░░░░░│ ┌─────────────────────────────────────────┐│░░░░░░│ │
│  │░░░░░│ │ ⏸️ Pause All Agents                     ││░░░░░░│ │
│  │░░░░░│ └─────────────────────────────────────────┘│░░░░░░│ │
│  │░░░░░│ ┌─────────────────────────────────────────┐│░░░░░░│ │
│  │░░░░░│ │ 📊 View Project Dashboard               ││░░░░░░│ │
│  │░░░░░│ └─────────────────────────────────────────┘│░░░░░░│ │
│  │░░░░░│                                             │░░░░░░│ │
│  │░░░░░│           ↑↓ Navigate  ↵ Select  Esc Close │░░░░░░│ │
│  │░░░░░└─────────────────────────────────────────────┘░░░░░░│ │
│  │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Categories:                                                     │
│  • Files: Search and open project files                         │
│  • Agents: Interact with specific agents                        │
│  • Actions: Common actions (pause, deploy, etc.)                │
│  • Settings: Quick access to settings                           │
│  • Help: Documentation and support                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 3.10 Toast Notifications

```
┌─────────────────────────────────────────────────────────────────┐
│  TOAST NOTIFICATIONS                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Positioned: Bottom-right corner                                 │
│  Stack: New toasts appear above existing ones                   │
│                                                                  │
│                         ┌────────────────────────────────────┐  │
│                         │ ✓ Project created successfully    ✕│  │
│                         │   E-Commerce Platform              │  │
│                         └────────────────────────────────────┘  │
│                                    ↑ Success toast              │
│                                                                  │
│                         ┌────────────────────────────────────┐  │
│                         │ 🎨 Frontend completed task        ✕│  │
│                         │   ProductCard.tsx created          │  │
│                         │   ┌──────────────┐                 │  │
│                         │   │ View Changes │                 │  │
│                         │   └──────────────┘                 │  │
│                         └────────────────────────────────────┘  │
│                                    ↑ Info toast with action     │
│                                                                  │
│                         ┌────────────────────────────────────┐  │
│                         │ ⚠️ Security review required       ✕│  │
│                         │   auth.ts needs attention          │  │
│                         │   ┌──────────────┐                 │  │
│                         │   │ View Issues  │                 │  │
│                         │   └──────────────┘                 │  │
│                         └────────────────────────────────────┘  │
│                                    ↑ Warning toast              │
│                                                                  │
│                         ┌────────────────────────────────────┐  │
│                         │ ❌ Build failed                   ✕│  │
│                         │   TypeError in ProductCard.tsx:42  │  │
│                         │   ┌──────────┐ ┌─────────────────┐ │  │
│                         │   │ Dismiss  │ │ View Error →    │ │  │
│                         │   └──────────┘ └─────────────────┘ │  │
│                         └────────────────────────────────────┘  │
│                                    ↑ Error toast                │
│                                                                  │
│  Auto-dismiss:                                                   │
│  • Success: 3 seconds                                           │
│  • Info: 5 seconds                                              │
│  • Warning: 8 seconds                                           │
│  • Error: Manual dismiss only                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

# 4. Page Layouts & Wireframes

## 4.1 Landing Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LANDING PAGE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  DevTeam AI                      Features  Pricing  Docs    [Sign In]  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │                    Your AI Development Team                            │ │
│  │                         Awaits                                         │ │
│  │                                                                        │ │
│  │       Multiple AI agents working together to build your               │ │
│  │       project. Like having a full dev team, but faster.               │ │
│  │                                                                        │ │
│  │              ┌──────────────────────────────────────┐                 │ │
│  │              │  Describe your project idea...      │                 │ │
│  │              └──────────────────────────────────────┘                 │ │
│  │              ┌─────────────────────┐                                  │ │
│  │              │  Start Building →   │                                  │ │
│  │              └─────────────────────┘                                  │ │
│  │                                                                        │ │
│  │                   No credit card required                             │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │   ┌─────────────────────────────────────────────────────────────────┐ │ │
│  │   │                                                                 │ │ │
│  │   │                    [PRODUCT DEMO VIDEO/GIF]                     │ │ │
│  │   │                                                                 │ │ │
│  │   │     Showing: Agents working in parallel, real-time code        │ │ │
│  │   │              generation, chat interface                         │ │ │
│  │   │                                                                 │ │ │
│  │   └─────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        Meet Your AI Team                               │ │
│  │                                                                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│ │
│  │  │    👔    │  │    🎨    │  │    🔧    │  │    🗄️    │  │    🔒    ││ │
│  │  │    PM    │  │ Frontend │  │ Backend  │  │ Database │  │ Security ││ │
│  │  │          │  │          │  │          │  │          │  │          ││ │
│  │  │Coordinates│ │ Builds   │  │ Creates  │  │ Designs  │  │ Ensures  ││ │
│  │  │the team  │  │ beautiful│  │ robust   │  │ efficient│  │ secure   ││ │
│  │  │          │  │ UIs      │  │ APIs     │  │ schemas  │  │ code     ││ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘│ │
│  │                                                                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                            │ │
│  │  │    🧪    │  │    🚀    │  │    🤖    │                            │ │
│  │  │ Testing  │  │  DevOps  │  │  AI/ML   │                            │ │
│  │  │          │  │          │  │          │                            │ │
│  │  │ Writes   │  │ Deploys  │  │ Adds     │                            │ │
│  │  │ tests    │  │ infra    │  │ smart    │                            │ │
│  │  │          │  │          │  │ features │                            │ │
│  │  └──────────┘  └──────────┘  └──────────┘                            │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                          How It Works                                  │ │
│  │                                                                        │ │
│  │    ┌───────────┐      ┌───────────┐      ┌───────────┐               │ │
│  │    │     1     │      │     2     │      │     3     │               │ │
│  │    │  Describe │ ───> │  AI Plans │ ───> │   Watch   │               │ │
│  │    │ Your Idea │      │   & Asks  │      │  It Build │               │ │
│  │    │           │      │ Questions │      │           │               │ │
│  │    └───────────┘      └───────────┘      └───────────┘               │ │
│  │                                                                        │ │
│  │    Tell us what       PM Agent breaks     Agents work in              │ │
│  │    you want to        down the project    parallel to build           │ │
│  │    build              and clarifies       your application            │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                            Pricing                                     │ │
│  │                                                                        │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐       │ │
│  │  │      Free       │  │       Pro       │  │    Enterprise   │       │ │
│  │  │                 │  │                 │  │                 │       │ │
│  │  │    $0/month     │  │   $49/month     │  │     Custom      │       │ │
│  │  │                 │  │                 │  │                 │       │ │
│  │  │ • 3 projects    │  │ • Unlimited     │  │ • Everything    │       │ │
│  │  │ • 5 agents      │  │ • All agents    │  │ • SSO           │       │ │
│  │  │ • Community     │  │ • Priority      │  │ • Audit logs    │       │ │
│  │  │                 │  │ • Private repos │  │ • SLA           │       │ │
│  │  │                 │  │                 │  │                 │       │ │
│  │  │ [Get Started]   │  │ [Start Trial]   │  │ [Contact Us]    │       │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘       │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  DevTeam AI        Product   Company   Resources                      │ │
│  │                    Features  About     Docs                           │ │
│  │  © 2024            Pricing   Careers   Blog                           │ │
│  │                    Changelog Contact   Community                      │ │
│  │                                                                        │ │
│  │  [Twitter] [GitHub] [Discord]                                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4.2 Main Workspace Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MAIN WORKSPACE LAYOUT                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ DevTeam AI   E-Commerce Platform ▼        ⌘K      🔔 2    👤 Alex ▼   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│       ↑              ↑                        ↑        ↑       ↑            │
│     Logo      Project Selector          Cmd Palette  Notif  Profile        │
│                                                                              │
│  ┌──────┬────────────────────────────────────────────────────────┬────────┐ │
│  │      │                                                        │        │ │
│  │  📊  │  ┌─────────────────────────────────────────────────┐  │ Agent  │ │
│  │      │  │ ProductCard.tsx  │  products.ts  │  + New Tab   │  │ Panel  │ │
│  │  📁  │  ├─────────────────────────────────────────────────┤  │        │ │
│  │      │  │                                                 │  │ ┌────┐ │ │
│  │  💬  │  │  1  import React from 'react';                  │  │ │ 👔 │ │ │
│  │      │  │  2  import { Product } from '@/types';          │  │ │ PM │ │ │
│  │  ⚙️  │  │  3                                              │  │ │ ●  │ │ │
│  │      │  │  4  interface ProductCardProps {                │  │ └────┘ │ │
│  │      │  │  5    product: Product;                         │  │        │ │
│  │      │  │  6    onAddToCart: () => void;                  │  │ ┌────┐ │ │
│  │      │  │  7  }                                           │  │ │ 🎨 │ │ │
│  │      │  │  8                                              │  │ │ FE │ │ │
│  │      │  │  9  export const ProductCard = ({               │  │ │ ●  │ │ │
│  │      │  │ 10    product,                                  │  │ └────┘ │ │
│  │      │  │ 11    onAddToCart                               │  │        │ │
│  │      │  │ 12  }: ProductCardProps) => {                   │  │ ┌────┐ │ │
│  │      │  │ 13    return (                                  │  │ │ 🔧 │ │ │
│  │      │  │ 14      <div className="rounded-lg border">     │  │ │ BE │ │ │
│  │      │  │ 15        <img src={product.image} />           │  │ │ ●  │ │ │
│  │      │  │ 16        <h3>{product.title}</h3>              │  │ └────┘ │ │
│  │      │  │ 17        <p>${product.price}</p>               │  │        │ │
│  │      │  │ 18        <button onClick={onAddToCart}>        │  │ ┌────┐ │ │
│  │      │  │ 19          Add to Cart                         │  │ │ 🗄️ │ │ │
│  │      │  │ 20        </button>                             │  │ │ DB │ │ │
│  │      │  │ 21      </div>                                  │  │ │ ○  │ │ │
│  │      │  │ 22    );                                        │  │ └────┘ │ │
│  │      │  │ 23  };                                          │  │        │ │
│  │      │  │                                                 │  │  ...   │ │
│  │      │  │                                                 │  │        │ │
│  │      │  └─────────────────────────────────────────────────┘  │        │ │
│  │      │                                                        │        │ │
│  │      ├────────────────────────────────────────────────────────┤        │ │
│  │      │ Communication Panel                          [Expand ↑]│        │ │
│  │      ├────────────────────────────────────────────────────────┤        │ │
│  │      │ 🎨 Frontend: Building responsive image component...    │        │ │
│  │      │ 🔧 Backend: API endpoint /products ready               │        │ │
│  │      │ 👔 PM: Great progress! Next up: Cart functionality     │        │ │
│  │      │                                                        │        │ │
│  │      │ ┌──────────────────────────────────────────────────┐   │        │ │
│  │      │ │ Message the team...                      → Send │   │        │ │
│  │      │ └──────────────────────────────────────────────────┘   │        │ │
│  └──────┴────────────────────────────────────────────────────────┴────────┘ │
│                                                                              │
│  ↑ Side   ↑ File Tree + Editor                                    ↑ Agent  │
│    Nav    (Resizable panels)                                       Sidebar │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Layout Specifications

```scss
// Panel dimensions
$sidebar-width: 48px; // Icon-only sidebar
$file-tree-width: 240px; // Collapsible
$agent-panel-width: 280px; // Collapsible
$comm-panel-height: 200px; // Expandable

// Breakpoints
$bp-sm: 640px;
$bp-md: 768px;
$bp-lg: 1024px;
$bp-xl: 1280px;
$bp-2xl: 1536px;

// Panel states
.panel-collapsed {
  width: 0;
  overflow: hidden;
}
.panel-expanded {
  width: var(--panel-width);
}
```

## 4.3 Project Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PROJECT DASHBOARD                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ DevTeam AI   E-Commerce Platform ▼        ⌘K      🔔 2    👤 Alex ▼   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌──────┬────────────────────────────────────────────────────────────────┐ │
│  │      │                                                                │ │
│  │  📊  │  E-Commerce Platform                                          │ │
│  │  ←   │  Multi-vendor marketplace with Stripe payments                │ │
│  │  📁  │                                                                │ │
│  │      │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │ │
│  │  💬  │  │ Progress   │ │ Tasks      │ │ Agents     │ │ Timeline   │  │ │
│  │      │  │            │ │            │ │            │ │            │  │ │
│  │  ⚙️  │  │  ████░ 68% │ │ 17/25      │ │ 5/7 Active │ │ On Track   │  │ │
│  │      │  │            │ │ Complete   │ │            │ │            │  │ │
│  │      │  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │ │
│  │      │                                                                │ │
│  │      │  ┌──────────────────────────────┐ ┌────────────────────────┐  │ │
│  │      │  │ Agent Activity                │ │ Current Sprint         │  │ │
│  │      │  ├──────────────────────────────┤ ├────────────────────────┤  │ │
│  │      │  │                              │ │                        │  │ │
│  │      │  │ 🎨 Frontend Developer    ●  │ │ Sprint 2: Core Features│  │ │
│  │      │  │ ├─ ProductCard.tsx          │ │                        │  │ │
│  │      │  │ ├─ Adding responsive grid   │ │ ☑ User Auth       100% │  │ │
│  │      │  │ └─ 72% complete             │ │ ☑ Product Listing  100% │  │ │
│  │      │  │                              │ │ ◐ Shopping Cart    45% │  │ │
│  │      │  │ 🔧 Backend Developer     ●  │ │ ○ Checkout          0% │  │ │
│  │      │  │ ├─ cart.controller.ts       │ │ ○ Order History     0% │  │ │
│  │      │  │ ├─ Implementing add to cart │ │                        │  │ │
│  │      │  │ └─ 35% complete             │ │ Due: Dec 15, 2024      │  │ │
│  │      │  │                              │ │                        │  │ │
│  │      │  │ 🗄️ Database Engineer     ○  │ │ [View All Tasks →]     │  │ │
│  │      │  │ └─ Waiting for cart specs   │ │                        │  │ │
│  │      │  │                              │ └────────────────────────┘  │ │
│  │      │  │ 🔒 Security Engineer     ●  │                             │ │
│  │      │  │ ├─ Reviewing auth flow      │ ┌────────────────────────┐  │ │
│  │      │  │ └─ Found 2 issues           │ │ Recent Activity        │  │ │
│  │      │  │                              │ ├────────────────────────┤ │
│  │      │  │ 🧪 Testing Engineer      ●  │ │                        │  │ │
│  │      │  │ ├─ Writing cart tests       │ │ • 2m ago: FE created   │  │ │
│  │      │  │ └─ 12 tests passing         │ │   ProductCard.tsx      │  │ │
│  │      │  │                              │ │                        │  │ │
│  │      │  │ 🚀 DevOps Engineer       ○  │ │ • 5m ago: BE added     │  │ │
│  │      │  │ └─ Idle - waiting           │ │   cart endpoint        │  │ │
│  │      │  │                              │ │                        │  │ │
│  │      │  │ [View All Agents →]         │ │ • 8m ago: SEC flagged  │  │ │
│  │      │  │                              │ │   auth issue           │  │ │
│  │      │  └──────────────────────────────┘ │                        │  │ │
│  │      │                                   │ • 12m ago: PM assigned │  │ │
│  │      │  ┌──────────────────────────────┐ │   cart tasks           │  │ │
│  │      │  │ Blockers & Alerts            │ │                        │  │ │
│  │      │  ├──────────────────────────────┤ │ [View All →]           │  │ │
│  │      │  │                              │ └────────────────────────┘  │ │
│  │      │  │ ⚠️ Security Issue            │                             │ │
│  │      │  │ JWT expiry too long (24h)   │ ┌────────────────────────┐  │ │
│  │      │  │ [View Details] [Resolve]    │ │ Quick Actions          │  │ │
│  │      │  │                              │ ├────────────────────────┤  │ │
│  │      │  │ 🔄 Waiting for Input        │ │                        │  │ │
│  │      │  │ Cart: Use sessions or JWT?  │ │ [+ New Task]           │  │ │
│  │      │  │ [Respond →]                 │ │ [📤 Export Code]       │  │ │
│  │      │  │                              │ │ [⏸ Pause All Agents]  │  │ │
│  │      │  └──────────────────────────────┘ │ [⚙️ Project Settings]  │  │ │
│  │      │                                   │                        │  │ │
│  │      │                                   └────────────────────────┘  │ │
│  │      │                                                                │ │
│  └──────┴────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4.4 Task Board View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TASK BOARD (Kanban)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Tasks    [Board ▼]  [+ Add Task]                   🔍 Filter  ⋮ More  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌────────────────┐│
│  │ 📋 Backlog (8) │ │ 🔄 In Progress │ │ 👀 Review (2)  │ │ ✅ Done (12)   ││
│  │                │ │     (5)        │ │                │ │                ││
│  ├────────────────┤ ├────────────────┤ ├────────────────┤ ├────────────────┤│
│  │                │ │                │ │                │ │                ││
│  │ ┌────────────┐ │ │ ┌────────────┐ │ │ ┌────────────┐ │ │ ┌────────────┐ ││
│  │ │ Order      │ │ │ │ Product    │ │ │ │ Auth flow  │ │ │ │ User       │ ││
│  │ │ history    │ │ │ │ Card       │ │ │ │ security   │ │ │ │ signup     │ ││
│  │ │ page       │ │ │ │ component  │ │ │ │ review     │ │ │ │            │ ││
│  │ │            │ │ │ │            │ │ │ │            │ │ │ │ 🎨 FE      │ ││
│  │ │ 🎨 FE      │ │ │ │ 🎨 FE  72% │ │ │ │ 🔒 SEC     │ │ │ │ ✓ Done     │ ││
│  │ └────────────┘ │ │ │ ━━━━━━━░░░ │ │ │ └────────────┘ │ │ └────────────┘ ││
│  │                │ │ └────────────┘ │ │                │ │                ││
│  │ ┌────────────┐ │ │                │ │ ┌────────────┐ │ │ ┌────────────┐ ││
│  │ │ Vendor     │ │ │ ┌────────────┐ │ │ │ Cart API   │ │ │ │ Product    │ ││
│  │ │ dashboard  │ │ │ │ Cart API   │ │ │ │ tests      │ │ │ │ listing    │ ││
│  │ │            │ │ │ │ endpoints  │ │ │ │            │ │ │ │ API        │ ││
│  │ │ 🎨 FE      │ │ │ │            │ │ │ │ 🧪 QA      │ │ │ │            │ ││
│  │ │            │ │ │ │ 🔧 BE  35% │ │ │ └────────────┘ │ │ │ 🔧 BE      │ ││
│  │ └────────────┘ │ │ │ ━━━░░░░░░░ │ │ │                │ │ │ ✓ Done     │ ││
│  │                │ │ └────────────┘ │ │                │ │ └────────────┘ ││
│  │ ┌────────────┐ │ │                │ │                │ │                ││
│  │ │ Payment    │ │ │ ┌────────────┐ │ │                │ │ ┌────────────┐ ││
│  │ │ processing │ │ │ │ Cart DB    │ │ │                │ │ │ Product    │ ││
│  │ │            │ │ │ │ schema     │ │ │                │ │ │ schema     │ ││
│  │ │ 🔧 BE      │ │ │ │            │ │ │                │ │ │            │ ││
│  │ │ Blocked 🚫 │ │ │ │ 🗄️ DB  20% │ │ │                │ │ │ 🗄️ DB      │ ││
│  │ └────────────┘ │ │ │ ━━░░░░░░░░ │ │ │                │ │ │ ✓ Done     │ ││
│  │                │ │ └────────────┘ │ │                │ │ └────────────┘ ││
│  │      ...       │ │      ...       │ │                │ │      ...       ││
│  │                │ │                │ │                │ │                ││
│  └────────────────┘ └────────────────┘ └────────────────┘ └────────────────┘│
│                                                                              │
│  Legend: 🎨 Frontend  🔧 Backend  🗄️ Database  🔒 Security  🧪 Testing      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4.5 Agent Communication Panel (Expanded)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AGENT COMMUNICATION PANEL (Expanded)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │ Communications                                         [Collapse ↓]    │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │ All │ 👔 PM │ 🎨 FE │ 🔧 BE │ 🗄️ DB │ 🔒 SEC │ 🧪 QA │ 🚀 OPS │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │        ↑ Filter tabs - click to filter by agent                       │ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │                                                                  │ │ │
│  │  │  ┌────┐                                                          │ │ │
│  │  │  │ 👔 │  Project Manager                           10:30 AM     │ │ │
│  │  │  └────┘                                                          │ │ │
│  │  │         Starting Sprint 2: Shopping Cart functionality.          │ │ │
│  │  │         I've assigned tasks to the team:                         │ │ │
│  │  │                                                                  │ │ │
│  │  │         • @Frontend - Cart UI components                         │ │ │
│  │  │         • @Backend - Cart API endpoints                          │ │ │
│  │  │         • @Database - Cart schema design                         │ │ │
│  │  │                                                                  │ │ │
│  │  │         Let me know if you have questions!                       │ │ │
│  │  │                                                                  │ │ │
│  │  │  ───────────────────────────────────────────────────────────     │ │ │
│  │  │                                                                  │ │ │
│  │  │  ┌────┐                                                          │ │ │
│  │  │  │ 🔧 │  Backend Developer                         10:32 AM     │ │ │
│  │  │  └────┘                                                          │ │ │
│  │  │         @Database I need the cart schema before I can            │ │ │
│  │  │         implement the API. Key questions:                        │ │ │
│  │  │                                                                  │ │ │
│  │  │         1. Should cart items reference product variants?         │ │ │
│  │  │         2. Do we need to store price at time of adding?          │ │ │
│  │  │         3. Guest carts vs. user carts?                           │ │ │
│  │  │                                                                  │ │ │
│  │  │  ───────────────────────────────────────────────────────────     │ │ │
│  │  │                                                                  │ │ │
│  │  │  ┌────┐                                                          │ │ │
│  │  │  │ 🗄️ │  Database Engineer                         10:35 AM     │ │ │
│  │  │  └────┘                                                          │ │ │
│  │  │         @Backend Good questions! Here's my proposal:             │ │ │
│  │  │                                                                  │ │ │
│  │  │  ┌────────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │ // prisma/schema.prisma                        [Copy] [▶️] │ │ │ │
│  │  │  │                                                            │ │ │ │
│  │  │  │ model Cart {                                               │ │ │ │
│  │  │  │   id        String   @id @default(uuid())                  │ │ │ │
│  │  │  │   userId    String?  // null for guest carts               │ │ │ │
│  │  │  │   sessionId String?  // for guest identification           │ │ │ │
│  │  │  │   items     CartItem[]                                     │ │ │ │
│  │  │  │   createdAt DateTime @default(now())                       │ │ │ │
│  │  │  │   updatedAt DateTime @updatedAt                            │ │ │ │
│  │  │  │ }                                                          │ │ │ │
│  │  │  │                                                            │ │ │ │
│  │  │  │ model CartItem {                                           │ │ │ │
│  │  │  │   id              String  @id @default(uuid())             │ │ │ │
│  │  │  │   cartId          String                                   │ │ │ │
│  │  │  │   productVariantId String                                  │ │ │ │
│  │  │  │   quantity        Int                                      │ │ │ │
│  │  │  │   priceAtAdd      Decimal // snapshot price                │ │ │ │
│  │  │  │ }                                                          │ │ │ │
│  │  │  └────────────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                                  │ │ │
│  │  │         Does this work? I can adjust based on your needs.        │ │ │
│  │  │                                                                  │ │ │
│  │  │  ───────────────────────────────────────────────────────────     │ │ │
│  │  │                                                                  │ │ │
│  │  │  ┌────┐                                                          │ │ │
│  │  │  │ 🔧 │  Backend Developer                         10:37 AM     │ │ │
│  │  │  └────┘                                                          │ │ │
│  │  │         @Database Perfect! 👍 I'll start implementing.           │ │ │
│  │  │                                                                  │ │ │
│  │  │         @Frontend Here's the API contract for cart:              │ │ │
│  │  │                                                                  │ │ │
│  │  │  ┌────────────────────────────────────────────────────────────┐ │ │ │
│  │  │  │ POST /api/v1/cart/items                                    │ │ │ │
│  │  │  │ Body: { productVariantId, quantity }                       │ │ │ │
│  │  │  │ Response: { cart: Cart }                                   │ │ │ │
│  │  │  │                                                            │ │ │ │
│  │  │  │ GET /api/v1/cart                                           │ │ │ │
│  │  │  │ Response: { cart: Cart, itemCount: number }                │ │ │ │
│  │  │  │                                                            │ │ │ │
│  │  │  │ DELETE /api/v1/cart/items/:itemId                          │ │ │ │
│  │  │  │ Response: { cart: Cart }                                   │ │ │ │
│  │  │  └────────────────────────────────────────────────────────────┘ │ │ │
│  │  │                                                                  │ │ │
│  │  │         Let me know if you need any changes!                     │ │ │
│  │  │                                                                  │ │ │
│  │  │                                                                  │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │ 💬 Message the team...                                          │ │ │
│  │  │                                                                  │ │ │
│  │  │                                                                  │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │   📎 Attach   @ Mention   / Commands                        ⌘ Enter  │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4.6 Project Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROJECT ONBOARDING FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STEP 1: Describe Your Idea                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │                        🚀 What are we building?                        │ │
│  │                                                                        │ │
│  │     Describe your project idea in plain language. Our AI Project      │ │
│  │     Manager will help break it down into actionable tasks.            │ │
│  │                                                                        │ │
│  │     ┌────────────────────────────────────────────────────────────┐    │ │
│  │     │                                                            │    │ │
│  │     │  I want to build an e-commerce platform for selling        │    │ │
│  │     │  handmade crafts. Multiple vendors should be able to       │    │ │
│  │     │  list their products. Customers can browse, add items      │    │ │
│  │     │  to cart, and checkout with Stripe. Need user reviews      │    │ │
│  │     │  and a vendor dashboard.                                   │    │ │
│  │     │                                                            │    │ │
│  │     │                                                            │    │ │
│  │     └────────────────────────────────────────────────────────────┘    │ │
│  │                                                                        │ │
│  │     💡 Tips:                                                          │ │
│  │     • Describe the main features you need                             │ │
│  │     • Mention any specific technologies if you have preferences       │ │
│  │     • Include user types (admin, customer, vendor, etc.)              │ │
│  │                                                                        │ │
│  │                                           ┌────────────────────────┐  │ │
│  │                                           │    Continue →          │  │ │
│  │                                           └────────────────────────┘  │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  STEP 2: PM Agent Conversation                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │     ● ─────── ○ ─────── ○ ─────── ○                                   │ │
│  │   Describe   Clarify    Plan     Start                                │ │
│  │                                                                        │ │
│  │  ┌────────────────────────────────────────────────────────────────┐   │ │
│  │  │                                                                │   │ │
│  │  │  ┌────┐                                                        │   │ │
│  │  │  │ 👔 │  Project Manager AI                                    │   │ │
│  │  │  └────┘                                                        │   │ │
│  │  │                                                                │   │ │
│  │  │  Great idea! I'd love to help you build this marketplace.     │   │ │
│  │  │  Let me ask a few questions to make sure I understand:        │   │ │
│  │  │                                                                │   │ │
│  │  │  1️⃣ **Vendor Verification**: Should vendors be verified       │   │ │
│  │  │     before they can list products, or can anyone sign up?     │   │ │
│  │  │                                                                │   │ │
│  │  │  2️⃣ **Product Categories**: Do you have specific categories   │   │ │
│  │  │     in mind (jewelry, pottery, textiles, etc.)?               │   │ │
│  │  │                                                                │   │ │
│  │  │  3️⃣ **Shipping**: Will vendors handle their own shipping,     │   │ │
│  │  │     or do you need integrated shipping calculation?           │   │ │
│  │  │                                                                │   │ │
│  │  │  4️⃣ **Commission**: Will the platform take a commission       │   │ │
│  │  │     on sales? If so, what percentage?                         │   │ │
│  │  │                                                                │   │ │
│  │  └────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                        │ │
│  │  ┌────────────────────────────────────────────────────────────────┐   │ │
│  │  │                                                                │   │ │
│  │  │  1. Open to anyone, but with email verification               │   │ │
│  │  │  2. Yes: Jewelry, Ceramics, Textiles, Woodwork, Art           │   │ │
│  │  │  3. Vendors handle shipping, just need to show est. cost      │   │ │
│  │  │  4. 10% commission on each sale                               │   │ │
│  │  │                                                                │   │ │
│  │  └────────────────────────────────────────────────────────────────┘   │ │
│  │                                                     [Send Response →] │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  STEP 3: Review Project Plan                                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │     ● ─────── ● ─────── ● ─────── ○                                   │ │
│  │   Describe   Clarify    Plan     Start                                │ │
│  │                                                                        │ │
│  │  ┌────────────────────────────────────────────────────────────────┐   │ │
│  │  │ 👔 Project Manager AI                                          │   │ │
│  │  │                                                                │   │ │
│  │  │ Here's the project plan I've created:                         │   │ │
│  │  └────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │ 📋 Handmade Crafts Marketplace                                   │ │ │
│  │  ├──────────────────────────────────────────────────────────────────┤ │ │
│  │  │                                                                  │ │ │
│  │  │ 🛠️ Tech Stack                                                   │ │ │
│  │  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │ │ │
│  │  │ │   Next.js   │ │   Node.js   │ │ PostgreSQL  │ │   Stripe    │ │ │ │
│  │  │ │   React     │ │   Fastify   │ │   Prisma    │ │   Auth      │ │ │ │
│  │  │ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │ │ │
│  │  │                                                                  │ │ │
│  │  │ 📅 Phases & Timeline                                            │ │ │
│  │  │                                                                  │ │ │
│  │  │ Phase 1: Foundation (Week 1-2)                                  │ │ │
│  │  │ ├─ ☐ User authentication (signup, login, email verify)         │ │ │
│  │  │ ├─ ☐ Vendor registration flow                                  │ │ │
│  │  │ ├─ ☐ Database schema (users, vendors, products)                │ │ │
│  │  │ └─ ☐ Basic UI layout and navigation                            │ │ │
│  │  │                                                                  │ │ │
│  │  │ Phase 2: Core Features (Week 2-3)                               │ │ │
│  │  │ ├─ ☐ Product listing and categories                            │ │ │
│  │  │ ├─ ☐ Product detail pages                                      │ │ │
│  │  │ ├─ ☐ Vendor dashboard                                          │ │ │
│  │  │ ├─ ☐ Product management (CRUD)                                 │ │ │
│  │  │ └─ ☐ Search and filtering                                      │ │ │
│  │  │                                                                  │ │ │
│  │  │ Phase 3: E-commerce (Week 3-4)                                  │ │ │
│  │  │ ├─ ☐ Shopping cart                                             │ │ │
│  │  │ ├─ ☐ Stripe checkout integration                               │ │ │
│  │  │ ├─ ☐ Order management                                          │ │ │
│  │  │ └─ ☐ Commission calculation                                    │ │ │
│  │  │                                                                  │ │ │
│  │  │ Phase 4: Engagement (Week 4-5)                                  │ │ │
│  │  │ ├─ ☐ Product reviews & ratings                                 │ │ │
│  │  │ ├─ ☐ Vendor ratings                                            │ │ │
│  │  │ └─ ☐ Order history                                             │ │ │
│  │  │                                                                  │ │ │
│  │  │ 👥 Team Assignment                                               │ │ │
│  │  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │ │ │
│  │  │ │ 🎨 FE    │ │ 🔧 BE    │ │ 🗄️ DB    │ │ 🔒 SEC   │             │ │ │
│  │  │ │ UI/UX    │ │ APIs     │ │ Schema   │ │ Auth     │             │ │ │
│  │  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘             │ │ │
│  │  │ ┌──────────┐ ┌──────────┐                                       │ │ │
│  │  │ │ 🧪 QA    │ │ 🚀 OPS   │                                       │ │ │
│  │  │ │ Testing  │ │ Deploy   │                                       │ │ │
│  │  │ └──────────┘ └──────────┘                                       │ │ │
│  │  │                                                                  │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                        │ │
│  │     ┌──────────────┐           ┌─────────────────────────────────┐    │ │
│  │     │ ✏️ Edit Plan │           │   ✓ Approve & Start Building    │    │ │
│  │     └──────────────┘           └─────────────────────────────────┘    │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4.7 Settings Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SETTINGS PAGE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────┬────────────────────────────────────────────────────────────────┐ │
│  │      │                                                                │ │
│  │  ←   │  Settings                                                      │ │
│  │      │                                                                │ │
│  │      │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │      │  │ General │ Agents │ Integrations │ Team │ Billing │       │ │ │
│  │      │  └──────────────────────────────────────────────────────────┘ │ │
│  │      │                                                                │ │
│  │      │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │      │  │ PROJECT SETTINGS                                         │ │ │
│  │      │  ├──────────────────────────────────────────────────────────┤ │ │
│  │      │  │                                                          │ │ │
│  │      │  │ Project Name                                             │ │ │
│  │      │  │ ┌──────────────────────────────────────────────────┐    │ │ │
│  │      │  │ │ E-Commerce Platform                              │    │ │ │
│  │      │  │ └──────────────────────────────────────────────────┘    │ │ │
│  │      │  │                                                          │ │ │
│  │      │  │ Description                                              │ │ │
│  │      │  │ ┌──────────────────────────────────────────────────┐    │ │ │
│  │      │  │ │ Multi-vendor marketplace for handmade crafts     │    │ │ │
│  │      │  │ │ with Stripe payments                             │    │ │ │
│  │      │  │ └──────────────────────────────────────────────────┘    │ │ │
│  │      │  │                                                          │ │ │
│  │      │  │ Visibility                                               │ │ │
│  │      │  │ ○ Private (Only you)                                    │ │ │
│  │      │  │ ● Team (Invited members)                                │ │ │
│  │      │  │ ○ Public (Anyone with link)                             │ │ │
│  │      │  │                                                          │ │ │
│  │      │  └──────────────────────────────────────────────────────────┘ │ │
│  │      │                                                                │ │
│  │      │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │      │  │ TECHNOLOGY STACK                                         │ │ │
│  │      │  ├──────────────────────────────────────────────────────────┤ │ │
│  │      │  │                                                          │ │ │
│  │      │  │ Frontend Framework                                       │ │ │
│  │      │  │ ┌──────────────────────────────────────────────────┐    │ │ │
│  │      │  │ │ Next.js (React)                              ▼   │    │ │ │
│  │      │  │ └──────────────────────────────────────────────────┘    │ │ │
│  │      │  │                                                          │ │ │
│  │      │  │ Backend Framework                                        │ │ │
│  │      │  │ ┌──────────────────────────────────────────────────┐    │ │ │
│  │      │  │ │ Fastify (Node.js)                            ▼   │    │ │ │
│  │      │  │ └──────────────────────────────────────────────────┘    │ │ │
│  │      │  │                                                          │ │ │
│  │      │  │ Database                                                 │ │ │
│  │      │  │ ┌──────────────────────────────────────────────────┐    │ │ │
│  │      │  │ │ PostgreSQL + Prisma                          ▼   │    │ │ │
│  │      │  │ └──────────────────────────────────────────────────┘    │ │ │
│  │      │  │                                                          │ │ │
│  │      │  │ Styling                                                  │ │ │
│  │      │  │ ┌──────────────────────────────────────────────────┐    │ │ │
│  │      │  │ │ Tailwind CSS                                 ▼   │    │ │ │
│  │      │  │ └──────────────────────────────────────────────────┘    │ │ │
│  │      │  │                                                          │ │ │
│  │      │  └──────────────────────────────────────────────────────────┘ │ │
│  │      │                                                                │ │
│  │      │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │      │  │ DANGER ZONE                                              │ │ │
│  │      │  ├──────────────────────────────────────────────────────────┤ │ │
│  │      │  │                                                          │ │ │
│  │      │  │ ┌────────────────────────────────────────────────────┐  │ │ │
│  │      │  │ │ Archive Project                    [Archive]       │  │ │ │
│  │      │  │ │ Hide this project from your dashboard              │  │ │ │
│  │      │  │ └────────────────────────────────────────────────────┘  │ │ │
│  │      │  │                                                          │ │ │
│  │      │  │ ┌────────────────────────────────────────────────────┐  │ │ │
│  │      │  │ │ Delete Project                     [Delete]        │  │ │ │
│  │      │  │ │ Permanently delete all files and history           │  │ │ │
│  │      │  │ └────────────────────────────────────────────────────┘  │ │ │
│  │      │  │                                                          │ │ │
│  │      │  └──────────────────────────────────────────────────────────┘ │ │
│  │      │                                                                │ │
│  │      │                            ┌─────────────────────────────────┐│ │
│  │      │                            │       Save Changes              ││ │
│  │      │                            └─────────────────────────────────┘│ │
│  │      │                                                                │ │
│  └──────┴────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 5. User Flows

## 5.1 New User Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NEW USER ONBOARDING FLOW                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                                                                              │
│    ┌─────────────┐                                                          │
│    │  Landing    │                                                          │
│    │   Page      │                                                          │
│    └──────┬──────┘                                                          │
│           │                                                                  │
│           ▼                                                                  │
│    ┌─────────────┐     ┌─────────────┐                                      │
│    │  Sign Up    │────▶│   Verify    │                                      │
│    │   Form      │     │   Email     │                                      │
│    └──────┬──────┘     └──────┬──────┘                                      │
│           │                   │                                              │
│           ▼                   ▼                                              │
│    ┌─────────────────────────────────┐                                      │
│    │        Welcome Screen           │                                      │
│    │  "What would you like to build?"│                                      │
│    └──────────────┬──────────────────┘                                      │
│                   │                                                          │
│         ┌─────────┴─────────┐                                               │
│         ▼                   ▼                                               │
│  ┌─────────────┐     ┌─────────────┐                                        │
│  │ Start from  │     │   Use a     │                                        │
│  │   Scratch   │     │  Template   │                                        │
│  └──────┬──────┘     └──────┬──────┘                                        │
│         │                   │                                                │
│         └─────────┬─────────┘                                               │
│                   ▼                                                          │
│    ┌─────────────────────────────────┐                                      │
│    │      Describe Your Project      │                                      │
│    │   (Natural language input)      │                                      │
│    └──────────────┬──────────────────┘                                      │
│                   │                                                          │
│                   ▼                                                          │
│    ┌─────────────────────────────────┐                                      │
│    │      PM Agent Conversation      │                                      │
│    │   (Clarifying questions)        │                                      │
│    └──────────────┬──────────────────┘                                      │
│                   │                                                          │
│                   ▼                                                          │
│    ┌─────────────────────────────────┐                                      │
│    │      Review Project Plan        │                                      │
│    │   (Tasks, timeline, tech stack) │                                      │
│    └──────────────┬──────────────────┘                                      │
│                   │                                                          │
│         ┌─────────┴─────────┐                                               │
│         ▼                   ▼                                               │
│  ┌─────────────┐     ┌─────────────┐                                        │
│  │ Edit Plan   │     │  Approve    │                                        │
│  │             │     │   Plan      │                                        │
│  └──────┬──────┘     └──────┬──────┘                                        │
│         │                   │                                                │
│         └─────────┬─────────┘                                               │
│                   ▼                                                          │
│    ┌─────────────────────────────────┐                                      │
│    │        Main Workspace           │                                      │
│    │   (Agents start working)        │                                      │
│    └─────────────────────────────────┘                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5.2 Development Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEVELOPMENT WORKFLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           MAIN LOOP                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│                          ┌───────────────┐                                  │
│                          │   User Input  │                                  │
│                          │  or Task Start│                                  │
│                          └───────┬───────┘                                  │
│                                  │                                          │
│                                  ▼                                          │
│                          ┌───────────────┐                                  │
│                          │   PM Agent    │                                  │
│                          │   Analyzes    │                                  │
│                          └───────┬───────┘                                  │
│                                  │                                          │
│                 ┌────────────────┼────────────────┐                         │
│                 ▼                ▼                ▼                         │
│          ┌───────────┐    ┌───────────┐    ┌───────────┐                   │
│          │  Assign   │    │  Assign   │    │  Assign   │                   │
│          │  to FE    │    │  to BE    │    │  to DB    │                   │
│          └─────┬─────┘    └─────┬─────┘    └─────┬─────┘                   │
│                │                │                │                          │
│                ▼                ▼                ▼                          │
│          ╔═══════════╗    ╔═══════════╗    ╔═══════════╗                   │
│          ║  PARALLEL ║    ║  PARALLEL ║    ║  PARALLEL ║                   │
│          ║  EXECUTION║    ║  EXECUTION║    ║  EXECUTION║                   │
│          ╚═════╤═════╝    ╚═════╤═════╝    ╚═════╤═════╝                   │
│                │                │                │                          │
│                └────────────────┼────────────────┘                          │
│                                 │                                            │
│                                 ▼                                            │
│                    ┌────────────────────────┐                               │
│                    │   Agents Communicate   │                               │
│                    │   (API Contracts, etc) │                               │
│                    └───────────┬────────────┘                               │
│                                │                                            │
│                    ┌───────────┴───────────┐                               │
│                    ▼                       ▼                                │
│             ┌───────────┐           ┌───────────┐                          │
│             │ Security  │           │  Testing  │                          │
│             │  Review   │           │   Agent   │                          │
│             └─────┬─────┘           └─────┬─────┘                          │
│                   │                       │                                 │
│                   └───────────┬───────────┘                                │
│                               │                                             │
│                               ▼                                             │
│                    ┌────────────────────────┐                               │
│                    │   PM Tracks Progress   │                               │
│                    │   Updates User         │                               │
│                    └───────────┬────────────┘                               │
│                                │                                            │
│                    ┌───────────┴───────────┐                               │
│                    ▼                       ▼                                │
│             ┌───────────┐           ┌───────────┐                          │
│             │ Task Done │           │  Blocked  │                          │
│             │ Next Task │           │ Need User │                          │
│             └─────┬─────┘           └─────┬─────┘                          │
│                   │                       │                                 │
│                   │                       ▼                                 │
│                   │              ┌───────────────┐                          │
│                   │              │  User Action  │                          │
│                   │              │   Required    │                          │
│                   │              └───────┬───────┘                          │
│                   │                      │                                  │
│                   └──────────────────────┘                                  │
│                              │                                              │
│                              ▼                                              │
│                    ┌────────────────────────┐                               │
│                    │    Loop Continues      │                               │
│                    │  Until Project Done    │                               │
│                    └────────────────────────┘                               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5.3 User Intervention Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER INTERVENTION FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                          ┌───────────────┐                                  │
│                          │ User Observes │                                  │
│                          │ Agent Working │                                  │
│                          └───────┬───────┘                                  │
│                                  │                                          │
│                 ┌────────────────┼────────────────┐                         │
│                 ▼                ▼                ▼                         │
│          ┌───────────┐    ┌───────────┐    ┌───────────┐                   │
│          │ Continue  │    │ Intervene │    │  Pause    │                   │
│          │ Watching  │    │  (Guide)  │    │  Agent    │                   │
│          └───────────┘    └─────┬─────┘    └─────┬─────┘                   │
│                                 │                │                          │
│                                 ▼                ▼                          │
│                          ┌───────────┐    ┌───────────┐                    │
│                          │  Type     │    │  Agent    │                    │
│                          │ Guidance  │    │  Pauses   │                    │
│                          └─────┬─────┘    └─────┬─────┘                    │
│                                │                │                          │
│                                ▼                ▼                          │
│                          ┌───────────┐    ┌───────────┐                    │
│                          │  Agent    │    │  User     │                    │
│                          │ Receives  │    │  Options: │                    │
│                          │ Guidance  │    │ •Resume   │                    │
│                          └─────┬─────┘    │ •Redirect │                    │
│                                │          │ •Rollback │                    │
│                                │          │ •Override │                    │
│                                │          └─────┬─────┘                    │
│                                │                │                          │
│                                ▼                ▼                          │
│                          ┌───────────┐    ┌───────────┐                    │
│                          │  Agent    │    │  Action   │                    │
│                          │ Adjusts   │    │  Taken    │                    │
│                          │ Approach  │    │           │                    │
│                          └─────┬─────┘    └─────┬─────┘                    │
│                                │                │                          │
│                                └────────┬───────┘                          │
│                                         │                                   │
│                                         ▼                                   │
│                          ┌─────────────────────────┐                       │
│                          │    Agent Continues      │                       │
│                          │  With New Direction     │                       │
│                          └─────────────────────────┘                       │
│                                                                              │
│  INTERVENTION TYPES:                                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ • Guide: "Use Tailwind instead of CSS modules"                       │  │
│  │ • Redirect: "Focus on mobile design first"                           │  │
│  │ • Rollback: "Undo the last 3 changes"                                │  │
│  │ • Override: "Replace this implementation with [code]"                │  │
│  │ • Pause: "Stop all agents while I review"                            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 6. Interaction Patterns

## 6.1 Keyboard Shortcuts

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          KEYBOARD SHORTCUTS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  GLOBAL SHORTCUTS                                                            │
│  ────────────────────────────────────────────────────────────────────────   │
│  ⌘ K          Open command palette                                          │
│  ⌘ P          Quick file search                                             │
│  ⌘ S          Save current file                                             │
│  ⌘ ⇧ S        Save all files                                                │
│  ⌘ B          Toggle file sidebar                                           │
│  ⌘ J          Toggle communication panel                                    │
│  ⌘ \          Toggle agent panel                                            │
│  ⌘ `          Toggle terminal                                               │
│  Esc          Close modal/panel/palette                                     │
│                                                                              │
│  EDITOR SHORTCUTS                                                            │
│  ────────────────────────────────────────────────────────────────────────   │
│  ⌘ Z          Undo                                                          │
│  ⌘ ⇧ Z        Redo                                                          │
│  ⌘ F          Find in file                                                  │
│  ⌘ ⇧ F        Find in project                                               │
│  ⌘ H          Find and replace                                              │
│  ⌘ D          Select next occurrence                                        │
│  ⌘ /          Toggle comment                                                │
│  ⌘ ⇧ K        Delete line                                                   │
│  ⌥ ↑          Move line up                                                  │
│  ⌥ ↓          Move line down                                                │
│  ⌘ G          Go to line                                                    │
│  F12          Go to definition                                              │
│                                                                              │
│  AGENT SHORTCUTS                                                             │
│  ────────────────────────────────────────────────────────────────────────   │
│  ⌘ ⇧ A        Focus agent panel                                             │
│  ⌘ ⇧ P        Open PM chat                                                  │
│  ⌘ ⇧ F        Open Frontend chat                                            │
│  ⌘ ⇧ B        Open Backend chat                                             │
│  ⌘ ⇧ Space    Pause/Resume all agents                                       │
│                                                                              │
│  NAVIGATION SHORTCUTS                                                        │
│  ────────────────────────────────────────────────────────────────────────   │
│  ⌘ 1          Go to Dashboard                                               │
│  ⌘ 2          Go to Editor                                                  │
│  ⌘ 3          Go to Tasks                                                   │
│  ⌘ 4          Go to Settings                                                │
│  ⌘ W          Close current tab                                             │
│  ⌘ ⇧ T        Reopen closed tab                                             │
│  ⌘ Tab        Switch to next tab                                            │
│  ⌘ ⇧ Tab      Switch to previous tab                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 6.2 Drag and Drop Interactions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DRAG AND DROP PATTERNS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FILE TREE                                                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │  📁 src                                                                │ │
│  │    📁 components                                                       │ │
│  │      📄 ProductCard.tsx  ← Drag                                       │ │
│  │            ↓                                                           │ │
│  │    📁 features  ← Drop here (move to folder)                          │ │
│  │      ┌─────────────────────────────┐                                  │ │
│  │      │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ ← Drop indicator                │ │
│  │      └─────────────────────────────┘                                  │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  TASK BOARD                                                                  │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │  │ In Progress │     │ Review │     │ Done │                          │ │
│  │  │             │     │        │     │      │                          │ │
│  │  │  ┌────────┐ │     │        │     │      │                          │ │
│  │  │  │ Task A │←┼─┐   │        │     │      │                          │ │
│  │  │  └────────┘ │ │   │        │     │      │                          │ │
│  │  │             │ │   │  ┌───────────────┐  │                          │ │
│  │  │             │ └──▶│  │ ░░░ Drop ░░░ │  │                          │ │
│  │  │             │     │  └───────────────┘  │                          │ │
│  │  │             │     │                     │                          │ │
│  │                                                                        │ │
│  │  Dragging task changes status automatically                           │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  PANEL RESIZE                                                                │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │  ┌──────────────────┐║┌────────────────────────────────────┐          │ │
│  │  │                  │║│                                    │          │ │
│  │  │   File Tree      │║│            Editor                  │          │ │
│  │  │                  │║│                                    │          │ │
│  │  │                  │◀▶                                    │          │ │
│  │  │                  │║│   Drag border to resize panels     │          │ │
│  │  │                  │║│                                    │          │ │
│  │  └──────────────────┘║└────────────────────────────────────┘          │ │
│  │                      ↑                                                 │ │
│  │               Resize handle                                            │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  TAB REORDER                                                                 │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │  ┌─────────────┬─────────────┬─────────────┬─────────────┐            │ │
│  │  │ file1.tsx   │ file2.tsx ←─┼── Drag      │ file3.tsx   │            │ │
│  │  └─────────────┴─────────────┴─────────────┴─────────────┘            │ │
│  │                      │                                                 │ │
│  │                      ▼                                                 │ │
│  │  ┌─────────────┬─────────────┬─────────────┬─────────────┐            │ │
│  │  │ file1.tsx   │ file3.tsx   │ ░░░░░░░░░░░ │ file2.tsx   │            │ │
│  │  └─────────────┴─────────────┴─────────────┴─────────────┘            │ │
│  │                                ↑ Drop indicator                        │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 6.3 Hover States & Tooltips

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        HOVER STATES & TOOLTIPS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  AGENT AVATAR HOVER                                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │      ┌────┐                                                            │ │
│  │      │ 🎨 │ ● ◄── Hover here                                          │ │
│  │      └────┘                                                            │ │
│  │         ↓                                                              │ │
│  │    ┌─────────────────────────────────────────┐                        │ │
│  │    │ 🎨 Frontend Developer                   │                        │ │
│  │    │                                         │                        │ │
│  │    │ Status: Active                          │                        │ │
│  │    │ Current: Building ProductCard.tsx       │                        │ │
│  │    │ Progress: 72%                           │                        │ │
│  │    │                                         │                        │ │
│  │    │ [View Activity] [Send Message]          │                        │ │
│  │    └─────────────────────────────────────────┘                        │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  BUTTON TOOLTIP                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │                    ┌─────────────────────────┐                        │ │
│  │                    │ Pause all agents  ⌘⇧P  │ ◄── Tooltip            │ │
│  │                    └───────────┬─────────────┘                        │ │
│  │                                ↓                                       │ │
│  │                          ┌──────────┐                                 │ │
│  │                          │    ⏸️    │ ◄── Icon button                │ │
│  │                          └──────────┘                                 │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  FILE TREE HOVER                                                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │    📄 ProductCard.tsx  🎨                                             │ │
│  │    ─────────────────────────  ◄── Hover                              │ │
│  │         ↓                                                              │ │
│  │    ┌─────────────────────────────────────────────────────┐            │ │
│  │    │ src/components/ProductCard.tsx                      │            │ │
│  │    │                                                     │            │ │
│  │    │ Last modified: 2 minutes ago by Frontend Agent     │            │ │
│  │    │ Size: 2.4 KB                                        │            │ │
│  │    │                                                     │            │ │
│  │    │ 🎨 Currently being edited by Frontend Developer    │            │ │
│  │    └─────────────────────────────────────────────────────┘            │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  PROGRESS BAR HOVER                                                          │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │    ━━━━━━━━━━━━━━━━░░░░░░░░░░  68%  ◄── Hover                        │ │
│  │              ↓                                                         │ │
│  │    ┌─────────────────────────────────────────┐                        │ │
│  │    │ Project Progress                        │                        │ │
│  │    │                                         │                        │ │
│  │    │ Completed: 17 tasks                     │                        │ │
│  │    │ In Progress: 5 tasks                    │                        │ │
│  │    │ Remaining: 3 tasks                      │                        │ │
│  │    │                                         │                        │ │
│  │    │ Est. completion: 2 days                 │                        │ │
│  │    └─────────────────────────────────────────┘                        │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 6.4 Context Menus

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CONTEXT MENUS                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FILE CONTEXT MENU (Right-click on file)                                     │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │    📄 ProductCard.tsx ← Right-click                                   │ │
│  │         ↓                                                              │ │
│  │    ┌─────────────────────────────────┐                                │ │
│  │    │ Open                       ↵    │                                │ │
│  │    │ Open to the Side           ⌘\   │                                │ │
│  │    ├─────────────────────────────────┤                                │ │
│  │    │ Copy Path                  ⌘C   │                                │ │
│  │    │ Copy Relative Path              │                                │ │
│  │    ├─────────────────────────────────┤                                │ │
│  │    │ Rename                     F2   │                                │ │
│  │    │ Delete                     ⌘⌫   │                                │ │
│  │    │ Duplicate                       │                                │ │
│  │    ├─────────────────────────────────┤                                │ │
│  │    │ Ask Agent About This File  →   │                                │ │
│  │    │   ├─ 🎨 Frontend                │                                │ │
│  │    │   ├─ 🔧 Backend                 │                                │ │
│  │    │   └─ 🔒 Security Review         │                                │ │
│  │    ├─────────────────────────────────┤                                │ │
│  │    │ View History                    │                                │ │
│  │    │ Compare with...                 │                                │ │
│  │    └─────────────────────────────────┘                                │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  EDITOR CONTEXT MENU (Right-click on code)                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │    const handleClick = () => {  ← Right-click on selection            │ │
│  │         ↓                                                              │ │
│  │    ┌─────────────────────────────────┐                                │ │
│  │    │ Cut                        ⌘X   │                                │ │
│  │    │ Copy                       ⌘C   │                                │ │
│  │    │ Paste                      ⌘V   │                                │ │
│  │    ├─────────────────────────────────┤                                │ │
│  │    │ Go to Definition           F12  │                                │ │
│  │    │ Find All References        ⇧F12 │                                │ │
│  │    │ Rename Symbol              F2   │                                │ │
│  │    ├─────────────────────────────────┤                                │ │
│  │    │ 🤖 Ask AI About This       →   │                                │ │
│  │    │   ├─ Explain this code          │                                │ │
│  │    │   ├─ Improve this code          │                                │ │
│  │    │   ├─ Add comments               │                                │ │
│  │    │   ├─ Find bugs                  │                                │ │
│  │    │   └─ Write tests                │                                │ │
│  │    ├─────────────────────────────────┤                                │ │
│  │    │ Format Selection           ⌘⇧F  │                                │ │
│  │    │ Comment                    ⌘/   │                                │ │
│  │    └─────────────────────────────────┘                                │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  AGENT CONTEXT MENU (Right-click on agent avatar)                            │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                                                                        │ │
│  │    ┌────┐                                                             │ │
│  │    │ 🎨 │ ← Right-click                                              │ │
│  │    └────┘                                                             │ │
│  │         ↓                                                              │ │
│  │    ┌─────────────────────────────────┐                                │ │
│  │    │ View Activity                   │                                │ │
│  │    │ Send Message                    │                                │ │
│  │    ├─────────────────────────────────┤                                │ │
│  │    │ ⏸️ Pause Agent                   │                                │ │
│  │    │ 🔄 Restart Current Task          │                                │ │
│  │    │ ↩️ Rollback Last Change          │                                │ │
│  │    ├─────────────────────────────────┤                                │ │
│  │    │ View Files Modified             │                                │ │
│  │    │ View Completed Tasks            │                                │ │
│  │    ├─────────────────────────────────┤                                │ │
│  │    │ Agent Settings                  │                                │ │
│  │    └─────────────────────────────────┘                                │ │
│  │                                                                        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 7. Responsive Design

## 7.1 Breakpoint System

```scss
// Breakpoints (Mobile-first approach)
$breakpoints: (
  'sm': 640px,
  // Small tablets
  'md': 768px,
  // Tablets
  'lg': 1024px,
  // Small laptops
  'xl': 1280px,
  // Desktops
  '2xl': 1536px, // Large desktops
);

// Usage
@mixin responsive($breakpoint) {
  @media (min-width: map-get($breakpoints, $breakpoint)) {
    @content;
  }
}
```

## 7.2 Layout Adaptations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         RESPONSIVE LAYOUTS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  DESKTOP (≥1280px) - Full Layout                                            │
│  ┌────┬──────────────────────────────────────────────────┬────────┐         │
│  │    │                                                  │        │         │
│  │ S  │                                                  │ Agent  │         │
│  │ I  │                    Editor                        │ Panel  │         │
│  │ D  │                                                  │        │         │
│  │ E  ├──────────────────────────────────────────────────┤        │         │
│  │    │            Communication Panel                   │        │         │
│  └────┴──────────────────────────────────────────────────┴────────┘         │
│                                                                              │
│  LAPTOP (1024px - 1279px) - Collapsible Panels                              │
│  ┌────┬────────────────────────────────────────────────────────────┐        │
│  │    │                                                            │        │
│  │ S  │                                                            │        │
│  │ I  │                         Editor                             │        │
│  │ D  │                                                            │        │
│  │ E  ├────────────────────────────────────────────────────────────┤        │
│  │    │              Communication Panel (Collapsed)               │        │
│  └────┴────────────────────────────────────────────────────────────┘        │
│         Agent panel collapsed to icons, expandable on hover                  │
│                                                                              │
│  TABLET (768px - 1023px) - Stack Layout                                      │
│  ┌──────────────────────────────────────────────────────────────────┐       │
│  │  [≡ Menu]    E-Commerce Platform    [🤖 Agents]    [💬 Chat]    │       │
│  ├──────────────────────────────────────────────────────────────────┤       │
│  │                                                                  │       │
│  │                                                                  │       │
│  │                          Editor                                  │       │
│  │                     (Full Width)                                 │       │
│  │                                                                  │       │
│  │                                                                  │       │
│  ├──────────────────────────────────────────────────────────────────┤       │
│  │  📁 Files  │  📊 Dashboard  │  📋 Tasks  │  ⚙️ Settings          │       │
│  └──────────────────────────────────────────────────────────────────┘       │
│         Side panels become slide-out drawers                                 │
│         Bottom tab navigation                                                │
│                                                                              │
│  MOBILE (< 768px) - View Only / Limited Interaction                          │
│  ┌────────────────────────────────────┐                                     │
│  │  [≡]  DevTeam AI        [🔔] [👤] │                                     │
│  ├────────────────────────────────────┤                                     │
│  │                                    │                                     │
│  │  ┌──────────────────────────────┐ │                                     │
│  │  │ 📊 Project Progress          │ │                                     │
│  │  │ ████████████░░░░ 68%         │ │                                     │
│  │  └──────────────────────────────┘ │                                     │
│  │                                    │                                     │
│  │  ┌──────────────────────────────┐ │                                     │
│  │  │ 🤖 Agent Activity            │ │                                     │
│  │  │ 🎨 FE: ProductCard... ●      │ │                                     │
│  │  │ 🔧 BE: Cart API...    ●      │ │                                     │
│  │  │ 🗄️ DB: Idle          ○      │ │                                     │
│  │  └──────────────────────────────┘ │                                     │
│  │                                    │                                     │
│  │  ┌──────────────────────────────┐ │                                     │
│  │  │ 💬 Recent Messages           │ │                                     │
│  │  │ PM: Sprint 2 started...      │ │                                     │
│  │  │ FE: Need API contract...     │ │                                     │
│  │  └──────────────────────────────┘ │                                     │
│  │                                    │                                     │
│  │  ┌──────────────────────────────┐ │                                     │
│  │  │ 💬 Send Message              │ │                                     │
│  │  └──────────────────────────────┘ │                                     │
│  │                                    │                                     │
│  ├────────────────────────────────────┤                                     │
│  │  📊     💬     📋     ⚙️          │                                     │
│  └────────────────────────────────────┘                                     │
│         Code editing disabled on mobile                                      │
│         Focus on monitoring and messaging                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 7.3 Component Responsive Behavior

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPONENT RESPONSIVE BEHAVIOR                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  NAVIGATION                                                                  │
│  ────────────────────────────────────────────────────────────────────────   │
│  Desktop:  Sidebar with icons + text labels                                 │
│  Tablet:   Icon-only sidebar, text on hover                                 │
│  Mobile:   Bottom tab bar + hamburger menu                                  │
│                                                                              │
│  FILE TREE                                                                   │
│  ────────────────────────────────────────────────────────────────────────   │
│  Desktop:  Always visible in sidebar (240px width)                          │
│  Tablet:   Slide-out drawer from left                                       │
│  Mobile:   Full-screen modal                                                │
│                                                                              │
│  AGENT PANEL                                                                 │
│  ────────────────────────────────────────────────────────────────────────   │
│  Desktop:  Always visible on right (280px width)                            │
│  Tablet:   Slide-out drawer from right                                      │
│  Mobile:   Full-screen modal with agent cards                               │
│                                                                              │
│  COMMUNICATION PANEL                                                         │
│  ────────────────────────────────────────────────────────────────────────   │
│  Desktop:  Docked at bottom (expandable)                                    │
│  Tablet:   Slide-up panel from bottom                                       │
│  Mobile:   Dedicated chat tab/screen                                        │
│                                                                              │
│  EDITOR                                                                      │
│  ────────────────────────────────────────────────────────────────────────   │
│  Desktop:  Full Monaco Editor with all features                             │
│  Tablet:   Simplified editor, basic editing                                 │
│  Mobile:   Read-only code viewer                                            │
│                                                                              │
│  TASK BOARD                                                                  │
│  ────────────────────────────────────────────────────────────────────────   │
│  Desktop:  4-column Kanban board                                            │
│  Tablet:   Horizontal scroll, 2 columns visible                             │
│  Mobile:   Single column, swipe to change status                            │
│                                                                              │
│  MODALS                                                                      │
│  ────────────────────────────────────────────────────────────────────────   │
│  Desktop:  Centered modal with backdrop (max 600px)                         │
│  Tablet:   Centered modal (max 90% width)                                   │
│  Mobile:   Full-screen sheet from bottom                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 7.4 Touch-Friendly Adjustments

```scss
// Touch target sizes
$touch-target-min: 44px; // Apple HIG minimum

// Mobile-specific styles
@include responsive('md', 'max') {
  .button {
    min-height: $touch-target-min;
    min-width: $touch-target-min;
    padding: $space-3 $space-4;
  }

  .icon-button {
    width: $touch-target-min;
    height: $touch-target-min;
  }

  .list-item {
    min-height: $touch-target-min;
    padding: $space-3 $space-4;
  }

  .input {
    min-height: $touch-target-min;
    font-size: 16px; // Prevents zoom on iOS
  }

  // Increase spacing between interactive elements
  .action-group {
    gap: $space-3;
  }
}
```

---

# 8. Accessibility Guidelines

## 8.1 WCAG 2.1 AA Compliance

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ACCESSIBILITY CHECKLIST                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PERCEIVABLE                                                                 │
│  ────────────────────────────────────────────────────────────────────────   │
│  ✓ All images have alt text                                                 │
│  ✓ Color is not the only means of conveying information                    │
│  ✓ Text has minimum contrast ratio of 4.5:1 (normal) / 3:1 (large)         │
│  ✓ Content can be resized up to 200% without loss of functionality         │
│  ✓ Audio/video has captions where applicable                               │
│                                                                              │
│  OPERABLE                                                                    │
│  ────────────────────────────────────────────────────────────────────────   │
│  ✓ All functionality available via keyboard                                │
│  ✓ No keyboard traps                                                        │
│  ✓ Skip links available for main content                                   │
│  ✓ Focus indicators visible                                                 │
│  ✓ No content flashes more than 3 times per second                         │
│  ✓ Page titles are descriptive                                             │
│  ✓ Focus order is logical                                                  │
│                                                                              │
│  UNDERSTANDABLE                                                              │
│  ────────────────────────────────────────────────────────────────────────   │
│  ✓ Language of page is specified                                           │
│  ✓ Navigation is consistent                                                 │
│  ✓ Error messages are clear and helpful                                    │
│  ✓ Labels and instructions are provided for inputs                         │
│  ✓ Error prevention for important actions                                  │
│                                                                              │
│  ROBUST                                                                      │
│  ────────────────────────────────────────────────────────────────────────   │
│  ✓ Valid HTML                                                               │
│  ✓ ARIA roles used correctly                                               │
│  ✓ Status messages announced to screen readers                             │
│  ✓ Compatible with assistive technologies                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 8.2 Color Contrast Requirements

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COLOR CONTRAST RATIOS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  DARK THEME CONTRAST CHECKS                                                  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Element              │ Foreground │ Background │ Ratio  │ Pass    │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ Primary Text         │ #fafafa    │ #09090b    │ 19.5:1 │ ✓ AAA   │   │
│  │ Secondary Text       │ #a1a1aa    │ #09090b    │ 7.2:1  │ ✓ AAA   │   │
│  │ Muted Text           │ #71717a    │ #09090b    │ 4.6:1  │ ✓ AA    │   │
│  │ Link Text            │ #3b82f6    │ #09090b    │ 5.1:1  │ ✓ AA    │   │
│  │ Error Text           │ #ef4444    │ #09090b    │ 4.8:1  │ ✓ AA    │   │
│  │ Success Text         │ #22c55e    │ #09090b    │ 6.4:1  │ ✓ AA    │   │
│  │ Button Text          │ #09090b    │ #fafafa    │ 19.5:1 │ ✓ AAA   │   │
│  │ Input Placeholder    │ #71717a    │ #18181b    │ 4.1:1  │ ✓ AA    │   │
│  │ Border (interactive) │ #3f3f46    │ #18181b    │ 3.1:1  │ ✓ AA*   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  * Non-text elements require 3:1 ratio                                      │
│                                                                              │
│  AGENT COLORS ON DARK BACKGROUND                                            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Agent      │ Color    │ On #09090b │ On #18181b │ Adjustment       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ PM         │ #8b5cf6  │ 5.8:1 ✓    │ 4.9:1 ✓    │ None needed      │   │
│  │ Frontend   │ #3b82f6  │ 5.1:1 ✓    │ 4.3:1 ✓    │ None needed      │   │
│  │ Backend    │ #22c55e  │ 6.4:1 ✓    │ 5.4:1 ✓    │ None needed      │   │
│  │ Database   │ #f59e0b  │ 8.2:1 ✓    │ 6.9:1 ✓    │ None needed      │   │
│  │ Security   │ #ef4444  │ 4.8:1 ✓    │ 4.0:1 ✓    │ None needed      │   │
│  │ Testing    │ #06b6d4  │ 6.1:1 ✓    │ 5.1:1 ✓    │ None needed      │   │
│  │ DevOps     │ #ec4899  │ 5.2:1 ✓    │ 4.4:1 ✓    │ None needed      │   │
│  │ AI/ML      │ #a855f7  │ 5.4:1 ✓    │ 4.6:1 ✓    │ None needed      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 8.3 Focus Management

````
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FOCUS MANAGEMENT                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FOCUS VISIBLE STYLES                                                        │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Default Focus Ring:                                                         │
│  ┌──────────────────────┐                                                   │
│  │ ┌──────────────────┐ │                                                   │
│  │ │                  │ │ ← 2px ring, accent color                         │
│  │ │     Button       │ │   with 2px offset                                │
│  │ │                  │ │                                                   │
│  │ └──────────────────┘ │                                                   │
│  └──────────────────────┘                                                   │
│                                                                              │
│  CSS Implementation:                                                         │
│  ```scss                                                                     │
│  :focus-visible {                                                            │
│    outline: 2px solid $accent;                                              │
│    outline-offset: 2px;                                                     │
│  }                                                                           │
│                                                                              │
│  // Remove default focus for mouse users                                    │
│  :focus:not(:focus-visible) {                                               │
│    outline: none;                                                           │
│  }                                                                           │
│  ```                                                                         │
│                                                                              │
│  FOCUS TRAP FOR MODALS                                                       │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  When modal opens:                                                           │
│  1. Save previously focused element                                         │
│  2. Move focus to first focusable element in modal                         │
│  3. Trap Tab/Shift+Tab within modal                                        │
│  4. Close on Escape key                                                     │
│  5. Return focus to previously focused element on close                    │
│                                                                              │
│  SKIP LINKS                                                                  │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ [Skip to main content] [Skip to navigation] [Skip to agent panel]   │  │
│  │                                                                      │  │
│  │ (Visible only on focus, positioned at top of page)                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
````

## 8.4 ARIA Labels and Roles

````
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ARIA IMPLEMENTATION                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LANDMARKS                                                                   │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  <header role="banner">           - Top navigation bar                      │
│  <nav role="navigation">          - Sidebar navigation                      │
│  <main role="main">               - Editor/Dashboard area                   │
│  <aside role="complementary">     - Agent panel                             │
│  <footer role="contentinfo">      - Status bar (if present)                 │
│                                                                              │
│  AGENT COMPONENTS                                                            │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Agent Status Card:                                                          │
│  ```html                                                                     │
│  <article                                                                    │
│    role="article"                                                           │
│    aria-label="Frontend Developer Agent"                                    │
│    aria-describedby="fe-agent-status"                                       │
│  >                                                                           │
│    <span aria-hidden="true">🎨</span>                                       │
│    <h3>Frontend Developer</h3>                                              │
│    <p id="fe-agent-status">                                                 │
│      Status: Active. Working on ProductCard component.                      │
│      Progress: 72 percent complete.                                         │
│    </p>                                                                      │
│  </article>                                                                  │
│  ```                                                                         │
│                                                                              │
│  LIVE REGIONS                                                                │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Agent Activity Updates:                                                     │
│  ```html                                                                     │
│  <div                                                                        │
│    role="log"                                                               │
│    aria-live="polite"                                                       │
│    aria-label="Agent activity feed"                                         │
│  >                                                                           │
│    <!-- New messages appear here and are announced -->                      │
│  </div>                                                                      │
│  ```                                                                         │
│                                                                              │
│  Progress Updates:                                                           │
│  ```html                                                                     │
│  <div                                                                        │
│    role="status"                                                            │
│    aria-live="polite"                                                       │
│    aria-atomic="true"                                                       │
│  >                                                                           │
│    Project is 68% complete                                                  │
│  </div>                                                                      │
│  ```                                                                         │
│                                                                              │
│  Error Alerts:                                                               │
│  ```html                                                                     │
│  <div                                                                        │
│    role="alert"                                                             │
│    aria-live="assertive"                                                    │
│  >                                                                           │
│    Security issue detected in authentication flow                           │
│  </div>                                                                      │
│  ```                                                                         │
│                                                                              │
│  INTERACTIVE ELEMENTS                                                        │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  File Tree:                                                                  │
│  ```html                                                                     │
│  <div role="tree" aria-label="Project files">                               │
│    <div role="treeitem" aria-expanded="true" aria-level="1">                │
│      src                                                                    │
│      <div role="group">                                                     │
│        <div role="treeitem" aria-level="2">                                 │
│          components                                                         │
│        </div>                                                               │
│      </div>                                                                 │
│    </div>                                                                   │
│  </div>                                                                      │
│  ```                                                                         │
│                                                                              │
│  Tab Panel:                                                                  │
│  ```html                                                                     │
│  <div role="tablist" aria-label="Editor tabs">                              │
│    <button role="tab" aria-selected="true" aria-controls="panel1">         │
│      ProductCard.tsx                                                        │
│    </button>                                                                │
│    <button role="tab" aria-selected="false" aria-controls="panel2">        │
│      products.ts                                                            │
│    </button>                                                                │
│  </div>                                                                      │
│  <div role="tabpanel" id="panel1" aria-labelledby="tab1">                   │
│    <!-- Editor content -->                                                  │
│  </div>                                                                      │
│  ```                                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
````

## 8.5 Screen Reader Announcements

````
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SCREEN READER ANNOUNCEMENTS                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  EVENT-BASED ANNOUNCEMENTS                                                   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Event                      │ Announcement                          │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ Agent starts task          │ "Frontend agent started working on    │   │
│  │                            │  ProductCard component"                │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ Agent completes task       │ "Frontend agent completed ProductCard │   │
│  │                            │  component. 18 of 25 tasks complete." │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ New message received       │ "New message from Backend agent"      │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ File created               │ "File ProductCard.tsx created by      │   │
│  │                            │  Frontend agent"                       │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ Security alert             │ "Alert: Security issue detected.      │   │
│  │                            │  JWT expiry too long."                 │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ Build error                │ "Error: Build failed. TypeError in    │   │
│  │                            │  ProductCard.tsx line 42"              │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ Project milestone          │ "Milestone reached: Sprint 1 complete.│   │
│  │                            │  Project is now 40% complete."         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  IMPLEMENTATION:                                                             │
│  ```typescript                                                               │
│  // Announcement service                                                     │
│  class ScreenReaderAnnouncer {                                              │
│    private liveRegion: HTMLElement;                                         │
│                                                                              │
│    announce(message: string, priority: 'polite' | 'assertive' = 'polite') { │
│      this.liveRegion.setAttribute('aria-live', priority);                   │
│      this.liveRegion.textContent = message;                                 │
│                                                                              │
│      // Clear after announcement                                            │
│      setTimeout(() => {                                                     │
│        this.liveRegion.textContent = '';                                    │
│      }, 1000);                                                               │
│    }                                                                         │
│  }                                                                           │
│  ```                                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
````

---

# 9. Animation & Motion

## 9.1 Animation Principles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ANIMATION PRINCIPLES                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  CORE PRINCIPLES                                                             │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  1. PURPOSEFUL                                                               │
│     Every animation should serve a purpose:                                  │
│     • Provide feedback (button click, hover)                                │
│     • Show relationships (parent-child, cause-effect)                       │
│     • Guide attention (new content, important updates)                      │
│     • Smooth transitions (page changes, panel slides)                       │
│                                                                              │
│  2. SUBTLE                                                                   │
│     Animations should enhance, not distract:                                 │
│     • Keep durations short (100-300ms for UI elements)                      │
│     • Use subtle easing curves                                              │
│     • Avoid excessive motion                                                │
│                                                                              │
│  3. PERFORMANT                                                               │
│     Animations should not impact performance:                                │
│     • Use transform and opacity only (GPU-accelerated)                      │
│     • Avoid animating layout properties (width, height, margin)             │
│     • Use will-change sparingly                                             │
│                                                                              │
│  4. ACCESSIBLE                                                               │
│     Respect user preferences:                                                │
│     • Honor prefers-reduced-motion                                          │
│     • Provide alternatives for motion-sensitive users                       │
│     • Ensure content is accessible without animations                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 9.2 Timing & Easing

```scss
// Duration tokens
$duration-instant: 0ms;
$duration-fast: 100ms; // Micro-interactions (hover, focus)
$duration-normal: 200ms; // Standard transitions
$duration-slow: 300ms; // Panel slides, modals
$duration-slower: 500ms; // Page transitions
$duration-slowest: 1000ms; // Complex sequences

// Easing curves
$ease-linear: linear;
$ease-in: cubic-bezier(0.4, 0, 1, 1);
$ease-out: cubic-bezier(0, 0, 0.2, 1); // DEFAULT for exits
$ease-in-out: cubic-bezier(0.4, 0, 0.2, 1); // DEFAULT for most
$ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
$ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);

// Common transitions
$transition-colors:
  color,
  background-color,
  border-color $duration-fast $ease-in-out;
$transition-opacity: opacity $duration-normal $ease-in-out;
$transition-transform: transform $duration-normal $ease-out;
$transition-shadow: box-shadow $duration-fast $ease-in-out;
$transition-all: all $duration-normal $ease-in-out;

// Reduced motion
@mixin reduced-motion {
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
    transition: none !important;
  }
}
```

## 9.3 Animation Catalog

````
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ANIMATION CATALOG                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  MICRO-INTERACTIONS                                                          │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Button Hover/Press:                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │    Idle      │ →  │    Hover     │ →  │   Pressed    │                  │
│  │              │    │ scale: 1.02  │    │ scale: 0.98  │                  │
│  │              │    │ bg: lighter  │    │ bg: darker   │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│  Duration: 100ms                                                             │
│                                                                              │
│  Icon Button Hover:                                                          │
│  ┌────┐    ┌────┐                                                          │
│  │ ⚙️ │ →  │ ⚙️ │  Rotate 90° on hover                                     │
│  └────┘    └────┘  Duration: 200ms                                          │
│                                                                              │
│  Toggle Switch:                                                              │
│  ┌──────────────┐    ┌──────────────┐                                      │
│  │ ●○○○         │ →  │         ○○○● │                                      │
│  │    OFF       │    │    ON        │                                      │
│  └──────────────┘    └──────────────┘                                      │
│  Knob slides with spring easing, background color fades                     │
│  Duration: 200ms                                                             │
│                                                                              │
│  COMPONENT TRANSITIONS                                                       │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Modal Enter:                                                                │
│  ```css                                                                      │
│  @keyframes modal-enter {                                                    │
│    from {                                                                    │
│      opacity: 0;                                                            │
│      transform: scale(0.95) translateY(10px);                               │
│    }                                                                         │
│    to {                                                                      │
│      opacity: 1;                                                            │
│      transform: scale(1) translateY(0);                                     │
│    }                                                                         │
│  }                                                                           │
│  .modal-enter { animation: modal-enter 200ms ease-out; }                    │
│  ```                                                                         │
│                                                                              │
│  Modal Exit:                                                                 │
│  ```css                                                                      │
│  @keyframes modal-exit {                                                     │
│    from {                                                                    │
│      opacity: 1;                                                            │
│      transform: scale(1);                                                   │
│    }                                                                         │
│    to {                                                                      │
│      opacity: 0;                                                            │
│      transform: scale(0.95);                                                │
│    }                                                                         │
│  }                                                                           │
│  .modal-exit { animation: modal-exit 150ms ease-in; }                       │
│  ```                                                                         │
│                                                                              │
│  Slide Panel (Left/Right):                                                   │
│  ```css                                                                      │
│  @keyframes slide-in-right {                                                 │
│    from { transform: translateX(100%); }                                    │
│    to { transform: translateX(0); }                                         │
│  }                                                                           │
│  .panel-enter { animation: slide-in-right 300ms ease-out; }                 │
│  ```                                                                         │
│                                                                              │
│  Dropdown Menu:                                                              │
│  ```css                                                                      │
│  @keyframes dropdown-enter {                                                 │
│    from {                                                                    │
│      opacity: 0;                                                            │
│      transform: translateY(-8px);                                           │
│    }                                                                         │
│    to {                                                                      │
│      opacity: 1;                                                            │
│      transform: translateY(0);                                              │
│    }                                                                         │
│  }                                                                           │
│  .dropdown-enter { animation: dropdown-enter 150ms ease-out; }              │
│  ```                                                                         │
│                                                                              │
│  AGENT-SPECIFIC ANIMATIONS                                                   │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Agent Active Pulse:                                                         │
│  ```css                                                                      │
│  @keyframes pulse {                                                          │
│    0%, 100% { opacity: 1; }                                                 │
│    50% { opacity: 0.5; }                                                    │
│  }                                                                           │
│  .agent-active { animation: pulse 2s ease-in-out infinite; }                │
│  ```                                                                         │
│                                                                              │
│  Agent Working Indicator:                                                    │
│  ```css                                                                      │
│  @keyframes typing-dots {                                                    │
│    0%, 20% { opacity: 0; }                                                  │
│    40% { opacity: 1; }                                                      │
│    100% { opacity: 0; }                                                     │
│  }                                                                           │
│  .dot:nth-child(1) { animation: typing-dots 1.4s infinite 0s; }             │
│  .dot:nth-child(2) { animation: typing-dots 1.4s infinite 0.2s; }           │
│  .dot:nth-child(3) { animation: typing-dots 1.4s infinite 0.4s; }           │
│  ```                                                                         │
│                                                                              │
│  Code Streaming Effect:                                                      │
│  ```css                                                                      │
│  @keyframes code-appear {                                                    │
│    from {                                                                    │
│      opacity: 0;                                                            │
│      background-color: rgba(139, 92, 246, 0.3); /* accent */                │
│    }                                                                         │
│    to {                                                                      │
│      opacity: 1;                                                            │
│      background-color: transparent;                                         │
│    }                                                                         │
│  }                                                                           │
│  .code-new { animation: code-appear 500ms ease-out; }                       │
│  ```                                                                         │
│                                                                              │
│  Progress Bar Fill:                                                          │
│  ```css                                                                      │
│  .progress-bar {                                                             │
│    transition: width 500ms ease-out;                                        │
│  }                                                                           │
│  ```                                                                         │
│                                                                              │
│  LOADING STATES                                                              │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  Skeleton Loading:                                                           │
│  ```css                                                                      │
│  @keyframes shimmer {                                                        │
│    0% { background-position: -200% 0; }                                     │
│    100% { background-position: 200% 0; }                                    │
│  }                                                                           │
│  .skeleton {                                                                 │
│    background: linear-gradient(                                             │
│      90deg,                                                                 │
│      #27272a 0%,                                                            │
│      #3f3f46 50%,                                                           │
│      #27272a 100%                                                           │
│    );                                                                        │
│    background-size: 200% 100%;                                              │
│    animation: shimmer 1.5s infinite;                                        │
│  }                                                                           │
│  ```                                                                         │
│                                                                              │
│  Spinner:                                                                    │
│  ```css                                                                      │
│  @keyframes spin {                                                           │
│    from { transform: rotate(0deg); }                                        │
│    to { transform: rotate(360deg); }                                        │
│  }                                                                           │
│  .spinner { animation: spin 1s linear infinite; }                           │
│  ```                                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
````

## 9.4 Reduced Motion Support

```scss
// Global reduced motion styles
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

// Component-specific alternatives
.agent-active {
  animation: pulse 2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    // Use static indicator instead
    border: 2px solid $success;
  }
}

.code-streaming {
  animation: code-appear 500ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    // Just show the content immediately
    opacity: 1;
    background-color: transparent;
  }
}
```

---

# 10. Design Tokens & Implementation

## 10.1 Complete Token Reference

```typescript
// design-tokens.ts

export const tokens = {
  // ==========================================================================
  // COLORS
  // ==========================================================================
  colors: {
    // Background
    bg: {
      base: '#09090b',
      surface: '#18181b',
      elevated: '#27272a',
      overlay: '#3f3f46',
    },

    // Foreground / Text
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa',
      muted: '#71717a',
      disabled: '#52525b',
    },

    // Border
    border: {
      default: '#27272a',
      muted: '#3f3f46',
      focus: '#a1a1aa',
    },

    // Primary / Interactive
    primary: {
      default: '#fafafa',
      hover: '#e4e4e7',
      active: '#d4d4d8',
    },

    // Accent / Brand
    accent: {
      default: '#8b5cf6',
      hover: '#7c3aed',
      light: 'rgba(139, 92, 246, 0.1)',
    },

    // Semantic
    success: {
      default: '#22c55e',
      light: 'rgba(34, 197, 94, 0.1)',
    },
    warning: {
      default: '#f59e0b',
      light: 'rgba(245, 158, 11, 0.1)',
    },
    error: {
      default: '#ef4444',
      light: 'rgba(239, 68, 68, 0.1)',
    },
    info: {
      default: '#3b82f6',
      light: 'rgba(59, 130, 246, 0.1)',
    },

    // Agent Colors
    agent: {
      pm: '#8b5cf6',
      frontend: '#3b82f6',
      backend: '#22c55e',
      database: '#f59e0b',
      security: '#ef4444',
      testing: '#06b6d4',
      devops: '#ec4899',
      ml: '#a855f7',
    },
  },

  // ==========================================================================
  // TYPOGRAPHY
  // ==========================================================================
  typography: {
    fontFamily: {
      sans: "'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'Geist Mono', 'JetBrains Mono', 'Fira Code', monospace",
    },
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
    },
  },

  // ==========================================================================
  // SPACING
  // ==========================================================================
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem', // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem', // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    10: '2.5rem', // 40px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
  },

  // ==========================================================================
  // BORDERS
  // ==========================================================================
  borderRadius: {
    none: '0',
    sm: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    full: '9999px',
  },

  borderWidth: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
  },

  // ==========================================================================
  // SHADOWS
  // ==========================================================================
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
  },

  // ==========================================================================
  // ANIMATION
  // ==========================================================================
  animation: {
    duration: {
      instant: '0ms',
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // ==========================================================================
  // Z-INDEX
  // ==========================================================================
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    popover: 50,
    toast: 60,
    tooltip: 70,
    command: 80,
  },

  // ==========================================================================
  // BREAKPOINTS
  // ==========================================================================
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};
```

## 10.2 CSS Variables Export

```css
/* variables.css */

:root {
  /* Colors - Background */
  --color-bg-base: #09090b;
  --color-bg-surface: #18181b;
  --color-bg-elevated: #27272a;
  --color-bg-overlay: #3f3f46;

  /* Colors - Text */
  --color-text-primary: #fafafa;
  --color-text-secondary: #a1a1aa;
  --color-text-muted: #71717a;
  --color-text-disabled: #52525b;

  /* Colors - Border */
  --color-border-default: #27272a;
  --color-border-muted: #3f3f46;
  --color-border-focus: #a1a1aa;

  /* Colors - Primary */
  --color-primary: #fafafa;
  --color-primary-hover: #e4e4e7;

  /* Colors - Accent */
  --color-accent: #8b5cf6;
  --color-accent-hover: #7c3aed;
  --color-accent-light: rgba(139, 92, 246, 0.1);

  /* Colors - Semantic */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Colors - Agents */
  --color-agent-pm: #8b5cf6;
  --color-agent-frontend: #3b82f6;
  --color-agent-backend: #22c55e;
  --color-agent-database: #f59e0b;
  --color-agent-security: #ef4444;
  --color-agent-testing: #06b6d4;
  --color-agent-devops: #ec4899;
  --color-agent-ml: #a855f7;

  /* Typography */
  --font-sans:
    'Geist Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'Geist Mono', 'JetBrains Mono', monospace;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);

  /* Animation */
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* Z-Index */
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-overlay: 30;
  --z-modal: 40;
  --z-popover: 50;
  --z-toast: 60;
  --z-tooltip: 70;
  --z-command: 80;
}
```

## 10.3 Tailwind CSS Configuration

```javascript
// tailwind.config.js

module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Background
        bg: {
          base: '#09090b',
          surface: '#18181b',
          elevated: '#27272a',
          overlay: '#3f3f46',
        },
        // Agent colors
        agent: {
          pm: '#8b5cf6',
          frontend: '#3b82f6',
          backend: '#22c55e',
          database: '#f59e0b',
          security: '#ef4444',
          testing: '#06b6d4',
          devops: '#ec4899',
          ml: '#a855f7',
        },
      },
      fontFamily: {
        sans: ['Geist Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'slide-in-bottom': 'slideInBottom 300ms ease-out',
        'fade-in': 'fadeIn 200ms ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        slideInRight: {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        slideInBottom: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
```

## 10.4 Component Implementation Examples

### Button Component

```tsx
// components/Button.tsx

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles
  `inline-flex items-center justify-center gap-2 
   font-medium text-sm leading-none
   rounded-md transition-all duration-150
   focus-visible:outline-none focus-visible:ring-2 
   focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base
   disabled:opacity-50 disabled:pointer-events-none`,
  {
    variants: {
      variant: {
        primary: `bg-white text-zinc-900 
                  hover:bg-zinc-200 
                  focus-visible:ring-white`,
        secondary: `bg-transparent text-white 
                    border border-zinc-700 
                    hover:bg-zinc-800 
                    focus-visible:ring-zinc-400`,
        ghost: `bg-transparent text-zinc-400 
                hover:bg-zinc-800 hover:text-white 
                focus-visible:ring-zinc-400`,
        destructive: `bg-red-500 text-white 
                      hover:bg-red-600 
                      focus-visible:ring-red-500`,
        success: `bg-green-500 text-white 
                  hover:bg-green-600 
                  focus-visible:ring-green-500`,
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-5 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
```

### Agent Avatar Component

```tsx
// components/AgentAvatar.tsx

import React from 'react';
import { cn } from '@/lib/utils';

type AgentType =
  | 'pm'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'security'
  | 'testing'
  | 'devops'
  | 'ml';
type AgentStatus = 'active' | 'idle' | 'error';

interface AgentAvatarProps {
  agent: AgentType;
  status?: AgentStatus;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  className?: string;
}

const agentConfig: Record<
  AgentType,
  { emoji: string; label: string; color: string }
> = {
  pm: {
    emoji: '👔',
    label: 'Project Manager',
    color: 'bg-violet-500/10 text-violet-500',
  },
  frontend: {
    emoji: '🎨',
    label: 'Frontend Developer',
    color: 'bg-blue-500/10 text-blue-500',
  },
  backend: {
    emoji: '🔧',
    label: 'Backend Developer',
    color: 'bg-green-500/10 text-green-500',
  },
  database: {
    emoji: '🗄️',
    label: 'Database Engineer',
    color: 'bg-amber-500/10 text-amber-500',
  },
  security: {
    emoji: '🔒',
    label: 'Security Engineer',
    color: 'bg-red-500/10 text-red-500',
  },
  testing: {
    emoji: '🧪',
    label: 'Testing Engineer',
    color: 'bg-cyan-500/10 text-cyan-500',
  },
  devops: {
    emoji: '🚀',
    label: 'DevOps Engineer',
    color: 'bg-pink-500/10 text-pink-500',
  },
  ml: {
    emoji: '🤖',
    label: 'AI/ML Specialist',
    color: 'bg-purple-500/10 text-purple-500',
  },
};

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-base',
  lg: 'w-12 h-12 text-2xl',
};

const statusClasses = {
  active: 'bg-green-500 animate-pulse',
  idle: 'bg-zinc-500',
  error: 'bg-red-500',
};

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  agent,
  status = 'idle',
  size = 'md',
  showStatus = true,
  className,
}) => {
  const config = agentConfig[agent];

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg',
        config.color,
        sizeClasses[size],
        className,
      )}
      role="img"
      aria-label={`${config.label} - ${status}`}
    >
      <span aria-hidden="true">{config.emoji}</span>

      {showStatus && (
        <span
          className={cn(
            'absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full',
            'border-bg-surface border-2',
            statusClasses[status],
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
```

### Message Bubble Component

```tsx
// components/MessageBubble.tsx

import React from 'react';
import { cn } from '@/lib/utils';
import { AgentAvatar } from './AgentAvatar';
import { CodeBlock } from './CodeBlock';

type AgentType =
  | 'pm'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'security'
  | 'testing'
  | 'devops'
  | 'ml';

interface MessageBubbleProps {
  type: 'user' | 'agent' | 'system';
  agent?: AgentType;
  content: string;
  timestamp: string;
  codeBlocks?: Array<{ language: string; code: string }>;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  type,
  agent,
  content,
  timestamp,
  codeBlocks,
}) => {
  if (type === 'system') {
    return (
      <div className="flex items-center justify-center gap-3 py-2">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-xs text-zinc-500">{content}</span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>
    );
  }

  const isUser = type === 'user';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {!isUser && agent && (
        <AgentAvatar
          agent={agent}
          status="active"
          size="md"
          showStatus={false}
        />
      )}

      <div
        className={cn('flex max-w-[80%] flex-col gap-1', isUser && 'items-end')}
      >
        <div
          className={cn(
            'rounded-lg px-4 py-2',
            isUser
              ? 'bg-violet-500/20 text-white'
              : 'bg-zinc-800 text-zinc-100',
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{content}</p>

          {codeBlocks?.map((block, index) => (
            <CodeBlock
              key={index}
              language={block.language}
              code={block.code}
              className="mt-3"
            />
          ))}
        </div>

        <span className="text-xs text-zinc-500">
          {isUser ? 'You' : agent?.toUpperCase()} • {timestamp}
        </span>
      </div>
    </div>
  );
};
```

---

# 11. Appendix

## 11.1 Icon Library

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ICON LIBRARY                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  RECOMMENDED: Lucide Icons (https://lucide.dev)                             │
│                                                                              │
│  NAVIGATION                          ACTIONS                                 │
│  ─────────────────────               ─────────────────────                  │
│  Home            🏠                  Add               ➕                   │
│  Folder          📁                  Edit              ✏️                   │
│  Settings        ⚙️                  Delete            🗑️                   │
│  Search          🔍                  Save              💾                   │
│  Menu            ☰                   Copy              📋                   │
│  Back            ←                   Refresh           🔄                   │
│  Forward         →                   Download          ⬇️                   │
│  Close           ✕                   Upload            ⬆️                   │
│                                                                              │
│  STATUS                              AGENTS (Custom/Emoji)                   │
│  ─────────────────────               ─────────────────────                  │
│  Check           ✓                   PM                👔                   │
│  Warning         ⚠️                  Frontend          🎨                   │
│  Error           ❌                  Backend           🔧                   │
│  Info            ℹ️                  Database          🗄️                   │
│  Loading         ⏳                  Security          🔒                   │
│  Active          ●                   Testing           🧪                   │
│  Idle            ○                   DevOps            🚀                   │
│                                      AI/ML             🤖                   │
│                                                                              │
│  CODE EDITOR                         COMMUNICATION                           │
│  ─────────────────────               ─────────────────────                  │
│  File            📄                  Message           💬                   │
│  Code            </>                 Send              ➤                    │
│  Terminal        >_                  Notification      🔔                   │
│  Git Branch      ⑂                   Mention           @                    │
│  Git Commit      ⊙                   Attachment        📎                   │
│  Play            ▶️                  Thread            ⤵️                   │
│  Pause           ⏸️                                                         │
│  Stop            ⏹️                                                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 11.2 Asset Specifications

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ASSET SPECIFICATIONS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LOGO                                                                        │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Primary Logo:       SVG, PNG (transparent)                                  │
│  Sizes:              32x32, 64x64, 128x128, 256x256, 512x512               │
│  Variants:           Full color, Monochrome white, Monochrome dark         │
│  Favicon:            16x16, 32x32, ICO format                              │
│  Apple Touch Icon:   180x180                                                │
│                                                                              │
│  AGENT AVATARS                                                               │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Format:             SVG (preferred), PNG with transparency                 │
│  Sizes:              24x24, 32x32, 48x48, 64x64                            │
│  Style:              Flat design, consistent with agent colors             │
│  Variants:           Default, Active (with glow), Error (with indicator)   │
│                                                                              │
│  ILLUSTRATIONS                                                               │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Style:              Minimal, line-based, uses brand colors                 │
│  Use cases:          Onboarding, empty states, error pages                  │
│  Format:             SVG                                                     │
│  Max dimensions:     400x400 for inline, 800x600 for full-page             │
│                                                                              │
│  SCREENSHOTS (for docs/marketing)                                            │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Resolution:         2x (retina), 1920x1080 base                           │
│  Format:             PNG, WebP                                              │
│  Compression:        Optimized for web                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 11.3 Design File Organization

```
design/
├── figma/
│   ├── DevTeamAI-DesignSystem.fig      # Master design system
│   ├── DevTeamAI-Components.fig        # Component library
│   ├── DevTeamAI-Pages.fig             # Page designs
│   └── DevTeamAI-Prototypes.fig        # Interactive prototypes
│
├── tokens/
│   ├── design-tokens.json              # Design tokens (JSON)
│   ├── design-tokens.ts                # TypeScript export
│   └── variables.css                   # CSS custom properties
│
├── icons/
│   ├── lucide/                         # Lucide icon subset
│   ├── agents/                         # Custom agent icons
│   └── logo/                           # Logo variations
│
├── assets/
│   ├── illustrations/                  # Empty states, onboarding
│   ├── screenshots/                    # Product screenshots
│   └── social/                         # Social media assets
│
├── fonts/
│   ├── GeistSans/                      # Primary font
│   └── GeistMono/                      # Monospace font
│
└── docs/
    ├── design-documentation.md         # This document
    ├── component-specs.md              # Detailed component specs
    └── accessibility-checklist.md      # A11y requirements
```

## 11.4 Design Handoff Checklist

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DESIGN HANDOFF CHECKLIST                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  FOR EACH COMPONENT                                                          │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ☐ All states documented (default, hover, active, focus, disabled)         │
│  ☐ Responsive behavior specified                                            │
│  ☐ Accessibility requirements noted                                         │
│  ☐ Animation/transition details provided                                    │
│  ☐ Edge cases covered (empty, loading, error)                              │
│  ☐ Copy/text content finalized                                             │
│                                                                              │
│  FOR EACH PAGE/FEATURE                                                       │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ☐ Desktop design complete                                                  │
│  ☐ Tablet design complete                                                   │
│  ☐ Mobile design complete                                                   │
│  ☐ User flow documented                                                     │
│  ☐ Error states designed                                                    │
│  ☐ Loading states designed                                                  │
│  ☐ Empty states designed                                                    │
│  ☐ Success states designed                                                  │
│                                                                              │
│  OVERALL                                                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ☐ Design tokens exported                                                   │
│  ☐ Icons exported (SVG)                                                     │
│  ☐ Assets optimized                                                         │
│  ☐ Figma components organized                                               │
│  ☐ Documentation up to date                                                 │
│  ☐ Prototype linked                                                         │
│  ☐ Developer questions addressed                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 11.5 Version History

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            VERSION HISTORY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Version 1.0.0 - Initial Release                                            │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Date: 2024                                                                  │
│  Author: DevTeam AI Design Team                                             │
│                                                                              │
│  Includes:                                                                   │
│  • Complete design system foundation                                        │
│  • All core component specifications                                        │
│  • Page layouts and wireframes                                              │
│  • User flow documentation                                                  │
│  • Accessibility guidelines                                                 │
│  • Animation specifications                                                 │
│  • Design token exports                                                     │
│  • Implementation examples                                                  │
│                                                                              │
│  Future Updates Planned:                                                     │
│  • v1.1: Additional component patterns                                      │
│  • v1.2: Enhanced mobile designs                                            │
│  • v1.3: Enterprise/team features                                           │
│  • v2.0: Design system refresh                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# End of Design Documentation

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DEVTEAM AI DESIGN QUICK REFERENCE                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  COLORS (Dark Theme)                                                         │
│  Background:    #09090b (base) → #18181b (surface) → #27272a (elevated)    │
│  Text:          #fafafa (primary) → #a1a1aa (secondary) → #71717a (muted)  │
│  Accent:        #8b5cf6 (violet)                                            │
│                                                                              │
│  AGENT COLORS                                                                │
│  PM: #8b5cf6  FE: #3b82f6  BE: #22c55e  DB: #f59e0b                        │
│  SEC: #ef4444  QA: #06b6d4  OPS: #ec4899  ML: #a855f7                      │
│                                                                              │
│  TYPOGRAPHY                                                                  │
│  Sans: Geist Sans, Inter        Mono: Geist Mono, JetBrains Mono           │
│  Sizes: xs(12) sm(14) base(16) lg(18) xl(20) 2xl(24) 3xl(30)              │
│                                                                              │
│  SPACING (4px base)                                                          │
│  1(4px) 2(8px) 3(12px) 4(16px) 6(24px) 8(32px) 12(48px) 16(64px)          │
│                                                                              │
│  RADIUS                                                                      │
│  sm(4px) md(6px) lg(8px) xl(12px) 2xl(16px) full(9999px)                   │
│                                                                              │
│  ANIMATION                                                                   │
│  Duration: fast(100ms) normal(200ms) slow(300ms)                            │
│  Easing: ease-out for exits, ease-in-out for most transitions              │
```
