import React, { useState, useEffect } from 'react';
import type { User } from '../types.ts';

interface ProfileProps {
    currentUser: User;
    setCurrentUser: (user: User) => void;
    users: User[];
    setUsers: (users: User[]) => void;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, setCurrentUser, users, setUsers }) => {
    const [profileName, setProfileName] = useState(currentUser.name);
    const [profileEmail, setProfileEmail] = useState(currentUser.email || '');

    // Update form if currentUser changes, e.g., via the user switcher in the header
    useEffect(() => {
        setProfileName(currentUser.name);
        setProfileEmail(currentUser.email || '');
    }, [currentUser]);
    
    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedUser = { ...currentUser, name: profileName, email: profileEmail };
        
        // Update the master list of users
        const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
        setUsers(updatedUsers);
        
        // Update the current user state
        setCurrentUser(updatedUser);
        
        alert('Perfil salvo com sucesso!');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-text-main dark:text-white">Meu Perfil</h1>

            <div className="max-w-2xl bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-text-main dark:text-white">Informações Pessoais</h2>
                <form onSubmit={handleProfileSave} className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <img src={currentUser.avatar_url} alt={currentUser.name} className="w-20 h-20 rounded-full"/>
                        <div>
                            <p className="font-bold text-lg text-text-main dark:text-white">{currentUser.name}</p>
                            <p className="text-sm text-text-secondary dark:text-gray-400">{currentUser.role}</p>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Nome</label>
                        <input
                            type="text"
                            id="name"
                            value={profileName}
                            onChange={e => setProfileName(e.target.value)}
                            className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-border-neutral dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={profileEmail}
                            onChange={e => setProfileEmail(e.target.value)}
                            className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-border-neutral dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">Salvar Alterações</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;