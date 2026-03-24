# 숙명여자대학교 120주년 - 백엔드 연동 요구사항

**작성일**: 2026-01-30
**버전**: 1.0
**상태**: 프론트엔드 완료, 백엔드 연동 필요

---

## 1. 개요

### 1.1 프로젝트 상태

**완성된 프론트엔드:**
- ✅ 메인 페이지 (Main.tsx) - D-Day 카운트다운, 하이라이트, 섹션 프리뷰
- ✅ 타임라인 페이지 (Timeline.tsx) - 120년 역사, 10개 이정표
- ✅ 갤러리 페이지 (Gallery.tsx) - 사진/영상, 필터, 라이트박스
- ✅ 이벤트 페이지 (Events.tsx) - 행사 캘린더, 월별 필터
- ✅ 참가 신청 (Application.tsx) - 기존 기능 유지
- ✅ 마이페이지 (MyPage.tsx) - 사용자 대시보드
- ✅ 관리자 페이지 (Admin.tsx) - 기존 탭 유지

**백엔드 연동이 필요한 새로운 기능:**
1. 타임라인 데이터 동기화 (Timeline)
2. 갤러리 아이템 관리 (Gallery)
3. 행사 데이터 관리 (Events)
4. 공지사항 관리 (Notices)
5. 사이트 설정 관리 (Site Config)

---

## 2. 데이터 모델 (Firestore Collections)

### 2.1 기존 Collections

```typescript
// users - 사용자 정보 (기존)
{
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: 'user' | 'admin';
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// payments - 결제 정보 (기존)
{
  orderId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'failed';
  paymentKey: string;
  createdAt: Timestamp;
}

// config - 시스템 설정 (기존)
{
  paymentAmount: number;
  adminCode: string;
  // 새로운 설정이 추가될 수 있음
}
```

### 2.2 새로 필요한 Collections

#### 2.2.1 timeline (타임라인)

