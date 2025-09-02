import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  onAgree: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ visible, onClose, onAgree }) => {
  const { language } = useLanguage();
  const [termsData, setTermsData] = useState<{
    title: string;
    sections: Array<{ title: string; content: string }>;
    lastUpdated?: string;
  } | null>(null);

  useEffect(() => {
    const loadTermsData = async () => {
      try {
        const response = await import('../../static-data/terms_conditions.json');
        setTermsData(response.default[language] || response.default.vi);
      } catch (error) {
        console.error('Failed to load terms data:', error);
        setTermsData(null);
      }
    };

    if (visible) {
      loadTermsData();
    }
  }, [language, visible]);

  if (!visible) return null;

  const handleAgree = () => {
    onAgree();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {termsData?.title || 'Điều khoản sử dụng'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="prose prose-sm max-w-none">
            {termsData?.lastUpdated && (
              <p className="text-sm text-gray-500 mb-4">
                {language === 'vi' ? 'Cập nhật lần cuối: ' : 'Last updated: '}{termsData.lastUpdated}
              </p>
            )}
            
            {termsData?.sections ? (
              <div className="space-y-6">
                {termsData.sections.map((section, index: number) => (
                  <div key={index}>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      {section.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 text-gray-700">
                <h3 className="text-lg font-medium">1. Chấp nhận điều khoản</h3>
                <p>Bằng việc sử dụng dịch vụ, bạn đồng ý tuân thủ các điều khoản và điều kiện này.</p>
                
                <h3 className="text-lg font-medium">2. Sử dụng dịch vụ</h3>
                <p>Bạn cam kết sử dụng dịch vụ một cách hợp pháp và không vi phạm quyền của người khác.</p>
                
                <h3 className="text-lg font-medium">3. Bảo mật thông tin</h3>
                <p>Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn theo chính sách bảo mật.</p>
                
                <h3 className="text-lg font-medium">4. Trách nhiệm</h3>
                <p>Bạn chịu trách nhiệm về tất cả hoạt động diễn ra dưới tài khoản của mình.</p>
                
                <h3 className="text-lg font-medium">5. Thay đổi điều khoản</h3>
                <p>Chúng tôi có quyền thay đổi các điều khoản này và sẽ thông báo trước cho người dùng.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {language === 'vi' ? 'Đóng' : 'Close'}
          </button>
          <button
            onClick={handleAgree}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {language === 'vi' ? 'Đồng ý' : 'Agree'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
