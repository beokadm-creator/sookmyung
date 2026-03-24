import Layout from '../components/Layout';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link as LinkIcon, MapPin, Users, History, Award, ExternalLink, Globe, BookOpen } from 'lucide-react';

interface President {
    id: string;
    name: string;
    department: string;
    terms: string;
    graduationYear: string;
    image?: string;
}

const pastPresidents: President[] = [
    { id: '2', name: '정진수', department: '기예', terms: '제2대', graduationYear: '41', image: '/img/제2대 회장 정진수.jpg' },
    { id: '3-5', name: '이상희', department: '가정', terms: '제3,5대', graduationYear: '41', image: '/img/제3,5대 회장 이상희.jpg' },
    { id: '4', name: '한영희', department: '가정', terms: '제4대', graduationYear: '41' },
    { id: '6', name: '이옥순', department: '가정', terms: '제6대', graduationYear: '41', image: '/img/제6대 회장 이옥순.jpg' },
    { id: '7', name: '최정신', department: '기예', terms: '제7대', graduationYear: '41' },
    { id: '8', name: '유유정', department: '가정', terms: '제8대', graduationYear: '42' },
    { id: '9', name: '김경진', department: '가정', terms: '제9대', graduationYear: '42', image: '/img/제9대 회장 김경진.gif' },
    { id: '10-12', name: '김명희', department: '국문', terms: '제10~12대', graduationYear: '52', image: '/img/제10~12대 회장 김명희.jpg' },
    { id: '13-14', name: '전금주', department: '영문', terms: '제13,14대', graduationYear: '54', image: '/img/제13,14대 회장 전금주.jpg' },
    { id: '15-16', name: '원효경', department: '경제', terms: '제15,16대', graduationYear: '58', image: '/img/제15,16대 회장 원효경.jpg' },
    { id: '17-19', name: '이상숙', department: '가정', terms: '제17~19대', graduationYear: '61', image: '/img/제17~19대 회장 이상숙.jpg' },
    { id: '20-21', name: '문계', department: '국문', terms: '제20,21대', graduationYear: '65', image: '/img/제20,21대 회장 문계.jpg' },
    { id: '22-23', name: '정정애', department: '사학', terms: '제22,23대', graduationYear: '66', image: '/img/제22,23대 회장 정정애.jpg' },
    { id: '24-25', name: '정춘희', department: '영문', terms: '제24,25대', graduationYear: '66', image: '/img/제24,25대 회장 정춘희.jpg' },
    { id: '26', name: '황현숙', department: '정외', terms: '제26대', graduationYear: '70', image: '/img/제26대 회장 황현숙.gif' },
    { id: '27', name: '류지영', department: '생미', terms: '제27대', graduationYear: '72', image: '/img/제27대 회장 류지영.jpg' },
    { id: '28-30', name: '정순옥', department: '화학', terms: '제28~30대', graduationYear: '73', image: '/img/제28~30대 회장 정순옥.jpg' },
    { id: '31', name: '김종희', department: '제약', terms: '제31대', graduationYear: '80', image: '/img/제31대 회장 김종희.jpg' },
    { id: '32', name: '김순례', department: '제약', terms: '제32대', graduationYear: '78', image: '/img/제32대 회장 김순례.jpg' },
];

