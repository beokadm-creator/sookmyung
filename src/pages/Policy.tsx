import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import Layout from '../components/Layout';
import { SiteConfig } from '../types';

type TabType = 'service' | 'privacy' | 'third_party' | 'marketing' | 'refund' | 'contact';

export default function Policy() {
  const [searchParams] = useSearchParams();
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tabParam = searchParams.get('tab');
    return (tabParam === 'service' || tabParam === 'privacy' || tabParam === 'third_party' || 
            tabParam === 'marketing' || tabParam === 'refund' || tabParam === 'contact')
      ? tabParam as TabType
      : 'service';
  });

  const tabs: { id: TabType; label: string }[] = [
    { id: 'service', label: '이용약관' },
    { id: 'privacy', label: '개인정보처리방침' },
    { id: 'third_party', label: '제3자 정보제공' },
    { id: 'marketing', label: '마케팅 동의' },
    { id: 'refund', label: '환불정책' },
    { id: 'contact', label: '문의처' },
  ];

  useEffect(() => {
    const loadSiteConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'settings', 'site_config'));
        if (configDoc.exists()) {
          setSiteConfig(configDoc.data() as SiteConfig);
        }
      } catch (error) {
        console.error('Failed to load site config:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSiteConfig();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-gray-600">약관을 불러오는 중입니다...</p>
        </div>
      </Layout>
    );
  }

  if (!siteConfig) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-red-600">약관을 불러오지 못했습니다. 관리자에게 문의해주세요.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-900">
          약관 및 정책
        </h1>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="flex flex-wrap border-b">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] py-4 px-6 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-8">
              {activeTab === 'service' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-blue-800">이용약관</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {siteConfig.terms.service_terms || '이용약관이 없습니다.'}
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-blue-800">개인정보처리방침</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {siteConfig.terms.privacy_policy || '개인정보처리방침이 없습니다.'}
                  </div>
                </div>
              )}

              {activeTab === 'third_party' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-blue-800">제3자 정보제공 동의</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {siteConfig.terms.third_party_provision || '제3자 정보제공 동의 내용이 없습니다.'}
                  </div>
                </div>
              )}

              {activeTab === 'marketing' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-blue-800">정보성 메시지 수신동의</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {siteConfig.terms.marketing_consent || '정보성 메시지 수신동의 내용이 없습니다.'}
                  </div>
                </div>
              )}

              {activeTab === 'refund' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-blue-800">환불정책</h2>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {siteConfig.terms.refund_policy || '환불정책이 없습니다.'}
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-blue-800">문의처</h2>
                  <div className="space-y-3 text-gray-700">
                    <p><strong>사업자등록번호:</strong> 514-80-18980</p>
                    <p><strong>대표자명:</strong> 김경희</p>
                    <p><strong>상호명:</strong> 숙명여자대학교 총동문회</p>
                    <p><strong>주소:</strong> 서울특별시 용산구 임정로 7, 2층 (효창동, 숙명여자대학교 동문회관)</p>
                    <p><strong>전화:</strong> 02-712-1212</p>
                    <p><strong>이메일:</strong> smalumn@sookmyung.ac.kr</p>
                    <p className="text-sm text-gray-500 mt-4">© 2026 숙명여자대학교 총동문회. All rights reserved.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
