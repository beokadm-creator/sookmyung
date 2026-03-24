import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, Clock, MapPin, Sparkles } from 'lucide-react';

type FestivalTab = 'intro' | 'program';

export default function Festival() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = (searchParams.get('tab') as FestivalTab) || 'intro';

    const handleTabChange = (tab: FestivalTab) => {
        setSearchParams({ tab });
    };

    return (
        <Layout>
            {/* Hero Section */}
            <Section variant="gradient" padding="lg" className="text-white">
                <Container>
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-8">
                            숙명 창학 120주년 기념 전야제
                        </h1>
                        <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>2026년 5월 21일 (목)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>오후 6시</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                <span>그랜드 인터컨티넨탈 서울 파르나스 5층 그랜드볼룸</span>
                            </div>
                        </div>
                    </div>
                </Container>
            </Section>

            {/* Tab Navigation */}
            <Section padding="none">
                <Container>
                    <div className="flex flex-wrap justify-center gap-4 py-6">
                        <button
                            onClick={() => handleTabChange('intro')}
                            className={`px-6 py-3 rounded-lg transition-all ${activeTab === 'intro'
                                ? 'bg-sookmyung-blue-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-sookmyung-blue-50'
                                }`}
                        >
                            전야제 소개
                        </button>
                        <button
                            onClick={() => handleTabChange('program')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${activeTab === 'program'
                                ? 'bg-sookmyung-blue-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-sookmyung-blue-50'
                                }`}
                        >
                            <Clock className="w-5 h-5" />
                            전야제 프로그램
                        </button>
                    </div>
                </Container>
            </Section>

            {/* Content */}
            <Section padding="lg">
                <Container>
                    {activeTab === 'intro' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <Sparkles className="w-16 h-16 text-sookmyung-gold-500 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold text-sookmyung-blue-900 mb-4">
                                    전야제 소개
                                </h2>
                            </div>

                            <Card variant="elevated" className="p-8 mb-8">
                                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                                    <p className="mb-6 text-lg">
                                        <strong>1906년의 작은 시작이 120년의 역사로 이어졌습니다.</strong>
                                    </p>
                                    <p className="mb-4">
                                        이번 전야제는 숙명인의 자부심을 다시 한 번 확인하고, 세대를 넘어 이어지는 연대의 힘을 나누는 자리입니다.
                                    </p>
                                    <p className="mb-4">
                                        120주년 창학기념식 전 날, 모교와 총동문회가 함께 준비한 축하의 밤에서, 숙명의 과거와 현재, 그리고 미래를 이어갑니다.
                                    </p>
                                    <p className="mb-6">
                                        한 세기를 넘어, 또 다른 백년을 향해 도약하는 이 특별한 순간을 숙명 가족 모든 분들과 함께 하고자 합니다.
                                    </p>
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card variant="outlined" className="text-center p-6">
                                    <div className="w-16 h-16 bg-sookmyung-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Calendar className="w-8 h-8 text-sookmyung-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-sookmyung-blue-900 mb-2">일시</h3>
                                    <p className="text-gray-600">2026년 5월 21일 (목)<br />오후 5시</p>
                                </Card>

                                <Card variant="outlined" className="text-center p-6">
                                    <div className="w-16 h-16 bg-sookmyung-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MapPin className="w-8 h-8 text-sookmyung-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-sookmyung-blue-900 mb-2">장소</h3>
                                    <p className="text-gray-600">그랜드 인터컨티넨탈<br />서울 파르나스 5층 그랜드볼룸</p>
                                </Card>

                                <Card variant="outlined" className="text-center p-6">
                                    <div className="w-16 h-16 bg-sookmyung-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Sparkles className="w-8 h-8 text-sookmyung-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-sookmyung-blue-900 mb-2">주제</h3>
                                    <p className="text-gray-600">120년의 숙명<br />숙명의 자부심</p>
                                </Card>
                            </div>

                            <div className="text-center mt-12">
                                <a href="/application">
                                    <Button variant="gold" size="lg" aria-label="참가신청">
                                        참가신청
                                    </Button>
                                </a>
                            </div>
                        </div>
                    )}

                    {activeTab === 'program' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="text-center mb-12">
                                <Clock className="w-16 h-16 text-sookmyung-gold-500 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold text-sookmyung-blue-900 mb-4">
                                    전야제 프로그램
                                </h2>
                                <p className="text-gray-600">
                                    120주년 전야제 상세 일정 안내
                                </p>
                            </div>

                            <Card variant="elevated" className="p-8">
                                <div className="space-y-8">
                                    <div className="flex flex-col md:flex-row gap-4 md:items-start border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                        <div className="min-w-[100px] text-lg font-bold text-sookmyung-blue-600">●</div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900">개식선언</h3>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 md:items-start border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                        <div className="min-w-[100px] text-lg font-bold text-sookmyung-blue-600">●</div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900 mb-3">기념식</h3>
                                            <ul className="space-y-2 text-gray-600 ml-4 list-disc">
                                                <li>총동문회장 기념사</li>
                                                <li>총장 축사</li>
                                                <li>숙명발전위원장 축사</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 md:items-start border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                        <div className="min-w-[100px] text-lg font-bold text-sookmyung-blue-600">●</div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900">만찬</h3>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-4 md:items-start border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                        <div className="min-w-[100px] text-lg font-bold text-sookmyung-blue-600">●</div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-900">축하공연</h3>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <div className="bg-yellow-50 rounded-lg p-6 mt-8">
                                <h4 className="font-bold text-sookmyung-blue-900 mb-2">📌 유의사항</h4>
                                <ul className="text-gray-700 space-y-2">
                                    <li>• 프로그램은 상황에 따라 변경될 수 있습니다</li>
                                    <li>• 공식 행사정장 착용이 권장됩니다</li>
                                    <li>• 네트워킹 시간에는 명함을 준비해 주세요</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </Container>
            </Section>
        </Layout>
    );
}
