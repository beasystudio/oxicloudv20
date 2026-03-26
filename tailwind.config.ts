import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
    	container: {
    		center: true,
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		fontFamily: {
    			sans: ['"Google Sans"', '"Noto Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    			display: ['"Google Sans"', '"Noto Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    			mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
    		},
    		colors: {
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			},
    			surface: {
    				DEFAULT: 'hsl(var(--surface))',
    				'container-lowest': 'hsl(var(--surface-container-lowest))',
    				'container-low': 'hsl(var(--surface-container-low))',
    				'container': 'hsl(var(--surface-container))',
    				'container-high': 'hsl(var(--surface-container-high))',
    				'container-highest': 'hsl(var(--surface-container-highest))'
    			},
    			'chart-1': 'hsl(var(--chart-1))',
    			'chart-2': 'hsl(var(--chart-2))',
    			'chart-3': 'hsl(var(--chart-3))',
    			'chart-4': 'hsl(var(--chart-4))',
    			'chart-5': 'hsl(var(--chart-5))'
    		},
    		boxShadow: {
    			ambient: 'var(--shadow-ambient)',
    			'ambient-lg': '0px 20px 60px hsla(160, 4%, 11%, 0.06)',
    			none: 'none'
    		},
    		borderRadius: {
    			lg: '0.75rem',
    			md: '0.5rem',
    			sm: '0.375rem',
    			'2xl': '1rem',
    			'3xl': '1.5rem',
    			'4xl': '2rem',
    			full: '9999px'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: { height: '0' },
    				to: { height: 'var(--radix-accordion-content-height)' }
    			},
    			'accordion-up': {
    				from: { height: 'var(--radix-accordion-content-height)' },
    				to: { height: '0' }
    			},
    			'fade-in': {
    				'0%': { opacity: '0', transform: 'translateY(20px)' },
    				'100%': { opacity: '1', transform: 'translateY(0)' }
    			},
    			'fade-in-up': {
    				'0%': { opacity: '0', transform: 'translateY(40px)' },
    				'100%': { opacity: '1', transform: 'translateY(0)' }
    			},
    			'fade-in-down': {
    				'0%': { opacity: '0', transform: 'translateY(-20px)' },
    				'100%': { opacity: '1', transform: 'translateY(0)' }
    			},
    			'scale-in': {
    				'0%': { opacity: '0', transform: 'scale(0.95)' },
    				'100%': { opacity: '1', transform: 'scale(1)' }
    			},
    			'slide-up': {
    				'0%': { opacity: '0', transform: 'translateY(30px)' },
    				'100%': { opacity: '1', transform: 'translateY(0)' }
    			},
    			'slide-in-right': {
    				'0%': { opacity: '0', transform: 'translateX(40px)' },
    				'100%': { opacity: '1', transform: 'translateX(0)' }
    			},
    			'slide-in-left': {
    				'0%': { opacity: '0', transform: 'translateX(-40px)' },
    				'100%': { opacity: '1', transform: 'translateX(0)' }
    			},
    			float: {
    				'0%, 100%': { transform: 'translateY(0)' },
    				'50%': { transform: 'translateY(-15px)' }
    			},
    			'pulse-glow': {
    				'0%, 100%': { boxShadow: '0 0 20px hsla(85, 100%, 62%, 0.3)' },
    				'50%': { boxShadow: '0 0 40px hsla(85, 100%, 62%, 0.6)' }
    			},
    			'bounce-subtle': {
    				'0%, 100%': { transform: 'translateY(0)' },
    				'50%': { transform: 'translateY(-6px)' }
    			},
    			marquee: {
    				'0%': { transform: 'translateX(0)' },
    				'100%': { transform: 'translateX(-50%)' }
    			},
    			blob: {
    				'0%': { transform: 'translate(0px, 0px) scale(1)' },
    				'33%': { transform: 'translate(20px, -40px) scale(1.05)' },
    				'66%': { transform: 'translate(-15px, 15px) scale(0.95)' },
    				'100%': { transform: 'translate(0px, 0px) scale(1)' }
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			'fade-in': 'fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    			'fade-in-up': 'fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    			'fade-in-down': 'fade-in-down 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    			'scale-in': 'scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    			'slide-up': 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    			'slide-in-right': 'slide-in-right 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    			'slide-in-left': 'slide-in-left 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    			float: 'float 5s ease-in-out infinite',
    			'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
    			'bounce-subtle': 'bounce-subtle 2.5s ease-in-out infinite',
    			blob: 'blob 6s infinite',
    			marquee: 'marquee 30s linear infinite'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
