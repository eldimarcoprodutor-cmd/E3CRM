import React, { useState, useEffect } from 'react';
import type { User } from '../types.ts';

interface TeamProps {
    team: User[];
    currentUser: User;
    onAddUser: (user: Omit<User, 'id'>) => Promise<void>;
    onUpdateUser: (user: User) => Promise<void>;
    onDeleteUser: (userId: string) => Promise<void>;
}

const TeamMemberModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (member: Omit<User, 'id'> & { id?: string; password?: string; }) => void;
    memberToEdit: User | null;
}> = ({ isOpen, onClose, onSave, memberToEdit }) => {
    const [name, setName] = useState('');
    // Fix: Changed state variable to 'login' to match the User type.
    const [login, setLogin] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [role, setRole] = useState<'Gerente' | 'Atendente'>('Atendente');
    const isEditing = !!memberToEdit;

    useEffect(() => {
        if (memberToEdit) {
            setName(memberToEdit.name);
            // Fix: Access 'login' property to match the User type.
            setLogin(memberToEdit.login);
            setAvatarUrl(memberToEdit.avatar_url);
            setRole(memberToEdit.role);
        } else {
            // Reset form for new member
            setName('');
            // Fix: Reset 'login' state.
            setLogin('');
            setAvatarUrl('');
            setRole('Atendente');
        }
    }, [memberToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Fix: Validate 'login' field.
        if (name.trim() && role && login.trim()) {
            onSave({
                id: memberToEdit?.id,
                name,
                // Fix: Pass 'login' property to onSave to match the User type.
                login,
                avatar_url: avatarUrl,
                role,
                password: memberToEdit?.password || 'password', // Default password for new users
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
                        <label className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Email (Login)</label>
                        {/* Fix: Bind input to 'login' state and its setter. */}
                        <input type="email" value={login} onChange={e => setLogin(e.target.value)} required className="w-full p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"/>
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
                    {!isEditing && (
                        <p className="text-xs text-text-secondary dark:text-gray-400 pt-2">
                            A senha padrão para novos usuários é "password". O usuário poderá alterá-la em seu perfil.
                        </p>
                    )}
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">Cancelar</button>
                        <button type="submit" className="px-4 py-2 text-white bg-primary rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Team: React.FC<TeamProps> = ({ team, currentUser, onAddUser, onUpdateUser, onDeleteUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<User | null>(null);

    const handleOpenModal = (member: User | null) => {
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const handleSave = async (memberData: Omit<User, 'id'> & { id?: string; password?: string; }) => {
        if (memberData.id) { // Editing
            await onUpdateUser(memberData as User);
        } else { // Adding
            const newUser: Omit<User, 'id'> = {
                name: memberData.name,
                // Fix: Use 'login' property from memberData to match the User type.
                login: memberData.login,
                avatar_url: memberData.avatar_url || `https://i.pravatar.cc/150?u=${Date.now()}`,
                role: memberData.role,
                password: 'password'
            };
            await onAddUser(newUser);
        }
        setIsModalOpen(false);
    };

    const handleRemove = (userId: string) => {
        if (userId === currentUser.id) {
            alert("Você não pode remover a si mesmo.");
            return;
        }
        if (window.confirm("Tem certeza que deseja remover este membro da equipe?")) {
            onDeleteUser(userId);
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

export default Team;