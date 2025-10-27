
import React, { useState, useRef, useEffect } from 'react';
import type { User, Theme } from '../types.ts';
import { ThemeSwitcher } from './ThemeSwitcher.tsx';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  activeView: string;
  whatsAppViewMode: 'integrado' | 'classico';
  setWhatsAppViewMode: (mode: 'integrado' | 'classico') => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onLogout: () => void;
}

const ViewSwitcher: React.FC<{
  mode: 'integrado' | 'classico';
  setMode: (mode: 'integrado' | 'classico') => void;
}> = ({ mode, setMode }) => {
  const baseStyle = "px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200";
  const activeStyle = "bg-primary text-white shadow";
  const inactiveStyle = "bg-border-neutral dark:bg-gray-700 text-text-secondary dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600";

  return (
    <div className="bg-border-neutral dark:bg-gray-700 p-1 rounded-lg flex items-center">
      <button 
        onClick={() => setMode('integrado')}
        className={`${baseStyle} ${mode === 'integrado' ? activeStyle : inactiveStyle}`}
      >
        Integrado
      </button>
      <button
        onClick={() => setMode('classico')}
        className={`${baseStyle} ${mode === 'classico' ? activeStyle : inactiveStyle}`}
      >
        Clássico
      </button>
    </div>
  );
};


export const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen, currentUser, setCurrentUser, users, activeView, whatsAppViewMode, setWhatsAppViewMode, theme, setTheme, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserChange = (user: User) => {
    setCurrentUser(user);
    setDropdownOpen(false);
  };

  return (
    <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b border-border-neutral dark:border-gray-700 shadow-sm">
      <div className="flex items-center space-x-4">
        <button onClick={toggleSidebar} className="text-text-secondary dark:text-gray-400 focus:outline-none lg:hidden">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button onClick={toggleSidebar} className="text-text-secondary dark:text-gray-400 focus:outline-none hidden lg:block">
            {isSidebarOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            )}
        </button>
        {activeView === 'whatsapp' && (
           <ViewSwitcher mode={whatsAppViewMode} setMode={setWhatsAppViewMode} />
        )}
      </div>
      <div className="flex items-center space-x-4">
        <ThemeSwitcher theme={theme} setTheme={setTheme} />
        <button className="relative text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-status-error rounded-full">3</span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
            <img className="w-8 h-8 rounded-full" src={currentUser.avatar_url} alt={currentUser.name} />
            <div className="text-left hidden sm:block">
              <span className="text-sm font-semibold text-text-main dark:text-white">{currentUser.name}</span>
              <span className="block text-xs text-text-secondary dark:text-gray-400">{currentUser.role}</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-xl z-20 divide-y divide-gray-100 dark:divide-gray-600">
              <div className="py-1">
                <p className="px-4 pt-1 pb-2 text-xs text-text-secondary dark:text-gray-400">Trocar de usuário:</p>
                {users.map(user => (
                  <a
                    key={user.id}
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleUserChange(user); }}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    {user.name} ({user.role})
                  </a>
                ))}
              </div>
              <div className="py-1">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onLogout(); }}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Sair
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};