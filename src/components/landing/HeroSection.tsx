import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ease = [0.16, 1, 0.3, 1] as const;
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease },
});

const Stars = () => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className="w-4 h-4 text-primary fill-primary" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const trustClients = [
  { name: 'Bureau Bouwtechniek', style: 'text-lg font-semibold tracking-wide', color: '#1a1a1a' },
  { name: 'ARCADIS', style: 'text-xl font-bold uppercase tracking-[0.15em]', color: '#e4002b' },
  { name: 'Sweco', style: 'text-2xl font-bold tracking-tight', color: '#009639' },
  { name: 'ANTEA GROUP', style: 'text-xl font-bold uppercase tracking-[0.12em]', color: '#00a3e0' },
  { name: 'BURO II', style: 'text-xl font-bold uppercase tracking-[0.2em]', color: '#e85d00' },
  { name: 'Tractebel', style: 'text-2xl font-bold tracking-tight', color: '#0072bc' },
  { name: 'VK Architects', style: 'text-xl font-semibold tracking-wide', color: '#2c2c2c' },
  { name: 'STRAMIEN', style: 'text-xl font-bold uppercase tracking-[0.15em]', color: '#d4a017' },
];

export const HeroSection = () => {
  return (
    <section className="relative h-[100dvh] flex flex-col items-center justify-center bg-background px-6 overflow-hidden">
      <div className="flex flex-col items-center text-center max-w-[860px] mx-auto">
        <motion.div {...fadeUp(0.05)} className="flex flex-col items-center gap-2 mb-12">
          <Stars />
          <p className="text-sm text-muted-foreground font-medium">Trusted by 20+ early users across Flanders</p>
        </motion.div>

        <motion.h1
          {...fadeUp(0.15)}
          className="text-[42px] sm:text-[56px] md:text-[68px] font-semibold leading-[1.04] tracking-[-0.03em] text-foreground text-balance"
        >
          Nitrogen report compliance-ready
          <br />
          <span className="text-muted-foreground">In minutes — not weeks</span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.3)}
          className="mt-8 text-muted-foreground text-base md:text-lg leading-relaxed max-w-[520px] text-balance"
        >
          With OxiCloud, we value your time and effort
        </motion.p>

        <motion.div {...fadeUp(0.45)} className="flex flex-col items-center gap-3 mt-12">
          <Link
            to="/register"
            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full bg-secondary text-secondary-foreground text-sm font-medium overflow-hidden transition-shadow duration-300 hover:shadow-lg"
          >
            <span className="relative overflow-hidden h-[1.2em] inline-flex items-center">
              <span className="block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
                Try now — It's free
              </span>
              <span className="absolute top-full left-0 block transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-full">
                Try now — It's free
              </span>
            </span>
          </Link>
          <p className="text-xs text-muted-foreground/60">Just your email or Google account</p>
        </motion.div>

        {/* Trust logos marquee */}
        <motion.div
          {...fadeUp(0.55)}
          className="mt-14 w-full max-w-[700px] mx-auto flex items-center gap-6"
        >
          <p className="text-xs text-muted-foreground/50 leading-tight shrink-0 max-w-[100px]">
            Trusted by leading firms
          </p>
          <div className="relative overflow-hidden flex-1">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10" />
            <div className="flex animate-marquee items-center">
              {[...Array(2)].map((_, setIndex) => (
                <div key={setIndex} className="flex items-center shrink-0">
                  {trustClients.map((client, i) => (
                    <span
                      key={`${setIndex}-${i}`}
                      className={`shrink-0 mx-8 whitespace-nowrap transition-colors duration-300 cursor-default ${client.style}`}
                      style={{ color: 'hsl(var(--foreground) / 0.25)' }}
                      onMouseEnter={(e) => { (e.target as HTMLElement).style.color = client.color; }}
                      onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'hsl(var(--foreground) / 0.25)'; }}
                    >
                      {client.name}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer"
        onClick={() => document.getElementById('video-section')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span className="text-muted-foreground text-xs tracking-[0.15em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-muted-foreground/40 to-transparent"
        />
      </motion.div>
    </section>
  );
};
