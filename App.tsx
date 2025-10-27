import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { CrmBoard } from './components/CrmBoard';
import { WhatsAppWeb } from './components/WhatsAppWeb';
import { Settings } from './components/Settings';
import type { User, Chat, Message, CrmContact, QuickReply, KnowledgeBaseItem, Theme } from './types';
import { Scheduling } from './components/Scheduling';
import { Broadcast } from './components/Broadcast';
import { Reports } from './components/Reports';
import { Chatbot } from './components/Chatbot';
import { Contacts } from './components/Contacts';
import { Team } from './components/Team';
import { WhatsAppCrm } from './components/WhatsAppCrm';
import { Logs } from './components/Logs';
import { generateChatbotResponse } from './services/geminiService';
import { supabase } from './services/supabase';

// Mock Data
const usersData: User[] = [
    { id: '1', name: 'Ana Silva', avatar_url: 'https://i.pravatar.cc/150?u=1', role: 'Gerente', email: 'ana.gerente@zapcrm.com' },
    { id: '2', name: 'Bruno Gomes', avatar_url: 'https://i.pravatar.cc/150?u=2', role: 'Atendente', email: 'bruno.atendente@zapcrm.com' },
    { id: '3', name: 'Carla Dias', avatar_url: 'https://i.pravatar.cc/150?u=3', role: 'Atendente', email: 'carla.atendente@zapcrm.com' },
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
        handled_by: 'bot',
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
    const [currentUser, setCurrentUser] = useState<User | null>(users[0] || null);
    const [chats, setChats] = useState<Chat[]>(initialChats);
    const [activeChatId, setActiveChatId] = useState<string | null>(initialChats[0]?.id || null);
    const [crmContacts, setCrmContacts] = useState<CrmContact[]>(crmContactsData);
    const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseItem[]>([]);
    const [whatsAppViewMode, setWhatsAppViewMode] = useState<'integrado' | 'classico'>('integrado');
    const [theme, setTheme] = useState<Theme>(() => {
        return (localStorage.getItem('theme') as Theme) || 'system';
    });

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
    }, [chats, crmContacts]); // Re-run when chats list changes


    useEffect(() => {
      const fetchInitialData = async () => {
        const { data: qrData } = await supabase.from('quick_replies').select('*');
        setQuickReplies(qrData || []);
        const { data: kbData } = await supabase.from('knowledge_base').select('*');
        setKnowledgeBase(kbData || []);
      };
      fetchInitialData();
    }, []);
    
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
                handled_by: 'bot',
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

        const updatedChats = chats.map(chat => {
            if (chat.id === chatId) {
                return {
                    ...chat,
                    messages: [...chat.messages, newMessage],
                    last_message: newMessage.text,
                    timestamp: newMessage.timestamp,
                };
            }
            return chat;
        });
        
        setChats(updatedChats);
        
        const targetChat = updatedChats.find(c => c.id === chatId);
        if (targetChat?.handled_by === 'bot') {
            const customerMessagesCount = targetChat.messages.filter(m => m.sender === targetChat.contact_id).length;
            const isFirstInteraction = customerMessagesCount === 0;

            const config = { tone: 'Amigável', knowledgeBase, isFirstInteraction };
            const botResponse = await generateChatbotResponse(newMessage.text, config);
            
            const botMessage: Message = {
                id: `msg-${Date.now() + 1}`,
                chat_id: chatId,
                sender: 'bot',
                text: botResponse.response,
                avatar_url: '/bot.png',
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                type: 'text'
            };
            setChats(currentChats => currentChats.map(chat => {
                if (chat.id === chatId) {
                    const updatedChat = { ...chat, messages: [...chat.messages, botMessage], last_message: botMessage.text };
                    if (botResponse.requiresHandoff) {
                        updatedChat.handled_by = '1'; // Assign to manager (Ana Silva) on handoff
                    }
                    return updatedChat;
                }
                return chat;
            }));
        }

    }, [chats, knowledgeBase, currentUser]);
    
    const handleTakeOverChat = (chatId: string) => {
        if (!currentUser) return;
        setChats(currentChats => currentChats.map(chat =>
            chat.id === chatId ? { ...chat, handled_by: currentUser.id } : chat
        ));
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
                return whatsAppViewMode === 'integrado' ? (
                     <WhatsAppCrm 
                        currentUser={currentUser}
                        chats={chats}
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
                        chats={chats}
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
                return <CrmBoard contacts={crmContacts} setContacts={setCrmContacts} users={users} currentUser={currentUser} onNavigateToChat={handleNavigateToChat} />;
            case 'contacts':
                return <Contacts contacts={crmContacts} setContacts={setCrmContacts} />;
            case 'scheduling':
                return <Scheduling contacts={crmContacts} />;
            case 'broadcast':
                return <Broadcast />;
            case 'reports':
                return <Reports users={users} chats={chats} />;
            case 'chatbot':
                return <Chatbot knowledgeBase={knowledgeBase} setKnowledgeBase={setKnowledgeBase} />;
            case 'team':
                return <Team team={users} setTeam={setUsers} />;
            case 'logs':
                return <Logs users={users} />;
            case 'settings':
                return <Settings 
                            currentUser={currentUser}
                            setCurrentUser={setCurrentUser}
                            users={users}
                            setUsers={setUsers}
                            quickReplies={quickReplies} 
                            setQuickReplies={setQuickReplies} 
                        />;
            default:
                return <Dashboard />;
        }
    };

    if (!currentUser) {
         return (
            <div className="flex h-screen bg-background-main dark:bg-gray-900 text-text-main dark:text-gray-200 items-center justify-center">
                <p>Nenhum usuário para carregar. Adicione um membro à equipe.</p>
            </div>
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
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {renderActiveView()}
                </main>
            </div>
        </div>
    );
};

export default App;