import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Menu, Close, ChevronDown, Building, Shield } from '@/components/icons/OxiIcons';
import { useLanguage, Language } from '@/i18n/LanguageContext';

type NavContext = 'homepage' | 'solution' | 'subpage';

export const LandingNavbar = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const solutionTimeout = useRef<ReturnType<typeof setTimeout>>();
  const langTimeout = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();

  const navItems = [
    { label: t('nav.solution'), path: '#', key: 'solution' },
    { label: t('nav.about'), path: '/about', key: 'about' },
    { label: t('nav.contact'), path: '/contact', key: 'contact' },
  ];

  const solutionDropdown = [
    { label: t('nav.forArchitects'), path: '/for-architects', icon: Building, desc: t('nav.forArchitectsDesc') },
    { label: t('nav.forGovernments'), path: '/for-authorities', icon: Shield, desc: t('nav.forGovernmentsDesc') },
  ];

  const getContext = (): NavContext => {
    if (location.pathname === '/') return 'homepage';
    if (location.pathname === '/for-architects') return 'solution';
    return 'subpage';
  };
  const context = getContext();

  const [scrollOpacity, setScrollOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 20);
      const fadeStart = 200;
      const fadeEnd = 600;
      if (y <= fadeStart) setScrollOpacity(1);
      else if (y >= fadeEnd) setScrollOpacity(0);
      else setScrollOpacity(1 - (y - fadeStart) / (fadeEnd - fadeStart));
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;
  const isHomepage = false;

  const handleSolutionEnter = () => { clearTimeout(solutionTimeout.current); setSolutionOpen(true); };
  const handleSolutionLeave = () => { solutionTimeout.current = setTimeout(() => setSolutionOpen(false), 150); };
  const handleLangEnter = () => { clearTimeout(langTimeout.current); setLangOpen(true); };
  const handleLangLeave = () => { langTimeout.current = setTimeout(() => setLangOpen(false), 150); };

  const navBg = 'bg-background shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)]';

  const langOptions: { code: Language; label: string; short: string }[] = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'nl', label: 'Nederlands', short: 'NL' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: scrollOpacity }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-4 left-4 right-4 z-50 transition-all duration-500',
          isScrolled && 'top-2 left-2 right-2',
          scrollOpacity === 0 && 'pointer-events-none'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={cn(
          'mx-auto max-w-7xl rounded-full border border-white/10 transition-all duration-500',
          isScrolled ? 'py-2 px-5' : 'py-3 px-6',
          navBg
        )}>
          <div className="flex items-center justify-between gap-8">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-10">
              <Link to="/" className="text-lg font-semibold tracking-tight transition-colors duration-300 hover:text-primary text-foreground">
                OxiCloud
              </Link>

              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center gap-1 relative">
                {navItems.map((item) => {
                  const isSolution = item.key === 'solution';
                  const isItemHovered = hoveredItem === item.key;
                  const isItemActive = isActive(item.path);

                  return (
                    <div
                      key={item.key}
                      className="relative"
                      onMouseEnter={() => { setHoveredItem(item.key); if (isSolution) handleSolutionEnter(); }}
                      onMouseLeave={() => { setHoveredItem(null); if (isSolution) handleSolutionLeave(); }}
                    >
                      {isItemHovered && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full bg-foreground/[0.06]"
                          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                        />
                      )}

                      {isSolution ? (
                        <button
                          type="button"
                          onClick={() => setSolutionOpen(!solutionOpen)}
                          className={cn(
                            'relative flex items-center gap-1 text-sm tracking-wide transition-all duration-200 px-4 py-2 rounded-full cursor-pointer',
                            isItemActive ? 'text-primary font-medium' :
                              cn('text-foreground/80 hover:text-foreground', hoveredItem && !isItemHovered ? 'opacity-50' : 'opacity-100')
                          )}
                        >
                          {item.label}
                          <motion.span animate={{ rotate: solutionOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown size={14} className="ml-0.5" />
                          </motion.span>
                        </button>
                      ) : (
                        <Link
                          to={item.path}
                          className={cn(
                            'relative flex items-center gap-1 text-sm tracking-wide transition-all duration-200 px-4 py-2 rounded-full',
                            isItemActive ? 'text-primary font-medium' :
                              cn('text-foreground/80 hover:text-foreground', hoveredItem && !isItemHovered ? 'opacity-50' : 'opacity-100')
                          )}
                        >
                          {item.label}
                        </Link>
                      )}

                      {isSolution && (
                        <AnimatePresence>
                          {solutionOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 8, scale: 0.97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 8, scale: 0.97 }}
                              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                              className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-popover shadow-[0_8px_40px_-8px_rgba(0,0,0,0.12)] border border-border/50 overflow-hidden z-50"
                              onMouseEnter={handleSolutionEnter}
                              onMouseLeave={handleSolutionLeave}
                            >
                              <div className="p-2">
                                {solutionDropdown.map((sub) => (
                                  <Link
                                    key={sub.label}
                                    to={sub.path}
                                    className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                    onClick={() => setSolutionOpen(false)}
                                  >
                                    <p className="text-sm font-medium text-foreground">{sub.label}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{sub.desc}</p>
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Language + CTAs */}
            <div className="flex items-center gap-2">
              {/* Language switcher */}
              <div
                className="relative hidden sm:block"
                onMouseEnter={handleLangEnter}
                onMouseLeave={handleLangLeave}
              >
                <button
                  type="button"
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium text-foreground/60 hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                >
                  {langOptions.find(l => l.code === language)?.short}
                  <ChevronDown size={12} />
                </button>
                <AnimatePresence>
                  {langOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-1 w-36 rounded-xl bg-popover shadow-lg border border-border/50 overflow-hidden z-50"
                      onMouseEnter={handleLangEnter}
                      onMouseLeave={handleLangLeave}
                    >
                      <div className="p-1">
                        {langOptions.map((opt) => (
                          <button
                            key={opt.code}
                            onClick={() => { setLanguage(opt.code); setLangOpen(false); }}
                            className={cn(
                              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                              language === opt.code
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-foreground/70 hover:bg-muted/50 hover:text-foreground'
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sign in */}
              <Link to="/login" className="hidden sm:block">
                <button className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border text-foreground/70 border-border hover:bg-muted hover:text-foreground">
                  {t('nav.signIn')}
                </button>
              </Link>

              {/* Start for free */}
              <Link to="/register" className="hidden sm:block">
                <button className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 active:scale-[0.97] bg-primary text-black hover:shadow-[0_4px_20px_-4px_hsl(108_96%_52%/0.5)]">
                  {t('nav.startFree')}
                </button>
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 transition-colors text-foreground/70 hover:text-foreground"
              >
                {isMobileMenuOpen ? <Close size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-4 top-20 z-40 bg-popover border border-border/30 rounded-2xl lg:hidden overflow-hidden shadow-xl"
          >
            <div className="p-6">
              <div className="flex flex-col gap-2">
                {navItems.map((item, index) => (
                  <motion.div key={item.key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                    <Link
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'block text-base py-3 px-4 rounded-lg transition-colors',
                        isActive(item.path) ? 'text-primary font-medium bg-primary/5' : 'text-foreground hover:text-primary hover:bg-muted/50'
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile language switcher */}
                <div className="flex gap-2 pt-3 mt-1 border-t border-border/30">
                  {langOptions.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => setLanguage(opt.code)}
                      className={cn(
                        'flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        language === opt.code ? 'bg-primary/10 text-primary' : 'bg-muted/50 text-foreground/60'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-border/30">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full py-3 rounded-full text-sm font-medium bg-muted text-foreground hover:bg-primary hover:text-white transition-colors">
                      {t('nav.signIn')}
                    </button>
                  </Link>
                  <Link to="/pilot-demo" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="w-full py-3 rounded-full text-sm font-medium bg-primary text-white">
                      {t('nav.startFree')}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
