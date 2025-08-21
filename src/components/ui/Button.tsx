import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-3 focus:ring-ios-blue/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-ios-blue text-white shadow-ios-button hover:bg-ios-blue/90',
      secondary: 'bg-ios-gray-200 text-ios-gray-800 hover:bg-ios-gray-300',
      outline: 'border-2 border-ios-blue text-ios-blue hover:bg-ios-blue hover:text-white',
      success: 'bg-ios-green text-white hover:bg-ios-green/90',
      warning: 'bg-ios-orange text-white hover:bg-ios-orange/90',
      danger: 'bg-ios-red text-white hover:bg-ios-red/90',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm h-9',
      md: 'px-6 py-3 text-base h-11',
      lg: 'px-8 py-4 text-lg h-13',
      xl: 'px-10 py-5 text-xl h-15',
    };

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;