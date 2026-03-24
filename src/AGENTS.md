# FRONTEND SOURCE

## OVERVIEW
React + TypeScript application for alumni registration, payment, and admin management.

## STRUCTURE
```
src/
├── pages/          # Route components (13 pages)
├── components/     # Reusable UI (ui/, layout/ subdirs)
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── types.ts        # TypeScript interfaces (248 lines)
├── firebase.ts     # Firebase initialization
├── main.tsx        # App entry point
└── App.tsx         # Router configuration
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add page route | `App.tsx` | Add `<Route>` element |
| Page logic | `pages/*.tsx` | One component per route |
| Shared UI | `components/*.tsx` | Layout, Header, Footer, SEO |
| UI components | `components/ui/*.tsx` | Button, Card, Modal, etc. |
| Layout components | `components/layout/*.tsx` | Container, Section |
| Global types | `types.ts` | All interfaces (centralized) |
| Firebase init | `firebase.ts` | App initialization |
| Theme logic | `hooks/useTheme.ts` | Dark/light mode |

## UNIQUE STYLES

### Route Organization
- `/` - Main page (hero, event info)
- `/application` - Registration form
- `/confirmation` - Email confirmation + login
- `/login` - Redirects to `/confirmation`
- `/mypage` - User dashboard
- `/admin` - Admin panel (role protected)
- `/policy` - Terms/privacy
- `/checkout` - Toss payment widget
- `/success` - Payment success callback
- `/timeline` - Timeline page
- `/gallery` - Gallery page
- `/events` - Events page

### Page Components
- Each page is a separate component in `pages/`
- Pages use shared Layout component (Header + Footer)
- Empty component for placeholder/null states
- SEO component for meta tags
- SkipLink component for accessibility

### Authentication Flow
- Registration → Email verification → Login
- Login redirects to `/confirmation`
- Protected routes check auth state
- Admin role check for `/admin`

### Component Organization
- **components/**: Top-level shared (Layout, Header, Footer, SEO, SkipLink, Empty)
- **components/ui/**: Reusable UI components (Button, Card, Image, Modal, ShareButton)
- **components/layout/**: Layout primitives (Container, Section)

### Type Centralization
- **All** TypeScript interfaces in `types.ts` (248 lines)
- User, Payment, Config, Notice, WithdrawalRequest, SiteConfig
- TimelineItem, GalleryItem, EventItem
- Firestore Timestamps for all date fields

## NOTES

### Key Files
- `App.tsx` - All route definitions (13 routes)
- `main.tsx` - React root, mounts to `#root`
- `types.ts` - **ALL** TypeScript interfaces (248 lines)
- `firebase.ts` - Firebase config (currently hardcoded, should use .env)

### Component Patterns
```tsx
// Typical page structure
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import type { User } from '../types';

export default function PageName() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Component logic
  return (
    <div className="container mx-auto">
      {/* Page content */}
    </div>
  );
}
```

### Import Aliases
- `@/*` maps to `src/*` (configured in vite.config.ts and tsconfig.json)
- Use: `import { User } from '@/types'` (if using alias) or `from './types'`

### Path Aliases
- Configured in both `vite.config.ts` and `tsconfig.json`
- Enabled via `vite-tsconfig-paths` plugin
- Use `@/` prefix for cleaner imports from src root

### Hooks
- `useTheme.ts` - Custom hook for theme management (dark/light mode)
- Only one custom hook currently

### Utility Functions
- `lib/utils.ts` - Utility functions (cn() for class merging)
- clsx + tailwind-merge for Tailwind class combinations
