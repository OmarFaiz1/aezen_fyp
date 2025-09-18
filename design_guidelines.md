# AEZEN Admin Portal Design Guidelines

## Design Approach
**Selected Approach**: Design System - Material Design with enterprise customizations
**Justification**: This is a utility-focused, information-dense admin portal where efficiency and learnability are paramount. The application requires standard UI patterns for dashboards, forms, and data displays.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light Mode: Deep Blue (220 85% 25%) for primary actions and navigation
- Dark Mode: Bright Blue (220 80% 60%) for primary elements
- Background: Clean whites (0 0% 98%) in light mode, deep grays (220 15% 8%) in dark mode
- Surface: Light grays (220 10% 95%) and darker grays (220 12% 15%) respectively

**Supporting Colors:**
- Success: Green (142 70% 45%) for positive metrics and completed states
- Warning: Orange (35 85% 55%) for attention items and pending states  
- Error: Red (0 70% 50%) for alerts and critical issues
- Neutral: Gray scale from (220 5% 90%) to (220 15% 20%)

### B. Typography
**Font System**: Inter from Google Fonts
- Headers: Inter 600-700 weight, sizes from 24px-48px
- Body: Inter 400-500 weight, 14px-16px
- Captions: Inter 400 weight, 12px-14px
- Code/Data: JetBrains Mono for technical displays

### C. Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Consistent spacing: p-4, m-6, gap-8 for most layouts
- Component margins: mb-8, mt-12 for section separation
- Grid gaps: gap-6 for cards, gap-4 for form elements

### D. Component Library

**Navigation**: Fixed sidebar with collapsible sections, breadcrumbs for deep navigation
**Dashboard Widgets**: Card-based layout with subtle shadows, rounded corners (rounded-lg)
**Data Tables**: Stripe-row styling, sortable headers, pagination controls
**Forms**: Grouped fieldsets, inline validation, multi-step wizards for complex flows
**Modals**: Centered overlays with backdrop blur, slide-in animations
**Charts**: Recharts integration with consistent color mapping to brand palette

**Interactive Elements**:
- Primary buttons: Solid blue fills with white text
- Secondary buttons: Outline style with brand blue borders
- Icon buttons: Subtle gray backgrounds with hover states
- Toggle switches: Brand blue when active, gray when inactive

### E. Visual Hierarchy
**Dashboard Focus**: Key metrics prominently displayed in hero cards
**Sidebar Navigation**: Clear iconography with text labels, active state highlighting  
**Content Areas**: Generous whitespace, logical grouping with subtle dividers
**Data Priority**: Important metrics use larger typography and brand colors

## Specific Admin Portal Considerations

**Professional Aesthetics**: Clean, minimal design that conveys reliability and efficiency
**Information Density**: Strategic use of cards and sections to organize complex data without overwhelming
**Workflow Support**: Clear visual paths for common tasks like ticket management and bot building
**Status Communication**: Consistent color coding and badges for different states (active, pending, error)

## Animation Guidelines
**Minimal Approach**: Subtle hover states, smooth transitions for navigation
**Performance Focus**: Avoid heavy animations that could impact dashboard loading
**Functional Animation**: Loading states, success confirmations, and progressive disclosure

This design system prioritizes usability and professionalism while maintaining visual appeal appropriate for a B2B admin interface.