# 🔥 Firestore Security Rules 배포 가이드

## 가장 쉬운 방법: npm 스크립트 사용 ✅

### 1단계: Rules 배포

```bash
npm run deploy:rules
```

이 명령어 하나로 Firestore Security Rules이 자동으로 배포됩니다!

---

## 다른 배포 옵션들

### 전체 배포 (Functions + Firestore + Hosting)
```bash
npm run deploy:all
```

### Functions만 배포
```bash
npm run deploy:functions
```

### Hosting만 배포
```bash
npm run deploy:hosting
```

### Security Rules만 배포
```bash
npm run deploy:rules
```

---

## 📋 전체 설정 순서

### 1️⃣ 처음 설정하는 경우

```bash
# 1. Firestore Security Rules 배포
npm run deploy:rules

# 2. 초기 데이터 생성
npm run init-db

# 3. 완료! 웹사이트 접속
# https://sookmyung-97032.web.app
```

### 2️⃣ 코드 수정 후 재배포

```bash
# 1. Functions 코드 수정 후
npm run deploy:functions

# 2. 프론트엔드 코드 수정 후
npm run build
npm run deploy:hosting

# 3. 한 번에 모두 배포
npm run deploy:all
```

---

## 🔍 배포 확인

배포 후 Firebase Console에서 확인:
- [Firestore Rules](https://console.firebase.google.com/project/sookmyung-97032/firestore/rules)
- [Functions](https://console.firebase.google.com/project/sookmyung-97032/functions/list)
- [Hosting](https://console.firebase.google.com/project/sookmyung-97032/hosting)

---

## ⚠️ 주의사항

1. **Firestore Rules 배포는 관리자 권한이 필요합니다**
   - Firebase CLI 로그인이 되어 있어야 합니다
   - 로그인 안 되어 있으면: `firebase login`

2. **배포 후 1-2분 소요됩니다**
   - Rules가 적용되기까지 시간이 걸릴 수 있습니다
   - 배포 완료 후 조금 기다렸다가 새로고침 하세요

3. **초기 데이터는 한 번만 실행하세요**
   - `npm run init-db`는 데이터가 없을 때만 실행하세요
   - 이미 데이터가 있으면 건너뜁니다

---

## 🚀 빠른 참조 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run deploy:rules` | 🔥 Firestore Rules만 배포 |
| `npm run deploy:functions` | ⚙️ Firebase Functions만 배포 |
| `npm run deploy:hosting` | 🌐 Hosting만 배포 |
| `npm run deploy:all` | 📦 전체 배포 |
| `npm run init-db` | 💾 초기 데이터 생성 |
| `npm run build` | 🔨 프론트엔드 빌드 |
| `npm run dev` | 🛠️ 개발 서버 시작 |

---

## ✅ 현재 상태

- ✅ **Firebase Functions**: 배포 완료
- ✅ **Firebase Hosting**: 배포 완료
- ✅ **초기 데이터**: 생성 완료
- ⏳ **Firestore Rules**: 배포 필요

**지금 바로 실행하세요:**
```bash
npm run deploy:rules
```

완료되면 모든 기능이 정상 작동합니다! 🎉
