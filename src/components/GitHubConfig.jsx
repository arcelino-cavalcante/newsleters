import React, { useState } from 'react';
import { Github, Key, AlertCircle, CheckCircle, Save } from 'lucide-react';
import { githubClient } from '../services/githubClient';

const GitHubConfig = ({ onConfigured }) => {
    const [token, setToken] = useState('');
    const [repo, setRepo] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validar token básico
            if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
                // Warning apenas, tokens podem variar
            }

            // Tentar conectar
            githubClient.configure(token, repo);

            // Verificar acesso tentando ler repo info
            const client = githubClient.getClient();
            const { owner, repo: repoName } = githubClient.getRepoInfo();

            await client.repos.get({ owner, repo: repoName });

            onConfigured();
        } catch (err) {
            console.error(err);
            setError('Falha ao conectar. Verifique o Token e o Repositório.');
            githubClient.logout(); // Limpa se falhou
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4">
                        <Github size={32} className="text-black" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Conexão GitHub</h2>
                    <p className="text-neutral-400 text-sm text-center mt-2">
                        Configure seu acesso para gerenciar o conteúdo via Git-based CMS.
                    </p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                            Personal Access Token
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-3 text-neutral-500" size={16} />
                            <input
                                type="password"
                                value={token}
                                onChange={e => setToken(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-white transition-colors outline-none"
                                placeholder="ghp_..."
                                required
                            />
                        </div>
                        <p className="text-[10px] text-neutral-500 mt-2">
                            Precisa de permissão <strong>repo</strong> (Full control of private repositories).
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                            Repositório (Usuário/Repo)
                        </label>
                        <div className="relative">
                            <Github className="absolute left-3 top-3 text-neutral-500" size={16} />
                            <input
                                type="text"
                                value={repo}
                                onChange={e => setRepo(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-white focus:border-white transition-colors outline-none"
                                placeholder="ex: usuario/meu-blog"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-xl flex items-start gap-3">
                            <AlertCircle className="text-red-500 shrink-0" size={18} />
                            <p className="text-red-200 text-xs">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black font-bold uppercase tracking-widest py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Conectando...' : (
                            <>
                                <Save size={18} /> Salvar Configuração
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default GitHubConfig;
