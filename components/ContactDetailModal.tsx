import React, { useState, useEffect, useMemo } from 'react';
import type { CrmContact, User, Activity } from '../types.ts';
import { EmailIcon } from './icons/EmailIcon.tsx';
import { NoteIcon } from './icons/NoteIcon.tsx';
import { StageChangeIcon } from './icons/StageChangeIcon.tsx';

interface ContactDetailModalProps {
    contact: CrmContact;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedContact: CrmContact) => void;
    currentUser: User;
    userMap: Map<string, User>;
    onDelete?: (contactId: string) => void;
}

const ActivityItem: React.FC<{ activity: Activity; author?: User }> = ({ activity, author }) => {
    const getIcon = () => {
        switch (activity.type) {
            case 'note': return <NoteIcon className="w-5 h-5 text-gray-500" />;
            case 'email': return <EmailIcon className="w-5 h-5 text-blue-500" />;
            case 'stage_change': return <StageChangeIcon className="w-5 h-5 text-indigo-500" />;
            default: return null;
        }
    };

    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <span className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full">{getIcon()}</span>
                <div className="w-px h-full bg-border-neutral dark:bg-gray-600"></div>
            </div>
            <div className="pb-6">
                <p className="text-xs text-text-secondary dark:text-gray-400">
                    {author?.name || 'Sistema'} • {new Date(activity.timestamp).toLocaleString('pt-BR')}
                </p>
                <div className="text-sm text-text-main dark:text-gray-200 mt-1">
                    {activity.type === 'stage_change' && (
                        <p>Etapa movida de <strong className="font-semibold">{activity.metadata?.from}</strong> para <strong className="font-semibold">{activity.metadata?.to}</strong>.</p>
                    )}
                    {activity.type === 'email' && (
                        <div>
                            <p className="font-semibold">Email: {activity.subject}</p>
                            <p className="mt-1 whitespace-pre-wrap">{activity.text}</p>
                        </div>
                    )}
                    {activity.type === 'note' && <p className="whitespace-pre-wrap">{activity.text}</p>}
                </div>
            </div>
        </div>
    );
};

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({ contact, isOpen, onClose, onSave, currentUser, userMap, onDelete }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'history'>('history');
    const [formData, setFormData] = useState<CrmContact>(contact);
    const [newNote, setNewNote] = useState('');

    useEffect(() => {
        setFormData(contact);
        setActiveTab('history');
    }, [contact, isOpen]);

    if (!isOpen) return null;

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'value' ? Number(value) : value }));
    };

    const handleSaveDetails = () => {
        onSave(formData);
    };

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        const noteActivity: Activity = {
            id: `activity-${Date.now()}`,
            type: 'note',
            text: newNote,
            author_id: currentUser.id,
            timestamp: new Date().toISOString(),
        };

        const updatedContact = { ...contact, activities: [...contact.activities, noteActivity] };
        onSave(updatedContact);
        setNewNote('');
    };
    
    const sortedActivities = useMemo(() => 
        [...formData.activities].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        [formData.activities]
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-start justify-between p-4 border-b dark:border-gray-700">
                     <div className="flex items-center gap-4">
                        <img src={contact.avatar_url} alt={contact.name} className="w-12 h-12 rounded-full" />
                        <div>
                            <h3 className="text-lg font-semibold text-text-main dark:text-white">{contact.name}</h3>
                            <p className="text-sm text-text-secondary dark:text-gray-400">{contact.email}</p>
                        </div>
                     </div>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-main dark:hover:text-white text-2xl">&times;</button>
                </div>

                <div className="border-b dark:border-gray-700">
                    <nav className="flex gap-4 px-4 -mb-px">
                        <button onClick={() => setActiveTab('history')} className={`py-3 px-1 text-sm font-medium ${activeTab === 'history' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-text-secondary hover:text-text-main'}`}>Histórico</button>
                        <button onClick={() => setActiveTab('details')} className={`py-3 px-1 text-sm font-medium ${activeTab === 'details' ? 'border-b-2 border-primary text-primary' : 'border-b-2 border-transparent text-text-secondary hover:text-text-main'}`}>Detalhes</button>
                    </nav>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'history' && (
                        <div>
                             <form onSubmit={handleAddNote} className="flex gap-2 mb-6">
                                <input 
                                    type="text"
                                    value={newNote}
                                    onChange={e => setNewNote(e.target.value)}
                                    placeholder={`Adicionar nota como ${currentUser.name}...`}
                                    className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 border rounded-lg"
                                />
                                <button type="submit" className="px-4 py-2 text-sm text-white bg-primary rounded-lg">Salvar</button>
                            </form>
                             <div className="relative">
                                {sortedActivities.map((act) => (
                                    <ActivityItem key={act.id} activity={act} author={userMap.get(act.author_id)} />
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'details' && (
                        <div className="space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Nome</label>
                                    <input name="name" value={formData.name} onChange={handleFormChange} className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 rounded-lg"/>
                                </div>
                                 <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <input name="email" value={formData.email} onChange={handleFormChange} className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 rounded-lg"/>
                                </div>
                                 <div>
                                    <label className="text-sm font-medium">Telefone</label>
                                    <input name="phone" value={formData.phone} onChange={handleFormChange} className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 rounded-lg"/>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Valor (R$)</label>
                                    <input name="value" type="number" value={formData.value} onChange={handleFormChange} className="w-full p-2 mt-1 bg-gray-100 dark:bg-gray-700 rounded-lg"/>
                                </div>
                           </div>
                            <div className="pt-2">
                                <button onClick={handleSaveDetails} className="px-4 py-2 text-white bg-primary rounded-lg">Salvar Detalhes</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};