import React from 'react';
// Fix: Import the 'Message' type to resolve a type error.
import type { Chat, User, QuickReply, CrmContact, Message } from '../types.ts';
import { ChatInterface } from './ChatInterface.tsx';
import { AiAssistantPanel } from './AiAssistantPanel.tsx';

interface ActiveChatViewProps {
    chat: Chat;
    crmContacts: CrmContact[];
    currentUser: User;
    onSendMessage: (chatId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
    users: User[];
    quickReplies: QuickReply[];
    onTakeOverChat: (chatId: string) => void;
    setCrmContacts: React.Dispatch<React.SetStateAction<CrmContact[]>>;
}

export const ActiveChatView: React.FC<ActiveChatViewProps> = ({ chat, crmContacts, currentUser, onSendMessage, users, quickReplies, onTakeOverChat, setCrmContacts }) => {
    
    return (
        <div className="flex h-full bg-background-main dark:bg-gray-900">
            <div className="flex-grow flex flex-col">
                <ChatInterface
                    chat={chat}
                    currentUser={currentUser}
                    onSendMessage={onSendMessage}
                    users={users}
                    quickReplies={quickReplies}
                    onTakeOverChat={onTakeOverChat}
                />
            </div>
            <AiAssistantPanel
                currentUser={currentUser}
                currentChat={chat}
                crmContacts={crmContacts}
                onContactsUpdate={setCrmContacts}
            />
        </div>
    );
};