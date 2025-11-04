import React, { lazy, Suspense } from 'react';
import type { User, Chat, Message, CrmContact, QuickReply, KnowledgeBaseItem, Channel } from './types.ts';
import { WhatsAppIcon } from './components/icons/WhatsAppIcon.tsx';

// Lazy load components for code splitting
const Dashboard = lazy(() => import('./components/Dashboard.tsx'));
const CrmBoard = lazy(() => import('./CrmBoard.tsx'));
const WhatsAppWeb = lazy(() => import('./components/WhatsAppWeb.tsx'));
const Settings = lazy(() => import('./components/Settings.tsx'));
const Scheduling = lazy(() => import('./components/Scheduling.tsx'));
const Broadcast = lazy(() => import('./components/Broadcast.tsx'));
const Reports = lazy(() => import('./components/Reports.tsx'));
const Chatbot = lazy(() => import('./components/Chatbot.tsx'));
const Contacts = lazy(() => import('./Contacts.tsx'));
const Team = lazy(() => import('./Team.tsx'));
const WhatsAppCrm = lazy(() => import('./components/WhatsAppCrm.tsx'));
const Logs = lazy(() => import('./components/Logs.tsx'));
const Canais = lazy(() => import('./components/Canais.tsx'));
const Profile = lazy(() => import('./components/Profile.tsx'));

const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-center justify-center h-full text-text-secondary dark:text-gray-400">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{message}</span>
    </div>
);

interface MainContentProps {
    activeView: string;
    currentUser: User;
    visibleCrmContacts: CrmContact[];
    users: User[];
    channels: Channel[];
    setActiveView: (view: string) => void;
    whatsAppViewMode: 'integrado' | 'classico';
    visibleChats: Chat[];
    setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
    handleSendMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
    quickReplies: QuickReply[];
    crmContacts: CrmContact[];
    handleUpdateContact: (updatedContact: CrmContact) => Promise<void>;
    handleTakeOverChat: (chatId: string) => Promise<void>;
    activeChatId: string | null;
    setActiveChatId: React.Dispatch<React.SetStateAction<string | null>>;
    handleAddContact: (newContact: Omit<CrmContact, 'id'>) => Promise<void>;
    handleDeleteContact: (contactId: string) => Promise<void>;
    setEmailTarget: React.Dispatch<React.SetStateAction<CrmContact | null>>;
    onNavigateToChat: (contact: CrmContact) => void;
    chats: Chat[];
    knowledgeBase: KnowledgeBaseItem[];
    setKnowledgeBase: React.Dispatch<React.SetStateAction<KnowledgeBaseItem[]>>;
    setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
    handleAddUser: (newUser: Omit<User, 'id' | "password"> & { password?: string | undefined; }) => Promise<void>;
    handleUpdateUser: (updatedUser: User) => Promise<void>;
    handleDeleteUser: (userId: string) => Promise<void>;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    setQuickReplies: React.Dispatch<React.SetStateAction<QuickReply[]>>;
}


