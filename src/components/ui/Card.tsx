import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  selectable?: boolean;
  selected?: boolean;
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', selectable = false, selected = false, children, ...props }, ref) => {
    const baseClasses = 'rounded-2xl transition-all duration-300';
    
    const variants = {
      default: 'bg-white shadow-ios border border-ios-gray-200',
      elevated: 'bg-white shadow-ios-lg',
      outlined: 'bg-white border-2 border-ios-gray-300',
      glass: 'bg-white/90 backdrop-blur-ios border border-black/5',
    };

    const selectableClasses = selectable 
      ? 'cursor-pointer hover:shadow-ios-lg hover:-translate-y-1'
      : '';

    const selectedClasses = selected 
      ? 'ring-2 ring-ios-blue shadow-ios-lg -translate-y-1'
      : '';

    return (
      <div
        className={cn(
          baseClasses,
          variants[variant],
          selectableClasses,
          selectedClasses,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;