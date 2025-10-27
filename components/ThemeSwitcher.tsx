import React, { useState, useRef, useEffect } from 'react';
import type { Theme } from '../types.ts';
import { SunIcon } from './icons/SunIcon.tsx';
import { MoonIcon } from './icons/MoonIcon.tsx';
import { DesktopComputerIcon } from './icons/DesktopComputerIcon.tsx';

interface ThemeSwitcherProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Claro', icon: <SunIcon className="w-5 h-5" /> },
  { value: 'dark', label: 'Escuro', icon: <MoonIcon className="w-5 h-5" /> },
  { value: 'system', label: 'Sistema', icon: <DesktopComputerIcon className="w-5 h-5" /> },
];

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ActiveIcon = themeOptions.find(opt => opt.value === theme)?.icon || <DesktopComputerIcon className="w-6 h-6" />;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
        aria-label="Alterar tema"
      >
        {ActiveIcon}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-border-neutral dark:border-gray-600 z-20">
          {themeOptions.map(option => (
            <button
              key={option.value}
              onClick={() => {
                setTheme(option.value);
                setIsOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-2 text-sm text-left ${
                theme === option.value
                  ? 'text-primary dark:text-primary-light font-semibold'
                  : 'text-text-main dark:text-gray-200'
              } hover:bg-gray-100 dark:hover:bg-gray-600`}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};