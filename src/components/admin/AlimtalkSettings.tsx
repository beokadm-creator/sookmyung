import { useState, useEffect } from 'react';
import { db, functions } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { AlimtalkConfig, AlimtalkTemplateConfig } from '../../types';
import { Save, RefreshCw, ExternalLink } from 'lucide-react';

interface AlimtalkSettingsProps {
  user: any;
}

export default function AlimtalkSettings({ user }: AlimtalkSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingTemplates, setFetchingTemplates] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  
  const [config, setConfig] = useState<AlimtalkConfig>({
    appKey: '',
    secretKey: '',
    senderKey: '',
    templates: {
      verification: { templateId: '', enabled: true },
      welcome: { templateId: '', enabled: true },
      event: { templateId: '', enabled: true },
      payment: { templateId: '', enabled: true },
      cancel: { templateId: '', enabled: true },
      passwordReset: { templateId: '', enabled: true },
      vbankPending: { templateId: '', enabled: true },
    },
    updatedAt: serverTimestamp(),
    updatedBy: '',
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const docRef = doc(db, 'config', 'alimtalk');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as AlimtalkConfig;
        setConfig({
          ...data,
          templates: {
            verification: data.templates?.verification || { templateId: '', enabled: true },
            welcome: data.templates?.welcome || { templateId: '', enabled: true },
            event: data.templates?.event || { templateId: '', enabled: true },
            payment: data.templates?.payment || { templateId: '', enabled: true },
            cancel: data.templates?.cancel || { templateId: '', enabled: true },
            passwordReset: data.templates?.passwordReset || { templateId: '', enabled: true },
            vbankPending: data.templates?.vbankPending || { templateId: '', enabled: true },
            ...data.templates
          }
        });
      }
    } catch (error) {
      console.error('Error fetching Alimtalk config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.appKey.trim() || !config.secretKey.trim() || !config.senderKey.trim()) {
      alert('App Key, Secret Key, Sender Key를 모두 입력해주세요.');
      return;
    }

    if (config.senderKey.length !== 40) {
      alert('Sender Key는 40자리여야 합니다.');
      return;
    }

    setSaving(true);
    try {
      const trimmedConfig = {
        ...config,
        appKey: config.appKey.trim(),
        secretKey: config.secretKey.trim(),
        senderKey: config.senderKey.trim(),
        updatedAt: serverTimestamp(),
        updatedBy: user.email || user.uid,
      };

      await setDoc(doc(db, 'config', 'alimtalk'), trimmedConfig);
      setConfig(prev => ({
        ...prev,
        appKey: prev.appKey.trim(),
        secretKey: prev.secretKey.trim(),
        senderKey: prev.senderKey.trim(),
      }));
      alert('✅ 알림톡 설정이 저장되었습니다.\n\n설정이 적용되는데 약 1분 정도 소요될 수 있습니다.');
    } catch (error) {
      console.error('Error saving Alimtalk config:', error);
      alert('설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleFetchTemplates = async () => {
    if (!config.appKey || !config.secretKey || !config.senderKey) {
      alert('App Key, Secret Key, Sender Key를 모두 입력해주세요.');
      return;
    }

    setFetchingTemplates(true);
    try {
      const getAlimtalkTemplates = httpsCallable(functions, 'getAlimtalkTemplates');
      const result = await getAlimtalkTemplates({
        appKey: config.appKey.trim(),
        secretKey: config.secretKey.trim(),
        senderKey: config.senderKey.trim()
      });
      
      const data = result.data as { templates: any[] };
      if (data.templates && Array.isArray(data.templates)) {
        setAvailableTemplates(data.templates);
        alert(`템플릿 ${data.templates.length}개를 불러왔습니다.`);
      } else {
        setAvailableTemplates([]);
        alert('불러온 템플릿이 없습니다.');
      }
    } catch (error: any) {
      console.error('Error fetching templates:', error);
      alert(`템플릿 불러오기 실패: ${error.message}`);
    } finally {
      setFetchingTemplates(false);
    }
  };

  const handleTemplateChange = (key: string, field: 'templateId' | 'enabled', value: any) => {
    setConfig(prev => ({
      ...prev,
      templates: {
        ...prev.templates,
        [key]: {
          ...prev.templates[key],
          [field]: value
        }
      }
    }));
  };

  if (loading) return <div className="p-8 text-center">로딩 중...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">NHN Cloud 알림톡 설정</h2>
          <a 
            href="https://console.ncloud.com/alimtalk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center mt-1"
          >
            NHN Cloud Console <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? '저장 중...' : '설정 저장'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">API 키 설정</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">App Key</label>
            <input
              type="text"
              value={config.appKey}
              onChange={(e) => setConfig({ ...config, appKey: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="NHN Cloud App Key"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
            <input
              type="password"
              value={config.secretKey}
              onChange={(e) => setConfig({ ...config, secretKey: e.target.value })}
              className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="NHN Cloud Secret Key"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Sender Key (발신 프로필 키)</label>
            <input
              type="text"
              value={config.senderKey}
              onChange={(e) => setConfig({ ...config, senderKey: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                config.senderKey && config.senderKey.length !== 40 ? 'border-red-500 bg-red-50' : ''
              }`}
              placeholder="40자리 발신 프로필 키"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">40자리 발신 프로필 키를 입력해주세요</p>
              <button
                onClick={handleFetchTemplates}
                disabled={fetchingTemplates || !config.appKey || !config.secretKey || !config.senderKey}
                className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${fetchingTemplates ? 'animate-spin' : ''}`} />
                {fetchingTemplates ? '불러오는 중...' : '템플릿 목록 불러오기'}
              </button>
            </div>
            {config.senderKey && config.senderKey.length !== 40 && (
              <p className="text-xs text-red-600 mt-1 font-bold">
                Sender Key는 정확히 40자리여야 합니다. 현재 {config.senderKey.length}자리입니다.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">템플릿 설정</h3>
        <div className="space-y-6">
          {[
            { key: 'verification', label: '인증번호 발송', desc: '회원가입 시 전화번호 인증을 위해 발송됩니다. 변수: #{code}' },
            { key: 'welcome', label: '신청 완료 (접수)', desc: '신청이 접수되었을 때 발송됩니다. (결제 전) 변수: #{name}, #{receiptNumber}' },
            { key: 'payment', label: '환불접수', desc: '실제 환불 접수(취소 요청) 시 발송됩니다. 변수: #{name}, #{date}, #{amount}' },
            { key: 'cancel', label: '환불완료', desc: '관리자에서 환불을 완료해서 취소가 될때 발송됩니다. 변수: #{name}, #{amount}' },
            { key: 'passwordReset', label: '비밀번호 찾기', desc: '비밀번호 찾기 요청 시 발송됩니다. 변수: #{password}' },
            { key: 'vbankPending', label: '무통장입금 신청', desc: '무통장입금 신청 시 발송됩니다. 변수: #{name}, #{amount}' },
          ].map((template) => (
            <div key={template.key} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{template.label}</h4>
                  <p className="text-sm text-gray-500">{template.desc}</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.templates[template.key]?.enabled}
                    onChange={(e) => handleTemplateChange(template.key, 'enabled', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">사용</span>
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">템플릿 코드 (Template Code)</label>
                {availableTemplates.length > 0 ? (
                  <select
                    value={config.templates[template.key]?.templateId}
                    onChange={(e) => handleTemplateChange(template.key, 'templateId', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">템플릿 선택</option>
                    {availableTemplates.map((t: any) => (
                      <option key={t.templateCode} value={t.templateCode}>
                        {t.templateName} ({t.templateCode})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={config.templates[template.key]?.templateId}
                    onChange={(e) => handleTemplateChange(template.key, 'templateId', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`${template.label} 템플릿 코드 입력`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
