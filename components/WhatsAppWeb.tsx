import React, { useState, useEffect } from 'react';
import type { User, Chat, Message, QuickReply } from '../types.ts';
import { ChatInterface } from './ChatInterface.tsx';
import { BotIcon } from './icons/BotIcon.tsx';

interface WhatsAppWebProps {
    currentUser: User;
    chats: Chat[];
    setChats: (updater: (chats: Chat[]) => Chat[]) => void;
    onSendMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
    users: User[];
    quickReplies: QuickReply[];
    onTakeOverChat: (chatId: string) => void;
    activeChatId: string | null;
    setActiveChatId: (id: string | null) => void;
}

const ChatListItem: React.FC<{ chat: Chat; isActive: boolean; onClick: () => void }> = ({ chat, isActive, onClick }) => (
    <button onClick={onClick} className={`w-full text-left p-4 flex items-center space-x-4 transition-colors ${isActive ? 'bg-primary-light dark:bg-primary/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
        <div className="relative">
            <img src={chat.avatar_url} alt={chat.contact_name} className="w-12 h-12 rounded-full" />
            {chat.unread_count > 0 && <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-primary ring-2 ring-white dark:ring-gray-800"></span>}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <p className={`font-semibold truncate ${isActive ? 'text-text-main dark:text-white' : 'text-gray-800 dark:text-gray-200'}`}>{chat.contact_name}</p>
                    {chat.handled_by === 'bot' && <BotIcon className="w-4 h-4 text-primary flex-shrink-0" title="Atendido por IA" />}
                </div>
                <p className="text-xs text-text-secondary dark:text-gray-400">{chat.timestamp}</p>
            </div>
            <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-text-secondary dark:text-gray-400 truncate pr-4">{chat.last_message}</p>
                {chat.unread_count > 0 && <span className="text-xs text-white bg-primary rounded-full px-2 py-0.5">{chat.unread_count}</span>}
            </div>
        </div>
    </button>
);


const WhatsAppWeb: React.FC<WhatsAppWebProps> = ({ currentUser, chats, setChats, onSendMessage, users, quickReplies, onTakeOverChat, activeChatId, setActiveChatId }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSelectChat = (chatId: string) => {
        setActiveChatId(chatId);
        // Update the global state to mark chat as read
        setChats(currentChats => 
            currentChats.map(chat => 
                chat.id === chatId ? { ...chat, unread_count: 0 } : chat
            )
        );
    };

    const filteredChats = chats.filter(chat =>
        chat.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const activeChat = chats.find(c => c.id === activeChatId);

    return (
        <div className="flex h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            {/* Chat List Sidebar */}
            <aside className="w-1/3 border-r dark:border-gray-700 flex flex-col min-w-[350px]">
                <header className="p-4 border-b dark:border-gray-700">
                    <input 
                        type="text" 
                        placeholder="Pesquisar ou começar uma nova conversa" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm" 
                    />
                </header>
                <div className="flex-1 overflow-y-auto">
                    {filteredChats.length > 0 ? filteredChats.map(chat => (
                        <ChatListItem 
                            key={chat.id} 
                            chat={chat} 
                            isActive={chat.id === activeChatId}
                            onClick={() => handleSelectChat(chat.id)}
                        />
                    )) : <p className="p-4 text-center text-text-secondary">Nenhuma conversa encontrada.</p>}
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1">
                {activeChat ? (
                    <ChatInterface
                        key={activeChat.id}
                        chat={activeChat}
                        currentUser={currentUser}
                        onSendMessage={onSendMessage}
                        users={users}
                        quickReplies={quickReplies}
                        onTakeOverChat={onTakeOverChat}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center bg-background-main dark:bg-gray-900">
                        <h2 className="text-xl font-semibold text-text-main dark:text-gray-200">Selecione uma conversa</h2>
                        <p className="text-text-secondary dark:text-gray-400 mt-2">Escolha uma das suas conversas existentes para continuar.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default WhatsAppWeb;