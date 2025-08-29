'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface DropdownItem {
  type: 'link' | 'button';
  href?: string;
  label: string;
  icon?: string;
  onClick?: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export default function DropdownMenu({ 
  trigger, 
  items, 
  align = 'right',
  className = '' 
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ESCキーでドロップダウンを閉じる
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  const getItemClassName = (item: DropdownItem) => {
    const baseClass = 'flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-ios-gray-50 transition-colors duration-200';
    
    if (item.disabled) {
      return `${baseClass} text-ios-gray-400 cursor-not-allowed`;
    }

    switch (item.variant) {
      case 'primary':
        return `${baseClass} text-ios-blue hover:bg-ios-blue/10`;
      case 'secondary':
        return `${baseClass} text-ios-purple hover:bg-ios-purple/10`;
      case 'danger':
        return `${baseClass} text-ios-red hover:bg-ios-red/10`;
      default:
        return `${baseClass} text-ios-gray-700`;
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* トリガー */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div
          className={`absolute z-50 mt-2 w-64 bg-white rounded-lg shadow-ios-lg border border-ios-gray-200 py-2 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item, index) => (
            <div key={index}>
              {item.type === 'link' && item.href ? (
                <Link
                  href={item.href}
                  className={getItemClassName(item)}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon && <span className="text-lg">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                </Link>
              ) : (
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={getItemClassName(item)}
                >
                  {item.icon && <span className="text-lg">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 管理画面専用のアクションドロップダウン
interface AdminActionsDropdownProps {
  onToggleForm: () => void;
  onToggleDebug?: () => void;
  showForm: boolean;
  showDebugConsole?: boolean;
  currentEntity?: 'books' | 'stores' | 'archives' | 'rankings';
  hasDebugFeature?: boolean;
  // ランキング管理専用機能
  onToggleAllVisibility?: () => void;
  allVisibilityLabel?: string;
}

export function AdminActionsDropdown({ 
  onToggleForm, 
  onToggleDebug, 
  showForm, 
  showDebugConsole = false,
  currentEntity = 'books',
  hasDebugFeature = true,
  onToggleAllVisibility,
  allVisibilityLabel
}: AdminActionsDropdownProps) {
  const entityConfig = {
    books: { icon: '📚', label: '書籍', addLabel: '新しい書籍を追加' },
    stores: { icon: '🏪', label: '店舗', addLabel: '新しい店舗を追加' },
    archives: { icon: '📰', label: 'アーカイブ', addLabel: '新しい記事を追加' },
    rankings: { icon: '🏆', label: 'ランキング書籍', addLabel: '新しいランキング書籍を追加' }
  };

  const config = entityConfig[currentEntity];

  const items: DropdownItem[] = [
    {
      type: 'button',
      label: showForm ? 'フォームを閉じる' : config.addLabel,
      icon: showForm ? '←' : config.icon,
      onClick: onToggleForm,
      variant: 'primary'
    }
  ];

  // デバッグ機能がある場合のみ追加
  if (hasDebugFeature && onToggleDebug) {
    items.push({
      type: 'button',
      label: showDebugConsole ? 'デバッグコンソールを非表示' : 'デバッグコンソールを表示',
      icon: '🔧',
      onClick: onToggleDebug,
      variant: 'secondary'
    });
  }

  // ランキング管理専用の一括表示切り替え機能
  if (currentEntity === 'rankings' && onToggleAllVisibility && allVisibilityLabel) {
    items.push({
      type: 'button',
      label: allVisibilityLabel,
      icon: '👁️',
      onClick: onToggleAllVisibility,
      variant: 'secondary'
    });
  }

  // その他のメニュー項目を追加
  items.push(
    {
      type: 'link',
      href: '/admin/tags',
      label: 'タグマスター管理',
      icon: '🏷️'
    },
    {
      type: 'link',
      href: '/admin/mappings',
      label: '質問マッピング管理',
      icon: '🔗'
    },
    {
      type: 'link',
      href: '/',
      label: 'ホームに戻る',
      icon: '🏠'
    }
  );

  const trigger = (
    <button className="flex items-center space-x-2 px-4 py-2 bg-ios-blue text-white rounded-lg hover:bg-ios-blue/90 transition-colors duration-200 shadow-sm">
      <span>アクション</span>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );

  return <DropdownMenu trigger={trigger} items={items} align="right" />;
}