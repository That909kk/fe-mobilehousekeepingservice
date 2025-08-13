import React from 'react';
import ReactCountryFlag from 'react-country-flag';
import { useLanguage } from '../../shared/hooks/useLanguage';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <div className="flex items-center">
      <button
        onClick={toggleLanguage}
        className="px-2 py-1.5 rounded-md transition-all duration-300 transform hover:scale-105 flex items-center bg-transparent hover:bg-white/10"
      >
        {language === 'vi' ? (
          <ReactCountryFlag countryCode="GB" svg style={{ width: '28px', height: '20px' }} />
        ) : (
          <ReactCountryFlag countryCode="VN" svg style={{ width: '28px', height: '20px' }} />
        )}
      </button>
    </div>
  );
};

export default LanguageSwitcher;
