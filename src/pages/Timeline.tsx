import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useState, useEffect } from 'react';
import { ChevronRight, Calendar } from 'lucide-react';
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { TimelineItem } from '../types';

interface Milestone {
  year: number;
  title: string;
  description: string;
  details?: string;
  image?: string;
}

const fallbackMilestones: Milestone[] = [
  {
    year: 1906,
    title: '대한제국 황실이 세운 최초의 민족 여성 사학',
    description: '순헌황귀비의 선각으로 한국 여성 교육의 새로운 장이 열렸습니다.',
    details: '숙명여자대학교의 설립은 대한제국 시기 여성 교육의 획기적인 시작이었습니다.',
  },
  {
    year: 1938,
    title: '전문학교 설립',
    description: '숙명여자전문학교로 승격되며 전문 교육 기관으로 발돋움했습니다.',
    details: '일제강점기 속에서도 민족 교육의 맥을 이어갔습니다.',
  },
  {
    year: 1948,
    title: '대학승격, 피난지에 임시 교사 설치',
    description: '대학 승격과 함께 한국전쟁의 어려움 속에서도 교육을 이어갔습니다.',
    details: '부산 피난 시절에도 임시 교사를 마련하여 학생들을 가르쳤습니다.',
  },
  {
    year: 1955,
    title: '종합대학교 시대의 개막',
    description: '숙명여자대학교가 종합대학으로 승격하며 새로운 도약을 시작했습니다.',
    details: '인문, 사회, 자연, 예체능 등 다양한 학과가 설치되었습니다.',
  },
  {
    year: 1981,
    title: '새로운 전진을 위한 준비',
    description: '대학 시설 확충과 교육 과정 개선을 통해 질적 성장을 이루었습니다.',
    details: '도서관, 실험실 등 교육 환경이 대폭 개선되었습니다.',
  },
  {
    year: 1995,
    title: '숙명 제2창학',
    description: '대학 개혁을 통해 새로운 도약을 위한 기반을 마련했습니다.',
    details: '교육 시스템 혁신과 캠퍼스 현대화가 이루어졌습니다.',
  },
  {
    year: 2006,
    title: '숙명 창학 100주년',
    description: '100년의 역사를 자랑하며 새로운 100년을 향한 비전을 제시했습니다.',
    details: '100주년 기념식과 다양한 학술 문화 행사가 열렸습니다.',
  },
  {
    year: 2015,
    title: '사회수요에 맞춘 교육개혁',
    description: '사회 변화에 부응하는 혁신적인 교육 과정을 도입했습니다.',
    details: '융합 교육, 창의적 인재 양성에 집중했습니다.',
  },
  {
    year: 2023,
    title: '혁신적인 학제 개편',
    description: '미래 사회에 필요한 인재 양성을 위한 학제 개편을 단행했습니다.',
    details: 'AI, 데이터 등 첨단 분야 교육이 강화되었습니다.',
  },
  {
    year: 2026,
    title: '숙명 창학 120주년',
    description: '120년의 역사와 전통을 자랑하며 새로운 120년을 향해 나아갑니다.',
    details: '2026년 5월 21일 숙명창학기념일을 맞아 대규모 기념행사가 열립니다.',
  },
];

export default function Timeline() {
  const [selectedMilestone, setSelectedMilestone] = useState<number | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>(fallbackMilestones);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTimelines = async () => {
      try {
        const getTimelinesFn = httpsCallable(functions, 'getTimelines');
        const result = await getTimelinesFn({});
        const timelineData = (result.data as { timelines?: TimelineItem[] }).timelines || [];

        if (timelineData.length > 0) {
          const mappedMilestones: Milestone[] = timelineData.map((item) => ({
            year: item.year,
            title: item.title,
            description: item.shortDesc,
            details: item.details,
            image: item.imageUrl,
          }));
          setMilestones(mappedMilestones);
        }
      } catch (error) {
        console.warn('Failed to load timelines from Firebase, using fallback:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTimelines();
  }, []);

  if (loading) {
    return (
      <Layout>
        <Section padding="xl">
          <Container>
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </Container>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <Section variant="gradient" padding="lg">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              120년 역사 여정
            </h1>
            <p className="text-xl text-blue-100">
              숙명여자대학교의 빛나는 역사와 함께하는 시간
            </p>
          </div>
        </Container>
      </Section>

      {/* Timeline Section */}
      <Section padding="xl">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Introduction */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4 text-sookmyung-blue-900">
                숙명의 역사, 숙명의 자부심
              </h2>
              <p className="text-gray-600 text-lg">
                1906년 순헌황귀비의 선각으로 시작된 숙명여자대학교의 120년 역사는
                <br />
                대한민국 여성 교육의 발전과 함께해왔습니다.
              </p>
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-sookmyung-blue-200 transform md:-translate-x-1/2" />

              {/* Milestones */}
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`relative mb-12 md:mb-16 ${index % 2 === 0 ? 'md:pr-1/2 md:text-right' : 'md:pl-1/2 md:ml-auto'
                    }`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 top-8 w-8 h-8 bg-sookmyung-blue-600 rounded-full border-4 border-white shadow-lg transform md:-translate-x-1/2 z-10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>

                  {/* Card */}
                  <div className="ml-16 md:ml-0">
                    <Card
                      variant="elevated"
                      className={`cursor-pointer transition-all duration-300 hover:shadow-glow ${selectedMilestone === index ? 'ring-2 ring-sookmyung-blue-400' : ''
                        }`}
                      onClick={() => setSelectedMilestone(selectedMilestone === index ? null : index)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="text-5xl font-bold text-sookmyung-gold-500">
                            {milestone.year}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2 text-sookmyung-blue-900">
                            {milestone.title}
                          </h3>
                          <p className="text-gray-700 mb-2">{milestone.description}</p>
                          {selectedMilestone === index && milestone.details && (
                            <div className="mt-4 p-4 bg-sookmyung-blue-50 rounded-lg animate-fade-in">
                              <p className="text-gray-600">{milestone.details}</p>
                            </div>
                          )}
                          <div className="mt-4 flex items-center text-sookmyung-blue-600 text-sm font-medium">
                            <span>자세히 보기</span>
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="gradient" className="text-center">
                <div className="text-4xl font-bold text-sookmyung-gold-500 mb-2">120</div>
                <div className="text-gray-700">년의 역사</div>
              </Card>
              <Card variant="gradient" className="text-center">
                <div className="text-4xl font-bold text-sookmyung-gold-500 mb-2">10</div>
                <div className="text-gray-700">개의 중요한 이정표</div>
              </Card>
              <Card variant="gradient" className="text-center">
                <div className="text-4xl font-bold text-sookmyung-gold-500 mb-2">120,000+</div>
                <div className="text-gray-700">명의 동문</div>
              </Card>
            </div>

            {/* Back Button */}
            <div className="mt-12 text-center">
              <Link to="/">
                <Button variant="primary" size="lg">
                  홈으로 돌아가기
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
