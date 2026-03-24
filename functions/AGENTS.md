# FIREBASE CLOUD FUNCTIONS

## OVERVIEW
Firebase Functions (TypeScript) for backend logic: admin creation, payment verification.

## STRUCTURE
```
functions/
├── src/
│   ├── index.ts       # Main functions entry point
│   └── setAdmin.ts    # Admin creation endpoint
├── lib/               # Compiled JavaScript (auto-generated, DO NOT EDIT)
├── package.json       # Functions dependencies (Node 20)
└── tsconfig.json      # Functions TypeScript config (CommonJS)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add HTTP function | `src/index.ts` | Export `functions.https.onCall()` or `onRequest()` |
| Admin creation | `src/setAdmin.ts` | Callable function with hardcoded admin code |
| Dependencies | `package.json` | Functions has its own dependencies |
| Build output | `lib/` | Compiled JS, DO NOT edit |

## CONVENTIONS

### Function Structure
```typescript
import * as functions from 'firebase-functions';

export const functionName = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  // Function logic
  return { result: 'success' };
});
```

### Callable vs HTTP
- **Callable**: `onCall()` - Client calls via `httpsCallable()`, auto-auth
- **HTTP**: `onRequest()` - Express-style, manual auth

### Deployment
```bash
# Deploy all functions
firebase deploy --only functions

# Deploy single function
firebase deploy --only functions:functionName
```

## UNIQUE STYLES

### Admin Creation
- Function: `setAdmin` in `setAdmin.ts`
- Admin code: `SOOKMYUNG2024` (**hardcoded, should be env var**)
- Updates Firestore `users` collection role field
- Callable: `httpsCallable(functions, 'setAdmin')`

### Payment Verification
- Verifies Toss Payments transaction
- Updates `payments` collection
- Returns payment data
- Callable from frontend

### Node 20 Runtime
- Functions run on Node 20
- Specified in `package.json` engines field

### Region Configuration
- Default: `us-central1` (should be `asia-northeast1` for Korea)
- Set in function export: `functions.region('asia-northeast1').onCall(...)`

### No Testing Infrastructure
- **No test framework configured**
- **No test files**
- Manual testing via Firebase emulators only

## NOTES

### Initialization
```typescript
import * as functions from 'firebase-functions';
import { initializeApp } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const app = initializeApp();
const db = getFirestore(app);
```

### Error Handling
```typescript
throw new functions.https.HttpsError(
  'permission-denied',
  'User must be an admin'
);
```

Error codes: `invalid-argument`, `failed-precondition`, `unauthenticated`, `permission-denied`, `not-found`

### Environment Variables
Set in Firebase console or `.env`:
```bash
ADMIN_CODE=SOOKMYUNG2024
TOSS_SECRET_KEY=your_secret_key
```

**Current issue**: Admin code hardcoded in `setAdmin.ts`

### Dependencies
```bash
cd functions
npm install firebase-admin firebase-functions
```

### Testing locally
```bash
firebase functions:shell
firebase emulators:start --only functions
```

### Common Patterns

**Admin Check:**
```typescript
const userDoc = await db.collection('users').doc(context.auth.uid).get();
if (userDoc.data()?.role !== 'admin') {
  throw new functions.https.HttpsError('permission-denied', 'Admin only');
}
```

**Data Validation:**
```typescript
if (!data.email || !data.adminCode) {
  throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
}
```

**Transaction:**
```typescript
await db.runTransaction(async (t) => {
  // Atomic operations
});
```

### Build Process
- TypeScript compiles to `lib/` before deployment
- Predeploy hook runs `npm run build` automatically
- `lib/` directory is auto-generated, never edit manually
