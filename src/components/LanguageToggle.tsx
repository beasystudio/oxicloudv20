import { useLanguage } from '@/i18n/LanguageContext';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  variant?: 'light' | 'dark';
}

export function LanguageToggle({ variant = 'light' }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn(
      "flex items-center gap-0.5 rounded-full p-0.5 border",
      variant === 'light'
        ? "border-border bg-muted/50"
        : "border-white/10 bg-white/5"
    )}>
      <button
        onClick={() => setLanguage('nl')}
        className={cn(
          "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200",
          variant === 'light'
            ? language === 'nl'
              ? 'bg-foreground/10 text-foreground'
              : 'text-muted-foreground hover:text-foreground'
            : language === 'nl'
              ? 'bg-white/15 text-white'
              : 'text-white/35 hover:text-white/60'
        )}
      >
        NL
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200",
          variant === 'light'
            ? language === 'en'
              ? 'bg-foreground/10 text-foreground'
              : 'text-muted-foreground hover:text-foreground'
            : language === 'en'
              ? 'bg-white/15 text-white'
              : 'text-white/35 hover:text-white/60'
        )}
      >
        EN
      </button>
    </div>
  );
}
