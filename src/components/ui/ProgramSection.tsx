import { MapPin } from 'lucide-react';

export default function ProgramSection() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6">Event Program</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            숙명여자대학교 창학 120주년 기념 전야제의 주요 식순을 안내해 드립니다.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-12 space-y-8">
            {/* Item 1 */}
            <div className="flex flex-col md:flex-row gap-4 md:items-start border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                <div className="min-w-[80px] text-xl font-bold text-blue-600">●</div>
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">개식선언</h3>
                </div>
            </div>

            {/* Item 2 */}
            <div className="flex flex-col md:flex-row gap-4 md:items-start border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                <div className="min-w-[80px] text-xl font-bold text-blue-600">●</div>
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">기념식</h3>
                    <ul className="space-y-3 text-gray-600 ml-4 list-disc marker:text-blue-400">
                        <li className="text-lg">총동문회장 기념사</li>
                        <li className="text-lg">총장 축사</li>
                        <li className="text-lg">숙명발전위원장 축사</li>
                    </ul>
                </div>
            </div>

            {/* Item 3 */}
            <div className="flex flex-col md:flex-row gap-4 md:items-start border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                <div className="min-w-[80px] text-xl font-bold text-blue-600">●</div>
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">만찬</h3>
                    <p className="text-slate-600 text-lg">동문 네트워킹 및 만찬</p>
                </div>
            </div>

            {/* Item 4 */}
            <div className="flex flex-col md:flex-row gap-4 md:items-start">
                <div className="min-w-[80px] text-xl font-bold text-blue-600">●</div>
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">축하공연</h3>
                    <p className="text-slate-600 text-lg">특별 축하 공연</p>
                </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 text-center border-t border-blue-100">
            <div className="flex items-center justify-center gap-2 text-blue-800 font-medium">
              <MapPin size={18} />
              <span>장소: 그랜드인터컨티넨탈 서울 파르나스 그랜드볼룸(5F)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
