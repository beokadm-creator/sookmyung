# UI COMPONENTS

## OVERVIEW
Reusable React components for layout and UI elements.

## STRUCTURE
```
components/
├── Layout.tsx      # Page wrapper (Header + Footer + content)
├── Header.tsx      # Navigation bar
├── Footer.tsx      # Site footer with business info
├── SEO.tsx         # SEO meta tags
├── SkipLink.tsx    # Accessibility skip link
├── Empty.tsx       # Placeholder/null state component
├── ui/             # UI component library
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Image.tsx
│   ├── Modal.tsx
│   └── ShareButton.tsx
└── layout/         # Layout components
    ├── Container.tsx
    └── Section.tsx
```

## WHERE TO LOOK
| Component | Purpose | Usage |
|-----------|---------|-------|
| Layout | Page wrapper | Wrap all pages |
| Header | Navigation | Logo, menu links, auth state |
| Footer | Site info | Business info for PG compliance |
| SEO | Meta tags | Document head management |
| SkipLink | Accessibility | Skip to main content |
| Empty | Empty state | No data, loading, error states |
| Button | UI element | Reusable button component |
| Card | UI element | Content container |
| Image | UI element | Optimized images |
| Modal | UI element | Dialog/overlay |
| ShareButton | UI element | Social sharing |
| Container | Layout | Centered container |
| Section | Layout | Section wrapper |

## CONVENTIONS

### Component Structure
```tsx
export default function ComponentName({ prop }: PropType) {
  return (
    <div className="tailwind-classes">
      {/* Content */}
    </div>
  );
}
```

### Styling
- Tailwind CSS utility classes
- Responsive design (mobile-first)
- Consistent spacing, colors from Tailwind config
- Lucide React icons
- Sookmyung brand colors (blue, gold)

### Props
- Define TypeScript interfaces
- Destructure in function signature
- Default values where appropriate

## UNIQUE STYLES

### Layout Component
- Wraps all page content
- Includes Header at top
- Includes Footer at bottom
- Main content area in between
```tsx
<Layout>
  {/* Page content */}
</Layout>
```

### Header
- Logo on left
- Navigation links on right
- Shows auth state (login/logout buttons)
- Sticky or fixed positioning
- Responsive hamburger menu on mobile

### Footer
- Business name (Sookmyung 120th Anniversary Alumni Association)
- Business registration number (required for PG)
- Representative name
- Address
- Contact information
- **Required for Toss Payments compliance**

### SEO Component
- Meta tags for search engines
- Open Graph tags for social sharing
- Canonical URLs
- Structured data

### SkipLink Component
- Accessibility feature
- "Skip to main content" link
- Visible on keyboard focus
- Required for WCAG compliance

### UI Component Library (ui/)
- Reusable design system components
- Consistent styling across app
- Tailwind-based with custom variants
- TypeScript props with strict typing

### Layout Components (layout/)
- Container: Centered with max-width
- Section: Vertical spacing with padding
- Responsive breakpoints

## NOTES

### Import Pattern
```tsx
import { Link } from 'react-router-dom';
import { IconName } from 'lucide-react';
```

### Common Tailwind Classes
- Container: `container mx-auto px-4`
- Flex: `flex items-center justify-between`
- Grid: `grid grid-cols-1 md:grid-cols-3`
- Spacing: `space-y-4`, `gap-4`
- Colors: Sookmyung blue (`text-blue-600`, `bg-blue-600`)

### Color Scheme
- Primary: #1E3A8A (Sookmyung Blue)
- Secondary: #D4AF37 (Anniversary Gold)
- Neutral grays: #F8FAFC, #E2E8F0, #475569
- Configure in `tailwind.config.js`

### Icon Usage
```tsx
import { Home, User, LogOut } from 'lucide-react';
<Home className="w-5 h-5" />
```

### Responsive Patterns
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

<button className="px-4 py-2 md:px-6 md:py-3">
  {/* Button */}
</button>
```

### Component Organization
- **components/**: Top-level shared components (Layout, Header, Footer, SEO)
- **components/ui/**: Reusable UI components (Button, Card, Modal, etc.)
- **components/layout/**: Layout primitives (Container, Section)
