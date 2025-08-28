import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // iOS風カラーパレット
        'ios-blue': '#007AFF',
        'ios-green': '#34C759',
        'ios-purple': '#AF52DE',
        'ios-orange': '#FF9500',
        'ios-red': '#FF3B30',
        'ios-teal': '#5AC8FA',
        'ios-indigo': '#5856D6',
        'ios-pink': '#FF2D92',
        'ios-mint': '#00C7BE',
        'ios-gray': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#424242',
          800: '#212121',
          900: '#0d1117',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '42': '10.5rem',
        '46': '11.5rem',
        '50': '12.5rem',
      },
      boxShadow: {
        'ios-sm': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'ios': '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
        'ios-lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'ios-xl': '0 14px 28px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.12)',
        'ios-button': '0 4px 8px rgba(0, 122, 255, 0.3), 0 1px 3px rgba(0, 122, 255, 0.15)',
      },
      backdropBlur: {
        'ios': '20px',
      },
      animation: {
        'ios-fade-in': 'ios-fade-in 0.6s ease-out',
        'ios-slide-up': 'ios-slide-up 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)',
        'ios-scale-in': 'ios-scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'float': 'float 3s ease-in-out infinite',
        'holographic': 'holographic 3s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in-left': 'slide-in-left 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)',
        'slide-in-right': 'slide-in-right 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'sparkle': 'sparkle 3s ease-in-out infinite',
        'count-up': 'count-up 2s ease-out',
        'minimal-fade-in': 'minimal-fade-in 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'minimal-slide-up': 'minimal-slide-up 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'minimal-scale-in': 'minimal-scale-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'text-reveal': 'text-reveal 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'line-draw': 'line-draw 1s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.5s both',
      },
      keyframes: {
        'ios-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'ios-slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'ios-scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'holographic': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(0, 122, 255, 0.4), 0 0 40px rgba(0, 122, 255, 0.2)' 
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(0, 122, 255, 0.8), 0 0 60px rgba(0, 122, 255, 0.4)' 
          },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'sparkle': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        'count-up': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'minimal-fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'minimal-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'minimal-scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'text-reveal': {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(40px)',
            letterSpacing: '0.2em'
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)',
            letterSpacing: 'normal'
          },
        },
        'line-draw': {
          '0%': { width: '0%', opacity: '0' },
          '100%': { width: '100%', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;