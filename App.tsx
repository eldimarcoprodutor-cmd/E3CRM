import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import type { User, Chat, Message, CrmContact, QuickReply, KnowledgeBaseItem, Theme, Channel, Activity } from './types.ts';
import { WhatsAppIcon } from './components/icons/WhatsAppIcon.tsx';

// Lazy load components for code splitting
const Login = lazy(() => import('./components/Login.tsx'));
const Dashboard = lazy(() => import('./components/Dashboard.tsx'));
const CrmBoard = lazy(() => import('./components/CrmBoard.tsx'));
const WhatsAppWeb = lazy(() => import('./components/WhatsAppWeb.tsx'));
const Settings = lazy(() => import('./components/Settings.tsx'));
const Scheduling = lazy(() => import('./components/Scheduling.tsx'));
const Broadcast = lazy(() => import('./components/Broadcast.tsx'));
const Reports = lazy(() => import('./components/Reports.tsx'));
const Chatbot = lazy(() => import('./components/Chatbot.tsx'));
const Contacts = lazy(() => import('./components/Contacts.tsx'));
const Team = lazy(() => import('./components/Team.tsx'));
const WhatsAppCrm = lazy(() => import('./components/WhatsAppCrm.tsx'));
const Logs = lazy(() => import('./components/Logs.tsx'));
const Canais = lazy(() => import('./components/Canais.tsx'));
const Profile = lazy(() => import('./components/Profile.tsx'));
const EmailComposerModal = lazy(() => import('./components/EmailComposerModal.tsx'));


