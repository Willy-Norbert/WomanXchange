
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage: Language = language === 'en' ? 'rw' : 'en';
    setLanguage(newLanguage);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center space-x-2 border-gray-300 hover:border-purple-400"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">
        {language === 'en' ? 'Kinyarwanda' : 'English'}
      </span>
    </Button>
  );
};

export default LanguageSwitcher;
