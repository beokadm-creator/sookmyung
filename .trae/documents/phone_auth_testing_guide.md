# Phone Authentication Testing Guide

## Manual Testing Checklist

### 1. Phone Number Formatting

| Input | Expected Output | Status |
|-------|----------------|--------|
| "" | "" | ☐ |
| "010" | "010" | ☐ |
| "0101234" | "010-1234" | ☐ |
| "01012345678" | "010-1234-5678" | ☐ |
| "010-1234-5678" | "010-1234-5678" | ☐ |
| "010 1234 5678" | "010-1234-5678" | ☐ |

### 2. Password Validation

| Input | Expected | Status |
|-------|----------|--------|
| "123456" | Valid | ☐ |
| "000000" | Valid | ☐ |
| "12345" | Invalid | ☐ |
| "1234567" | Invalid | ☐ |
| "12345a" | Invalid | ☐ |
| "abcdef" | Invalid | ☐ |
| "12345!" | Invalid | ☐ |

### 3. Phone Number Normalization

| Input | Expected | Status |
|-------|----------|--------|
| "12345678" | "01012345678" | ☐ |
| "01012345678" | "01012345678" | ☐ |
| "010-1234-5678" | "01012345678" | ☐ |

## Integration Testing

### A. Registration Flow

1. **Open Application Page**
   - [ ] Navigate to `/application`
   - [ ] Verify step 1 (auth) is displayed

2. **Enter Name**
   - [ ] Enter valid name (2+ characters)
   - [ ] Verify input accepts text

3. **Enter Phone Number**
   - [ ] Enter 8 digits after 010
   - [ ] Verify auto-formatting works

4. **reCAPTCHA Verification**
   - [ ] Complete reCAPTCHA challenge
   - [ ] Verify reCAPTCHA token is generated

5. **Send Verification Code**
   - [ ] Click "인증번호 발송" button
   - [ ] Verify loading state
   - [ ] Verify success message appears
   - [ ] Check AlimTalk is received

6. **Verify Code**
   - [ ] Enter 6-digit code from AlimTalk
   - [ ] Click "확인" button
   - [ ] Verify "인증이 완료되었습니다" message

7. **Set Password**
   - [ ] Enter 6-digit password
   - [ ] Verify password input is enabled

8. **Proceed to Info**
   - [ ] Click "다음" button
   - [ ] Verify step 2 (info) is displayed

9. **Complete Registration**
   - [ ] Fill optional fields
   - [ ] Check consent checkboxes
   - [ ] Click "결제하기"
   - [ ] Verify redirect to `/checkout`

### B. Login Flow

1. **Open Confirmation Page**
   - [ ] Navigate to `/confirmation`
   - [ ] Verify login form is displayed

2. **Enter Credentials**
   - [ ] Enter phone number (8 digits)
   - [ ] Enter 6-digit password

3. **reCAPTCHA Verification**
   - [ ] Complete reCAPTCHA challenge

4. **Submit Login**
   - [ ] Click "신청 확인" button
   - [ ] Verify loading state

5. **Redirect**
   - [ ] If payment pending: redirect to `/checkout`
   - [ ] If payment completed: redirect to `/mypage`

### C. Admin Login

1. **Open Admin Page**
   - [ ] Navigate to `/admin`
   - [ ] Verify login form is displayed

2. **Enter Admin Credentials**
   - [ ] Enter admin email
   - [ ] Enter admin password

3. **Submit Login**
   - [ ] Click login button
   - [ ] Verify admin dashboard loads

### D. AlimTalk Delivery

| Trigger | Expected Template | Status |
|---------|-------------------|--------|
| Verification Code | `verification` | ☐ |
| Registration Complete | `welcome` | ☐ |
| Event Reminder | `event` | ☐ |

## Test Cases

### TC-001: New User Registration
**Objective:** Verify new user can complete registration

**Steps:**
1. Navigate to `/application`
2. Enter name: "홍길동"
3. Enter phone: "12345678"
4. Complete reCAPTCHA
5. Click "인증번호 발송"
6. Enter received code
7. Click "확인"
8. Set password: "123456"
9. Click "다음"
10. Fill info form
11. Check consent boxes
12. Click "결제하기"

**Expected Result:**
- User redirected to checkout
- AlimTalk verification code received
- User record created in Firestore

### TC-002: Existing User Login
**Objective:** Verify existing user can login

**Prerequisites:** User from TC-001 exists

**Steps:**
1. Navigate to `/confirmation`
2. Enter phone: "12345678"
3. Enter password: "123456"
4. Complete reCAPTCHA
5. Click "신청 확인"

**Expected Result:**
- User redirected to `/mypage` (if paid) or `/checkout` (if unpaid)
- Session created in Firebase Auth

### TC-003: Invalid Login
**Objective:** Verify system rejects invalid credentials

**Steps:**
1. Navigate to `/confirmation`
2. Enter invalid phone or password
3. Complete reCAPTCHA
4. Click "신청 확인"

**Expected Result:**
- Error message displayed
- No redirect occurs

### TC-004: Rate Limiting
**Objective:** Verify rate limiting works

**Steps:**
1. Navigate to `/application`
2. Enter valid name and phone
3. Complete reCAPTCHA
4. Click "인증번호 발송" 4+ times quickly

**Expected Result:**
- Error message after 3rd request
- Message: "너무 자주 요청하셨습니다."

### TC-005: Verification Code Expiry
**Objective:** Verify expired codes are rejected

**Steps:**
1. Request verification code
2. Wait 5+ minutes
3. Enter code
4. Click "확인"

**Expected Result:**
- Error: "인증번호가 만료되었습니다."

### TC-006: AlimTalk Welcome Message
**Objective:** Verify welcome message is sent after registration

**Steps:**
1. Complete registration (TC-001)
2. Wait for AlimTalk

**Expected Result:**
- Welcome message received with template `welcome`

## Performance Testing

### Metric: Registration Time
- [ ] Measure time from first input to checkout redirect
- Target: < 60 seconds

### Metric: Login Time
- [ ] Measure time from login submit to dashboard load
- Target: < 5 seconds

### Metric: AlimTalk Delivery
- [ ] Measure time from request to receipt
- Target: < 30 seconds

## Security Testing

### reCAPTCHA Bypass
- [ ] Attempt automated registration without reCAPTCHA
- Expected: Request rejected

### SQL Injection
- [ ] Attempt special characters in inputs
- Expected: Inputs sanitized

### Rate Limit Bypass
- [ ] Attempt multiple requests from different IPs
- Expected: Rate limit enforced per phone number

## Bug Report Template

```
## Bug Description
[Clear description of the bug]

## Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [...]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots
[If applicable]

## Environment
- Browser: [Browser name]
- OS: [OS version]
- Date: [Date of bug]
```

## Test Data

### Valid Test Users
| Phone | Password | Status |
|-------|----------|--------|
| 01099990001 | 123456 | Available |
| 01099990002 | 123456 | Available |
| 01099990003 | 123456 | Available |

### Invalid Test Data
| Phone | Password | Expected Error |
|-------|----------|-----------------|
| 01112345678 | 123456 | Invalid format |
| 0101234 | 123456 | Too short |
| 010123456789 | 123456 | Too long |
| 01012345678 | 12345 | Wrong password |
| 01012345678 | abcdef | Invalid password |
