import Layout from '../components/Layout';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MailOpen } from 'lucide-react';

export default function Greetings() {
    return (
        <Layout>
            {/* Hero Section */}
            <Section variant="gradient" padding="md" className="text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10"></div>
                <Container className="relative z-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">
                        모시는 글
                    </h1>
                    <p className="text-lg md:text-2xl text-blue-100">
                        숙명여자대학교 창학 120주년 기념 전야제
                    </p>
                </Container>
            </Section>

            <Section padding="lg" className="bg-gray-50">
                <Container>
                    <div className="max-w-4xl mx-auto -mt-10 md:-mt-20 relative z-20">
                        <Card variant="elevated" className="p-6 md:p-16 bg-white shadow-xl border-t-4 border-sookmyung-blue-900">
                            {/* Decorative Icon */}
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sookmyung-blue-50 text-sookmyung-blue-900 mb-6">
                                    <MailOpen className="w-8 h-8" />
                                </div>
                                <div className="w-20 h-1 bg-sookmyung-gold-500 mx-auto"></div>
                            </div>

                            {/* Content */}
                            <div className="prose prose-xl md:prose-2xl max-w-none text-gray-700 leading-loose space-y-8 md:space-y-10 text-left md:text-justify break-keep tracking-tight">
                                <div className="space-y-6 md:space-y-8 text-[1.15rem] md:text-[1.4rem]">
                                    <p>
                                        우리 숙명여자대학교는 1906년, <strong className="text-sookmyung-blue-900">“민족의 미래는 여성교육에 있다”</strong>는 신념으로 배움을 통해 시대를 밝히고자 했던 순헌황귀비의 뜻에서 출발한 대한민국 최초의 민족 여성 사학입니다.
                                    </p>
                                    <p>
                                        시대의 제약과 편견 속에서도 배움의 불씨를 지켜온 지난 120년은 수많은 숙명인의 삶과 함께 이어져 온 자랑스러운 역사입니다.
                                    </p>
                                    <p>
                                        12만 모든 숙명 동문들의 도전과 성취가 모여 이루어진 결실이며, 지성과 품격, 그리고 사회적 책임을 바탕으로 시대를 이끌어온 뜻깊은 발자취입니다.
                                    </p>
                                    <p>
                                        총동문회는 이 소중한 유산을 기억하고 그 정신을 이어가며, 세대와 지역을 넘어 동문을 하나로 연결하는 만남의 장이 되고자 합니다. 숙명의 전통 위에서 더욱 단단한 공동체로 나아가, 다음 백년을 준비하는 든든한 기반을 함께 만들어 가겠습니다.
                                    </p>
                                    <p>
                                        창학 120주년을 맞는 뜻깊은 해에 모교의 정신을 다시 한 번 되새기며, 전야제에 대한 따뜻한 관심과 적극적인 참여로 후배들에게 큰 자긍심을 전해주시기를 바랍니다.
                                    </p>
                                    <p>
                                        숙명을 사랑하시는 모든 분들의 건승과 행복을 기원합니다.
                                    </p>
                                </div>
                                <p className="text-center font-bold text-2xl md:text-3xl mt-12 md:mt-16 text-sookmyung-blue-900">
                                    감사합니다.
                                </p>
                            </div>

                            {/* Decorative Bottom */}
                            <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                                <p className="text-sookmyung-blue-900 text-2xl font-bold">
                                    숙명여자대학교 총동문회
                                </p>
                            </div>
                        </Card>

                        {/* Navigation Buttons */}
                        <div className="flex justify-center gap-4 mt-12">
                            <Button 
                                variant="outline" 
                                onClick={() => window.history.back()}
                                className="px-8 py-3 text-lg"
                            >
                                이전으로
                            </Button>
                            <a href="/application">
                                <Button 
                                    variant="primary" 
                                    aria-label="참가신청"
                                    className="px-8 py-3 text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                                >
                                    참가신청
                                </Button>
                            </a>
                        </div>
                    </div>
                </Container>
            </Section>
        </Layout>
    );
}
