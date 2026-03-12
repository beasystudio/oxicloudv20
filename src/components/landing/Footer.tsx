import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n/LanguageContext';

export const Footer = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();
  
  const isActive = (path: string) => location.pathname === path;

  const footerLinks = {
    platform: [
      { label: t('nav.solution'), path: '/solution' },
      { label: t('nav.about'), path: '/about' },
      { label: t('nav.contact'), path: '/contact' },
    ],
    legal: [
      { label: t('footer.privacyPolicy'), path: '/privacy' },
      { label: t('footer.termsOfService'), path: '/terms' },
    ],
  };

  return (
    <footer className="bg-secondary text-secondary-foreground border-t border-secondary-foreground/10">
      <div className="container mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-semibold text-secondary-foreground">OxiCloud</span>
            </Link>
            <p className="text-secondary-foreground/60 text-sm max-w-sm leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="text-secondary-foreground/40 text-xs space-y-1">
              <p className="font-medium">{t('footer.aligned')}</p>
              <p>VITO · Natura 2000 · GEOPUNT</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-secondary-foreground uppercase tracking-wider">
              {t('footer.platform')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className={cn("text-sm transition-colors", isActive(link.path) ? "text-primary font-bold" : "text-secondary-foreground/60 hover:text-secondary-foreground")}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-secondary-foreground uppercase tracking-wider">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className={cn("text-sm transition-colors", isActive(link.path) ? "text-primary font-bold" : "text-secondary-foreground/60 hover:text-secondary-foreground")}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 pt-8 border-t border-secondary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-xs text-secondary-foreground/40">
            © {currentYear} OxiCloud. {t('footer.allRights')}
          </p>
          <p className="text-xs text-secondary-foreground/40">
            {t('footer.productOf')}
          </p>
        </motion.div>
      </div>
    </footer>
  );
};
