import React, { useState, useEffect } from 'react';
import type { User } from '../types';

interface TeamProps {
    team: User[];
    setTeam: (team: User[]) => void;
}

const TeamMemberModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (member: Omit<User, 'id'> & { id?: string }) => void;
    memberToEdit: User | null;
}> = ({ isOpen, onClose, onSave, memberToEdit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [role, setRole] = useState<'Gerente' | 'Atendente'>('Atendente');
    const isEditing = !!memberToEdit;

    useEffect(() => {
        if (memberToEdit) {
            setName(memberToEdit.name);
            setEmail(memberToEdit.email);
            setAvatarUrl(memberToEdit.avatar_url);
            setRole(memberToEdit.role);
        } else {
            // Reset form for new member
            setName('');
            setEmail('');
            setAvatarUrl('');
            setRole('Atendente');
        }
    }, [memberToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && role && email.trim()) {
            onSave({
                id: memberToEdit?.id,
                name,
                email,
                avatar_url: avatarUrl,
                role,
                password: memberToEdit?.password,
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4 text-text-main dark:text-white">
                    {isEditing ? 'Editar Membro da Equipe' : 'Adicionar Novo Membro'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Nome</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">URL do Avatar (Opcional)</label>
                        <input type="text" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="Deixe em branco para gerar um avatar" className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Cargo</label>
                        <select value={role} onChange={e => setRole(e.target.value as 'Gerente' | 'Atendente')} className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <option value="Atendente">Atendente</option>
                            <option value="Gerente">Gerente</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-white bg-primary rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const Team: React.FC<TeamProps> = ({ team, setTeam }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<User | null>(null);

    const handleOpenModal = (member: User | null) => {
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const handleSave = (memberData: Omit<User, 'id'> & { id?: string }) => {
        if (memberData.id) { // Editing
            setTeam(team.map(m => (m.id === memberData.id ? { ...m, ...memberData } as User : m)));
        } else { // Adding
            // Fix: Add missing 'email' and 'password' properties to the new User object.
            const newMember: User = {
                id: `user-${Date.now()}`,
                name: memberData.name,
                email: memberData.email,
                avatar_url: memberData.avatar_url || `https://i.pravatar.cc/150?u=${Date.now()}`,
                role: memberData.role,
                password: 'password'
            };
            setTeam([newMember, ...team]);
        }
        setIsModalOpen(false);
    };

    const handleRemove = (userId: string) => {
        if (window.confirm("Tem certeza que deseja remover este membro da equipe?")) {
            setTeam(team.filter(member => member.id !== userId));
        }
    };
  
    return (
        <div>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-text-main dark:text-white">Gerenciamento de Equipe</h1>
                <button onClick={() => handleOpenModal(null)} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">
                    Adicionar Membro
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 rounded-l-lg">Membro</th>
                                <th scope="col" className="px-6 py-3">Cargo</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 rounded-r-lg">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {team.map(member => (
                                <tr key={member.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-text-main whitespace-nowrap dark:text-white">
                                        <div className="flex items-center gap-3">
                                            <img src={member.avatar_url} alt={member.name} className="w-10 h-10 rounded-full" />
                                            <span>{member.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{member.role}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-status-success/20 text-green-800 dark:bg-status-success/20 dark:text-green-200">
                                            Ativo
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2">
                                        <button onClick={() => handleOpenModal(member)} className="font-medium text-primary dark:text-primary hover:underline">Editar</button>
                                        <button onClick={() => handleRemove(member.id)} className="font-medium text-status-error dark:text-status-error hover:underline">Remover</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <TeamMemberModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                memberToEdit={editingMember}
            />
        </div>
    );
};