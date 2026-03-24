import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">숙명여자대학교 창학120주년 기념 전야제</h3>
            <p className="text-gray-400 text-sm">
              창학 120주년 기념 전야제 웹사이트
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">빠른 링크</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  홈
                </Link>
              </li>
              <li>
                <Link to="/policy?tab=service" className="hover:text-white transition-colors">
                  이용약관
                </Link>
              </li>
              <li>
                <Link to="/policy?tab=privacy" className="hover:text-white transition-colors">
                  개인정보처리방침
                </Link>
              </li>
              <li>
                <Link to="/policy?tab=refund" className="hover:text-white transition-colors">
                  환불정책
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">문의하기</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>사무실: 02-712-1212</li>
              <li>FAX: 02-701-6963</li>
              <li>e-mail: smalumn@sookmyung.ac.kr</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="text-xs text-gray-500 space-y-2">
            <p>
              <strong className="text-gray-400">사업자등록번호:</strong> 514-80-18980
            </p>
            <p>
              <strong className="text-gray-400">대표자명:</strong> 김경희
            </p>
            <p>
              <strong className="text-gray-400">상호명:</strong> 숙명여자대학교 총동문회
            </p>
            <p>
              <strong className="text-gray-400">주소:</strong> 서울특별시 용산구 임정로 7, 2층 (효창동, 숙명여자대학교 동문회관)
            </p>
            <p>
              <strong className="text-gray-400">개인정보보호책임자:</strong> (주)홍커뮤니케이션 (chlim@hongcomm.kr)
            </p>
          </div>
          <p className="text-xs text-gray-600 mt-4">
            © {new Date().getFullYear()} 숙명여자대학교 총동문회. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
