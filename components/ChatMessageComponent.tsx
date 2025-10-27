import React from 'react';
import type { Message, User } from '../types.ts';

interface ChatMessageProps {
    message: Message;
    currentUser: User;
    contactAvatar?: string;
    users: User[];
}

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, currentUser, contactAvatar, users }) => {
    if (message.type === 'internal') {
        const senderUser = users.find(u => u.id === message.sender);
        
        const renderTextWithMentions = (text: string) => {
            // Regex to find mentions like @John Doe, capturing the full mention.
            const mentionRegex = /(@\w+(?:\s\w+)*)/g;
            const parts = text.split(mentionRegex);
            
            return parts.map((part, index) => {
                // `split` with a capturing group alternates between non-matches and matches.
                // Matches will be at odd indices.
                if (part.startsWith('@') && index % 2 === 1) {
                    const mentionedName = part.substring(1); // Remove '@' prefix
                    const userExists = users.some(u => u.name === mentionedName);

                    if (userExists) {
                        return (
                            <strong key={index} className="text-primary dark:text-primary-light font-semibold rounded bg-primary-light dark:bg-primary/20 px-1">
                                {part}
                            </strong>
                        );
                    }
                }
                return part; // Return the part of the string (either non-mention or non-existing user mention)
            });
        };

        return (
            <div className="my-3 mx-auto max-w-lg p-3 bg-status-warning/20 dark:bg-status-warning/30 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-status-warning dark:text-status-warning flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-300">
                        Nota interna de {senderUser?.name || 'Usuário'}
                    </p>
                </div>
                <p className="text-sm text-yellow-900 dark:text-yellow-200 text-left whitespace-pre-wrap">
                    {renderTextWithMentions(message.text)}
                </p>
                <p className="text-xs text-right mt-1 text-yellow-700 dark:text-yellow-400 opacity-80">{message.timestamp}</p>
            </div>
        );
    }
    
    const isCurrentUser = message.sender === currentUser.id;
    
    return (
      <div className={`flex items-end gap-2 my-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        {!isCurrentUser && <img src={contactAvatar} alt="Avatar" className="w-8 h-8 rounded-full" />}
        <div className={`max-w-md p-3 rounded-2xl ${isCurrentUser ? 'bg-primary text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-text-main dark:text-gray-200 rounded-bl-none'}`}>
          <p className="text-sm">{message.text}</p>
          <p className="text-xs text-right mt-1 opacity-70">{message.timestamp}</p>
        </div>
      </div>
    );
};