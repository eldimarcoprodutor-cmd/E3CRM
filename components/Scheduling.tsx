import React, { useState, useMemo, useEffect } from 'react';
import type { CrmContact } from '../types.ts';

interface ScheduledMessage {
    id: number;
    recipient: string;
    message: string;
    scheduledAt: Date;
    status: 'Agendado' | 'Enviado' | 'Falhou';
}

interface SchedulingProps {
    contacts: CrmContact[];
}

const initialScheduledMessages: ScheduledMessage[] = [
    { id: 1, recipient: 'Grupo de Promoções', message: '📢 Última chance! 50% OFF em todos os planos. Só hoje!', scheduledAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), status: 'Agendado' },
    { id: 2, recipient: 'Mariana Costa', message: 'Olá {{nome}}, seu boleto vence amanhã. Não se esqueça de pagar!', scheduledAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), status: 'Agendado' },
    { id: 3, recipient: 'Leads Frios (TAG)', message: 'Sentimos sua falta! Que tal um café virtual para conversarmos?', scheduledAt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), status: 'Enviado' },
];

const formatDate = (date: Date) => {
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getStatusColor = (status: ScheduledMessage['status']) => {
    switch (status) {
        case 'Agendado':
            return 'bg-primary-light text-primary-dark dark:bg-primary/20 dark:text-primary-light';
        case 'Enviado':
            return 'bg-status-success/20 text-green-800 dark:bg-status-success/20 dark:text-green-200';
        case 'Falhou':
            return 'bg-status-error/20 text-red-800 dark:bg-status-error/20 dark:text-red-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
};

interface ScheduleMessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (message: Omit<ScheduledMessage, 'status'>) => void;
    initialData?: ScheduledMessage | null;
    contacts: CrmContact[];
}

const ScheduleMessageModal: React.FC<ScheduleMessageModalProps> = ({ isOpen, onClose, onSave, initialData, contacts }) => {
    const [recipient, setRecipient] = useState('');
    const [message, setMessage] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const isEditing = !!initialData;

    useEffect(() => {
        if (initialData) {
            setRecipient(initialData.recipient);
            setMessage(initialData.message);
            const d = new Date(initialData.scheduledAt);
            setDate(d.toISOString().split('T')[0]);
            setTime(d.toTimeString().substring(0, 5));
        } else {
            // Reset form for new message
            setRecipient('');
            setMessage('');
            setDate('');
            setTime('');
        }
    }, [initialData, isOpen]);

    const personalizedPreview = useMemo(() => {
        const matchedContact = contacts.find(c => c.name.toLowerCase() === recipient.toLowerCase());
        if (matchedContact) {
            return message.replace(/{{nome}}/gi, matchedContact.name);
        }
        return message;
    }, [recipient, message, contacts]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!recipient || !message || !date || !time) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        onSave({
            id: initialData?.id || Date.now(),
            recipient,
            message,
            scheduledAt: new Date(`${date}T${time}`),
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text-main dark:text-white">{isEditing ? 'Editar Agendamento' : 'Nova Mensagem Agendada'}</h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-main dark:hover:text-white text-2xl">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="recipient" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Destinatário</label>
                        <input type="text" id="recipient" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Nome do contato, grupo ou tag" className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-lg"/>
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Mensagem</label>
                        <textarea id="message" rows={5} value={message} onChange={e => setMessage(e.target.value)} placeholder="Escreva sua mensagem aqui... Use {{nome}} para personalizar." className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-lg"></textarea>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-xs font-semibold text-text-secondary dark:text-gray-400 mb-1">Pré-visualização:</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200">{personalizedPreview}</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="date" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Data</label>
                            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-lg"/>
                        </div>
                        <div className="flex-1">
                            <label htmlFor="time" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Hora</label>
                            <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-700 border rounded-lg"/>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg">Salvar Agendamento</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Scheduling: React.FC<SchedulingProps> = ({ contacts }) => {
    const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>(initialScheduledMessages);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMessage, setEditingMessage] = useState<ScheduledMessage | null>(null);

    const handleOpenEditModal = (message: ScheduledMessage) => {
        setEditingMessage(message);
        setIsModalOpen(true);
    };

    const handleOpenNewModal = () => {
        setEditingMessage(null);
        setIsModalOpen(true);
    };

    const handleSaveMessage = (data: Omit<ScheduledMessage, 'status'>) => {
        const isEditing = scheduledMessages.some(m => m.id === data.id);
        if (isEditing) {
            setScheduledMessages(scheduledMessages.map(m => m.id === data.id ? { ...m, ...data } : m));
        } else {
            const newMessage: ScheduledMessage = { ...data, status: 'Agendado' };
            setScheduledMessages([newMessage, ...scheduledMessages]);
        }
    };

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-text-main dark:text-white">Agendamentos Inteligentes</h1>
                <button 
                    onClick={handleOpenNewModal}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                    Agendar Nova Mensagem
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-text-main dark:text-white">Fila de Agendamentos</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 rounded-l-lg">Destinatário</th>
                                <th scope="col" className="px-6 py-3">Mensagem</th>
                                <th scope="col" className="px-6 py-3">Data/Hora</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 rounded-r-lg">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scheduledMessages.map(msg => (
                                <tr key={msg.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap dark:text-white">{msg.recipient}</td>
                                    <td className="px-6 py-4 truncate" style={{maxWidth: '200px'}} title={msg.message}>{msg.message}</td>
                                    <td className="px-6 py-4">{formatDate(msg.scheduledAt)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(msg.status)}`}>
                                            {msg.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <button onClick={() => handleOpenEditModal(msg)} className="font-medium text-primary dark:text-primary/90 hover:underline">Editar</button>
                                        <button className="font-medium text-status-error dark:text-status-error/90 hover:underline">Cancelar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ScheduleMessageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveMessage}
                initialData={editingMessage}
                contacts={contacts}
            />
        </div>
    );
};

export default Scheduling;