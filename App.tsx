import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import type { User, Chat, Message, CrmContact, QuickReply, KnowledgeBaseItem, Theme, Channel, Note } from './types.ts';
import { Login } from './components/Login.tsx';
import { WhatsAppIcon } from './components/icons/WhatsAppIcon.tsx';
import { generateChatbotResponse } from './services/geminiService.ts';
import { supabase } from './services/supabase.ts';
import { sendEmail } from './services/emailService.ts';

// Lazy load components for code splitting
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

// Mock Data
const usersData: User[] = [
    { id: '1', name: 'Ana Silva', avatar_url: 'https://i.pravatar.cc/150?u=1', role: 'Gerente', email: 'ana.gerente@zapcrm.com', password: 'password' },
    { id: '2', name: 'Bruno Gomes', avatar_url: 'https://i.pravatar.cc/150?u=2', role: 'Atendente', email: 'bruno.atendente@zapcrm.com', password: 'password' },
    { id: '3', name: 'Carla Dias', avatar_url: 'https://i.pravatar.cc/150?u=3', role: 'Atendente', email: 'carla.atendente@zapcrm.com', password: 'password' },
];

const crmContactsData: CrmContact[] = [
    { id: '101', name: 'Carlos Pereira', email: 'carlos.p@example.com', phone: '+55 11 98765-4321', avatar_url: 'https://i.pravatar.cc/150?u=101', tags: ['cliente-vip', 'e-commerce'], pipeline_stage: 'Fechado', last_interaction: '2024-07-20', owner_id: '2', value: 1500, temperature: 'Quente', next_action_date: '2024-07-25', lead_source: 'Indicação', notes: [] },
    { id: '102', name: 'Mariana Costa', email: 'mari.costa@example.com', phone: '+55 21 91234-5678', avatar_url: 'https://i.pravatar.cc/150?u=102', tags: ['e-commerce', 'newsletter'], pipeline_stage: 'Proposta', last_interaction: '2024-07-22', owner_id: '2', value: 3200, temperature: 'Morno', next_action_date: '2024-07-28', lead_source: 'Website', notes: [] },
    { id: '103', name: 'Tech Solutions Inc.', email: 'contato@techsolutions.com', phone: '+55 11 5555-1010', avatar_url: 'https://i.pravatar.cc/150?u=103', tags: ['B2B', 'parceria'], pipeline_stage: 'Qualificação', last_interaction: '2024-07-21', owner_id: '3', value: 12500, temperature: 'Quente', next_action_date: '2024-07-20', lead_source: 'Evento', notes: [] },
    { id: '104', name: 'João Almeida', email: 'joao.a@example.net', phone: '+55 81 99999-8888', avatar_url: 'https://i.pravatar.cc/150?u=104', tags: ['lead-frio'], pipeline_stage: 'Contato', last_interaction: '2024-07-15', owner_id: '3', value: 500, temperature: 'Frio', next_action_date: '2024-08-01', lead_source: 'Anúncio Facebook', notes: [] },
];

const initialChats: Chat[] = [
    {
        id: 'chat1',
        contact_id: '102',
        contact_name: 'Mariana Costa',
        avatar_url: 'https://i.pravatar.cc/150?u=102',
        last_message: 'Olá! Tenho uma dúvida sobre a fatura.',
        timestamp: '10:30',
        unread_count: 2,
        handled_by: '2', // Handled by Bruno
        messages: [
            { id: 'msg1-1', chat_id: 'chat1', sender: '102', text: 'Olá! Tenho uma dúvida sobre a fatura.', avatar_url: 'https://i.pravatar.cc/150?u=102', timestamp: '10:30', type: 'text' },
        ],
    },
    {
        id: 'chat2',
        contact_id: '104',
        contact_name: 'João Almeida',
        avatar_url: 'https://i.pravatar.cc/150?u=104',
        last_message: 'Quais são os planos disponíveis?',
        timestamp: '09:15',
        unread_count: 0,
        handled_by: 'bot',
        messages: [
            { id: 'msg2-1', chat_id: 'chat2', sender: '104', text: 'Quais são os planos disponíveis?', avatar_url: 'https://i.pravatar.cc/150?u=104', timestamp: '09:15', type: 'text' },
            { id: 'msg2-2', chat_id: 'chat2', sender: 'bot', text: 'Olá, João! Temos os planos Básico, Profissional e Enterprise. Qual deles te interessa mais?', avatar_url: '/bot.png', timestamp: '09:16', type: 'text' },
        ],
    },
];

