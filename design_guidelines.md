# Design Guidelines: AI-Powered Product Categorization PWA

## Design Approach

**Selected Approach**: Design System (Linear-inspired + Material Design patterns)

**Justification**: This is a utility-focused productivity tool for data processing with information-dense interfaces. The design prioritizes efficiency, clarity, and professional aesthetics over visual flair. Linear's clean aesthetic combined with Material Design's robust interaction patterns provides the perfect foundation.

**Key Design Principles**:
- Clarity over decoration
- Immediate visual feedback for all actions
- Progressive disclosure (wizard flow)
- Data hierarchy through typography and spacing
- Professional, trustworthy aesthetic

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary)**:
- Background: `222 15% 10%` (deep charcoal)
- Surface: `222 15% 14%` (elevated panels)
- Surface Elevated: `222 15% 18%` (cards, modals)
- Border: `222 10% 25%` (subtle dividers)
- Text Primary: `0 0% 98%`
- Text Secondary: `0 0% 70%`
- Text Muted: `0 0% 50%`

**Brand & Accent Colors**:
- Primary: `262 80% 60%` (vibrant purple - for CTAs, active states)
- Primary Hover: `262 80% 55%`
- Success: `142 76% 45%` (high-confidence indicators)
- Warning: `38 92% 50%` (low-confidence highlights)
- Error: `0 84% 60%` (validation errors)
- Info: `217 91% 60%` (processing states)

**Light Mode**:
- Background: `0 0% 100%`
- Surface: `0 0% 98%`
- Surface Elevated: `0 0% 100%` with shadow
- Border: `0 0% 90%`
- Text Primary: `0 0% 10%`
- Text Secondary: `0 0% 40%`
- Text Muted: `0 0% 60%`

### B. Typography

**Font Stack**: Inter (via Google Fonts CDN) with system fallbacks

**Hierarchy**:
- H1 (Page Titles): 2.5rem, font-semibold, tracking-tight
- H2 (Section Headers): 1.875rem, font-semibold
- H3 (Step Titles): 1.5rem, font-medium
- H4 (Card Titles): 1.125rem, font-medium
- Body Large: 1.125rem, font-normal (instructions)
- Body: 1rem, font-normal (default)
- Body Small: 0.875rem, font-normal (metadata, labels)
- Caption: 0.75rem, font-medium, uppercase, tracking-wide (status badges)

### C. Layout System

**Spacing Primitives**: Use Tailwind units of `2, 4, 6, 8, 12, 16, 24`

**Container Strategy**:
- App container: `max-w-7xl mx-auto px-6`
- Wizard steps: `max-w-4xl mx-auto`
- Data tables: Full width with horizontal scroll if needed

**Grid System**:
- Column mapping: 2-column grid (source → target)
- File upload: Single centered layout
- Results table: Full-width responsive table

---

## Component Library

### 1. Navigation & Header

**Structure**: Fixed header with app title, API key status indicator, and settings access
- Height: `h-16`
- Background: Surface color with bottom border
- Logo/Title: Left-aligned, font-semibold
- API Key indicator: Right-aligned pill showing "Connected" (success) or "Configure" (warning)

### 2. File Upload Zone

**Design**: Large dashed border area with centered icon and text
- Idle state: Dashed border (border-2, border-dashed), rounded-lg, p-12
- Hover state: Border color shifts to primary, background subtle highlight
- Active (dragover): Border solid, background primary with 10% opacity
- Icon: Large upload cloud icon (96px) centered
- Text: "Drag and drop your file here" (body large) + "or click to browse" (text-muted)
- Accepted formats: Display as small badges below

### 3. Wizard Progress Indicator

**Design**: Horizontal stepper at top of wizard container
- Steps: Upload → Map Columns → Taxonomy → Configure → Process → Export
- Active step: Primary color, font-semibold
- Completed steps: Success color with checkmark icon
- Future steps: Muted color
- Connector lines: Between steps, muted when inactive, primary when complete

### 4. Column Mapping Interface

**Layout**: Two-column grid with arrow connectors
- Left column: "Your Columns" (detected from file)
- Right column: "Required Fields" (id, name, brand, description, images)
- Mapping: Dropdown selects for each required field
- Visual connector: Right-pointing arrow icon between matched pairs
- Validation: Real-time highlighting of unmapped required fields

### 5. Data Table (Results)

**Structure**: Professional data grid with fixed header
- Header: Sticky top, surface-elevated background, font-medium, text-sm
- Rows: Alternating subtle background (every other row 2% lighter)
- Low-confidence rows: Warning color background at 15% opacity, yellow left border (4px)
- Cell padding: px-4 py-3
- Status column: Badge component with icon + text
- Confidence score: Progress bar visualization (mini horizontal bar)

### 6. Processing Progress

**Design**: Modal overlay with centered progress card
- Backdrop: Dark overlay (bg-black/60) with backdrop-blur
- Card: Surface-elevated, rounded-lg, p-8, shadow-2xl
- Progress bar: Linear bar showing chunk progress (h-2, rounded-full)
- Status text: "Processing chunk 3 of 12" (body), "Categorizing products..." (text-muted)
- Cancel button: Secondary/ghost style, bottom of card

### 7. Confidence Threshold Control

**Design**: Slider with value display
- Range slider: 0.0 to 1.0, step 0.05
- Current value: Large display above slider (1.5rem, font-semibold)
- Visual guide: Gradient background on track (red → yellow → green)
- Labels: "Low" (left), "High" (right) in text-muted

### 8. Buttons

**Variants**:
- Primary: Solid primary color, white text, rounded-md, px-6 py-3, shadow-sm
- Secondary: Surface-elevated background, text primary, border
- Ghost: Transparent, text secondary, hover background subtle
- Danger: Error color for destructive actions

**States**: Hover (brightness-110), active (brightness-95), disabled (opacity-50, cursor-not-allowed)

### 9. Empty States

**Design**: Centered content with illustration placeholder
- Icon: 128px, muted color
- Title: H3, "No products yet"
- Description: Body, text-muted, max-w-md
- Action button: Primary CTA

### 10. Status Badges

**Design**: Rounded pills with icon + text
- High confidence: Success background (10% opacity), success text, checkmark icon
- Low confidence: Warning background (10% opacity), warning text, alert icon
- Processing: Info background, info text, spinner icon
- Error: Error background, error text, X icon
- Padding: px-3 py-1, text-sm, font-medium

---

## Animations

**Minimal Approach** - Use only for feedback:
- File upload: Fade-in on drop, scale pulse on hover
- Progress bar: Smooth width transition (transition-all duration-300)
- Modals: Fade + scale-95 to scale-100 entrance
- Table row highlight: Background color transition on confidence threshold change
- No page transitions, no decorative animations

---

## Responsive Behavior

- Mobile (<768px): Stack wizard steps vertically, single-column layouts, hide secondary text
- Tablet (768-1024px): 2-column grids where appropriate, compact padding
- Desktop (>1024px): Full multi-column layouts, generous spacing

---

## Images

No images required for this utility application. All visual communication achieved through typography, icons (Heroicons via CDN), and color.