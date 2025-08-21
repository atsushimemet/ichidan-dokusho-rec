import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  className
}) => {
  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        
        return (
          <div
            key={stepNumber}
            className={cn(
              'w-3 h-3 rounded-full transition-all duration-300',
              isCompleted && 'bg-ios-blue',
              isCurrent && 'bg-ios-blue scale-125',
              !isCompleted && !isCurrent && 'bg-ios-gray-300'
            )}
          />
        );
      })}
    </div>
  );
};

export default ProgressIndicator;