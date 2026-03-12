import { useLanguage } from '@/i18n/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-0.5">
      <button
        onClick={() => setLanguage('nl')}
        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 ${
          language === 'nl'
            ? 'bg-white/15 text-white'
            : 'text-white/35 hover:text-white/60'
        }`}
      >
        NL
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 ${
          language === 'en'
            ? 'bg-white/15 text-white'
            : 'text-white/35 hover:text-white/60'
        }`}
      >
        EN
      </button>
    </div>
  );
}
