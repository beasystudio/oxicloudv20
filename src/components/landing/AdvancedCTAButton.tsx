import { motion } from 'framer-motion';
import { ArrowUpRight } from '@/components/icons/OxiIcons';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AdvancedCTAButtonProps {
  children: React.ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
  variant?: 'black' | 'green' | 'reversed' | 'white' | 'black-white';
  size?: 'default' | 'lg';
  className?: string;
}

export const AdvancedCTAButton = ({
  children,
  to,
  href,
  onClick,
  variant = 'black',
  size = 'default',
  className
}: AdvancedCTAButtonProps) => {
  const isReversed = variant === 'reversed';
  const isWhite = variant === 'white';
  const isGreen = variant === 'green';

  // Default: black fill, white text → hover: green fill, black text
  const bgColor = isWhite ? 'bg-white' : isGreen ? 'bg-primary' : 'bg-secondary';
  const hoverFillColor = isWhite ? 'bg-primary' : isGreen ? 'bg-secondary' : 'bg-primary';
  const textColor = isWhite ? 'text-foreground' : isGreen ? 'text-primary-foreground' : 'text-secondary-foreground';
  const hoverTextClass = isWhite ? 'group-hover:text-primary-foreground' : isGreen ? 'group-hover:text-secondary-foreground' : 'group-hover:text-primary-foreground';

  const baseStyles = cn(
    'group relative inline-flex items-center gap-3 overflow-hidden font-semibold tracking-[0.02em] transition-all duration-350 rounded-lg active:scale-[0.97]',
    size === 'lg' ? 'h-14 px-8 text-sm' : 'h-12 px-6 text-sm',
    bgColor,
    textColor,
    className
  );

  const content = (
    <>
      {/* Background fill animation */}
      <span
        className={cn(
          "absolute inset-0 origin-bottom transition-transform duration-350 ease-[cubic-bezier(0.4,0,0.2,1)] scale-y-0 group-hover:scale-y-100",
          hoverFillColor
        )}
        style={{ transformOrigin: 'bottom' }}
      />

      {/* Text */}
      <span className={cn(
        "relative z-10 transition-all duration-300 group-hover:translate-y-[-2px] group-hover:scale-[1.03]",
        hoverTextClass
      )}>
        {children}
      </span>

      {/* Arrow icon */}
      <span className={cn(
        "relative z-10 flex h-6 w-6 items-center justify-center rounded transition-all duration-350 group-hover:rotate-90",
        isWhite ? 'bg-foreground/10 group-hover:bg-primary-foreground/20' : isGreen ? 'bg-primary-foreground/20 group-hover:bg-secondary-foreground/20' : 'bg-secondary-foreground/20 group-hover:bg-primary-foreground/20'
      )}>
        <ArrowUpRight size={14} className={cn(
          "transition-transform duration-350",
          isWhite ? 'text-foreground group-hover:text-primary-foreground' : isGreen ? 'text-primary-foreground group-hover:text-secondary-foreground' : 'text-secondary-foreground group-hover:text-primary-foreground'
        )} />
      </span>
    </>
  );

  const MotionWrapper = ({ children: wrapperChildren }: { children: React.ReactNode }) => (
    <motion.div className="inline-block" initial="initial" whileHover="hover" animate="initial">
      {wrapperChildren}
    </motion.div>
  );

  if (to) {
    return (
      <MotionWrapper>
        <Link to={to} className={baseStyles}>{content}</Link>
      </MotionWrapper>
    );
  }
  if (href) {
    return (
      <MotionWrapper>
        <a href={href} className={baseStyles} target="_blank" rel="noopener noreferrer">{content}</a>
      </MotionWrapper>
    );
  }
  return (
    <MotionWrapper>
      <button onClick={onClick} className={baseStyles}>{content}</button>
    </MotionWrapper>
  );
};

// Simpler variant
export const CTAButton = ({
  children,
  to,
  onClick,
  variant = 'primary',
  size = 'default',
  className
}: {
  children: React.ReactNode;
  to?: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'default' | 'lg' | 'sm';
  className?: string;
}) => {
  const styles = cn(
    'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 rounded-lg active:scale-[0.97]',
    size === 'lg' && 'h-14 px-8 text-base',
    size === 'default' && 'h-12 px-6 text-sm',
    size === 'sm' && 'h-9 px-4 text-xs',
    variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_4px_20px_-4px_hsl(108_96%_52%/0.4)]',
    variant === 'outline' && 'border-2 border-current text-inherit hover:bg-white/10',
    variant === 'ghost' && 'text-foreground hover:bg-muted',
    className
  );

  if (to) return <Link to={to} className={styles}>{children}</Link>;
  return <button onClick={onClick} className={styles}>{children}</button>;
};
