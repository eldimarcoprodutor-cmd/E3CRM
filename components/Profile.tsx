

import React, { useState, useEffect } from 'react';
import type { User } from '../types.ts';

interface ProfileProps {
    currentUser: User;
    onUpdateUser: (user: User) => Promise<void>;
}

const Profile: React.FC<ProfileProps> = ({ currentUser, onUpdateUser }) => {
    const [profileName, setProfileName] = useState(currentUser.name);
    const [profileLogin, setProfileLogin] = useState(currentUser.login || '');
    const [isSaving, setIsSaving] = useState(false);

    // Update form if currentUser changes, e.g., via the user switcher in the header
    useEffect(() => {
        setProfileName(currentUser.name);
        setProfileLogin(currentUser.login || '');
    }, [currentUser]);
    
    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const updatedUser = { ...currentUser, name: profileName, login: profileLogin };
        
        await onUpdateUser(updatedUser);
        
        setIsSaving(false);
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
                        <label htmlFor="login" className="block text-sm font-medium text-text-secondary dark:text-gray-300 mb-1">Email (Login)</label>
                        <input
                            type="email"
                            id="login"
                            value={profileLogin}
                            onChange={e => setProfileLogin(e.target.value)}
                            className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-border-neutral dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <div className="pt-2">
                        <button 
                          type="submit" 
                          disabled={isSaving}
                          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:bg-primary/70 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Salvando...
                                </>
                            ) : (
                                'Salvar Alterações'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;