import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { X, Lock, Mail, Loader2 } from 'lucide-react';

const Login = ({ onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await signInWithEmailAndPassword(auth, email, password);
            onSuccess(); // Close modal and open editor
        } catch (err) {
            console.error(err);
            setError('Falha no login. Verifique suas credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-md p-8 rounded-2xl shadow-2xl relative border border-neutral-200 dark:border-neutral-800">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 text-neutral-900 dark:text-white">Acesso Restrito</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Faça login para gerenciar conteúdo.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-500 dark:text-neutral-400">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" size={16} />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 p-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white outline-none rounded-lg transition-colors text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                                placeholder="admin@menslog.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-500 dark:text-neutral-400">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-neutral-400 dark:text-neutral-500" size={16} />
                            <input
                                type="password"
                                required
                                className="w-full pl-10 p-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:border-neutral-900 dark:focus:border-white outline-none rounded-lg transition-colors text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-neutral-900 text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-xs rounded-lg hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Entrar no Painel'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
