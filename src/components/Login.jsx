import React, { useState } from 'react';
import { githubService } from '../services/githubService';
import { Lock, Github, Loader2, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
    const [token, setToken] = useState('');
    const [repoString, setRepoString] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const parts = repoString.split('/');
            if (parts.length !== 2) {
                throw new Error("Formato inválido. Use usuario/repositorio");
            }
            const owner = parts[0].trim();
            const repo = parts[1].trim();
            const tokenStr = token.trim();

            const result = await githubService.testConnection(tokenStr, owner, repo);
            if (result.success) {
                localStorage.setItem('github_token', tokenStr);
                localStorage.setItem('github_owner', owner);
                localStorage.setItem('github_repo', repo);
                onLoginSuccess({ username: result.user });
                navigate('/admin');
            } else {
                setError(`Erro do GitHub: ${result.error}`);
            }
        } catch (err) {
            console.error(err);
            setError(err.message || 'Falha na conexão. Verifique suas credenciais.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-6 animate-in fade-in transition-colors duration-500">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-neutral-200">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 text-neutral-900 flex items-center justify-center gap-2">
                        <Github size={24} /> Admin
                    </h2>
                    <p className="text-sm text-neutral-500">Conecte seu repositório para gerenciar.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-500">Repositório (usuario/repo)</label>
                        <div className="relative">
                            <Database className="absolute left-3 top-3 text-neutral-400" size={16} />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 p-3 bg-neutral-50 border border-neutral-200 focus:border-neutral-900 outline-none rounded-lg transition-colors text-neutral-900 placeholder:text-neutral-400"
                                placeholder="ex: seu-usuario/seu-repositorio"
                                value={repoString}
                                onChange={e => setRepoString(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-500">Token PAT do GitHub</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-neutral-400" size={16} />
                            <input
                                type="password"
                                required
                                className="w-full pl-10 p-3 bg-neutral-50 border border-neutral-200 focus:border-neutral-900 outline-none rounded-lg transition-colors text-neutral-900 placeholder:text-neutral-400"
                                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-neutral-900 text-white font-bold uppercase tracking-widest text-xs rounded-lg hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Conectar Banco'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