const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-center justify-center h-full text-text-secondary dark:text-gray-400">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{message}</span>
    </div>
);

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [activeView, setActiveView] = useState('dashboard');
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [crmContacts, setCrmContacts] = useState<CrmContact[]>([]);
    const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>([]);
    const [whatsAppViewMode, setWhatsAppViewMode] = useState<'integrado' | 'classico'>('integrado');
    const [channels, setChannels] = useState<Channel[]>([]);
    const [emailTarget, setEmailTarget] = useState<CrmContact | null>(null);
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('theme') as Theme) || 'system';
    });

    const handleLogout = () => {
        setCurrentUser(null);
        setActiveView('dashboard');
    };
    
    const handleSignUp = async (name: string, email: string, password: string): Promise<{ success: boolean, error?: string }> => {
        const { supabase } = await import('./services/supabase.ts');
        
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email.toLowerCase());

        if (checkError) return { success: false, error: 'Erro ao verificar o email.' };
        if (existingUsers && existingUsers.length > 0) {
            return { success: false, error: 'Este email já está em uso.' };
        }
    
        const newUser: Omit<User, 'id'> = {
            name,
            email: email.toLowerCase(),
            password, // In a real app, this should be hashed.
            role: 'Atendente',
            avatar_url: `https://i.pravatar.cc/150?u=${Date.now()}`,
        };
        
        const { data: insertedUser, error: insertError } = await supabase
            .from('users')
            .insert(newUser)
            .select()
            .single();

        if (insertError || !insertedUser) {
            return { success: false, error: 'Não foi possível criar a conta.' };
        }
    
        setUsers(prevUsers => [...prevUsers, insertedUser]);
        setCurrentUser(insertedUser); // Automatically log in the new user
        return { success: true };
    };

    // Data segregation based on user role
    const visibleCrmContacts = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'Gerente') {
            return crmContacts;
        }
        return crmContacts.filter(c => c.owner_id === currentUser.id);
    }, [crmContacts, currentUser]);

    const visibleChats = useMemo(() => {
        if (!currentUser) return [];
        if (currentUser.role === 'Gerente') {
            return chats;
        }
        return chats.filter(c => c.handled_by === currentUser.id || c.handled_by === 'bot');
    }, [chats, currentUser]);

    useEffect(() => {
        const root = window.document.documentElement;
        const isDark =
          theme === 'dark' ||
          (theme === 'system' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches);
    
        root.classList.remove(isDark ? 'light' : 'dark');
        root.classList.add(isDark ? 'dark' : 'light');
        
        localStorage.setItem('theme', theme);
    
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme === 'system') {
                const newIsDark = mediaQuery.matches;
                root.classList.remove(newIsDark ? 'light' : 'dark');
                root.classList.add(newIsDark ? 'dark' : 'light');
            }
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);
    
    useEffect(() => {
        if (currentUser && !users.find(u => u.id === currentUser.id)) {
            setCurrentUser(users[0] || null);
        }
    }, [users, currentUser]);
    
    useEffect(() => {
        if (activeChatId && !visibleChats.find(c => c.id === activeChatId)) {
            setActiveChatId(null);
        }
    }, [visibleChats, activeChatId]);

    // Main data fetching effect
    useEffect(() => {
      const fetchInitialData = async () => {
        setIsLoading(true);
        const { supabase } = await import('./services/supabase.ts');
        
        const [
            { data: usersData },
            { data: contactsData },
            { data: chatsData },
            { data: qrData },
            { data: kbData }
        ] = await Promise.all([
             supabase.from('users').select('*'),
             supabase.from('crm_contacts').select('*, activities(*)'),
             supabase.from('chats').select('*, messages(*)'),
             supabase.from('quick_replies').select('*'),
             supabase.from('knowledge_base').select('*')
        ]);

        setUsers(usersData || []);
        setCrmContacts(contactsData || []);
        setChats(chatsData || []);
        setQuickReplies(qrData || []);
        setKnowledgeBase(kbData || []);
        setIsLoading(false);
      };
      fetchInitialData();
    }, []);

    const handleNavigateToChat = (contact: CrmContact) => {
        const existingChat = chats.find(chat => chat.contact_id === contact.id);
        if (existingChat) {
            setActiveChatId(existingChat.id);
        } else {
            // This part can be enhanced to also create a chat in the database
            const newChat: Chat = {
                id: `chat-${contact.id}-${Date.now()}`,
                contact_id: contact.id,
                contact_name: contact.name,
                avatar_url: contact.avatar_url,
                last_message: 'Inicie a conversa!',
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                unread_count: 0,
                messages: [],
                handled_by: currentUser?.id || 'bot',
            };
            setChats(currentChats => [newChat, ...currentChats]);
            setActiveChatId(newChat.id);
        }
        setActiveView('whatsapp');
    };

    const handleSendMessage = useCallback(async (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
        if (!currentUser) return;
        const { supabase } = await import('./services/supabase.ts');

        // Optimistically update UI
        const tempId = `msg-temp-${Date.now()}`;
        const newMessage: Message = { ...message, id: tempId, timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };

        setChats(currentChats => currentChats.map(chat => {
            if (chat.id === chatId) {
                const isBotHandled = chat.handled_by === 'bot';
                return {
                    ...chat,
                    messages: [...chat.messages, newMessage],
                    last_message: newMessage.text,
                    timestamp: newMessage.timestamp,
                    handled_by: isBotHandled ? currentUser.id : chat.handled_by,
                };
            }
            return chat;
        }));
        
        // Update database
        const { data, error } = await supabase.from('messages').insert({ ...message, chat_id: chatId }).select().single();
        if(error || !data) console.error("Failed to send message:", error);
        
        // Replace temp message with real one from DB
        setChats(currentChats => currentChats.map(chat => chat.id === chatId ? { ...chat, messages: chat.messages.map(m => m.id === tempId ? data : m) } : chat));

    }, [currentUser, setChats]);

    const handleTakeOverChat = async (chatId: string) => {
        if (!currentUser) return;
        const { supabase } = await import('./services/supabase.ts');
        setChats(currentChats => currentChats.map(chat => chat.id === chatId ? { ...chat, handled_by: currentUser.id } : chat));
        await supabase.from('chats').update({ handled_by: currentUser.id }).eq('id', chatId);
    };
    
    const handleDeleteContact = async (contactId: string) => {
        if (currentUser?.role !== 'Gerente') {
            alert('Apenas gerentes podem remover contatos.');
            return;
        }
        if (window.confirm("Tem certeza que deseja remover este contato e todas as suas informações?")) {
            const { supabase } = await import('./services/supabase.ts');
            const { error } = await supabase.from('crm_contacts').delete().eq('id', contactId);
            if (!error) {
                setCrmContacts(prev => prev.filter(c => c.id !== contactId));
                setChats(prev => prev.filter(c => c.contact_id !== contactId));
            } else {
                 alert('Falha ao remover o contato.');
            }
        }
    };

    const handleUpdateContact = async (updatedContact: CrmContact) => {
        const { supabase } = await import('./services/supabase.ts');
        // Separate activities to upsert them
        const { activities, ...contactData } = updatedContact;
    
        const { error } = await supabase.from('crm_contacts').update(contactData).eq('id', contactData.id);
    
        if (activities && activities.length > 0) {
            const activitiesToUpsert = activities.map(act => ({ ...act, contact_id: contactData.id }));
            await supabase.from('activities').upsert(activitiesToUpsert);
        }
    
        if (!error) {
            setCrmContacts(current => current.map(c => c.id === updatedContact.id ? updatedContact : c));
        } else {
            console.error("Failed to update contact:", error);
        }
    };
    
    const handleAddContact = async (newContact: CrmContact) => {
        const { supabase } = await import('./services/supabase.ts');
        const { activities, ...contactData } = newContact;
        const { data, error } = await supabase.from('crm_contacts').insert(contactData).select().single();
        if(!error && data) {
            setCrmContacts(current => [data, ...current]);
        }
    };
    
    const handleSendEmail = async (contact: CrmContact, subject: string, body: string) => {
        if (!currentUser) return;
        console.log(`Simulating sending email to ${contact.email}...`);

        try {
            const { sendEmail } = await import('./services/emailService.ts');
            const result = await sendEmail({ to: contact.email, subject, body });

            if (result.success) {
                const { supabase } = await import('./services/supabase.ts');
                const newActivity: Omit<Activity, 'id'> = {
                    type: 'email', subject, text: body, author_id: currentUser.id, timestamp: new Date().toISOString(), contact_id: contact.id
                };
                const { data } = await supabase.from('activities').insert(newActivity).select().single();

                if (data) {
                    setCrmContacts(currentContacts =>
                        currentContacts.map(c => c.id === contact.id ? { ...c, activities: [...c.activities, data] } : c)
                    );
                }
                alert('Email enviado com sucesso!');
                setEmailTarget(null);
            } else {
                alert('Falha ao enviar o email.');
            }
        } catch (error) {
            console.error(error);
            alert('Ocorreu um erro ao enviar o email.');
        }
    };


    const renderActiveView = () => {
        if (!currentUser) {
            return (
                <div className="flex items-center justify-center h-full">
                    <p>Carregando ou nenhum usuário disponível...</p>
                </div>
            );
        }
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
                                setCrmContacts={setCrmContacts} // This should be updated to onUpdateContact
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
                            onNavigateToChat={handleNavigateToChat}
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
                return <Suspense fallback={<LoadingIndicator message="Carregando Equipe..." />}><Team team={users} setTeam={setUsers} currentUser={currentUser} /></Suspense>;
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
    
    if (isLoading) {
        return <LoadingIndicator message="Carregando dados da aplicação..." />;
    }

    if (!currentUser) {
         return (
            <Suspense fallback={<LoadingIndicator message="Carregando..." />}>
                <Login users={users} onLoginSuccess={setCurrentUser} onSignUp={handleSignUp} />
            </Suspense>
        );
    }

    return (
        <div className="flex h-screen bg-background-main dark:bg-gray-900 text-text-main dark:text-gray-200">
            <Sidebar 
              isSidebarOpen={isSidebarOpen} 
              activeView={activeView}
              setActiveView={setActiveView}
              currentUser={currentUser}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                    isSidebarOpen={isSidebarOpen}
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    users={users}
                    activeView={activeView}
                    whatsAppViewMode={whatsAppViewMode}
                    setWhatsAppViewMode={setWhatsAppViewMode}
                    theme={theme}
                    setTheme={setTheme}
                    onLogout={handleLogout}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {renderActiveView()}
                    {emailTarget && (
                        <Suspense fallback={null}>
                            <EmailComposerModal
                                contact={emailTarget}
                                onClose={() => setEmailTarget(null)}
                                onSend={handleSendEmail}
                            />
                        </Suspense>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;