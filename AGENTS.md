# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-06
**Commit:** N/A
**Branch:** N/A
**Last Updated:** 2026-02-06

## PROJECT METADATA
- **Total Files:** 91 (excluding node_modules, build artifacts)
- **Lines of Code:** ~9,900 TypeScript/JavaScript
- **Max Depth:** 4 directories
- **Large Files:** 4 files >500 lines (complexity hotspots)
- **Highest Complexity:** src/pages (17 files), src/components/ui (6 files)

## OVERVIEW
Sookmyung Women's University 120th Anniversary Alumni Association web platform. React + TypeScript frontend with Firebase backend (Auth, Firestore, Functions, Hosting) and Toss Payments integration.

## STRUCTURE
```
sookmyung/
├── src/                    # React frontend source
│   ├── pages/             # Route page components (13 pages)
│   ├── components/        # Reusable UI components (ui/, layout/)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── types.ts           # All TypeScript interfaces (248 lines)
│   ├── firebase.ts        # Firebase initialization
│   └── App.tsx            # Router setup
├── functions/             # Firebase Cloud Functions (TypeScript, CommonJS)
├── public/                # Static assets
└── .trae/                 # Project documentation
```

## COMMANDS

```bash
# Development
npm run dev              # Start Vite dev server (localhost:5173)

# Build & Type Check
npm run check            # Type check only (tsc -b --noEmit)
npm run build           # TypeScript check + Vite build (tsc -b && vite build)

# Linting
npm run lint            # Run ESLint on all files

# Preview
npm run preview         # Preview production build locally

# NO TEST COMMANDS      # No test framework configured (see GOTCHAS)
```

### Firebase Deployment
```bash
firebase deploy --only functions         # Deploy all functions
firebase deploy --only hosting           # Deploy frontend
firebase deploy --only firestore:rules   # Deploy security rules
firebase deploy                          # Deploy all
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add/route page | `src/pages/*.tsx` + `App.tsx` | Create component, add route |
| Add UI component | `src/components/` | Reusable across pages |
| Add custom hook | `src/hooks/` | Prefix with `use` |
| Add utility | `src/lib/` | Pure functions, formatters |
| Add type | `src/types.ts` | **ALL** types centralized here |
| Add Firebase function | `functions/src/*.ts` | Callable functions |
| Update styles | `tailwind.config.js` | Brand colors, custom config |

## CONVENTIONS (Project-Specific)

### Firebase Import Rule
**CRITICAL:** Always import from `firebase.ts`, never from `firebase` directly.
```tsx
// CORRECT
import { auth, db, functions } from '../firebase';

// WRONG
import { getAuth } from 'firebase/auth';
```

### Type Centralization
**ALL** TypeScript interfaces in `src/types.ts` (248 lines). Never define types elsewhere unless component-specific props.

### Routing
- Routes defined in `App.tsx`
- `/login` redirects to `/confirmation` (not a separate page)
- Protected routes check auth state
- Admin role check for `/admin`

### Component Organization
- **components/**: Top-level shared (Layout, Header, Footer, SEO, SkipLink, Empty)
- **components/ui/**: Reusable UI components (Button, Card, Image, Modal, ShareButton)
- **components/layout/**: Layout primitives (Container, Section)

## ANTI-PATTERNS (THIS PROJECT)

### NEVER
- Import directly from `firebase` - use `firebase.ts` exports only
- Use `as any`, `@ts-ignore`, `@ts-expect-error` - fix type errors properly
- Create pages without adding route in `App.tsx`
- Edit files in `functions/lib/` - auto-generated, DO NOT EDIT
- Modify `types.ts` without updating Firestore collections
- Use class components - functional components only

### ALWAYS
- Use TypeScript interfaces from `types.ts`
- Define component props interfaces
- Handle loading/error states for async operations
- Use Tailwind classes for styling (not inline styles except dynamic values)
- Use `cn()` utility for conditional class merging
- Verify `context.auth` for protected Firebase Functions
- Run `npm run check` before committing

## GOTCHAS

| Issue | Description |
|-------|-------------|
| **No tests** | No test framework configured - manual testing only |
| **Strict mode disabled** | `strict: false` in tsconfig.json - weaker type safety |
| **Admin code hardcoded** | `SOOKMYUNG2024` visible in `functions/src/setAdmin.ts` |
| **Firebase config exposed** | API keys in `src/firebase.ts` (should be .env) |
| **Service account key in root** | `sookmyung-97032-firebase-adminsdk-*.json` (security risk) |
| **Orphaned `Home.tsx`** | Unused component - actual home is `Main.tsx` |
| **tsconfig includes "api"** | Directory doesn't exist |
| **Functions region** | Using `us-central1` instead of `asia-northeast1` for Korea |
| **Login route** | Redirects to `/confirmation`, not a separate login page |
| **Supabase** | Used only for initial settings migration, not ongoing operations |

## DATABASE COLLECTIONS

- **users** - User profiles, roles, payment status
- **payments** - Payment records with Toss metadata
- **config** - System settings (payment amount, admin code)
- **notices** - Admin announcements
- **withdrawal_requests** - Account deletion requests
- **settings/site_config** - Site-wide config (PG, terms)
- **timeline** - Timeline items
- **gallery** - Gallery items
- **events** - Event items

## KEY DEPENDENCIES

- `react@^18.3.1` + `react-dom@^18.3.1` - UI framework
- `react-router-dom@^7.13.0` - Client-side routing
- `firebase@^12.8.0` - Backend (Auth, Firestore, Functions)
- `@tosspayments/payment-widget-sdk@^0.12.1` - Payment processing
- `zustand@^5.0.3` - Global state management
- `lucide-react@^0.511.0` - Icon library
- `tailwindcss@^3.4.17` - Utility-first CSS
- `typescript@~5.8.3` - Type system (strict mode disabled)
- `vite@^6.3.5` - Build tool
- `eslint@^9.25.0` - Linting (flat config)

## CONFIGURATION FILES

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript config (strict: false, path aliases: `@/*`) |
| `vite.config.ts` | Vite build config (sourcemaps hidden, react-dev-locator) |
| `tailwind.config.js` | Tailwind with Sookmyung brand colors (blue, gray, hydrangea) |
| `eslint.config.js` | ESLint flat config (react-hooks, react-refresh plugins) |
| `firebase.json` | Firebase hosting config |
| `firestore.rules` | Firestore security rules |
| `firestore.indexes.json` | Firestore indexes |

## ENVIRONMENT VARIABLES

Create `.env` file (currently NOT used - config hardcoded in `firebase.ts`):
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_TOSS_CLIENT_KEY=
```

## HIERARCHY

See subdirectory AGENTS.md for details:
- `./src/AGENTS.md` - Frontend source structure
- `./src/components/AGENTS.md` - UI components
- `./src/pages/AGENTS.md` - Page components
- `./functions/AGENTS.md` - Cloud Functions
