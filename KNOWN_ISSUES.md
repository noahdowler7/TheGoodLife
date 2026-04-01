# Known Issues

## Phase 6 - E2E Integration Testing

### UI Issue: Input Text Visibility During Typing
**Status:** Partial fix, needs refinement
**Priority:** Low
**Description:**
- When typing in input fields, text color is slightly hard to see while actively typing
- Text becomes properly visible after typing stops
- Likely related to browser autofill/autocomplete styling or focus states
- Current workaround: Explicit inline styles applied, but not 100% perfect

**Technical Details:**
- Component: `src/components/AuthScreen.jsx`
- CSS: `src/styles/index.css` (autofill styling)
- Browser: Chrome on macOS
- Inline styles added: `color: #000000`, `backgroundColor: #FFFFFF`, `WebkitTextFillColor: #000000`

**To Fix Later:**
- Investigate browser-specific CSS overrides
- Consider using CSS-in-JS library for more control
- Test across multiple browsers (Safari, Firefox, etc.)

---

### UI Issue: Movement Church Logo Display
**Status:** Needs refinement
**Priority:** Low (cosmetic)
**Description:**
- Movement Church logo colors don't display optimally on dark background
- Original implementation used CSS filters (invert, hue-rotate) that created overlay effect
- Filters removed, but logo still needs color/contrast adjustment for dark mode

**Technical Details:**
- Component: `src/components/MovementLogo.jsx`
- Image: `/public/images/movement-logo.png`
- Used in: Onboarding welcome screen
- Current: No filters applied, displays logo as-is

**To Fix Later:**
- Option 1: Create separate logo variant for dark mode (white text version)
- Option 2: Use SVG instead of PNG for better color control
- Option 3: Adjust logo image itself to work on dark backgrounds
- Consider theme-aware logo switching based on light/dark mode

---

**Last Updated:** 2026-04-01