const MainContent: React.FC<MainContentProps> = (props) => {
    const { 
        activeView, currentUser, visibleCrmContacts, users, channels, setActiveView, 
        whatsAppViewMode, visibleChats, setChats, handleSendMessage, quickReplies, 
        crmContacts, handleUpdateContact, handleTakeOverChat, activeChatId, 
        setActiveChatId, handleAddContact, handleDeleteContact, setEmailTarget, onNavigateToChat,
        chats, knowledgeBase, setKnowledgeBase, setChannels, handleAddUser, handleUpdateUser,
        handleDeleteUser, setCurrentUser, setUsers, setQuickReplies
    } = props;
    
    switch (activeView) {
        case 'dashboard':
            return <Suspense fallback={<LoadingIndicator message="Carregando Dashboard..." />}><Dashboard contacts={visibleCrmContacts} users={users} /></Suspense>;
        case 'whatsapp':
             if (channels.length === 0) {
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center bg-background-main dark:bg-gray-800 rounded-2xl p-8">
                        <WhatsAppIcon className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-4" />
                        <h2 className="text-xl font-semibold text-text-main dark:text-gray-200">Nenhum canal do WhatsApp conectado</h2>
                        <p className="text-text-secondary dark:text-gray-400 mt-2 max-w-sm">Para começar a atender seus clientes, você precisa primeiro conectar um número do WhatsApp.</p>
                        <button 
                            onClick={() => setActiveView('channels')} 
                            className="mt-6 px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                            Conectar Canal Agora
                        </button>
                    </div>
                );
            }
            return (
                <Suspense fallback={<LoadingIndicator message="Carregando Atendimento..." />}>
                    {whatsAppViewMode === 'integrado' ? (
                        <WhatsAppCrm 
                            currentUser={currentUser}
                            chats={visibleChats}
                            setChats={setChats}
                            onSendMessage={handleSendMessage}
                            users={users}
                            quickReplies={quickReplies}
                            crmContacts={crmContacts}
                            onUpdateContact={handleUpdateContact}
                            onTakeOverChat={handleTakeOverChat}
                            activeChatId={activeChatId}
                            setActiveChatId={setActiveChatId}
                        />
                    ) : (
                        <WhatsAppWeb 
                            currentUser={currentUser}
                            chats={visibleChats}
                            setChats={setChats}
                            onSendMessage={handleSendMessage}
                            users={users}
                            quickReplies={quickReplies}
                            onTakeOverChat={handleTakeOverChat}
                            activeChatId={activeChatId}
                            setActiveChatId={setActiveChatId}
                        />
                    )}
                </Suspense>
            );
        case 'crm-board':
            return <Suspense fallback={<LoadingIndicator message="Carregando Funil CRM..." />}><CrmBoard 
                        contacts={visibleCrmContacts} 
                        onUpdateContact={handleUpdateContact}
                        onAddContact={handleAddContact}
                        users={users} 
                        currentUser={currentUser} 
                        onNavigateToChat={onNavigateToChat}
                        onSendEmail={setEmailTarget}
                    /></Suspense>;
        case 'contacts':
            return <Suspense fallback={<LoadingIndicator message="Carregando Contatos..." />}><Contacts 
                        contacts={visibleCrmContacts} 
                        onAddContact={handleAddContact}
                        onUpdateContact={handleUpdateContact} 
                        currentUser={currentUser} 
                        onDeleteContact={handleDeleteContact} 
                        onSendEmail={setEmailTarget}
                        users={users}
                    /></Suspense>;
        case 'scheduling':
            return <Suspense fallback={<LoadingIndicator message="Carregando Agendamentos..." />}><Scheduling contacts={crmContacts} /></Suspense>;
        case 'broadcast':
            return <Suspense fallback={<LoadingIndicator message="Carregando Broadcast..." />}><Broadcast /></Suspense>;
        case 'reports':
            return <Suspense fallback={<LoadingIndicator message="Carregando Relatórios..." />}><Reports users={users} chats={chats} /></Suspense>;
        case 'chatbot':
            return <Suspense fallback={<LoadingIndicator message="Carregando Configurações do Chatbot..." />}><Chatbot knowledgeBase={knowledgeBase} setKnowledgeBase={setKnowledgeBase} /></Suspense>;
        case 'channels':
            return <Suspense fallback={<LoadingIndicator message="Carregando Canais..." />}><Canais channels={channels} setChannels={setChannels} /></Suspense>;
        case 'team':
            return <Suspense fallback={<LoadingIndicator message="Carregando Equipe..." />}><Team 
                        team={users} 
                        onAddUser={handleAddUser}
                        onUpdateUser={handleUpdateUser}
                        onDeleteUser={handleDeleteUser}
                        currentUser={currentUser} 
                    /></Suspense>;
        case 'logs':
            return <Suspense fallback={<LoadingIndicator message="Carregando Logs..." />}><Logs users={users} /></Suspense>;
        case 'profile':
            return <Suspense fallback={<LoadingIndicator message="Carregando Perfil..." />}><Profile 
                        currentUser={currentUser}
                        setCurrentUser={setCurrentUser}
                        users={users}
                        setUsers={setUsers}
                    /></Suspense>;
        case 'settings':
            return <Suspense fallback={<LoadingIndicator message="Carregando Configurações..." />}><Settings 
                        quickReplies={quickReplies} 
                        setQuickReplies={setQuickReplies} 
                    /></Suspense>;
        default:
            return <Suspense fallback={<LoadingIndicator message="Carregando Dashboard..." />}><Dashboard contacts={visibleCrmContacts} users={users}/></Suspense>;
    }
};

export default MainContent;
