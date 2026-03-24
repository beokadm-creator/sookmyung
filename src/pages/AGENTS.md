# PAGE COMPONENTS

## OVERVIEW
React components for application routes. Each page = one component file.

## STRUCTURE
```
pages/
├── Main.tsx           # Home page (hero, events)
├── Home.tsx           # Orphaned/unused (3 lines)
├── Application.tsx    # Registration form
├── Confirmation.tsx   # Email verification + login
├── MyPage.tsx         # User dashboard
├── Admin.tsx          # Admin panel
├── Policy.tsx         # Terms/privacy
├── Checkout.tsx       # Toss payment widget
├── Success.tsx        # Payment success callback
├── Timeline.tsx       # Timeline page
├── Gallery.tsx        # Gallery page
└── Events.tsx         # Events page
```

## WHERE TO LOOK
| Page | Purpose | Key Features |
|------|---------|--------------|
| Main | Landing page | Hero section, event cards |
| Home | **UNUSED** | Empty component (3 lines) |
| Application | User registration | Email, password, profile form |
| Confirmation | Email verify + login | Auth flow |
| MyPage | User dashboard | Profile edit, payment history |
| Admin | Admin panel | User management, payment records |
| Policy | Legal pages | Terms, privacy policy |
| Checkout | Payment | Toss Payments widget |
| Success | Payment callback | Order confirmation |
| Timeline | Timeline display | Chronological events |
| Gallery | Image gallery | Photo display |
| Events | Events listing | Event information |

## CONVENTIONS

### Page Structure
```tsx
export default function PageName() {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Page content */}
    </Layout>
  );
}
```

### Common Patterns
- All pages use `Layout` wrapper (Header + Footer)
- Use `useNavigate()` for navigation
- Handle auth state with `onAuthStateChanged` or `signInWithEmailAndPassword`
- Firestore operations wrapped in try/catch
- Loading states for async operations

### Route Setup
Add to `App.tsx`:
```tsx
<Route path="/new-page" element={<NewPage />} />
```

## UNIQUE STYLES

### Authentication Pages
- **Application**: Registration with email verification
- **Confirmation**: Login + email verification status
- Redirect `/login` to `/confirmation` (in App.tsx)

### Payment Flow
1. **Checkout**: Toss widget initialization
2. **Success**: Callback with paymentKey, orderId
3. Verify payment via Firebase Function
4. Update Firestore `payments` collection

### Admin Page
- Protected: Check `user.role === 'admin'`
- User management table
- Payment history
- System settings (payment amount, notices)

## NOTES

### Key Dependencies
```tsx
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import type { User, Payment } from '../types';
```

### Firebase Operations
```tsx
// Auth
await signInWithEmailAndPassword(auth, email, password);
await createUserWithEmailAndPassword(auth, email, password);
await sendEmailVerification(auth.currentUser);

// Firestore
const docRef = doc(db, 'collection', id);
await updateDoc(docRef, { field: value });
const querySnapshot = await getDocs(query(collection(db, 'collection')));
```

### Toss Payments Integration
- Import: `import { loadPaymentWidget } from '@tosspayments/payment-widget-sdk'`
- Client key from environment variable
- Customer key: `user_${userId}`
- Success/fail URLs configured in widget

### Page-Specific Notes
- **Main**: Hero section with 120th anniversary branding, TODO: add video file
- **Home**: Orphaned component, not routed in App.tsx - can be deleted
- **Application**: Multi-step form (email, password, profile)
- **MyPage**: Show payment history from `payments` collection
- **Admin**: Admin code verification before access
- **Checkout**: Amount from `config` collection
- **Success**: Verify payment via Firebase Function before showing success
- **Timeline, Gallery, Events**: New pages for 120th anniversary content
