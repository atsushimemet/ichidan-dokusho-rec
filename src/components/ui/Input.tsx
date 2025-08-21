import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-ios-gray-700">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'w-full px-4 py-3 rounded-xl border border-ios-gray-300 bg-white transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-ios-blue/50 focus:border-ios-blue',
            'placeholder:text-ios-gray-500',
            error && 'border-ios-red focus:ring-ios-red/50 focus:border-ios-red',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-ios-red">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-ios-gray-600">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;