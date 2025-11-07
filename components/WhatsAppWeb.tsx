import React, { useState, useEffect } from 'react';
import type { User, Chat, Message, QuickReply } from '../types.ts';
import { ChatInterface } from './ChatInterface.tsx';
import { BotIcon } from './icons/BotIcon.tsx';
import { WhatsAppIcon } from './icons/WhatsAppIcon.tsx';

interface WhatsAppWebProps {
    currentUser: User;
    chats: Chat[];
    setChats: (updater: (chats: Chat[]) => Chat[]) => void;
    onSendMessage: (chatId: string, messageText: string) => void;
    users: User[];
    quickReplies: QuickReply[];
    onTakeOverChat: (chatId: string) => void;
    activeChatId: string | null;
    setActiveChatId: (id: string | null) => void;
}

const ChatListItem: React.FC<{ chat: Chat; isActive: boolean; onClick: () => void }> = ({ chat, isActive, onClick }) => (
    <button onClick={onClick} className={`w-full text-left p-3 flex items-center space-x-3 transition-colors border-b border-gray-200 dark:border-gray-700 ${isActive ? 'bg-gray-200 dark:bg-gray-700/60' : 'hover:bg-gray-100 dark:hover:bg-gray-700/30'}`}>
        <img src={chat.avatar_url} alt={chat.contact_name} className="w-12 h-12 rounded-full" />
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
                <p className={`font-semibold truncate text-gray-800 dark:text-gray-100`}>{chat.contact_name}</p>
                <p className={`text-xs ${chat.unread_count > 0 ? 'text-status-success font-bold' : 'text-text-secondary dark:text-gray-400'}`}>{chat.timestamp}</p>
            </div>
            <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-text-secondary dark:text-gray-400 truncate pr-4">{chat.last_message}</p>
                {chat.unread_count > 0 && <span className="text-xs text-white bg-status-success font-bold rounded-full h-5 w-5 flex items-center justify-center">{chat.unread_count}</span>}
            </div>
        </div>
    </button>
);


const WhatsAppWeb: React.FC<WhatsAppWebProps> = ({ currentUser, chats, setChats, onSendMessage, users, quickReplies, onTakeOverChat, activeChatId, setActiveChatId }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSelectChat = (chatId: string) => {
        setActiveChatId(chatId);
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
        <div className="flex h-full max-h-[calc(100vh-110px)] bg-white dark:bg-[#111b21] rounded-none sm:rounded-lg shadow-lg overflow-hidden text-gray-800 dark:text-gray-200">
            {/* Chat List Sidebar */}
            <aside className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-800 flex flex-col min-w-[300px] max-w-[500px]">
                <header className="p-3 bg-[#f0f2f5] dark:bg-[#202c33] flex-shrink-0 flex items-center justify-between">
                     <img src={currentUser.avatar_url} alt={currentUser.name} className="w-10 h-10 rounded-full" />
                     {/* Placeholder icons */}
                     <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                     </div>
                </header>
                 <div className="p-2 bg-[#f0f2f5] dark:bg-[#111b21] border-b border-gray-200 dark:border-gray-800">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Pesquisar ou começar uma nova conversa" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-10 bg-white dark:bg-[#202c33] rounded-lg text-sm focus:outline-none"
                        />
                         <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                 </div>
                <div className="flex-1 overflow-y-auto bg-white dark:bg-[#111b21]">
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
            <main className="flex-1 hidden md:flex">
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
                    <div className="relative flex flex-col items-center justify-center h-full w-full text-center bg-background-main dark:bg-[#222e35]">
                         <WhatsAppIcon className="w-48 h-48 text-gray-300 dark:text-gray-600 mb-4" />
                        <h2 className="text-3xl font-light text-gray-700 dark:text-gray-300">WhatsApp Web (E3CRM)</h2>
                        <p className="text-text-secondary dark:text-gray-400 mt-2 max-w-sm">
                            Envie e receba mensagens em tempo real. Os dados são sincronizados com o CRM automaticamente.
                        </p>
                         <div className="absolute bottom-6 text-xs text-gray-500 dark:text-gray-500 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            <span>End-to-end encrypted (Simulated)</span>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default WhatsAppWeb;