const App: React.FC = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [activeView, setActiveView] = useState('dashboard');
    const [users, setUsers] = useState<User[]>(usersData);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [chats, setChats] = useState<Chat[]>(initialChats);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [crmContacts, setCrmContacts] = useState<CrmContact[]>(crmContactsData);
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
        // Atendentes see chats assigned to them OR handled by the bot
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
    
    // Effect to handle if the current user is deleted from the team
    useEffect(() => {
        if (currentUser && !users.find(u => u.id === currentUser.id)) {
            setCurrentUser(users[0] || null);
        }
    }, [users, currentUser]);
    
     // Reset active chat if it's no longer visible after user switch
    useEffect(() => {
        if (activeChatId && !visibleChats.find(c => c.id === activeChatId)) {
            setActiveChatId(null);
        }
    }, [visibleChats, activeChatId]);


    // Simulate receiving a message from a new contact to demonstrate auto-creation
    useEffect(() => {
        const timer = setTimeout(() => {
            setChats(currentChats => {
                const newContactId = `+55 11 91234-9999`;
                const existingChat = currentChats.find(c => c.contact_id === newContactId);
                
                if (existingChat) {
                    return currentChats; // Already exists, do nothing
                }
                
                const newChat: Chat = {
                    id: `chat-${newContactId}`,
                    contact_id: newContactId,
                    contact_name: 'Novo Lead',
                    avatar_url: `https://i.pravatar.cc/150?u=${newContactId}`,
                    last_message: 'Olá, gostaria de um orçamento.',
                    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    unread_count: 1,
                    messages: [
                        { id: `msg-${Date.now()}`, chat_id: `chat-${newContactId}`, sender: newContactId, text: 'Olá, gostaria de um orçamento.', avatar_url: `https://i.pravatar.cc/150?u=${newContactId}`, timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), type: 'text' },
                    ],
                    handled_by: 'bot',
                };
                return [newChat, ...currentChats];
            });
        }, 5000); // Simulate after 5 seconds
    
        return () => clearTimeout(timer);
    }, []); // Run only once on mount

    // Effect to automatically create CRM contacts from new chats
    useEffect(() => {
        const existingContactIds = new Set(crmContacts.map(c => c.id));
        const newContactsToCreate: CrmContact[] = [];

        chats.forEach(chat => {
            if (!existingContactIds.has(chat.contact_id)) {
                const newContact: CrmContact = {
                    id: chat.contact_id,
                    name: chat.contact_name,
                    phone: chat.contact_id, // Assuming contact_id is the phone number for new leads
                    email: '', // Default empty email
                    avatar_url: chat.avatar_url,
                    pipeline_stage: 'Contato', // Default to the first stage
                    owner_id: '1', // Default owner: Manager
                    tags: ['novo-contato'],
                    last_interaction: new Date().toISOString().split('T')[0],
                    value: 0,
                    temperature: 'Morno',
                    next_action_date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0], // Follow up in 3 days
                    lead_source: 'WhatsApp',
                    notes: [],
                };
                newContactsToCreate.push(newContact);
                existingContactIds.add(chat.contact_id); // Avoid duplicates in the same run
            }
        });

        if (newContactsToCreate.length > 0) {
            setCrmContacts(currentContacts => [...currentContacts, ...newContactsToCreate]);
        }
    }, [chats]); // Re-run when chats list changes


    useEffect(() => {
      const fetchInitialData = async () => {
        const { data: qrData } = await supabase.from('quick_replies').select('*');
        setQuickReplies(qrData || []);
        const { data: kbData } = await supabase.from('knowledge_base').select('*');
        setKnowledgeBase(kbData || []);
      };
      fetchInitialData();
    }, []);
    
    // Effect to handle bot responses to customer messages
    useEffect(() => {
        const processBotResponses = async () => {
            const chatsToProcess = chats.filter(chat => {
                if (chat.handled_by !== 'bot' || chat.messages.length === 0) {
                    return false;
                }
                const lastMessage = chat.messages[chat.messages.length - 1];
                // Respond only if the last message is from the contact (customer)
                return lastMessage.sender === chat.contact_id;
            });

            if (chatsToProcess.length === 0) return;

            for (const chat of chatsToProcess) {
                const lastMessage = chat.messages[chat.messages.length - 1];
                if (!lastMessage) continue;

                // Determine if this is the first interaction for a proper greeting
                const customerMessagesCount = chat.messages.filter(m => m.sender === chat.contact_id).length;
                const isFirstInteraction = customerMessagesCount === 1;

                const config = { tone: 'Amigável', knowledgeBase, isFirstInteraction };
                const botResponse = await generateChatbotResponse(lastMessage.text, config);

                const botMessage: Message = {
                    id: `msg-${Date.now()}-${Math.random()}`,
                    chat_id: chat.id,
                    sender: 'bot',
                    text: botResponse.response,
                    avatar_url: '/bot.png',
                    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    type: 'text'
                };

                setChats(currentChats => currentChats.map(c => {
                    if (c.id === chat.id) {
                        const updatedChat = {
                            ...c,
                            messages: [...c.messages, botMessage],
                            last_message: botMessage.text,
                            timestamp: botMessage.timestamp,
                        };
                        if (botResponse.requiresHandoff) {
                            updatedChat.handled_by = '1'; // Assign to manager (Ana Silva) on handoff
                        }
                        return updatedChat;
                    }
                    return c;
                }));
            }
        };

        const responseTimer = setTimeout(processBotResponses, 2000); // Add a small delay
        return () => clearTimeout(responseTimer);
    }, [chats, knowledgeBase]);

    const handleNavigateToChat = (contact: CrmContact) => {
        const existingChat = chats.find(chat => chat.contact_id === contact.id);
        if (existingChat) {
            setActiveChatId(existingChat.id);
        } else {
            const newChat: Chat = {
                id: `chat-${contact.id}-${Date.now()}`,
                contact_id: contact.id,
                contact_name: contact.name,
                avatar_url: contact.avatar_url,
                last_message: 'Inicie a conversa!',
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                unread_count: 0,
                messages: [],
                handled_by: currentUser?.id || 'bot', // Assign to current user
            };
            setChats(currentChats => [newChat, ...currentChats]);
            setActiveChatId(newChat.id);
        }
        setActiveView('whatsapp');
    };


    const handleSendMessage = useCallback(async (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
        if (!currentUser) return;
        
        const newMessage: Message = {
            ...message,
            id: `msg-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        setChats(currentChats => currentChats.map(chat => {
            if (chat.id === chatId) {
                // If an agent sends a message in a bot-handled chat, they automatically take over.
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

    }, [currentUser]);

    const handleTakeOverChat = (chatId: string) => {
        if (!currentUser) return;
        setChats(currentChats => currentChats.map(chat =>
            chat.id === chatId ? { ...chat, handled_by: currentUser.id } : chat
        ));
    };
    
    const handleDeleteContact = (contactId: string) => {
        if (currentUser?.role !== 'Gerente') {
            alert('Apenas gerentes podem remover contatos.');
            return;
        }
        if (window.confirm("Tem certeza que deseja remover este contato e todas as suas informações?")) {
            setCrmContacts(prev => prev.filter(c => c.id !== contactId));
            // Optional: also remove associated chats
            setChats(prev => prev.filter(c => c.contact_id !== contactId));
        }
    };
    
    const handleSendEmail = async (contact: CrmContact, subject: string, body: string) => {
        if (!currentUser) return;
        console.log(`Simulating sending email to ${contact.email}...`);

        try {
            const result = await sendEmail({ to: contact.email, subject, body });
            if (result.success) {
                // Add a record of the email to the contact's notes
                const emailNote: Note = {
                    id: `email-${Date.now()}`,
                    type: 'email',
                    subject: subject,
                    text: body,
                    author_id: currentUser.id,
                    timestamp: new Date().toISOString(),
                };

                setCrmContacts(currentContacts =>
                    currentContacts.map(c =>
                        c.id === contact.id
                            ? { ...c, notes: [...c.notes, emailNote] }
                            : c
                    )
                );
                alert('Email enviado com sucesso!');
                setEmailTarget(null); // Close the modal
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
                return <Dashboard />;
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
                return whatsAppViewMode === 'integrado' ? (
                     <WhatsAppCrm 
                        currentUser={currentUser}
                        chats={visibleChats}
                        setChats={setChats}
                        onSendMessage={handleSendMessage}
                        users={users}
                        quickReplies={quickReplies}
                        crmContacts={crmContacts}
                        setCrmContacts={setCrmContacts}
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
                );
            case 'crm-board':
                return <CrmBoard 
                            contacts={visibleCrmContacts} 
                            setContacts={setCrmContacts} 
                            users={users} 
                            currentUser={currentUser} 
                            onNavigateToChat={handleNavigateToChat}
                            onSendEmail={setEmailTarget}
                        />;
            case 'contacts':
                return <Contacts 
                            contacts={visibleCrmContacts} 
                            setContacts={setCrmContacts} 
                            currentUser={currentUser} 
                            onDeleteContact={handleDeleteContact} 
                            onSendEmail={setEmailTarget}
                        />;
            case 'scheduling':
                return <Scheduling contacts={crmContacts} />;
            case 'broadcast':
                return <Broadcast />;
            case 'reports':
                return <Reports users={users} chats={chats} />;
            case 'chatbot':
                return <Chatbot knowledgeBase={knowledgeBase} setKnowledgeBase={setKnowledgeBase} />;
            case 'channels':
                return <Canais channels={channels} setChannels={setChannels} />;
            case 'team':
                return <Team team={users} setTeam={setUsers} currentUser={currentUser} />;
            case 'logs':
                return <Logs users={users} />;
            case 'profile':
                return <Profile 
                            currentUser={currentUser}
                            setCurrentUser={setCurrentUser}
                            users={users}
                            setUsers={setUsers}
                        />;
            case 'settings':
                return <Settings 
                            quickReplies={quickReplies} 
                            setQuickReplies={setQuickReplies} 
                        />;
            default:
                return <Dashboard />;
        }
    };

    if (!currentUser) {
         return <Login users={users} onLoginSuccess={setCurrentUser} />;
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
                    <Suspense fallback={<div className="flex items-center justify-center h-full text-text-secondary">Carregando visualização...</div>}>
                        {renderActiveView()}
                         {emailTarget && (
                            <EmailComposerModal
                                contact={emailTarget}
                                onClose={() => setEmailTarget(null)}
                                onSend={handleSendEmail}
                            />
                        )}
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default App;