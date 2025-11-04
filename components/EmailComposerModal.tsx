import React, { useState } from 'react';
import type { CrmContact } from '../types.ts';

interface EmailComposerModalProps {
    contact: CrmContact;
    onClose: () => void;
    onSend: (contact: CrmContact, subject: string, body: string) => void;
}

const EmailComposerModal: React.FC<EmailComposerModalProps> = ({ contact, onClose, onSend }) => {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !body.trim()) {
            alert('Assunto e corpo do email são obrigatórios.');
            return;
        }
        setIsSending(true);
        await onSend(contact, subject, body);
        setIsSending(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl transform transition-all">
                <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-text-main dark:text-white">Enviar Email</h3>
                    <button onClick={onClose} disabled={isSending} className="text-text-secondary hover:text-text-main dark:hover:text-white text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="to" className="block text-sm font-medium text-text-secondary dark:text-gray-300">Para</label>
                        <input
                            id="to"
                            type="email"
                            value={contact.email}
                            readOnly
                            className="mt-1 w-full p-2 bg-gray-100 dark:bg-gray-700/50 border dark:border-gray-600 rounded-lg cursor-not-allowed"
                        />
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-text-secondary dark:text-gray-300">Assunto</label>
                        <input
                            id="subject"
                            type="text"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            required
                            disabled={isSending}
                            className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="body" className="block text-sm font-medium text-text-secondary dark:text-gray-300">Mensagem</label>
                        <textarea
                            id="body"
                            rows={10}
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            required
                            disabled={isSending}
                            className="mt-1 w-full p-2 bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} disabled={isSending} className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSending} className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg disabled:bg-primary/50 flex items-center gap-2">
                            {isSending && (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isSending ? 'Enviando...' : 'Enviar Email'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EmailComposerModal;
