import React, { useState } from 'react';
import type { User } from '../types.ts';
import { ChatIcon } from './icons/ChatIcon.tsx';

interface LoginProps {
    users: User[];
    onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ users, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if (user) {
            onLoginSuccess(user);
        } else {
            setError('Email ou senha inválidos.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background-main dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <ChatIcon className="w-12 h-12 text-primary"/>
                    </div>
                    <h1 className="text-2xl font-bold text-text-main dark:text-white">Bem-vindo ao E3CRM</h1>
                    <p className="mt-2 text-text-secondary dark:text-gray-400">Faça login para continuar</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Email</label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Senha</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Senha"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-status-error text-center">{error}</p>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark"
                        >
                            Entrar
                        </button>
                    </div>
                </form>
                 <div className="text-center text-xs text-text-secondary dark:text-gray-500 pt-4">
                    <p>Use um dos emails abaixo com a senha "password"</p>
                    <ul className="mt-2 list-disc list-inside">
                        {users.map(u => <li key={u.id}>{u.email}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Login;