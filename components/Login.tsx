import React, { useState } from 'react';
import type { User } from '../types.ts';
import { ChatIcon } from './icons/ChatIcon.tsx';

interface LoginProps {
    users: User[];
    onLoginSuccess: (user: User) => void;
    onSignUp: (name: string, email: string, password: string) => { success: boolean, error?: string };
}

const Login: React.FC<LoginProps> = ({ users, onLoginSuccess, onSignUp }) => {
    const [isLoginView, setIsLoginView] = useState(true);

    // Common state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Sign up specific state
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if (user) {
            onLoginSuccess(user);
        } else {
            setError('Email ou senha inválidos.');
        }
    };
    
    const handleSignUpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
    
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
    
        const result = onSignUp(name, email, password);
        if (!result.success) {
            setError(result.error || 'Não foi possível criar a conta.');
        }
        // On success, the App component handles the login automatically
    };

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        // Clear all fields and errors when switching views
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background-main dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <ChatIcon className="w-12 h-12 text-primary"/>
                    </div>
                    <h1 className="text-2xl font-bold text-text-main dark:text-white">
                        {isLoginView ? 'Bem-vindo ao E3CRM' : 'Crie sua Conta'}
                    </h1>
                    <p className="mt-2 text-text-secondary dark:text-gray-400">
                        {isLoginView ? 'Faça login para continuar' : 'Preencha os dados para se cadastrar'}
                    </p>
                </div>
                
                {isLoginView ? (
                    <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
                        {/* Login Form Fields */}
                        <div className="rounded-md shadow-sm -space-y-px">
                             <div>
                                <label htmlFor="email-address" className="sr-only">Email</label>
                                <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Email"/>
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">Senha</label>
                                <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Senha"/>
                            </div>
                        </div>
                         {error && <p className="text-sm text-status-error text-center">{error}</p>}
                        <div>
                            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark">
                                Entrar
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={handleSignUpSubmit}>
                        {/* Sign Up Form Fields */}
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="name" className="sr-only">Nome</label>
                                <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Nome completo"/>
                            </div>
                            <div>
                                <label htmlFor="email-address-signup" className="sr-only">Email</label>
                                <input id="email-address-signup" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Email"/>
                            </div>
                             <div>
                                <label htmlFor="password-signup" className="sr-only">Senha</label>
                                <input id="password-signup" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Senha"/>
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="sr-only">Confirmar Senha</label>
                                <input id="confirm-password" name="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Confirmar Senha"/>
                            </div>
                        </div>
                        {error && <p className="text-sm text-status-error text-center">{error}</p>}
                        <div>
                             <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark">
                                Cadastrar
                            </button>
                        </div>
                    </form>
                )}

                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    {isLoginView ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
                    <button type="button" onClick={toggleView} className="font-medium text-primary hover:text-primary-dark">
                        {isLoginView ? 'Cadastre-se' : 'Entrar'}
                    </button>
                </p>

                {isLoginView && (
                    <div className="text-center text-xs text-text-secondary dark:text-gray-500 pt-4">
                        <p>Use um dos emails abaixo com a senha "password"</p>
                        <ul className="mt-2 list-disc list-inside">
                            {users.map(u => <li key={u.id}>{u.email}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;