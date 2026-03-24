const admin = require('firebase-admin');
const serviceAccount = require('../sookmyung-97032-firebase-adminsdk-fbsvc-cdee98bac9.json');

// Firebase Admin 초기화
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initializeDatabase() {
  console.log('🚀 데이터베이스 초기화 시작...');

  try {
    // 1. Timeline 초기 데이터
    console.log('📝 Timeline 데이터 생성 중...');
    const timelineRef = db.collection('timeline');
    const timelineSnapshot = await timelineRef.limit(1).get();

    if (timelineSnapshot.empty) {
      const initialTimelines = [
        {
          year: 1906,
          title: '대한제국 황실이 세운 최초의 민족 여성 사학',
          shortDesc: '순헌황귀비의 선각으로 한국 여성 교육의 새로운 장이 열렸습니다.',
          details: '숙명여자대학교의 설립은 대한제국 시기 여성 교육의 획기적인 시작이었습니다.',
          period: '1906년',
          category: 'founding',
          displayOrder: 1,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          year: 1938,
          title: '전문학교 설립',
          shortDesc: '숙명여자전문학교로 승격되며 전문 교육 기관으로 발돋움했습니다.',
          details: '일제강점기 속에서도 민족 교육의 맥을 이어갔습니다.',
          period: '1938년',
          category: 'education',
          displayOrder: 2,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          year: 1948,
          title: '대학승격, 피난지에 임시 교사 설치',
          shortDesc: '대학 승격과 함께 한국전쟁의 어려움 속에서도 교육을 이어갔습니다.',
          details: '부산 피난 시절에도 임시 교사를 마련하여 학생들을 가르쳤습니다.',
          period: '1948년',
          category: 'expansion',
          displayOrder: 3,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          year: 1955,
          title: '종합대학교 시대의 개막',
          shortDesc: '숙명여자대학교가 종합대학으로 승격하며 새로운 도약을 시작했습니다.',
          details: '인문, 사회, 자연, 예체능 등 다양한 학과가 설치되었습니다.',
          period: '1955년',
          category: 'expansion',
          displayOrder: 4,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          year: 1981,
          title: '새로운 전진을 위한 준비',
          shortDesc: '대학 시설 확충과 교육 과정 개선을 통해 질적 성장을 이루었습니다.',
          details: '도서관, 실험실 등 교육 환경이 대폭 개선되었습니다.',
          period: '1981년',
          category: 'development',
          displayOrder: 5,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          year: 1995,
          title: '숙명 제2창학',
          shortDesc: '대학 개혁을 통해 새로운 도약을 위한 기반을 마련했습니다.',
          details: '교육 시스템 혁신과 캠퍼스 현대화가 이루어졌습니다.',
          period: '1995년',
          category: 'reform',
          displayOrder: 6,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          year: 2006,
          title: '숙명 창학 100주년',
          shortDesc: '100년의 역사를 자랑하며 새로운 100년을 향한 비전을 제시했습니다.',
          details: '100주년 기념식과 다양한 학술 문화 행사가 열렸습니다.',
          period: '2006년',
          category: 'milestone',
          displayOrder: 7,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          year: 2015,
          title: '사회수요에 맞춘 교육개혁',
          shortDesc: '사회 변화에 부응하는 혁신적인 교육 과정을 도입했습니다.',
          details: '융합 교육, 창의적 인재 양성에 집중했습니다.',
          period: '2015년',
          category: 'reform',
          displayOrder: 8,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          year: 2023,
          title: '혁신적인 학제 개편',
          shortDesc: '미래 사회에 필요한 인재 양성을 위한 학제 개편을 단행했습니다.',
          details: 'AI, 데이터 등 첨단 분야 교육이 강화되었습니다.',
          period: '2023년',
          category: 'reform',
          displayOrder: 9,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          year: 2026,
          title: '숙명 창학 120주년',
          shortDesc: '120년의 역사와 전통을 자랑하며 새로운 120년을 향해 나아갑니다.',
          details: '2026년 5월 22일 숙명창학기념일을 맞아 대규모 기념행사가 열립니다.',
          period: '2026년',
          category: 'milestone',
          displayOrder: 10,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        }
      ];

      for (const item of initialTimelines) {
        await timelineRef.add(item);
      }
      console.log('✅ Timeline 데이터 생성 완료 (10개 항목)');
    } else {
      console.log('⏭️  Timeline 데이터가 이미 존재합니다.');
    }

    // 2. Gallery 초기 데이터
    console.log('📸 Gallery 데이터 생성 중...');
    const galleryRef = db.collection('gallery');
    const gallerySnapshot = await galleryRef.limit(1).get();

    if (gallerySnapshot.empty) {
      const initialGallery = [
        {
          type: 'photo',
          title: '초기 캠퍼스 모습',
          description: '1906년 숙명여자대학교의 초기 캠퍼스 모습',
          thumbnailUrl: '',
          mediaUrl: '/placeholder1.jpg',
          displayOrder: 1,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          type: 'photo',
          title: '100주년 기념식',
          description: '2006년 숙명 창학 100주년 기념식',
          thumbnailUrl: '',
          mediaUrl: '/placeholder2.jpg',
          displayOrder: 2,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          type: 'photo',
          title: '졸업식 사진',
          description: '1960년대 졸업식 모습',
          thumbnailUrl: '',
          mediaUrl: '/placeholder3.jpg',
          displayOrder: 3,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          type: 'photo',
          title: '도서관',
          description: '중앙도서관 건립 기념사진',
          thumbnailUrl: '',
          mediaUrl: '/placeholder4.jpg',
          displayOrder: 4,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          type: 'photo',
          title: '동문회 모임',
          description: '동문들의 축하 모임',
          thumbnailUrl: '',
          mediaUrl: '/placeholder5.jpg',
          displayOrder: 5,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          type: 'photo',
          title: '캠퍼스 봄 풍경',
          description: '봄의 숙명 캠퍼스',
          thumbnailUrl: '',
          mediaUrl: '/placeholder6.jpg',
          displayOrder: 6,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          type: 'video',
          title: '120주년 비전 선포 영상',
          description: '120주년 기념 비전 선포식 영상',
          thumbnailUrl: '',
          mediaUrl: '',
          videoId: 'SALwRCKxZEc',
          displayOrder: 7,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          type: 'video',
          title: '숙명 120년 역사 다큐멘터리',
          description: '120년의 역사를 담은 다큐멘터리',
          thumbnailUrl: '',
          mediaUrl: '',
          videoId: '',
          displayOrder: 8,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          type: 'video',
          title: '동문 축하 메시지',
          description: '동문들의 축하 메시지 영상',
          thumbnailUrl: '',
          mediaUrl: '',
          videoId: '',
          displayOrder: 9,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        }
      ];

      for (const item of initialGallery) {
        await galleryRef.add(item);
      }
      console.log('✅ Gallery 데이터 생성 완료 (9개 항목)');
    } else {
      console.log('⏭️  Gallery 데이터가 이미 존재합니다.');
    }

    // 3. Events 초기 데이터
    console.log('🎉 Events 데이터 생성 중...');
    const eventsRef = db.collection('events');
    const eventsSnapshot = await eventsRef.limit(1).get();

    if (eventsSnapshot.empty) {
      const initialEvents = [
        {
          title: '120주년 기념식',
          date: '2026-05-10',
          month: '5월',
          time: '10:00 - 12:00',
          location: '숙명여자대학교 대강당',
          description: '120년의 역사를 축하하는 기념식입니다. 총장님의 축사, 동문 대표 축하 메시지, 기념 공연 등 다채로운 프로그램이 준비되어 있습니다.',
          capacity: 1000,
          registered: 456,
          displayOrder: 1,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          title: '동문 네트워킹',
          date: '2026-05-11',
          month: '5월',
          time: '14:00 - 17:00',
          location: '학생회관 다목적실',
          description: '전공별, 졸업년도별 동문들과 소통하며 네트워크를 확장하는 시간입니다. 산하동문 후원금 전달식, 네트워킹 세션 등이 진행됩니다.',
          capacity: 300,
          registered: 178,
          displayOrder: 2,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          title: '문화 행사',
          date: '2026-05-12',
          month: '5월',
          time: '10:00 - 18:00',
          location: '캠퍼스 전체',
          description: '공연, 전시, 체험 프로그램 등 다양한 문화 행사가 진행됩니다. 동문 예술가들의 초청 공연, 학생 동아리 공연, 특별 전시회 등을 만나보세요.',
          capacity: 500,
          registered: 234,
          displayOrder: 3,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          title: '120주년 기념 학술 심포지엄',
          date: '2026-03-15',
          month: '3월',
          time: '14:00 - 17:00',
          location: '국제교육관',
          description: '여성 교육의 역사와 미래를 주제로 학술 심포지엄을 개최합니다. 저명한 교수님들과 동문 학자들이 참여합니다.',
          capacity: 200,
          registered: 89,
          displayOrder: 4,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          title: '동문 런닝 페스티벌',
          date: '2026-04-20',
          month: '4월',
          time: '09:00 - 12:00',
          location: '캠퍼스 운동장',
          description: '건강한 체력으로 동문들과 함께 달리는 러닝 페스티벌입니다. 5km, 10km 코스가 마련되어 있으며, 참가자 모두에게 기념품이 제공됩니다.',
          capacity: 400,
          registered: 156,
          displayOrder: 5,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        },
        {
          title: '동문 채용 박람회',
          date: '2026-06-10',
          month: '6월',
          time: '13:00 - 17:00',
          location: '체육관',
          description: '동문들이 근무하는 기업/기관의 채용 정보를 나누는 박람회입니다. 취업 준비생 동문들에게 좋은 기회가 될 것입니다.',
          capacity: 500,
          registered: 203,
          displayOrder: 6,
          active: true,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        }
      ];

      for (const item of initialEvents) {
        await eventsRef.add(item);
      }
      console.log('✅ Events 데이터 생성 완료 (6개 항목)');
    } else {
      console.log('⏭️  Events 데이터가 이미 존재합니다.');
    }

    // 4. Site Config 초기 데이터
    console.log('⚙️  Site Config 데이터 생성 중...');
    const siteConfigRef = db.collection('config').doc('site_settings');
    const siteConfigSnap = await siteConfigRef.get();

    if (!siteConfigSnap.exists) {
      await siteConfigRef.set({
        id: 'site_settings',
        siteTitle: '숙명여자대학교 120주년 기념 동문회',
        siteDescription: '숙명여자대학교 개교 120주년을 맞이하여 동문 여러분을 초대합니다.',
        targetDate: '2026-05-22T00:00:00',
        contactEmail: 'alumni@sookmyung.ac.kr',
        contactPhone: '02-710-9114',
        showGallery: true,
        showEvents: true,
        showTimeline: true,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Site Config 데이터 생성 완료');
    } else {
      console.log('⏭️  Site Config 데이터가 이미 존재합니다.');
    }

    console.log('🎉 데이터베이스 초기화 완료!');
    console.log('');
    console.log('생성된 데이터:');
    console.log('  - Timeline: 10개 항목');
    console.log('  - Gallery: 9개 항목');
    console.log('  - Events: 6개 항목');
    console.log('  - Site Config: 1개 항목');
    console.log('');
    console.log('이제 웹사이트에서 데이터를 확인할 수 있습니다!');

  } catch (error) {
    console.error('❌ 초기화 중 오류 발생:', error);
    process.exit(1);
  }
}

// 스크립트 실행
initializeDatabase().then(() => {
  console.log('');
  console.log('✅ 모든 작업이 완료되었습니다.');
  process.exit(0);
});
