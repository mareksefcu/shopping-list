// components/LoginForm.jsx
// Login and registration form component

import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';

const LoginForm = ({ onLogin, onRegister, isLoading }) => {
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (isRegisterMode) {
                await onRegister(email, password, name);
            } else {
                await onLogin(email, password);
            }
        } catch (err) {
            setError(err.message || 'Došlo k chybě při přihlášení.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <LogIn size={32} className="text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {isRegisterMode ? 'Registrace' : 'Přihlášení'}
                        </h1>
                        <p className="text-gray-500">
                            {isRegisterMode 
                                ? 'Vytvořte si účet pro správu nákupních seznamů'
                                : 'Přihlaste se do aplikace'
                            }
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegisterMode && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jméno
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Jan Novák"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        required
                                        minLength={2}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="vas@email.com"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Heslo
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {isRegisterMode ? 'Registruji...' : 'Přihlašuji...'}
                                </>
                            ) : (
                                <>
                                    {isRegisterMode ? <UserPlus size={20} /> : <LogIn size={20} />}
                                    {isRegisterMode ? 'Registrovat' : 'Přihlásit se'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegisterMode(!isRegisterMode);
                                setError('');
                            }}
                            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                        >
                            {isRegisterMode 
                                ? 'Již máte účet? Přihlaste se'
                                : 'Nemáte účet? Zaregistrujte se'
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;