```typescript
// Collection: timeline
{
  id: string;                    // 문서 ID
  year: number;                 // 예: 1906, 1938, 1948...
  title: string;                // 예: "대한제국 황실이 세운 최초의 민족 여성 사학"
  shortDesc: string;            // 1-2줄 요약
  details: string;              // 상세 설명 (클릭 시 표시)
  period?: string;              // 예: "1906년", "1938-1948"
  category?: string;            // 예: "founding", "education", "expansion"
  imageUrl?: string;            // 선택적: 역사적 사진 URL
  displayOrder: number;          // 정렬 순서
  active: boolean;              // 표시 여부
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**초기 데이터 (10개 이정표):**
```javascript
[
  { year: 1906, title: "대한제국 황실이 세운 최초의 민족 여성 사학", shortDesc: "순헌황귀비의 선각으로 한국 여성 교육의 새로운 장이 열렸습니다.", details: "숙명여자대학교의 설립은 대한제국 시기 여성 교육의 획기적인 시작이었습니다.", period: "1906년", category: "founding", displayOrder: 1, active: true },
  { year: 1938, title: "전문학교 설립", shortDesc: "숙명여자전문학교로 승격되며 전문 교육 기관으로 발돋움했습니다.", details: "일제강점기 속에서도 민족 교육의 맥을 이어갔습니다.", period: "1938년", category: "education", displayOrder: 2, active: true },
  { year: 1948, title: "대학승격, 피난지에 임시 교사 설치", shortDesc: "대학 승격과 함께 한국전쟁의 어려움 속에서도 교육을 이어갔습니다.", details: "부산 피난 시절에도 임시 교사를 마련하여 학생들을 가르쳤습니다.", period: "1948년", category: "expansion", displayOrder: 3, active: true },
  { year: 1955, title: "종합대학교 시대의 개막", shortDesc: "숙명여자대학교가 종합대학으로 승격하며 새로운 도약을 시작했습니다.", details: "인문, 사회, 자연, 예체능 등 다양한 학과가 설치되었습니다.", period: "1955년", category: "expansion", displayOrder: 4, active: true },
  { year: 1981, title: "새로운 전진을 위한 준비", shortDesc: "대학 시설 확충과 교육 과정 개선을 통해 질적 성장을 이루었습니다.", details: "도서관, 실험실 등 교육 환경이 대폭 개선되었습니다.", period: "1981년", category: "development", displayOrder: 5, active: true },
  { year: 1995, title: "숙명 제2창학", shortDesc: "대학 개혁을 통해 새로운 도약을 위한 기반을 마련했습니다.", details: "교육 시스템 혁신과 캠퍼스 현대화가 이루어졌습니다.", period: "1995년", category: "reform", displayOrder: 6, active: true },
  { year: 2006, title: "숙명 창학 100주년", shortDesc: "100년의 역사를 자랑하며 새로운 100년을 향한 비전을 제시했습니다.", details: "100주년 기념식과 다양한 학술 문화 행사가 열렸습니다.", period: "2006년", category: "milestone", displayOrder: 7, active: true },
  { year: 2015, title: "사회수요에 맞춘 교육개혁", shortDesc: "사회 변화에 부응하는 혁신적인 교육 과정을 도입했습니다.", details: "융합 교육, 창의적 인재 양성에 집중했습니다.", period: "2015년", category: "reform", displayOrder: 8, active: true },
  { year: 2023, title: "혁신적인 학제 개편", shortDesc: "미래 사회에 필요한 인재 양성을 위한 학제 개편을 단행했습니다.", details: "AI, 데이터 등 첨단 분야 교육이 강화되었습니다.", period: "2023년", category: "reform", displayOrder: 9, active: true },
  { year: 2026, title: "숙명 창학 120주년", shortDesc: "120년의 역사와 전통을 자랑하며 새로운 120년을 향해 나아갑니다.", details: "2026년 5월 22일 숙명창학기념일을 맞아 대규모 기념행사가 열립니다.", period: "2026년", category: "milestone", displayOrder: 10, active: true }
]
```

#### 2.2.2 gallery (갤러리)

```typescript
// Collection: gallery
{
  id: string;                    // 문서 ID
  type: 'photo' | 'video';      // 미디어 타입
  title: string;                // 제목
  description: string;          // 설명
  thumbnailUrl: string;         // 썸네일 URL
  mediaUrl: string;             // 실제 미디어 URL (고해상도 이미지 또는 비디오)
  videoId?: string;             // YouTube ID (비디오인 경우)
  displayOrder: number;          // 정렬 순서
  active: boolean;              // 표시 여부
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**초기 데이터 (9개 아이템):**
```javascript
// 사진 (6개)
[
  { type: 'photo', title: '초기 캠퍼스 모습', description: '1906년 숙명여자대학교의 초기 캠퍼스 모습', displayOrder: 1, active: true },
  { type: 'photo', title: '100주년 기념식', description: '2006년 숙명 창학 100주년 기념식', displayOrder: 2, active: true },
  { type: 'photo', title: '졸업식 사진', description: '1960년대 졸업식 모습', displayOrder: 3, active: true },
  { type: 'photo', title: '도서관', description: '중앙도서관 건립 기념사진', displayOrder: 4, active: true },
  { type: 'photo', title: '동문회 모임', description: '동문들의 축하 모임', displayOrder: 5, active: true },
  { type: 'photo', title: '캠퍼스 봄 풍경', description: '봄의 숙명 캠퍼스', displayOrder: 6, active: true }
]

// 비디오 (3개)
[
  { type: 'video', title: '120주년 비전 선포 영상', description: '120주년 기념 비전 선포식 영상', videoId: 'SALwRCKxZEc', displayOrder: 7, active: true },
  { type: 'video', title: '숙명 120년 역사 다큐멘터리', description: '120년의 역사를 담은 다큐멘터리', displayOrder: 8, active: true },
  { type: 'video', title: '동문 축하 메시지', description: '동문들의 축하 메시지 영상', displayOrder: 9, active: true }
]
```

#### 2.2.3 events (행사)

```typescript
// Collection: events
{
  id: string;                    // 문서 ID
  title: string;                // 행사명
  date: string;                 // ISO 날짜 (YYYY-MM-DD)
  month: string;                // 월 표시 (예: "5월")
  time: string;                 // 시간 (예: "10:00 - 12:00")
  location: string;             // 장소
  description: string;          // 설명
  capacity?: number;            // 정원 (선택)
  registered?: number;          // 현재 신청자 수 (선택)
  displayOrder: number;          // 정렬 순서
  active: boolean;              // 표시 여부
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**초기 데이터 (6개 행사):**
```javascript
[
  {
    title: "120주년 기념식",
    date: "2026-05-10",
    month: "5월",
    time: "10:00 - 12:00",
    location: "숙명여자대학교 대강당",
    description: "120년의 역사를 축하하는 기념식입니다. 총장님의 축사, 동문 대표 축하 메시지, 기념 공연 등 다채로운 프로그램이 준비되어 있습니다.",
    capacity: 1000,
    registered: 456,
    displayOrder: 1,
    active: true
  },
  {
    title: "동문 네트워킹",
    date: "2026-05-11",
    month: "5월",
    time: "14:00 - 17:00",
    location: "학생회관 다목적실",
    description: "전공별, 졸업년도별 동문들과 소통하며 네트워크를 확장하는 시간입니다. 산하동문 후원금 전달식, 네트워킹 세션 등이 진행됩니다.",
    capacity: 300,
    registered: 178,
    displayOrder: 2,
    active: true
  },
  {
    title: "문화 행사",
    date: "2026-05-12",
    month: "5월",
    time: "10:00 - 18:00",
    location: "캠퍼스 전체",
    description: "공연, 전시, 체험 프로그램 등 다양한 문화 행사가 진행됩니다. 동문 예술가들의 초청 공연, 학생 동아리 공연, 특별 전시회 등을 만나보세요.",
    capacity: 500,
    registered: 234,
    displayOrder: 3,
    active: true
  },
  {
    title: "120주년 기념 학술 심포지엄",
    date: "2026-03-15",
    month: "3월",
    time: "14:00 - 17:00",
    location: "국제교육관",
    description: "여성 교육의 역사와 미래를 주제로 학술 심포지엄을 개최합니다. 저명한 교수님들과 동문 학자들이 참여합니다.",
    capacity: 200,
    registered: 89,
    displayOrder: 4,
    active: true
  },
  {
    title: "동문 러닝 페스티벌",
    date: "2026-04-20",
    month: "4월",
    time: "09:00 - 12:00",
    location: "캠퍼스 운동장",
    description: "건강한 체력으로 동문들과 함께 달리는 러닝 페스티벌입니다. 5km, 10km 코스가 마련되어 있으며, 참가자 모두에게 기념품이 제공됩니다.",
    capacity: 400,
    registered: 156,
    displayOrder: 5,
    active: true
  },
  {
    title: "동문 채용 박람회",
    date: "2026-06-10",
    month: "6월",
    time: "13:00 - 17:00",
    location: "체육관",
    description: "동문들이 근무하는 기업/기관의 채용 정보를 나누는 박람회입니다. 취업 준비생 동문들에게 좋은 기회가 될 것입니다.",
    capacity: 500,
    registered: 203,
    displayOrder: 6,
    active: true
  }
]
```

#### 2.2.4 notices (공지사항)

```typescript
// Collection: notices
{
  id: string;                    // 문서 ID
  title: string;                // 공지 제목
  content: string;              // 공지 내용 (마크다운 또는 HTML)
  category: 'announcement' | 'update' | 'emergency';  // 카테고리
  priority: number;             // 우선순위 (높을수록 상단)
  active: boolean;              // 표시 여부
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 2.2.5 site_config (사이트 설정)

```typescript
// Collection: site_config (단일 문서, ID: "default")
{
  id: "default";
  
  // 타이틀 & 설명
  siteTitle: string;            // "숙명여자대학교 120주년 기념 동문회"
  siteDescription: string;      // 메타 설명
  siteKeywords: string[];       // SEO 키워드
  
  // D-Day 설정
  targetDate: string;           // "2026-05-22T00:00:00"
  
  // 연락처 정보
  contactEmail: string;
  contactPhone: string;
  
  // 소셜 미디어
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  blogUrl?: string;
  
  // 기타 설정
  showGallery: boolean;         // 갤러리 표시 여부
  showEvents: boolean;          // 행사 표시 여부
  showTimeline: boolean;        // 타임라인 표시 여부
  
  updatedAt: Timestamp;
}
```

---

## 3. 관리자 페이지 기능 확장 (Admin.tsx)

### 3.1 기존 탭 유지

**현재 Admin.tsx에 있는 탭:**
- users (사용자 관리)
- payments (결제 관리)
- notices (공지사항) ⭐ 확장 필요
- withdrawals (탈퇴 요청)
- config (설정) ⭐ 확장 필요
- site_settings (사이트 설정) ⭐ 확장 필요

### 3.2 새로 추가할 탭

#### 3.2.1 Timeline (타임라인) 탭

**기능:**
- 목록 테이블 (연도, 제목, 카테고리, 활성화 상태, 표시 순서)
- 추가/편집 모달 (연도, 제목, 요약, 상세설명, 이미지 URL)
- 토글로 활성화/비활성화
- 순서 변경 (위/아래 버튼 또는 드래그 앤 드롭)
- 삭제 확인 다이얼로그

**필요한 필드:**
```tsx
interface TimelineItem {
  year: number;
  title: string;
  shortDesc: string;
  details: string;
  period?: string;
  category?: string;
  imageUrl?: string;
  displayOrder: number;
  active: boolean;
}
```

**UI 구조:**
```tsx
<Card variant="elevated">
  <Table>
    <thead>
      <tr>
        <th>연도</th>
        <th>제목</th>
        <th>카테고리</th>
        <th>활성화</th>
        <th>순서</th>
        <th>액션</th>
      </tr>
    </thead>
    <tbody>
      {timelines.map((item) => (
        <tr key={item.id}>
          <td>{item.year}</td>
          <td>{item.title}</td>
          <td>{item.category || '-'}</td>
          <td>
            <Switch checked={item.active} onChange={() => toggleActive(item.id)} />
          </td>
          <td>{item.displayOrder}</td>
          <td>
            <Button size="sm" onClick={() => editItem(item.id)}>편집</Button>
            <Button size="sm" variant="ghost" onClick={() => deleteItem(item.id)}>삭제</Button>
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
  <Button onClick={() => setModalOpen(true)}>추가</Button>
</Card>
```

#### 3.2.2 Gallery (갤러리) 탭

**기능:**
- 목록 테이블 (타입, 제목, 썸네일, 활성화 상태)
- 추가/편집 모달
- 필터 탭 (전체/사진/영상)
- 이미지/동영상 업로드 (Firebase Storage)
- 순서 변경
- 미리보기 (썸네일 클릭 시 라이트박스)

**필요한 필드:**
```tsx
interface GalleryItem {
  type: 'photo' | 'video';
  title: string;
  description: string;
  thumbnailUrl: string;
  mediaUrl: string;
  videoId?: string;  // YouTube ID
  displayOrder: number;
  active: boolean;
}
```

**업로드 처리:**
```typescript
// Firebase Storage 업로드 경로
// Photos: /gallery/photos/{timestamp}_{filename}
// Videos: /gallery/videos/{timestamp}_{filename}

const uploadToStorage = async (file: File, type: 'photo' | 'video') => {
  const storage = getStorage();
  const fileName = `${Date.now()}_${file.name}`;
  const storageRef = ref(storage, `gallery/${type}s/${fileName}`);
  
  await uploadBytes(storageRef, await file.arrayBuffer());
  const url = await getDownloadURL(storageRef);
  
  return url;
};
```

**UI 구조:**
```tsx
<Card variant="elevated">
  {/* 필터 탭 */}
  <div className="flex gap-2 mb-4">
    <Button variant={filter === 'all' ? 'primary' : 'ghost'} onClick={() => setFilter('all')}>전체</Button>
    <Button variant={filter === 'photo' ? 'primary' : 'ghost'} onClick={() => setFilter('photo')}>사진</Button>
    <Button variant={filter === 'video' ? 'primary' : 'ghost'} onClick={() => setFilter('video')}>영상</Button>
  </div>

  <Table>
    {/* 테이블 내용 */}
  </Table>

  <Button onClick={() => setUploadModalOpen(true)}>추가</Button>
</Card>
```

#### 3.2.3 Events (행사) 탭

**기능:**
- 목록 테이블 (날짜, 제목, 장소, 정원, 신청자 수, 활성화 상태)
- 추가/편집 모달
- 월별 필터
- 날짜별 정렬
- 신청자 수 수정 (실시 업데이트는 별도 기능)

**필요한 필드:**
```tsx
interface EventItem {
  title: string;
  date: string;        // YYYY-MM-DD
  month: string;       // "5월"
  time: string;
  location: string;
  description: string;
  capacity?: number;
  registered?: number;
  displayOrder: number;
  active: boolean;
}
```

**UI 구조:**
```tsx
<Card variant="elevated">
  {/* 월 필터 */}
  <div className="flex gap-2 mb-4">
    {['전체', '3월', '4월', '5월', '6월'].map((month) => (
      <Button 
        key={month} 
        variant={selectedMonth === month ? 'primary' : 'ghost'}
        onClick={() => setSelectedMonth(month)}
      >
        {month}
      </Button>
    ))}
  </div>

  <Table>
    {/* 테이블 내용 */}
  </Table>

  <Button onClick={() => setModalOpen(true)}>추가</Button>
</Card>
```

---

## 4. Firebase Functions (백엔드 API)

### 4.1 기존 Functions

```typescript
// functions/src/index.ts (기존)
- httpsCallable: checkEmailDuplicate
- httpsCallable: confirmPayment
```

### 4.2 새로 필요한 Functions

#### 4.2.1 Timeline CRUD

```typescript
// Timeline 관련
export const getTimelines = httpsCallable(async (data, context) => {
  // 모든 타임라인 항목 조회 (활성화된 것만)
  const snapshot = await getDocs(collection(db, 'timeline'));
  const timelines = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(item => item.active)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  
  return { timelines };
});

export const saveTimeline = httpsCallable(async (data, context) => {
  // 타임라인 추가/수정 (관리자만)
  const { id, year, title, shortDesc, details, ...rest } = data.data;
  
  if (id) {
    // 수정
    await updateDoc(doc(db, 'timeline', id), {
      year, title, shortDesc, details, ...rest,
      updatedAt: serverTimestamp()
    });
  } else {
    // 추가
    await addDoc(collection(db, 'timeline'), {
      year, title, shortDesc, details, ...rest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  
  return { success: true };
});

export const deleteTimeline = httpsCallable(async (data, context) => {
  // 타임라인 삭제 (관리자만)
  const { id } = data.data;
  await deleteDoc(doc(db, 'timeline', id));
  return { success: true };
});
```

#### 4.2.2 Gallery CRUD

```typescript
// Gallery 관련
export const getGalleryItems = httpsCallable(async (data, context) => {
  const { type } = data.data || {};  // 필터 옵션
  
  let q = query(collection(db, 'gallery'));
  if (type) {
    q = query(q, where('type', '==', type));
  }
  q = query(q, where('active', '==', true));
  q = query(q, orderBy('displayOrder', 'asc'));
  
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return { items };
});

export const saveGalleryItem = httpsCallable(async (data, context) => {
  const { id, type, title, description, mediaUrl, videoId, ...rest } = data.data;
  
  if (id) {
    await updateDoc(doc(db, 'gallery', id), {
      type, title, description, mediaUrl, videoId, ...rest,
      updatedAt: serverTimestamp()
    });
  } else {
    await addDoc(collection(db, 'gallery'), {
      type, title, description, mediaUrl, videoId, ...rest,
      displayOrder: 0,  // 기본값
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  
  return { success: true };
});

export const deleteGalleryItem = httpsCallable(async (data, context) => {
  const { id } = data.data;
  await deleteDoc(doc(db, 'gallery', id));
  return { success: true };
});
```

#### 4.2.3 Events CRUD

```typescript
// Events 관련
export const getEvents = httpsCallable(async (data, context) => {
  const { month } = data.data || {};
  
  let q = query(collection(db, 'events'));
  if (month && month !== '전체') {
    q = query(q, where('month', '==', month));
  }
  q = query(q, where('active', '==', true));
  q = query(q, orderBy('date', 'asc'));
  
  const snapshot = await getDocs(q);
  const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return { events };
});

export const saveEvent = httpsCallable(async (data, context) => {
  const { id, title, date, month, time, location, description, ...rest } = data.data;
  
  if (id) {
    await updateDoc(doc(db, 'events', id), {
      title, date, month, time, location, description, ...rest,
      updatedAt: serverTimestamp()
    });
  } else {
    await addDoc(collection(db, 'events'), {
      title, date, month, time, location, description, ...rest,
      displayOrder: 0,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
  
  return { success: true };
});

export const deleteEvent = httpsCallable(async (data, context) => {
  const { id } = data.data;
  await deleteDoc(doc(db, 'events', id));
  return { success: true };
});
```

#### 4.2.4 Site Config

```typescript
// Site Config 관련
export const getSiteConfig = httpsCallable(async (data, context) => {
  const docRef = doc(db, 'site_config', 'default');
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { config: docSnap.data() };
  }
  
  // 기본 설정 반환
  return {
    config: {
      siteTitle: '숙명여자대학교 120주년 기념 동문회',
      siteDescription: '숙명여자대학교 개교 120주년을 맞이하여 동문 여러분을 초대합니다.',
      targetDate: '2026-05-22T00:00:00',
      showGallery: true,
      showEvents: true,
      showTimeline: true
    }
  };
});

export const saveSiteConfig = httpsCallable(async (data, context) => {
  const config = data.data;
  
  await setDoc(doc(db, 'site_config', 'default'), {
    ...config,
    id: 'default',
    updatedAt: serverTimestamp()
  }, { merge: true });
  
  return { success: true };
});
```

---

## 5. Firestore Security Rules 업데이트

### 5.1 기존 규칙에 추가

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 기존 규칙...
    
    // Timeline (공개 읽기, 관리자만 쓰기)
    match /timeline/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }
    
    // Gallery (공개 읽기, 관리자만 쓰기)
    match /gallery/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }
    
    // Events (공개 읽기, 관리자만 쓰기)
    match /events/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }
    
    // Notices (공개 읽기, 관리자만 쓰기)
    match /notices/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }
    
    // Site Config (관리자만)
    match /site_config/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && exists(/databases/$(database)/documents/users/$(request.auth.uid));
    }
  }
}
```

---

## 6. 초기 데이터 설정 (Functions)

### 6.1 데이터 초기화 Function

```typescript
// functions/src/initData.ts
export const initializeData = httpsCallable(async (data, context) => {
  // 관리자 권한 체크 필요
  
  // Timeline 초기 데이터
  const timelineRef = collection(db, 'timeline');
  const timelineSnapshot = await getDocs(timelineRef);
  
  if (timelineSnapshot.empty) {
    const initialTimelines = [
      { year: 1906, title: "대한제국 황실이 세운 최초의 민족 여성 사학", ... },
      { year: 1938, title: "전문학교 설립", ... },
      // ... 10개 항목
    ];
    
    for (const item of initialTimelines) {
      await addDoc(timelineRef, {
        ...item,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  }
  
  // Gallery 초기 데이터
  const galleryRef = collection(db, 'gallery');
  const gallerySnapshot = await getDocs(galleryRef);
  
  if (gallerySnapshot.empty) {
    const initialGallery = [
      { type: 'photo', title: '초기 캠퍼스 모습', ... },
      // ... 9개 항목
    ];
    
    for (const item of initialGallery) {
      await addDoc(galleryRef, {
        ...item,
        active: true,
        displayOrder: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  }
  
  // Events 초기 데이터
  const eventsRef = collection(db, 'events');
  const eventsSnapshot = await getDocs(eventsRef);
  
  if (eventsSnapshot.empty) {
    const initialEvents = [
      { title: "120주년 기념식", date: "2026-05-10", month: "5월", ... },
      // ... 6개 항목
    ];
    
    for (const item of initialEvents) {
      await addDoc(eventsRef, {
        ...item,
        active: true,
        displayOrder: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
  }
  
  // Site Config 초기 데이터
  const siteConfigRef = doc(db, 'site_config', 'default');
  const siteConfigSnapshot = await getDoc(siteConfigRef);
  
  if (!siteConfigSnapshot.exists()) {
    await setDoc(siteConfigRef, {
      id: 'default',
      siteTitle: '숙명여자대학교 120주년 기념 동문회',
      siteDescription: '숙명여자대학교 개교 120주년을 맞이하여 동문 여러분을 초대합니다.',
      targetDate: '2026-05-22T00:00:00',
      showGallery: true,
      showEvents: true,
      showTimeline: true,
      updatedAt: serverTimestamp()
    });
  }
  
  return { success: true, message: 'Initial data created' };
});
```

---

## 7. API 호출 예시 (프론트엔드)

### 7.1 Timeline 페이지

```typescript
// Timeline.tsx
import { httpsCallable } from 'firebase/functions';

export default function Timeline() {
  const [timelines, setTimelines] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTimelinesFn = httpsCallable(functions, 'getTimelines');
    
    getTimelinesFn({})
      .then((result) => {
        setTimelines(result.data.timelines);
      })
      .catch((error) => {
        console.error('Error fetching timelines:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div>로딩 중...</div>;

  return (
    <Layout>
      {/* 타임라인 렌더링 */}
      {timelines.map((item) => (
        <TimelineItem key={item.id} {...item} />
      ))}
    </Layout>
  );
}
```

### 7.2 Gallery 페이지

```typescript
// Gallery.tsx
export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');

  useEffect(() => {
    const getGalleryItemsFn = httpsCallable(functions, 'getGalleryItems');
    
    getGalleryItemsFn({ type: filter === 'all' ? null : filter })
      .then((result) => {
        setItems(result.data.items);
      });
  }, [filter]);

  return (
    <Layout>
      {/* 갤러리 렌더링 */}
    </Layout>
  );
}
```

### 7.3 Events 페이지

```typescript
// Events.tsx
export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('전체');

  useEffect(() => {
    const getEventsFn = httpsCallable(functions, 'getEvents');
    
    getEventsFn({ month: selectedMonth })
      .then((result) => {
        setEvents(result.data.events);
      });
  }, [selectedMonth]);

  return (
    <Layout>
      {/* 이벤트 렌더링 */}
    </Layout>
  );
}
```

---

## 8. 관리자 페이지 연동

### 8.1 Admin.tsx 수정 사항

**현재 Admin.tsx 구조:**
```tsx
export default function Admin() {
  const [activeTab, setActiveTab] = useState('users');
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">관리자 페이지</h1>
        
        {/* 탭 네비게이션 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>사용자</TabButton>
          <TabButton active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>결제</TabButton>
          <TabButton active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')}>타임라인</TabButton>
          <TabButton active={activeTab === 'gallery'} onClick={() => setActiveTab('gallery')}>갤러리</TabButton>
          <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')}>행사</TabButton>
          <TabButton active={activeTab === 'notices'} onClick={() => setActiveTab('notices')}>공지사항</TabButton>
          <TabButton active={activeTab === 'config'} onClick={() => setActiveTab('config')}>설정</TabButton>
        </div>
        
        {/* 탭 콘텐츠 */}
        {activeTab === 'users' && <UsersTable />}
        {activeTab === 'payments' && <PaymentsTable />}
        {activeTab === 'timeline' && <TimelineManager />}
        {activeTab === 'gallery' && <GalleryManager />}
        {activeTab === 'events' && <EventsManager />}
        {activeTab === 'notices' && <NoticesManager />}
        {activeTab === 'config' && <ConfigManager />}
      </div>
    </Layout>
  );
}
```

### 8.2 새로운 컴포넌트 추가

```tsx
// TimelineManager.tsx
function TimelineManager() {
  const [timelines, setTimelines] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadTimelines();
  }, []);

  const loadTimelines = async () => {
    const fn = httpsCallable(functions, 'getTimelines');
    const result = await fn({});
    setTimelines(result.data.timelines);
  };

  const handleSave = async (data: TimelineItem) => {
    const fn = httpsCallable(functions, 'saveTimeline');
    await fn({ ...data });
    loadTimelines();
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const fn = httpsCallable(functions, 'deleteTimeline');
      await fn({ id });
      loadTimelines();
    }
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">타임라인 관리</h2>
        <Button onClick={() => setEditingItem(null); setModalOpen(true);}>
          추가
        </Button>
      </div>

      <Table>
        {/* 테이블 내용 */}
      </Table>

      {modalOpen && (
        <TimelineModal 
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          item={editingItem}
        />
      )}
    </Card>
  );
}
```

---

## 9. Firebase Storage 설정

### 9.1 Storage Rules

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 읽기: 모두 허용
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // 쓰기: 관리자만
    match /gallery/{allPaths=**} {
      allow write: if request.auth != null 
        && exists(/databases/(default)/documents/users/(request.auth.uid));
    }
  }
}
```

### 9.2 업로드 경로

```
gallery/photos/{timestamp}_{filename}
gallery/videos/{timestamp}_{filename}
```

---

## 10. 구현 우선순위

### Phase 1: 기본 CRUD (높음)

1. ✅ Firestore Collections 구조 정의
2. ✅ Firebase Functions 개발 (CRUD API)
3. ✅ Admin 페이지 탭 추가 (Timeline, Gallery, Events)
4. ✅ 초기 데이터 생성 Function

### Phase 2: 데이터 연동 (높음)

1. ✅ Timeline 페이지 → Firebase Functions 연동
2. ✅ Gallery 페이지 → Firebase Functions 연동
3. ✅ Events 페이지 → Firebase Functions 연동
4. ✅ Main 페이지 → Site Config 연동 (D-Day 등)

### Phase 3: 관리자 기능 (중간)

1. ✅ 각 탭별 CRUD UI 구현
2. ✅ 이미지/동영상 업로드 기능
3. ✅ 순서 변경 기능
4. ✅ 활성화/비활성화 토글

### Phase 4: 고급 기능 (낮음 - 선택)

1. ⏸️ 드래그 앤 드롭 순서 변경
2. ⏸️ 다중 이미지 업로드
3. ⏸️ CSV 내보내기/가져오기
4. ⏸️ 미리보기 개선

---

## 11. 테스트 체크리스트

### 11.1 백엔드 API

- [ ] `getTimelines` 함수 호출 → 타임라인 목록 반환
- [ ] `saveTimeline` 함수 호출 → 타임라인 저장/수정
- [ ] `deleteTimeline` 함수 호출 → 타임라인 삭제
- [ ] `getGalleryItems` 함수 호출 → 갤러리 목록 반환
- [ ] `saveGalleryItem` 함수 호출 → 갤러리 저장/수정
- [ ] `deleteGalleryItem` 함수 호출 → 갤러리 삭제
- [ ] `getEvents` 함수 호출 → 행사 목록 반환
- [ ] `saveEvent` 함수 호출 → 행사 저장/수정
- [ ] `deleteEvent` 함수 호출 → 행사 삭제
- [ ] `getSiteConfig` 함수 호출 → 사이트 설정 반환
- [ ] `saveSiteConfig` 함수 호출 → 사이트 설정 저장

### 11.2 관리자 페이지

- [ ] Timeline 탭 → 목록 표시, 추가/편집/삭제 작동
- [ ] Gallery 탭 → 목록 표시, 필터, 추가/편집/삭제 작동
- [ ] Events 탭 → 목록 표시, 월 필터, 추가/편집/삭제 작동
- [ ] 이미지 업로드 → Firebase Storage에 저장, URL 반환
- [ ] 관리자 권한 체크 → admin role만 접근 가능

### 11.3 프론트엔드 페이지

- [ ] Timeline 페이지 → DB 데이터 표시
- [ ] Gallery 페이지 → DB 데이터 표시, 필터 작동
- [ ] Events 페이지 → DB 데이터 표시, 월 필터 작동
- [ ] Main 페이지 → Site Config의 D-Day 사용

---

## 12. 다음 세션에서 할 작업

1. **Firestore Collections 생성**
   - `create-collection` 명령어로 timeline, gallery, events, site_config 생성
   - 초기 데이터 삽입

2. **Firebase Functions 개발**
   - functions/src에 CRUD 함수 추가
   - functions 배포

3. **Admin.tsx 확장**
   - Timeline, Gallery, Events 탭 추가
   - 각 탭별 CRUD UI 개발

4. **프론트엔드 연동**
   - Timeline.tsx → Functions 연동
   - Gallery.tsx → Functions 연동
   - Events.tsx → Functions 연동

5. **테스트**
   - 관리자 페이지에서 CRUD 테스트
   - 프론트엔드 페이지에서 데이터 표시 확인

---

**문서 버전**: 1.0  
**다음 업데이트**: 백엔드 연동 완료 후
