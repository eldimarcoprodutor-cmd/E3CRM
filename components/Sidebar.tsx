import React from 'react';
import { DashboardIcon } from './icons/DashboardIcon';
import { CrmIcon } from './icons/CrmIcon';
import { ChatIcon } from './icons/ChatIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { SchedulingIcon } from './icons/SchedulingIcon';
import { BroadcastIcon } from './icons/BroadcastIcon';
import { ReportsIcon } from './icons/ReportsIcon';
import { ChatbotIcon } from './icons/ChatbotIcon';
import { ContactsIcon } from './icons/ContactsIcon';
import { TeamIcon } from './icons/TeamIcon';
import { LogsIcon } from './icons/LogsIcon';
import { ChannelsIcon } from './icons/ChannelsIcon';
import type { User } from '../types';

interface SidebarProps {
  isSidebarOpen: boolean;
  activeView: string;
  setActiveView: (view: string) => void;
  currentUser: User;
}

const NavLink: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isSidebarOpen: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, isSidebarOpen, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 transform rounded-lg ${
      isActive
        ? 'bg-primary text-white'
        : 'text-text-secondary dark:text-gray-400 hover:bg-primary-light/60 dark:hover:bg-gray-700'
    }`}
  >
    {icon}
    {isSidebarOpen && <span className="mx-4">{label}</span>}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, activeView, setActiveView, currentUser }) => {
    const allNavItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon className="w-6 h-6" />, roles: ['Gerente', 'Atendente'] },
        { id: 'whatsapp', label: 'Atendimento', icon: <ChatIcon className="w-6 h-6" />, roles: ['Gerente', 'Atendente'] },
        { id: 'crm-board', label: 'Funil CRM', icon: <CrmIcon className="w-6 h-6" />, roles: ['Gerente', 'Atendente'] },
        { id: 'contacts', label: 'Contatos', icon: <ContactsIcon className="w-6 h-6" />, roles: ['Gerente', 'Atendente'] },
        { id: 'scheduling', label: 'Agendamentos', icon: <SchedulingIcon className="w-6 h-6" />, roles: ['Gerente', 'Atendente'] },
        { id: 'broadcast', label: 'Broadcast', icon: <BroadcastIcon className="w-6 h-6" />, roles: ['Gerente', 'Atendente'] },
        { id: 'reports', label: 'Relatórios', icon: <ReportsIcon className="w-6 h-6" />, roles: ['Gerente'] },
        { id: 'chatbot', label: 'Chatbot IA', icon: <ChatbotIcon className="w-6 h-6" />, roles: ['Gerente'] },
        { id: 'channels', label: 'Canais', icon: <ChannelsIcon className="w-6 h-6" />, roles: ['Gerente'] },
        { id: 'team', label: 'Equipe', icon: <TeamIcon className="w-6 h-6" />, roles: ['Gerente'] },
        { id: 'logs', label: 'Logs', icon: <LogsIcon className="w-6 h-6" />, roles: ['Gerente'] },
        { id: 'settings', label: 'Configurações', icon: <SettingsIcon className="w-6 h-6" />, roles: ['Gerente'] },
    ];
    
    const visibleNavItems = allNavItems.filter(item => item.roles.includes(currentUser.role));

    return (
        <aside className={`flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-gray-800 border-r border-border-neutral dark:border-gray-700 shadow-xl transition-all duration-300`}>
            <div className="flex items-center justify-center h-20 border-b border-border-neutral dark:border-gray-700">
                <div className={`text-2xl font-bold text-primary dark:text-primary/90 flex items-center gap-2 ${!isSidebarOpen && 'justify-center'}`}>
                    <ChatIcon className="w-8 h-8"/>
                    {isSidebarOpen && <span>E3CRM</span>}
                </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-2">
                {visibleNavItems.map(item => (
                    <NavLink
                        key={item.id}
                        icon={item.icon}
                        label={item.label}
                        isActive={activeView === item.id}
                        isSidebarOpen={isSidebarOpen}
                        onClick={() => setActiveView(item.id)}
                    />
                ))}
            </nav>
        </aside>
    );
};