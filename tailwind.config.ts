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
    			sans: [
    				'Plus Jakarta Sans',
    				'ui-sans-serif',
    				'system-ui',
    				'sans-serif',
    				'Apple Color Emoji',
    				'Segoe UI Emoji',
    				'Segoe UI Symbol',
    				'Noto Color Emoji'
    			],
    			display: [
    				'roobert',
    				'Inter',
    				'ui-sans-serif',
    				'system-ui',
    				'sans-serif'
    			],
    			serif: [
    				'ui-serif',
    				'Georgia',
    				'Cambria',
    				'Times New Roman',
    				'Times',
    				'serif'
    			],
    			mono: [
    				'ui-monospace',
    				'SFMono-Regular',
    				'Menlo',
    				'Monaco',
    				'Consolas',
    				'Liberation Mono',
    				'Courier New',
    				'monospace'
    			]
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
    			'oxi-white': '#FFFFFF',
    			'oxi-white-soft': '#F4F4F4',
    			'oxi-black': '#000000',
    			'oxi-charcoal': '#1A1A1A',
    			'oxi-green': '#C7F655',
    			'oxi-green-dark': '#A8D840',
    			'oxi-gray': {
    				'50': '#F5F5F5',
    				'100': '#EDEDED',
    				'200': '#DADADA',
    				'300': '#B3B3B3',
    				'400': '#8A8A8A',
    				'500': '#6B6B6B',
    				'600': '#4A4A4A',
    				'700': '#2A2A2A',
    				'800': '#1A1A1A',
    				'900': '#0A0A0A'
    			},
    			'oxi-deep-blue': '#000000',
    			'oxi-accent-lime': '#C7F655',
    			'oxi-accent-lime-dark': '#A8D840',
    			'oxi-accent-green': '#C7F655',
    			'oxi-accent-green-dark': '#A8D840',
    			'oxi-primary-blue': '#C7F655',
    			'oxi-blue': '#C7F655',
    			'oxi-blue-light': '#D4F87A',
    			'oxi-blue-dark': '#A8D840',
    			'chart-1': 'hsl(var(--chart-1))',
    			'chart-2': 'hsl(var(--chart-2))',
    			'chart-3': 'hsl(var(--chart-3))',
    			'chart-4': 'hsl(var(--chart-4))',
    			'chart-5': 'hsl(var(--chart-5))'
    		},
    		boxShadow: {
    			glow: '0 0 40px rgba(199, 246, 85, 0.45)',
    			'glow-sm': '0 0 20px rgba(199, 246, 85, 0.35)',
    			'glow-lg': '0 0 60px rgba(199, 246, 85, 0.55)',
    			'glow-white': '0 0 40px rgba(255, 255, 255, 0.3)',
    			sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    			DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    			md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    			lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    			xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    			'2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    			'inner-lg': 'inset 0 2px 20px 0 rgb(0 0 0 / 0.1)'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)',
    			'2xl': '1rem',
    			'3xl': '1.5rem',
    			'4xl': '2rem'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			},
    			'fade-in': {
    				'0%': {
    					opacity: '0',
    					transform: 'translateY(20px)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateY(0)'
    				}
    			},
    			'fade-in-up': {
    				'0%': {
    					opacity: '0',
    					transform: 'translateY(40px)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateY(0)'
    				}
    			},
    			'fade-in-down': {
    				'0%': {
    					opacity: '0',
    					transform: 'translateY(-20px)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateY(0)'
    				}
    			},
    			'scale-in': {
    				'0%': {
    					opacity: '0',
    					transform: 'scale(0.95)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'scale(1)'
    				}
    			},
    			'slide-up': {
    				'0%': {
    					opacity: '0',
    					transform: 'translateY(30px)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateY(0)'
    				}
    			},
    			'slide-in-right': {
    				'0%': {
    					opacity: '0',
    					transform: 'translateX(40px)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateX(0)'
    				}
    			},
    			'slide-in-left': {
    				'0%': {
    					opacity: '0',
    					transform: 'translateX(-40px)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateX(0)'
    				}
    			},
    			float: {
    				'0%, 100%': {
    					transform: 'translateY(0)'
    				},
    				'50%': {
    					transform: 'translateY(-15px)'
    				}
    			},
    			'pulse-glow': {
    				'0%, 100%': {
    					boxShadow: '0 0 20px rgba(199, 246, 85, 0.3)'
    				},
    				'50%': {
    					boxShadow: '0 0 40px rgba(199, 246, 85, 0.6)'
    				}
    			},
    			'bounce-subtle': {
    				'0%, 100%': {
    					transform: 'translateY(0)'
    				},
    				'50%': {
    					transform: 'translateY(-6px)'
    				}
    			},
    			marquee: {
    				'0%': {
    					transform: 'translateX(0)'
    				},
    				'100%': {
    					transform: 'translateX(-50%)'
    				}
    			},
    			blob: {
    				'0%': {
    					transform: 'translate(0px, 0px) scale(1)'
    				},
    				'33%': {
    					transform: 'translate(20px, -40px) scale(1.05)'
    				},
    				'66%': {
    					transform: 'translate(-15px, 15px) scale(0.95)'
    				},
    				'100%': {
    					transform: 'translate(0px, 0px) scale(1)'
    				}
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