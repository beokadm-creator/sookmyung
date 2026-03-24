import { useState } from 'react';
import Layout from '../components/Layout';
import { Container } from '../components/layout/Container';
import { Section } from '../components/layout/Section';
import { MapPin, Bus, Car, Plane, Building2, Phone, Clock, CreditCard, Navigation, ChevronRight } from 'lucide-react';

export default function Directions() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 'location', label: '위치 안내', icon: MapPin },
    { id: 'public', label: '대중교통', icon: Bus },
    { id: 'car', label: '자가용', icon: Car },
    { id: 'airport', label: '공항버스', icon: Plane },
    { id: 'hotel', label: '호텔 내 이동', icon: Building2 },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative bg-blue-900 text-white py-12 md:py-16">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1565514020176-db93189a744d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
            alt="Grand InterContinental Seoul Parnas"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <Container className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">오시는 길</h1>
          <p className="text-lg md:text-xl text-blue-100 font-light leading-relaxed">
            그랜드 인터컨티넨탈 서울 파르나스로 오시는 가장 편안한 방법을 안내해 드립니다.
          </p>
        </Container>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <Container>
          <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className={`flex items-center justify-center gap-2 px-6 py-5 whitespace-nowrap transition-all duration-300 border-b-2 font-medium text-sm md:text-base flex-1 min-w-[120px]
                  ${activeTab === index
                    ? 'border-blue-900 text-blue-900 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-blue-700 hover:bg-gray-50'
                  }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === index ? 'text-blue-900' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </Container>
      </div>

      {/* Content Section */}
      <div className="bg-gray-50 min-h-[600px]">
        {/* Tab 1: Location */}
        {activeTab === 0 && (
          <div className="animate-fade-in">
            <div className="w-full h-[400px] md:h-[500px] bg-gray-200 relative">
              <iframe
                title="Grand InterContinental Seoul Parnas Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3164.8467479708654!2d127.0588633153102!3d37.51082997980837!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca46b3240e1b5%3A0xd653916962f9281e!2sGrand%20InterContinental%20Seoul%20Parnas!5e0!3m2!1sen!2skr!4v1620000000000!5m2!1sen!2skr"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                className="absolute inset-0"
              />
            </div>
            <Section padding="md">
              <Container>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 md:p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">그랜드 인터컨티넨탈 서울 파르나스 5층 그랜드볼룸</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Address</h3>
                          <p className="text-gray-700 text-lg leading-relaxed">
                            서울특별시 강남구 테헤란로 521, 5층 그랜드볼룸<br />
                            (우편번호 06164)
                          </p>
                          <p className="text-gray-500 mt-1">지번: 서울특별시 강남구 삼성동 159-8</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Contact</h3>
                          <div className="flex items-center gap-2 text-gray-700 text-lg">
                            <Phone className="w-5 h-5 text-blue-900" />
                            <a href="tel:02-555-5656" className="hover:text-blue-700 transition-colors">02-555-5656</a>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700 text-lg mt-2">
                            <span className="font-bold w-5 text-center">F</span>
                            <span>02-559-7990</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Email</h3>
                          <a href="mailto:grandic@parnas.co.kr" className="text-gray-700 text-lg hover:text-blue-700 border-b border-gray-300 hover:border-blue-700 pb-0.5 transition-all">
                            grandic@parnas.co.kr
                          </a>
                        </div>

                        <div>
                          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2">Nearby Landmarks</h3>
                          <ul className="text-gray-700 space-y-1">
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-900"></div>코엑스 컨벤션 센터 (COEX)</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-900"></div>파르나스몰 / 스타필드 코엑스몰</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-900"></div>현대백화점 무역센터점</li>
                            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-900"></div>도심공항터미널 (CALT)</li>
                          </ul>
                        </div>

                        {/* Parking Info */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Car className="w-4 h-4" /> Parking
                          </h3>
                          <p className="text-blue-800 font-medium whitespace-nowrap">
                            행사 당일 참가자 분들께 <span className="underline decoration-2 underline-offset-2">무료 주차 티켓</span>을 지원해 드립니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Container>
            </Section>
          </div>
        )}

        {/* Tab 2: Public Transport */}
        {activeTab === 1 && (
          <Section padding="md">
            <Container>
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center shrink-0">
                      <Navigation className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">지하철 이용 시</h2>
                  </div>

                  <div className="space-y-8 pl-4 md:pl-16 border-l-2 border-gray-100 ml-6 md:ml-6">
                    <div className="relative">
                      <div className="absolute -left-[25px] md:-left-[73px] top-1 w-4 h-4 rounded-full bg-green-600 border-4 border-white shadow-sm"></div>
                      <h3 className="text-xl font-bold text-green-600 mb-2">2호선 삼성역</h3>
                      <p className="text-gray-700 leading-relaxed mb-3">
                        <span className="font-bold text-gray-900">5번 출구</span> 또는 <span className="font-bold text-gray-900">6번 출구</span>와 연결된 파르나스몰 지하 입구를 통해 호텔 로비로 이동하실 수 있습니다. (도보 약 1분)
                      </p>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[25px] md:-left-[73px] top-1 w-4 h-4 rounded-full bg-yellow-600 border-4 border-white shadow-sm"></div>
                      <h3 className="text-xl font-bold text-yellow-600 mb-2">9호선 봉은사역</h3>
                      <p className="text-gray-700 leading-relaxed">
                        <span className="font-bold text-gray-900">7번 출구</span>로 나오신 후 코엑스몰을 통해 이동하시거나, 도보로 약 10분 정도 소요됩니다.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0">
                      <Bus className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">버스 이용 시</h2>
                  </div>

                  {/* Parking Info */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Car className="w-4 h-4" /> Parking
                    </h3>
                    <p className="text-blue-800 font-medium whitespace-nowrap">
                      행사 당일 참가자 분들께 <span className="underline decoration-2 underline-offset-2">무료 주차 티켓</span>을 지원해 드립니다.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        삼성역 5번 출구 / 한국무역센터 정류장
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1 font-medium text-blue-700">간선버스 (Blue)</div>
                        <div className="md:col-span-3 text-gray-700">146, 333, 341, 360, 740, N13(심야), N61(심야)</div>

                        <div className="md:col-span-1 font-medium text-green-600">지선버스 (Green)</div>
                        <div className="md:col-span-3 text-gray-700">3411, 4434</div>

                        <div className="md:col-span-1 font-medium text-red-600">광역버스 (Red)</div>
                        <div className="md:col-span-3 text-gray-700">1100, 1700, 2000, 7007, 8001, 9407, 9414</div>

                        <div className="md:col-span-1 font-medium text-yellow-500">순환버스 (Yellow)</div>
                        <div className="md:col-span-3 text-gray-700">41</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 text-right">* 노선 정보는 운수사의 사정에 따라 변경될 수 있습니다.</p>
                  </div>
                </div>
              </div>
            </Container>
          </Section>
        )}

        {/* Tab 3: Car */}
        {activeTab === 2 && (
          <Section padding="lg">
            <Container>
              <div className="max-w-6xl mx-auto space-y-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center shrink-0">
                      <Car className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">주차 안내</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">주차장 위치</h3>
                        <p className="text-gray-600">호텔 지하 2층 ~ 지하 4층 (B2 - B4)</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">주차 요금</h3>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                          <p className="text-blue-800 font-bold text-center flex items-center justify-center gap-2 flex-wrap">
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full shrink-0">안내</span>
                            <span>행사 당일 참가자 분들께 무료 주차 티켓을 지원해 드립니다.</span>
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm md:text-base">
                          <div className="flex justify-between">
                            <span className="text-gray-600">최초 30분</span>
                            <span className="font-bold text-gray-900">4,500원</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">추가 10분당</span>
                            <span className="font-bold text-gray-900">1,500원</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="text-gray-600">1일 최대</span>
                            <span className="font-bold text-gray-900">70,000원</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">발렛 파킹 (Valet Parking)</h3>
                        <p className="text-gray-600 mb-2">호텔 1층 정문 (Main Entrance)</p>
                        <div className="flex items-center gap-2 text-blue-900 font-bold">
                          <CreditCard className="w-4 h-4" />
                          30,000원 / 1회
                        </div>
                        <p className="text-xs text-gray-500 mt-2 leading-tight">
                          * 제휴 신용카드 소지 고객 무료 이용 가능<br />
                          (이용 전 카드사 확인 필요)
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">투숙객 및 행사 참가</h3>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          <li>객실 투숙객: 객실 당 1대 무료</li>
                          <li>레스토랑/연회: 업장별 규정에 따른 무료 주차</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </Section>
        )}

        {/* Tab 4: Airport Bus */}
        {activeTab === 3 && (
          <Section padding="lg">
            <Container>
              <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-sky-600 text-white rounded-full flex items-center justify-center shrink-0">
                        <Plane className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">KAL 리무진 (6703번)</h2>
                        <p className="text-gray-500">인천국제공항 ↔ 그랜드 인터컨티넨탈 서울 파르나스</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">성인 18,000원</span>
                      <span className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-600">소아 12,000원</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* To Hotel */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-xs">IN</span>
                        공항 <ChevronRight className="w-4 h-4" /> 호텔
                      </h3>
                      <div className="bg-gray-50 p-5 rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">제2여객터미널 (T2)</span>
                          <span className="font-bold">B1층 19번 승차장</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">제1여객터미널 (T1)</span>
                          <span className="font-bold">1층 3B/4A 승차장</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200 mt-2">
                          <p className="text-sm text-gray-500">첫차 07:00 / 막차 22:50 (배차 30~60분)</p>
                        </div>
                      </div>
                    </div>

                    {/* To Airport */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-sky-600 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs">OUT</span>
                        호텔 <ChevronRight className="w-4 h-4" /> 공항
                      </h3>
                      <div className="bg-gray-50 p-5 rounded-lg space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">승차 장소</span>
                          <span className="font-bold">호텔 정문 앞</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200 mt-2">
                          <p className="text-sm text-gray-500">첫차 05:25 / 막차 18:20 (배차 30~60분)</p>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          * 소요시간: 약 80~100분 (교통 상황에 따라 변동)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 rounded-lg flex flex-col gap-4">
                    <div className="flex gap-3 items-start">
                      <div className="shrink-0 text-blue-600 mt-1">ⓘ</div>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        운행 시간표는 운수사 사정에 따라 예고 없이 변경될 수 있습니다.
                        정확한 시간표는 <a href="https://www.klimousine.com" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-blue-900">K-Limousine 공식 홈페이지</a>를 확인해주시기 바랍니다.
                      </p>
                    </div>

                    {/* Parking Info */}
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Car className="w-4 h-4" /> Parking
                      </h3>
                      <p className="text-blue-800 font-medium whitespace-nowrap">
                        행사 당일 참가자 분들께 <span className="underline decoration-2 underline-offset-2">무료 주차 티켓</span>을 지원해 드립니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </Section>
        )}

        {/* Tab 5: Hotel Transport */}
        {activeTab === 4 && (
          <Section padding="md">
            <Container>
              <div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">호텔 연결 안내 (Connected Info)</h2>
                  </div>

                  {/* Parking Info */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-8">
                    <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Car className="w-4 h-4" /> Parking
                    </h3>
                    <p className="text-blue-800 font-medium whitespace-nowrap">
                      행사 당일 참가자 분들께 <span className="underline decoration-2 underline-offset-2">무료 주차 티켓</span>을 지원해 드립니다.
                    </p>
                  </div>

                  <div className="space-y-10">
                    {/* Parnas Mall */}
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">파르나스몰 (Parnas Mall)</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          호텔 지하 1층 로비는 파르나스몰과 직접 연결되어 있습니다.
                          프리미엄 다이닝, 패션, 뷰티 브랜드가 입점해 있는 파르나스몰을 통해 삼성역 및 현대백화점으로 편리하게 이동하실 수 있습니다.
                        </p>
                        <div className="flex gap-2 text-sm text-purple-700 font-medium bg-purple-50 px-3 py-2 rounded-lg inline-block">
                          호텔 B1층 ↔ 파르나스몰 ↔ 삼성역 (5, 6번 출구)
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100"></div>

                    {/* COEX Mall */}
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">스타필드 코엑스몰 (Starfield COEX Mall)</h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          아시아 최대 규모의 지하 쇼핑 공간인 코엑스몰과 연결되어 있습니다.
                          별마당 도서관, 아쿠아리움, 영화관 등 다양한 문화 시설을 즐기실 수 있습니다.
                        </p>
                        <div className="flex gap-2 text-sm text-purple-700 font-medium bg-purple-50 px-3 py-2 rounded-lg inline-block">
                          파르나스몰을 통해 도보 5분 소요
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </Section>
        )}
      </div>
    </Layout>
  );
}