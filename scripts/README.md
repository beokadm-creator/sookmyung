# 데이터베이스 초기화 가이드

## 🎯 두 가지 방법으로 초기화 가능

### 방법 1: 초기화 스크립트 사용 (가장 쉬움) ✅

**1단계: Firebase Service Account Key 확인**

프로젝트 폴더에 `service-account-key.json` 파일이 있는지 확인하세요.

**2단계: 필수 패키지 설치**

```bash
npm install firebase-admin
```

**3단계: 초기화 스크립트 실행**

```bash
node scripts/init-db.js
```

완료되면 다음과 같이 출력됩니다:
```
🚀 데이터베이스 초기화 시작...
📝 Timeline 데이터 생성 중...
✅ Timeline 데이터 생성 완료 (10개 항목)
📸 Gallery 데이터 생성 중...
✅ Gallery 데이터 생성 완료 (9개 항목)
🎉 Events 데이터 생성 중...
✅ Events 데이터 생성 완료 (6개 항목)
⚙️  Site Config 데이터 생성 중...
✅ Site Config 데이터 생성 완료
🎉 데이터베이스 초기화 완료!
```

---

### 방법 2: Firebase Console에서 수동 설정

**1단계: Firestore Security Rules 설정**

1. [Firebase Console - Firestore Rules](https://console.firebase.google.com/project/sookmyung-97032/firestore/rules) 접속
2. 다음 내용을 복사하여 붙여넣고 "게시" 클릭:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow delete: if request.auth != null && (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    match /payments/{paymentId} {
      allow read: if request.auth != null && (resource.data.user_id == request.auth.uid || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null && request.resource.data.user_id == request.auth.uid;
      allow update: if false;
      allow delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    match /config/{configId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    match /settings/{settingsId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    match /notices/{noticeId} {
      allow read: if true;
      allow create: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow update: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    match /withdrawal_requests/{requestId} {
      allow read: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow delete: if false;
    }

    match /timeline/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /gallery/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /events/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
  }
}
```

**2단계: 초기 데이터 수동 추가**

1. [Firebase Console - Firestore Database](https://console.firebase.google.com/project/sookmyung-97032/firestore/data) 접속
2. "컬렉션 시작" 클릭
3. `timeline`, `gallery`, `events`, `config` 컬렉션 생성

---

## 🔑 Service Account Key가 없는 경우

1. [Firebase Console - Settings](https://console.firebase.google.com/project/sookmyung-97032/settings/serviceaccounts/adminsdk) 접속
2. "새 비공개 키 생성" 클릭
3. JSON으로 다운로드
4. 프로젝트 루트에 `service-account-key.json`으로 저장

---

## ✅ 완료 후 확인

1. 웹사이트 접속: https://sookmyung-97032.web.app
2. Timeline, Gallery, Events 페이지 확인
3. 관리자 페이지에서 데이터 관리 가능

---

## 📞 문제 발생 시

**에러: "Missing permissions"**
→ Firestore Security Rules가 설정되지 않음. 위 1단계 수행

**에러: "Service account key not found"**
→ service-account-key.json 파일이 프로젝트 루트에 있는지 확인

**에러: "Collection does not exist"**
→ Firestore Database가 생성되지 않음. Firebase Console에서 Firestore 생성

---

## 🎉 추천 순서

1. ✅ Firestore Security Rules 설정 (방법 2-1단계)
2. ✅ 초기화 스크립트 실행 (방법 1)
3. ✅ 웹사이트에서 데이터 확인
