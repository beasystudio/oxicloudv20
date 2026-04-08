import { useState } from "react";
import { motion } from "framer-motion";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, ArrowRight, CheckCircle, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease },
});

const Contact = () => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success(t('contact.toastSuccess'));
  };

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />

      <section className="min-h-[100dvh] flex items-center px-6 pt-28 pb-16">
        <div className="container mx-auto max-w-5xl">
          <motion.div {...fadeUp(0.05)} className="mb-16">
            <h1 className="text-[36px] sm:text-[48px] md:text-[56px] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground text-balance max-w-2xl">
              {t('contact.title')}<br />{t('contact.titleBr')}
            </h1>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-16">
            <motion.div {...fadeUp(0.15)} className="lg:col-span-7">
              {isSubmitted ? (
                <div className="py-20 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 15 }}>
                    <CheckCircle size={56} className="text-primary mx-auto mb-6" strokeWidth={1.5} />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{t('contact.messageSent')}</h3>
                  <p className="text-muted-foreground mb-8">{t('contact.messageSentDesc')}</p>
                  <Button variant="outline" onClick={() => setIsSubmitted(false)} className="rounded-full px-6">
                    {t('contact.sendAnother')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <Label htmlFor="name" className="text-sm font-medium text-foreground">
                        {t('contact.fullName')} <span className="text-primary">*</span>
                      </Label>
                      <Input id="name" name="name" required placeholder={t('contact.placeholderName')}
                        className="h-12 rounded-lg bg-muted/30 border-border/50 focus:border-foreground focus:ring-foreground/10 placeholder:text-muted-foreground/50" />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="email" className="text-sm font-medium text-foreground">
                        {t('contact.workEmail')} <span className="text-primary">*</span>
                      </Label>
                      <Input id="email" name="email" type="email" required placeholder={t('contact.placeholderEmail')}
                        className="h-12 rounded-lg bg-muted/30 border-border/50 focus:border-foreground focus:ring-foreground/10 placeholder:text-muted-foreground/50" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <Label htmlFor="company" className="text-sm font-medium text-foreground">
                        {t('contact.company')} <span className="text-muted-foreground/60 font-normal">{t('contact.optional')}</span>
                      </Label>
                      <Input id="company" name="company" placeholder={t('contact.placeholderCompany')}
                        className="h-12 rounded-lg bg-muted/30 border-border/50 focus:border-foreground focus:ring-foreground/10 placeholder:text-muted-foreground/50" />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                        {t('contact.phone')} <span className="text-muted-foreground/60 font-normal">{t('contact.optional')}</span>
                      </Label>
                      <Input id="phone" name="phone" type="tel" placeholder={t('contact.placeholderPhone')}
                        className="h-12 rounded-lg bg-muted/30 border-border/50 focus:border-foreground focus:ring-foreground/10 placeholder:text-muted-foreground/50" />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="subject" className="text-sm font-medium text-foreground">
                      {t('contact.subject')} <span className="text-primary">*</span>
                    </Label>
                    <Input id="subject" name="subject" required placeholder={t('contact.placeholderSubject')}
                      className="h-12 rounded-lg bg-muted/30 border-border/50 focus:border-foreground focus:ring-foreground/10 placeholder:text-muted-foreground/50" />
                  </div>

                  <div className="space-y-2.5">
                    <Label htmlFor="message" className="text-sm font-medium text-foreground">
                      {t('contact.message')} <span className="text-primary">*</span>
                    </Label>
                    <Textarea id="message" name="message" required rows={5} placeholder={t('contact.placeholderMessage')}
                      className="rounded-lg bg-muted/30 border-border/50 focus:border-foreground focus:ring-foreground/10 resize-none placeholder:text-muted-foreground/50" />
                  </div>

                  <Button type="submit" size="lg" disabled={isSubmitting}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-10 h-14 text-sm rounded-lg active:scale-[0.97] group transition-all duration-300">
                    {isSubmitting ? t('contact.sending') : t('contact.sendMessage')}
                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </form>
              )}
            </motion.div>

            <motion.div {...fadeUp(0.25)} className="lg:col-span-5 lg:pl-8">
              <div className="space-y-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">{t('contact.email')}</p>
                  <a href="mailto:hello@oxicloud.eu" className="group flex items-center gap-3 text-foreground hover:text-primary transition-colors duration-300">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors duration-300">
                      <Mail size={18} className="text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                    </span>
                    <span className="text-base font-medium">hello@oxicloud.eu</span>
                  </a>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">{t('contact.location')}</p>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 mt-0.5">
                      <MapPin size={18} className="text-muted-foreground" />
                    </span>
                    <div>
                      <p className="text-base font-medium text-foreground">Aarschot, Belgium</p>
                      <p className="text-sm text-muted-foreground mt-0.5">European Union</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-3">{t('contact.responseTime')}</p>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-muted/50 mt-0.5">
                      <Clock size={18} className="text-muted-foreground" />
                    </span>
                    <div>
                      <p className="text-base font-medium text-foreground">{t('contact.within24')}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{t('contact.businessDays')}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 mb-4">{t('contact.lookingFor')}</p>
                  <div className="space-y-3">
                    <a href="/for-architects" className="block text-sm text-foreground/80 hover:text-primary transition-colors duration-200">
                      → {t('contact.linkPartner')}
                    </a>
                    <a href="/for-authorities" className="block text-sm text-foreground/80 hover:text-primary transition-colors duration-200">
                      → {t('contact.linkGovernment')}
                    </a>
                    <a href="/about" className="block text-sm text-foreground/80 hover:text-primary transition-colors duration-200">
                      → {t('contact.linkAbout')}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