export default function Alumni() {
    return (
        <Layout>
            {/* Hero Section */}
            <Section variant="gradient" padding="lg" className="text-white">
                <Container>
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            총동문회 소개
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-6">
                            숙명여자대학교 총동문회
                        </p>
                    </div>
                </Container>
            </Section>

            {/* History Section */}
            <Section padding="lg">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-sookmyung-blue-900 mb-4">
                                총동문회 약력
                            </h2>
                        </div>

                        <Card variant="elevated" className="p-8 mb-8">
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                                <p className="mb-4">
                                    <strong>숙명여자대학교 총동문회</strong>는 숙명여자대학교 졸업생들이 모인 동문 단체로,
                                    학교 발전과 동문 상호 협력을 위해 설립되었습니다.
                                </p>
                                <p className="mb-4">
                                    1906년 개교 이래 120년의 역사를 가진 숙명여자대학교는
                                    대한민국 여성 교육의 선구자로서 수많은 인재를 배출했습니다.
                                </p>
                                <p className="mb-4">
                                    총동문회는 동문들의 연대를 강화하고, 학교 발전에 기여하며,
                                    사회에 긍정적인 영향을 미치는 활동을 전개하고 있습니다.
                                </p>
                            </div>
                        </Card>

                        {/* Key Numbers */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card variant="outlined" className="text-center p-6">
                                <Users className="w-12 h-12 text-sookmyung-blue-600 mx-auto mb-4" />
                                <div className="text-4xl font-bold text-sookmyung-blue-600 mb-2">12만+</div>
                                <div className="text-gray-600">전세계 동문</div>
                            </Card>

                            <Card variant="outlined" className="text-center p-6">
                                <History className="w-12 h-12 text-sookmyung-blue-600 mx-auto mb-4" />
                                <div className="text-4xl font-bold text-sookmyung-blue-600 mb-2">120년</div>
                                <div className="text-gray-600">역사</div>
                            </Card>

                            <Card variant="outlined" className="text-center p-6">
                                <Award className="w-12 h-12 text-sookmyung-blue-600 mx-auto mb-4" />
                                <div className="text-4xl font-bold text-sookmyung-blue-600 mb-2">1906년</div>
                                <div className="text-gray-600">개교 연도</div>
                            </Card>
                        </div>
                    </div>
                </Container>
            </Section>

            {/* Chapters Map Section */}
            <Section variant="secondary" padding="lg">
                <Container>
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-sookmyung-blue-900 mb-4">
                                지부 현황
                            </h2>
                            <p className="text-gray-600">
                                전국 각지와 해외에서 활동하는 자랑스러운 숙명 동문회
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Map Visualization (Placeholder) */}
                            <Card variant="elevated" className="p-6 min-h-[400px] flex items-center justify-center bg-blue-50">
                                <div className="text-center">
                                    <MapPin className="w-16 h-16 text-sookmyung-blue-300 mx-auto mb-4" />
                                    <p className="text-sookmyung-blue-900 font-bold text-lg">지부 지도</p>
                                    <p className="text-gray-500 text-sm mt-2">
                                        국내외 곳곳에서 숙명의 이름을 빛내고 있는<br />
                                        동문회 지부를 지도에서 확인하실 수 있습니다.
                                    </p>
                                    <a 
                                        href="https://smal.or.kr/cmnt/45891/contentInfo.do" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="mt-4 inline-block text-sm text-sookmyung-blue-600 underline hover:text-sookmyung-blue-800"
                                    >
                                        지부 현황 자세히 보기
                                    </a>
                                </div>
                            </Card>

                            {/* Chapter Lists */}
                            <div className="space-y-6">
                                <Card variant="outlined" className="p-6">
                                    <h3 className="text-xl font-bold text-sookmyung-blue-900 mb-4 flex items-center gap-2">
                                        <MapPin className="w-5 h-5" /> 지방 지부
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-gray-700">
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-blue-400"></div>부산지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-blue-400"></div>대구경북지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-blue-400"></div>광주전남지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-blue-400"></div>대전충남지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-blue-400"></div>인천지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-blue-400"></div>경기지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-blue-400"></div>강원지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-blue-400"></div>충북지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-blue-400"></div>전북지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-blue-400"></div>울산지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-blue-400"></div>경남지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-blue-400"></div>제주지회</div>
                                    </div>
                                </Card>

                                <Card variant="outlined" className="p-6">
                                    <h3 className="text-xl font-bold text-sookmyung-blue-900 mb-4 flex items-center gap-2">
                                        <Globe className="w-5 h-5" /> 해외 지부
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-gray-700">
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-gold-400"></div>미주지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-gold-400"></div>캐나다지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-gold-400"></div>일본지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-gold-400"></div>중국지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-gold-400"></div>호주지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-gold-400"></div>독일지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-gold-400"></div>프랑스지회</div>
                                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-sookmyung-gold-400"></div>영국지회</div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </Container>
            </Section>

            {/* Past Presidents */}
            <Section padding="lg">
                <Container>
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-sookmyung-blue-900 mb-4">
                                역대 총동문회장
                            </h2>
                            <p className="text-gray-600">
                                숙명여자대학교 총동문회를 이끈 존경하는 회장님들
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                            {pastPresidents.map((president) => (
                                <Card
                                    key={president.id}
                                    variant="elevated"
                                    className="overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className={`aspect-square relative flex items-center justify-center ${president.image ? 'bg-gray-100' : 'bg-sky-300 border-4 border-sky-400'}`}>
                                        {president.image ? (
                                            <img
                                                src={president.image}
                                                alt={`${president.terms} ${president.name}`}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center text-white p-4">
                                                <p className="text-sm font-bold">사진 준비중</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 text-center">
                                        <p className="text-sm text-sookmyung-blue-600 font-medium mb-1">
                                            {president.terms}
                                        </p>
                                        <h3 className="text-lg font-bold text-sookmyung-blue-900 mb-1">
                                            {president.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {president.department} / {president.graduationYear}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Officers Link */}
                        <div className="text-center">
                            <a href="https://smal.or.kr/cmnt/45891/contentInfo.do" target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="lg" className="gap-2">
                                    제32대 동문회 임원진 보기
                                    <ExternalLink className="w-4 h-4" />
                                </Button>
                            </a>
                        </div>
                    </div>
                </Container>
            </Section>

            {/* Alumni Links */}
            <Section variant="secondary" padding="lg">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-sookmyung-blue-900 mb-4">
                                관련 링크
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <a
                                href="http://www.smal.or.kr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
                            >
                                <div className="w-12 h-12 bg-sookmyung-blue-100 rounded-lg flex items-center justify-center">
                                    <LinkIcon className="w-6 h-6 text-sookmyung-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sookmyung-blue-900">총동문회 기존 홈페이지</h3>
                                    <p className="text-sm text-gray-500">www.smal.or.kr</p>
                                </div>
                                <ExternalLink className="w-5 h-5 text-gray-400" />
                            </a>

                            <a
                                href="http://www.smwu120th.or.kr"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
                            >
                                <div className="w-12 h-12 bg-sookmyung-gold-100 rounded-lg flex items-center justify-center">
                                    <LinkIcon className="w-6 h-6 text-sookmyung-gold-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sookmyung-blue-900">120주년 전야제 홈페이지</h3>
                                    <p className="text-sm text-gray-500">www.smwu120th.or.kr</p>
                                </div>
                                <ExternalLink className="w-5 h-5 text-gray-400" />
                            </a>

                            <a
                                href="https://smal.or.kr/board/list.do?boardId=BBS_0000006"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sookmyung-blue-900">동문회보</h3>
                                    <p className="text-sm text-gray-500">숙명 동문의 소식</p>
                                </div>
                                <ExternalLink className="w-5 h-5 text-gray-400" />
                            </a>

                            <a
                                href="/directions"
                                className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
                            >
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sookmyung-blue-900">동문회 사무실 찾아오시는 길</h3>
                                    <p className="text-sm text-gray-500">약도 및 교통편 안내</p>
                                </div>
                                <ExternalLink className="w-5 h-5 text-gray-400" />
                            </a>
                        </div>
                    </div>
                </Container>
            </Section>

            {/* Location */}
            <Section padding="lg">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <Card variant="elevated" className="p-8">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-sookmyung-blue-900 mb-4">
                                        숙명여대 총동문회관 위치
                                    </h3>
                                    <div className="space-y-3 text-gray-700">
                                        <p className="flex items-start gap-2">
                                            <MapPin className="w-5 h-5 text-sookmyung-blue-600 mt-1" />
                                            <span>
                                                서울시 용산구 임정로 7, 숙명여자대학교 동문회관
                                            </span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="font-bold">사무실:</span>
                                            <span>02-712-1212</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="font-bold">FAX:</span>
                                            <span>02-701-6963</span>
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className="font-bold">Mail:</span>
                                            <span>smalumn@sookmyung.ac.kr</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="md:w-1/3">
                                    <div className="bg-gray-100 rounded-lg p-4 text-center">
                                        <div className="text-6xl mb-2">🏛️</div>
                                        <p className="text-sm text-gray-600">총동문회관</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </Container>
            </Section>
        </Layout>
    );
}
