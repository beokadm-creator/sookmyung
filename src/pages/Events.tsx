import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { Calendar as CalendarIcon, MapPin, Clock, Users } from 'lucide-react';
import { functions } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { EventItem } from '../types';

interface Event {
  id: string;
  date: string;
  month: string;
  title: string;
  time: string;
  location: string;
  description: string;
  capacity?: number;
  registered?: number;
}

const fallbackEvents: Event[] = [
  {
    id: '1',
    date: '2026-05-10',
    month: '5월',
    title: '120주년 기념식',
    time: '10:00 - 12:00',
    location: '숙명여자대학교 대강당',
    description: '120년의 역사를 축하하는 기념식입니다. 총장님의 축사, 동문 대표 축하 메시지, 기념 공연 등 다채로운 프로그램이 준비되어 있습니다.',
    capacity: 1000,
    registered: 456,
  },
  {
    id: '2',
    date: '2026-05-11',
    month: '5월',
    title: '동문 네트워킹',
    time: '14:00 - 17:00',
    location: '학생회관 다목적실',
    description: '전공별, 졸업년도별 동문들과 소통하며 네트워크를 확장하는 시간입니다. 산하동문 후원금 전달식, 네트워킹 세션 등이 진행됩니다.',
    capacity: 300,
    registered: 178,
  },
  {
    id: '3',
    date: '2026-05-12',
    month: '5월',
    title: '문화 행사',
    time: '10:00 - 18:00',
    location: '캠퍼스 전체',
    description: '공연, 전시, 체험 프로그램 등 다양한 문화 행사가 진행됩니다. 동문 예술가들의 초청 공연, 학생 동아리 공연, 특별 전시회 등을 만나보세요.',
    capacity: 500,
    registered: 234,
  },
  {
    id: '4',
    date: '2026-03-15',
    month: '3월',
    title: '숙명 창학120주년 기념 전야제 학술 심포지엄',
    time: '14:00 - 17:00',
    location: '국제교육관',
    description: '여성 교육의 역사와 미래를 주제로 학술 심포지엄을 개최합니다. 저명한 교수님들과 동문 학자들이 참여합니다.',
    capacity: 200,
    registered: 89,
  },
  {
    id: '5',
    date: '2026-04-20',
    month: '4월',
    title: '동문 런닝 페스티벌',
    time: '09:00 - 12:00',
    location: '캠퍼스 운동장',
    description: '건강한 체력으로 동문들과 함께 달리는 러닝 페스티벌입니다. 5km, 10km 코스가 마련되어 있으며, 참가자 모두에게 기념품이 제공됩니다.',
    capacity: 400,
    registered: 156,
  },
  {
    id: '6',
    date: '2026-06-10',
    month: '6월',
    title: '동문 채용 박람회',
    time: '13:00 - 17:00',
    location: '체육관',
    description: '동문들이 근무하는 기업/기관의 채용 정보를 나누는 박람회입니다. 취업 준비생 동문들에게 좋은 기회가 될 것입니다.',
    capacity: 500,
    registered: 203,
  },
];

const months = ['전체', '3월', '4월', '5월', '6월'];

export default function Events() {
  const [selectedMonth, setSelectedMonth] = useState<string>('전체');
  const [events, setEvents] = useState<Event[]>(fallbackEvents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const getEventsFn = httpsCallable(functions, 'getEvents');
        const result = await getEventsFn({});
        const eventsData = (result.data as { events?: EventItem[] }).events || [];

        if (eventsData.length > 0) {
          const mappedEvents: Event[] = eventsData.map((item) => ({
            id: item.id,
            date: item.date,
            month: item.month,
            title: item.title,
            time: item.time,
            location: item.location,
            description: item.description,
            capacity: item.capacity,
            registered: item.registered,
          }));
          setEvents(mappedEvents);
        }
      } catch (error) {
        console.warn('Failed to load events from Firebase, using fallback:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const filteredEvents =
    selectedMonth === '전체'
      ? events
      : events.filter((event) => event.month === selectedMonth);

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

  const upcomingEvents = filteredEvents.filter(
    (event) => new Date(event.date) >= new Date()
  );

  return (
    <Layout>
      {/* Hero Section */}
      <Section variant="gradient" padding="lg">
        <Container>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              숙명 창학120주년 기념 전야제 행사일정
            </h1>
            <p className="text-xl text-blue-100">
              숙명 창학120주년 기념 전야제를 축하하는 특별한 행사에 참여하세요
            </p>
          </div>
        </Container>
      </Section>

      {/* Month Filter */}
      <Section padding="md">
        <Container>
          <div className="flex flex-wrap justify-center gap-3">
            {months.map((month) => (
              <button
                type="button"
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedMonth === month
                    ? 'bg-sookmyung-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </Container>
      </Section>

      {/* Events List */}
      <Section padding="lg">
        <Container>
          <div className="max-w-4xl mx-auto">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card variant="gradient" className="text-center">
                <div className="text-4xl font-bold text-sookmyung-gold-500 mb-2">
                  {upcomingEvents.length}
                </div>
                <div className="text-gray-700">예정 행사</div>
              </Card>
              <Card variant="gradient" className="text-center">
                <div className="text-4xl font-bold text-sookmyung-gold-500 mb-2">
                  {filteredEvents.length}
                </div>
                <div className="text-gray-700">전체 행사</div>
              </Card>
              <Card variant="gradient" className="text-center">
                <div className="text-4xl font-bold text-sookmyung-gold-500 mb-2">
                  {filteredEvents.reduce((sum, e) => sum + (e.registered || 0), 0)}
                </div>
                <div className="text-gray-700">신청자 수</div>
              </Card>
            </div>

            {/* Events */}
            <div className="space-y-6">
              {upcomingEvents.map((event) => (
                <Card key={event.id} variant="elevated" className="hover:shadow-glow transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Date Badge */}
                    <div className="flex-shrink-0">
                      <div className="bg-sookmyung-blue-600 text-white rounded-lg p-4 text-center min-w-[100px]">
                        <div className="text-3xl font-bold">
                          {new Date(event.date).getDate()}
                        </div>
                        <div className="text-sm">{event.month}</div>
                        <div className="text-xs mt-1 opacity-80">
                          {new Date(event.date).getFullYear()}
                        </div>
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-3 text-sookmyung-blue-900">
                        {event.title}
                      </h3>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        {event.capacity && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>
                              신청: {event.registered} / {event.capacity}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="text-gray-700 mb-4">{event.description}</p>

                      {/* Progress Bar */}
                      {event.capacity && event.registered && (
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-sookmyung-blue-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${Math.min((event.registered / event.capacity) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button variant="primary" size="md">
                          신청하기
                        </Button>
                        <Button variant="outline" size="md">
                          상세보기
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {upcomingEvents.length === 0 && (
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  선택한 월에 예정된 행사가 없습니다.
                </p>
              </div>
            )}

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

      {/* CTA Section */}
      <Section variant="secondary" padding="lg">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-sookmyung-blue-900">
              모든 행사를 놓치지 마세요
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              120주년 기념행사에 참여하여 숙명인들과 함께 특별한 추억을 만드세요.
              행사 일정을 확인하고 미리 신청하세요.
            </p>
            <Link to="/application">
              <Button variant="gold" size="lg" aria-label="참가신청">
                참가신청
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    </Layout>
  );
}
