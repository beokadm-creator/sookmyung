import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { CheckCircle, MapPin, Bus, Car, ArrowRight } from 'lucide-react';

export default function Application() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-4 md:py-16">
        <div className="max-w-2xl w-full mx-auto space-y-4 md:space-y-6">

          {/* 마감 안내 카드 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-blue-900 py-6 px-5 text-center md:py-8 md:px-8">
              <p className="text-blue-200 text-xs font-medium tracking-widest uppercase mb-1.5 md:text-sm md:mb-2">
                숙명여자대학교 총동문회
              </p>
              <h1 className="text-lg font-bold text-white leading-snug md:text-2xl">
                창학 120주년 기념 전야제
              </h1>
            </div>

            <div className="px-5 py-8 text-center space-y-6 md:px-8 md:py-12 md:space-y-8">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center md:w-20 md:h-20">
                  <CheckCircle className="w-8 h-8 text-blue-700 md:w-10 md:h-10" />
                </div>
              </div>

              <div className="space-y-2 md:space-y-3">
                <h2 className="text-xl font-bold text-gray-900 md:text-3xl">
                  참가 신청이 마감되었습니다
                </h2>
                <p className="text-sm text-gray-500 md:text-base">
                  동문 여러분의 뜨거운 성원에 힘입어 조기 마감되었습니다.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-5 text-left space-y-3 text-gray-700 leading-relaxed text-sm md:px-6 md:py-6 md:space-y-4 md:text-base">
                <p>
                  이번 창학 120주년 기념 전야제에 보내주신 깊은 관심과 뜨거운 성원에 진심으로 감사드립니다.
                </p>
                <p>
                  많은 동문 여러분의 참여 신청 덕분에 예정보다 이른 시일 내에 모집이 마감되었습니다.
                </p>
                <p>
                  소중한 자리를 빛내주실 동문 여러분을 맞이할 수 있도록 최선을 다해 준비하겠습니다.
                </p>
                <p className="font-semibold text-blue-900">
                  행사 당일, 반갑게 뵙겠습니다.
                </p>
              </div>

              <div className="text-xs text-gray-400 pt-1 md:text-sm md:pt-2">
                문의사항이 있으시면 총동문회 사무국&nbsp;
                <a href="tel:027121212" className="font-medium text-gray-600 underline underline-offset-2">
                  02-712-1212
                </a>
                &nbsp;으로 연락 주시기 바랍니다.
              </div>
            </div>
          </div>

          {/* 오시는 길 안내 카드 */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 md:px-8 md:py-6">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 md:text-lg">
                <MapPin className="w-4 h-4 text-blue-700 shrink-0 md:w-5 md:h-5" />
                참가 신청을 완료하신 분들께
              </h2>
              <p className="text-xs text-gray-500 mt-1 md:text-sm">행사 장소 및 오시는 길을 안내해 드립니다.</p>
            </div>

            <div className="px-5 py-4 space-y-3 md:px-8 md:py-6 md:space-y-5">
              {/* 장소 */}
              <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl md:gap-4 md:p-4">
                <MapPin className="w-4 h-4 text-blue-700 mt-0.5 shrink-0 md:w-5 md:h-5" />
                <div>
                  <p className="font-bold text-gray-900 text-sm md:text-base">그랜드 인터컨티넨탈 서울 파르나스</p>
                  <p className="text-xs text-gray-600 mt-0.5 md:text-sm">5층 그랜드볼룸</p>
                  <p className="text-xs text-gray-500 mt-0.5 md:text-sm">서울특별시 강남구 테헤란로 521</p>
                </div>
              </div>

              {/* 지하철 */}
              <div className="flex items-start gap-3 p-3.5 bg-gray-50 rounded-xl md:gap-4 md:p-4">
                <Bus className="w-4 h-4 text-green-600 mt-0.5 shrink-0 md:w-5 md:h-5" />
                <div className="space-y-1.5">
                  <p className="font-bold text-gray-900 text-sm md:text-base">지하철</p>
                  <p className="text-xs text-gray-700 leading-relaxed md:text-sm">
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-1.5 py-0.5 rounded mr-1">2호선</span>
                    삼성역 5·6번 출구 — 파르나스몰 지하 입구 연결 (도보 약 1분)
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed md:text-sm">
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-1.5 py-0.5 rounded mr-1">9호선</span>
                    봉은사역 7번 출구 — 도보 약 10분
                  </p>
                </div>
              </div>

              {/* 주차 */}
              <div className="flex items-start gap-3 p-3.5 bg-blue-50 rounded-xl border border-blue-100 md:gap-4 md:p-4">
                <Car className="w-4 h-4 text-blue-700 mt-0.5 shrink-0 md:w-5 md:h-5" />
                <div>
                  <p className="font-bold text-blue-900 text-sm md:text-base">주차 안내</p>
                  <p className="text-xs text-blue-800 mt-0.5 leading-relaxed md:text-sm">
                    행사 당일 참가자 분들께 <span className="underline underline-offset-2">무료 주차 티켓</span>을 지원해 드립니다.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">호텔 지하 2층 ~ 지하 4층 (B2 - B4)</p>
                </div>
              </div>

              {/* 상세 안내 링크 */}
              <Link
                to="/directions"
                className="flex items-center justify-between w-full bg-blue-900 active:bg-blue-800 hover:bg-blue-800 text-white px-5 py-4 rounded-xl font-bold transition-colors group gap-3 min-h-[52px]"
              >
                <span className="text-sm leading-snug md:text-base">
                  오시는 길 상세 안내
                  <span className="block text-blue-300 text-xs font-normal mt-0.5 md:inline md:ml-1 md:text-sm md:text-blue-200">
                    대중교통 · 공항버스 · 자가용
                  </span>
                </span>
                <ArrowRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
