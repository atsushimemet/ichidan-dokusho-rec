import React, { useState } from 'react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export default function Accordion({ 
  title, 
  children, 
  defaultOpen = false,
  className = ''
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border border-ios-gray-300 rounded-lg overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-ios-gray-50 hover:bg-ios-gray-100 flex justify-between items-center text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ios-blue/50"
      >
        <span className="font-medium text-ios-gray-800">{title}</span>
        <span className={`text-ios-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-white border-t border-ios-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}