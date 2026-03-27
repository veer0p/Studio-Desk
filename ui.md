# Artisan UI Master Prompt: StudioDesk Design System

Use this prompt to generate or refactor UI components to match the high-performance, minimalist "Artisan" aesthetic established in the Booking Module.

---

## The Vision
Develop a mature, human-centric "Operations Dashboard" that feels like a high-end tool (Linear, Stripe, Raycast) rather than a generic SaaS template. Focus on structural clarity, precision geometry, and a monochromatic palette.

## Core Aesthetic Principles (The "De-AI" Rules)
1. **No "AI-Generated" Clutter:**
   - Eliminate all neon glows, high-saturation drop shadows, and radial background gradients.
   - Remove "dot-matrix" or technical mesh patterns.
   - Avoid generic "2026 SaaS" signatures like floaty glassmorphism or bouncy `rounded-full` pills for structural elements.

2. **Precision Geometry:**
   - Use `rounded-md` (8px) or `rounded-sm` (4px) for cards, buttons, and inputs.
   - Use razor-thin `1px` borders (`border-border/60`) to define containers.
   - Use flat, grounded shadows (`shadow-sm` or `shadow-xs`) or no shadow at all.

3. **Artisan Monochromatics:**
   - Base Palette: `background` (surface), `foreground` (text), `muted` (sub-elements).
   - Accents: Use high-contrast inversions (e.g., black button with white text in light mode, or white button with black text in dark mode).
   - Status: Mute all status washes. Instead of `bg-emerald-500`, use a 1px border and a small geometric node with the accent color.

4. **Typography & Data:**
   - Use `font-mono` with `tracking-wider` and `uppercase` for labels and quantitative data (prices, dates).
   - Keep baseline alignment perfect. Use `whitespace-nowrap` for critical metadata.
   - Hierarchy is established through size and contrast, never through "loud" colors.

## Component Specifics

### The "Mission Control" (Slide-Over/Sheets)
- **Width:** Large/Immersive (900px on desktop) to allow data to breathe.
- **Header:** Clean title with actions stacked below in a dedicated row, never floating over standard close buttons.
- **Timeline Nodes:** Geometric squares/rectangles. Active/Completed = Inverted colors (`bg-foreground text-background`).
- **Scrollbars:** Hide all native browser scrollbars in horizontal areas using `[&::-webkit-scrollbar]:hidden`.

### The "Lightning Node" (Modals/Dialogs)
- **Aesthetic:** Command-K / Spotlight style.
- **Input Design:** `shadow-inner` for depth, focus rings using `focus-visible:ring-foreground/50`.
- **Primary CTA:** Solid monochromatic blocks (`bg-foreground`). No "Create" buttons with blue-to-purple gradients.

## Example Tailwind Implementation Tokens
- **Borders:** `border border-border/60`
- **Backgrounds:** `bg-muted/10` (for secondary sections), `bg-card` (for main containers).
- **Text:** `text-[11px] uppercase tracking-widest font-bold text-muted-foreground` (for labels).
- **Icons:** Subdued opacity (`opacity-70`) or specific `text-muted-foreground` mapping.

---

**Constraint:** When generating code, prioritize [tsx](file:///home/veer/Documents/projects/Studio-Desk/frontend/studiodesk-web/app/layout.tsx) stability, standard Radix UI/shadcn patterns, and ensure pixel-perfect alignment in the CSS layout. No placeholder text or "lorem ipsum"—use realistic studio-context data.
