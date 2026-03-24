# Phase 1: Phone-Based Authentication Implementation

## Overview

This document describes the implementation of phone-based authentication for the Sookmyung Women's University 120th Anniversary Alumni Association web platform.

## Changes Made

### 1. TypeScript Types (`src/types.ts`)

Updated user model and authentication types:

```typescript
export interface User {
  id: string;
  email?: string; // Only for admin users
  phone: string;   // Primary identifier for users
  name: string;
  graduation_year?: string;
  department?: string;
  password?: string; // 6-digit numeric password (hashed)
  role: 'user' | 'admin';
  paymentStatus: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface LoginFormData {
  phone: string;
  password: string;
}

export interface RegisterFormData {
  phone: string;
  password: string;
  name: string;
  verificationCode: string;
  graduation_year?: string;
  department?: string;
}
```

### 2. Utility Functions (`src/lib/utils.ts`)

Added phone authentication utilities:

- `formatPhoneNumber(value)` - Formats phone number with hyphens
- `normalizePhoneNumber(phone)` - Ensures phone number starts with 010
- `validatePassword(password)` - Validates 6-digit password
- `validatePhoneNumber(phone)` - Validates Korean phone format
- `generateVerificationCode()` - Generates 6-digit verification code

### 3. Phone Input Component (`src/components/ui/PhoneInput.tsx`)

New reusable component for phone number input with reCAPTCHA support:

- Phone number input with 010 prefix
- reCAPTCHA integration for spam prevention
- Verification code input and verification
- Visual feedback for verification status

### 4. Login Page (`src/pages/Confirmation.tsx`)

Updated for phone-based login:

- Phone number input with 010 prefix
- 6-digit numeric password input
- reCAPTCHA integration
- Firebase Functions call to `loginWithPhone`
- Redirect to mypage or checkout based on payment status

### 5. Registration Page (`src/pages/Application.tsx`)

Completely redesigned for phone-based registration:

**Step 1 (Auth):**
- Name input
- Phone number input (010 + 8 digits)
- reCAPTCHA verification
- Send verification code via AlimTalk
- Enter and verify 6-digit code
- Set 6-digit password
- Proceed to info step

**Step 2 (Info):**
- Graduation year (optional)
- Department (optional)
- Consent checkboxes
- Submit to payment

### 6. Admin Page (`src/pages/Admin.tsx`)

Admin login remains email-based as required:

- Email/password authentication for admins
- Admin UID check: `DiMxXk9JZug3Ma2I2hK68ia0WZs1`
- Role-based access control maintained

### 7. Firebase Functions

#### Phone Authentication (`functions/src/phoneAuth.ts`)

Exported functions:
- `sendVerificationCode` - Sends verification code via AlimTalk
- `verifyCode` - Verifies the 6-digit code
- `registerWithPhone` - Registers new user with phone
- `loginWithPhone` - Authenticates user with phone + password

#### AlimTalk Integration (`functions/src/alimtalk.ts`)

Template methods:
- `sendVerificationCode` - Sends 6-digit verification code
- `sendWelcomeMessage` - Welcome message after registration
- `sendEventNotification` - Event reminder notifications
- `sendScheduleReminder` - Schedule reminder notifications
- `sendEventRegistration` - Event registration confirmation

## Environment Variables

### Frontend (.env)
```
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### Firebase Functions (firebase functions:config set)
```
recaptcha.secret_key=your_recaptcha_secret_key
aligo.apikey=your_aligo_api_key
aligo.userid=your_aligo_user_id
aligo.senderkey=your_sender_key
aligo.sender=01000000000
frontend.url=https://your-domain.web.app
```

## Database Schema

### Users Collection
```json
{
  "id": "user_id",
  "phone": "01012345678",
  "name": "홍길동",
  "password": "base64_encoded_6digit",
  "graduation_year": "2020",
  "department": "컴퓨터과학전공",
  "role": "user",
  "paymentStatus": false,
  "consent": {
    "privacy_policy": true,
    "third_party_provision": true,
    "marketing_consent": true
  },
  "created_at": Timestamp,
  "updated_at": Timestamp
}
```

## Authentication Flow

### Registration Flow
```
1. User enters name and phone number
2. User completes reCAPTCHA
3. User clicks "Send Verification Code"
4. System sends AlimTalk with 6-digit code
5. User enters verification code
6. System verifies code
7. User sets 6-digit password
8. User completes info form
9. User proceeds to payment
```

### Login Flow
```
1. User enters phone number and password
2. User completes reCAPTCHA
3. System validates credentials
4. System returns Firebase Custom Token
5. Frontend signs in with Custom Token
6. Redirect to mypage/checkout
```

## AlimTalk Templates

### 1. Verification Code (tpl_code: verification)
```
#{이름}님, 안녕하세요.
숙명여자대학교 120주년 기념 동문회 인증번호는 [#{인증번호}]입니다.
인증번호를 입력하여 회원가입을 완료해주세요.
```

### 2. Welcome Message (tpl_code: welcome)
```
#{이름}님, 숙명여자대학교 120주년 기념 동문회에 가입하신 것을 환영합니다!
120년의 역사와 함께 새로운 120년을 향해 나아갑니다.
```

### 3. Event Notification (tpl_code: event)
```
#{이름}님, 안녕하세요.
숙명여자대학교 120주년 기념행사 알림입니다.

📅 일시: #{일시}
📍 장소: #{장소}

#{행사명}
```

### 4. Schedule Reminder (tpl_code: schedule)
```
#{이름}님, 안녕하세요.
숙명여자대학교 120주년 기념 #{행사명} 일정 알림입니다.

일시: #{일시}
장소: #{장소}
```

## Security Features

1. **reCAPTCHA Integration**
   - Prevents automated registration
   - Required for code sending and login

2. **Rate Limiting**
   - Max 3 verification requests per minute
   - 5-minute verification code expiry
   - Max 3 verification attempts per code

3. **Password Requirements**
   - 6-digit numeric only
   - Stored as Base64 (simple hashing for demo)

4. **Phone Number Validation**
   - Must start with 010
   - Must be 11 digits total

## Testing Checklist

### Unit Tests
- [ ] Phone number formatting
- [ ] Password validation
- [ ] Phone number validation
- [ ] Verification code generation

### Integration Tests
- [ ] Phone number registration flow
- [ ] Verification code sending
- [ ] User login
- [ ] AlimTalk delivery

### Admin Tests
- [ ] Admin email login
- [ ] Admin dashboard access
- [ ] User management

## Deployment Steps

1. Set Firebase Functions config:
   ```bash
   firebase functions:config:set recaptcha.secret_key="your_secret" aligo.apikey="your_key" aligo.userid="your_user" aligo.senderkey="your_sender" frontend.url="your_url"
   ```

2. Deploy functions:
   ```bash
   cd functions && npm run build && firebase deploy --only functions
   ```

3. Update reCAPTCHA site key in `.env`

4. Deploy frontend:
   ```bash
   npm run build && firebase deploy --only hosting
   ```

## Rollback Plan

If issues arise, the email-based authentication can be restored by:
1. Reverting `src/pages/Confirmation.tsx`
2. Reverting `src/pages/Application.tsx`
3. Keeping the phone auth functions in Firebase Functions for future use

## Known Issues

1. Password stored as Base64 (not secure for production)
2. No SMS fallback for AlimTalk failures
3. Limited error messages for security

## Future Improvements (Phase 2)

1. Password hashing with bcrypt
2. SMS fallback with Twilio or similar
3. Better error handling
4. Session management
5. Password reset functionality
6. Two-factor authentication
