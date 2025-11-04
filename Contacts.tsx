import React, { useState, useMemo } from 'react';
import type { CrmContact, User } from '../types.ts';
import { ContactDetailModal } from './components/ContactDetailModal.tsx';

interface ContactsProps {
    contacts: CrmContact[];
    onAddContact: (contact: Omit<CrmContact, 'id'>) => void;
    onUpdateContact: (contact: CrmContact) => void;
    currentUser: User;
    onDeleteContact: (contactId: string) => void;
    onSendEmail: (contact: CrmContact) => void;
    users: User[];
}

// Modal for adding a new contact
const AddContactModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (contact: Omit<CrmContact, 'id'>) => void;
}> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [tags, setTags] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newContact: Omit<CrmContact, 'id'> = {
            name,
            email,
            phone,
            avatar_url: `https://i.pravatar.cc/150?u=${Date.now()}`,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            pipeline_stage: 'Contato',
            last_interaction: new Date().toISOString().split('T')[0],
            owner_id: '1', // Default to manager
            value: 0,
            temperature: 'Frio',
            next_action_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
            lead_source: 'Manual',
            activities: [],
        };
        onAdd(newContact);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4 text-text-main dark:text-white">Adicionar Novo Contato</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                    <input type="tel" placeholder="Telefone" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                    <input type="text" placeholder="Tags (separadas por vírgula)" value={tags} onChange={e => setTags(e.target.value)} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg" />
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-white bg-primary rounded-lg">Adicionar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Contacts: React.FC<ContactsProps> = ({ contacts, onAddContact, onUpdateContact, currentUser, onDeleteContact, onSendEmail, users }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState<CrmContact | null>(null);

    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleSaveContact = (updatedContact: CrmContact) => {
        onUpdateContact(updatedContact);
    };

    const handleOpenDetails = (contact: CrmContact) => {
        setSelectedContact(contact);
    };

    const handleCloseDetails = () => {
        setSelectedContact(null);
    };

    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-text-main dark:text-white">Gerenciador de Contatos</h1>
                <div className="flex items-center gap-4">
                    <input 
                        type="text" 
                        placeholder="Pesquisar contatos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 bg-white dark:bg-gray-700 border border-border-neutral dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm w-64" 
                    />
                    <button 
                        onClick={() => setAddModalOpen(true)}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">
                        Adicionar Contato
                    </button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 rounded-l-lg">Nome</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Telefone</th>
                                <th scope="col" className="px-6 py-3">Tags</th>
                                <th scope="col" className="px-6 py-3 rounded-r-lg">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContacts.map(contact => (
                                <tr key={contact.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <img src={contact.avatar_url} alt={contact.name} className="w-10 h-10 rounded-full" />
                                            <span>{contact.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{contact.email}</td>
                                    <td className="px-6 py-4">{contact.phone}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {contact.tags.map(tag => (
                                                <span key={tag} className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-text-secondary dark:text-gray-300 rounded-full">{tag}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 flex items-center space-x-4">
                                        <button onClick={() => onSendEmail(contact)} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Email</button>
                                        <button onClick={() => handleOpenDetails(contact)} className="font-medium text-primary dark:text-primary hover:underline">Detalhes</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddContactModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAdd={onAddContact}
            />

            {selectedContact && (
                <ContactDetailModal
                    isOpen={!!selectedContact}
                    onClose={handleCloseDetails}
                    contact={selectedContact}
                    onSave={handleSaveContact}
                    currentUser={currentUser}
                    onDelete={onDeleteContact}
                    userMap={userMap}
                />
            )}
        </div>
    );
};

export default Contacts;
