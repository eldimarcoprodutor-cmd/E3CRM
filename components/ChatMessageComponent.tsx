import React from 'react';
import type { Message, User } from '../types.ts';

interface ChatMessageProps {
    message: Message;
    currentUser: User;
}

const MessageStatus: React.FC<{ status: Message['status'] }> = ({ status }) => {
    const isRead = status === 'read';
    const tickColor = isRead ? '#53bdeb' : '#aebac1';

    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            className="inline-block ml-1"
            aria-label={`Status: ${status}`}
        >
            <path
                fill={tickColor}
                d="M15.01 3.316l-1.35-1.35a.6.6 0 00-.85 0L6.5 8.316 3.69 5.506a.6.6 0 00-.85 0l-1.35 1.35a.6.6 0 000 .85l4.34 4.34a.6.6 0 00.85 0l8.34-8.34a.6.6 0 000-.85z"
            ></path>
            {status !== 'sent' && (
                <path
                    fill={tickColor}
                    d="M10.01 3.316l-1.35-1.35a.6.6 0 00-.85 0L1.5 8.316 1.31 8.5a.6.6 0 000 .85l1.35 1.35a.6.6 0 00.85 0L4.84 9.37a.6.6 0 00.85 0l1.19-1.19a.6.6 0 000-.85l-.83-.82z"
                ></path>
            )}
        </svg>
    );
};

export const ChatMessageComponent: React.FC<ChatMessageProps> = ({ message, currentUser }) => {
    if (message.type === 'internal') {
       // Internal notes are not part of the WhatsApp UI, so we keep their styling.
       return (
            <div className="my-3 mx-auto max-w-lg p-3 bg-status-warning/20 dark:bg-status-warning/30 rounded-lg shadow-sm">
                <p className="text-sm text-yellow-900 dark:text-yellow-200 text-left whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs text-right mt-1 text-yellow-700 dark:text-yellow-400 opacity-80">{message.timestamp}</p>
            </div>
        );
    }
    
    const isCurrentUser = message.sender === currentUser.id;
    const formattedTime = new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
      <div className={`flex w-full ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`relative max-w-xl px-3 py-1.5 rounded-lg shadow-sm ${isCurrentUser ? 'bg-wa-green-light dark:bg-wa-green-dark' : 'bg-white dark:bg-[#202c33]'}`}>
          <p className="text-sm text-gray-800 dark:text-gray-100" style={{ wordBreak: 'break-word' }}>
            {message.text}
          </p>
          <div className="flex justify-end items-center mt-1 leading-none">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">{formattedTime}</span>
            {isCurrentUser && <MessageStatus status={message.status} />}
          </div>
        </div>
      </div>
    );
};