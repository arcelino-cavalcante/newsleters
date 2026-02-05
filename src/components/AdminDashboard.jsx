import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, LogOut, FileText, Search, Loader2, List, Folder, Settings, Sun, Moon, ArrowLeft } from 'lucide-react';
import { postService } from '../services/postService';
import ModernEditor from './ModernEditor';
import CategoryManager from './CategoryManager';
import SettingsManager from './SettingsManager';
// Firebase logic removed
import { githubClient } from '../services/githubClient';
import GitHubConfig from './GitHubConfig';

const AdminDashboard = ({ isDarkMode, toggleTheme, onClose }) => {
    // Auth state now tracks if GitHub is configured
    const [isConfigured, setIsConfigured] = useState(githubClient.isConfigured());

    // Check config on mount
    useEffect(() => {
        setIsConfigured(githubClient.isConfigured());
    }, []);

    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingPost, setEditingPost] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('posts');

    useEffect(() => {
        if (isConfigured && activeTab === 'posts' && !showEditor) loadPosts();
    }, [activeTab, showEditor, isConfigured]);

    const loadPosts = async () => {
        setIsLoading(true);
        const data = await postService.getAllPosts();
        setPosts(data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
        setIsLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este artigo? Esta ação será commitada no GitHub.')) {
            try {
                await postService.deletePost(id);
                setPosts(posts.filter(p => p.id !== id));
            } catch (error) {
                alert('Erro ao excluir: ' + error.message);
            }
        }
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setShowEditor(true);
    };

    const handleCreate = () => {
        setEditingPost(null);
        setShowEditor(true);
    };

    const handleCloseEditor = () => {
        setShowEditor(false);
        setEditingPost(null);
        loadPosts(); // Refresh list
    };

    const handleLogout = () => {
        githubClient.logout();
        setIsConfigured(false);
    };

    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If not configured, show config screen
    if (!isConfigured) {
        return <GitHubConfig onConfigured={() => setIsConfigured(true)} />;
    }

    if (showEditor) {
        return <ModernEditor onClose={handleCloseEditor} initialPost={editingPost} />;
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950 dark:bg-white p-6 md:p-12 animate-in fade-in transition-colors duration-500">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white dark:text-neutral-900 mb-2">Painel Administrativo</h1>
                        <p className="text-sm text-neutral-400 dark:text-neutral-600">
                            Modo GitHub CMS <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded ml-2 uppercase font-bold">Online</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onClose}
                            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border border-neutral-800 dark:border-neutral-200 px-4 py-3 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-50 transition-colors flex items-center gap-2"
                            title="Voltar para Leitores"
                        >
                            <ArrowLeft size={18} />
                            <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Voltar</span>
                        </button>
                        {activeTab === 'posts' && (
                            <button
                                onClick={handleCreate}
                                className="bg-white dark:bg-neutral-900 text-black dark:text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
                            >
                                <Plus size={16} /> Novo Artigo
                            </button>
                        )}
                        <button
                            onClick={toggleTheme}
                            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border border-neutral-800 dark:border-neutral-200 px-4 py-3 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-50 transition-colors"
                            title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-neutral-900 dark:bg-white text-red-500 border border-neutral-800 dark:border-neutral-200 px-4 py-3 rounded-lg hover:bg-red-900/10 dark:hover:bg-red-50 transition-colors"
                            title="Desconectar GitHub"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-neutral-800 dark:border-neutral-200 mb-8">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'posts' ? 'text-white dark:text-neutral-900 border-b-2 border-white dark:border-neutral-900' : 'text-neutral-400 hover:text-neutral-300 dark:hover:text-neutral-600'}`}
                    >
                        <span className="flex items-center gap-2"><List size={16} /> Artigos</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'categories' ? 'text-white dark:text-neutral-900 border-b-2 border-white dark:border-neutral-900' : 'text-neutral-400 hover:text-neutral-300 dark:hover:text-neutral-600'}`}
                    >
                        <span className="flex items-center gap-2"><Folder size={16} /> Categorias</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'text-white dark:text-neutral-900 border-b-2 border-white dark:border-neutral-900' : 'text-neutral-400 hover:text-neutral-300 dark:hover:text-neutral-600'}`}
                    >
                        <span className="flex items-center gap-2"><Settings size={16} /> Configurações</span>
                    </button>
                </div>

                {activeTab === 'categories' ? (
                    <CategoryManager />
                ) : activeTab === 'settings' ? (
                    <SettingsManager />
                ) : (
                    <>
                        {/* Search Bar */}
                        <div className="relative mb-8">
                            <Search className="absolute left-4 top-3.5 text-neutral-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar artigos..."
                                className="w-full pl-12 p-3 bg-neutral-950 dark:bg-white border border-neutral-800 dark:border-neutral-200 rounded-xl outline-none focus:border-neutral-400 transition-colors text-white dark:text-neutral-900"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Posts Table */}
                        <div className="bg-neutral-900 dark:bg-white rounded-2xl shadow-sm border border-neutral-800 dark:border-neutral-200 overflow-hidden">
                            {isLoading ? (
                                <div className="p-12 flex justify-center">
                                    <Loader2 className="animate-spin text-neutral-400" size={32} />
                                </div>
                            ) : filteredPosts.length === 0 ? (
                                <div className="p-12 text-center text-neutral-500">
                                    Nenhum artigo encontrado.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-neutral-800 dark:border-neutral-100 bg-neutral-900/50 dark:bg-neutral-50">
                                                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-neutral-500 dark:text-neutral-600 w-1/2">Título</th>
                                                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-neutral-500 dark:text-neutral-600">Categoria</th>
                                                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-neutral-500 dark:text-neutral-600">Data</th>
                                                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-neutral-500 dark:text-neutral-600 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPosts.map(post => (
                                                <tr key={post.id} className="border-b border-neutral-800 dark:border-neutral-100 hover:bg-neutral-800/50 dark:hover:bg-neutral-50 transition-colors group">
                                                    <td className="p-4">
                                                        <div className="font-bold text-white dark:text-neutral-900 text-sm">{post.title}</div>
                                                        <div className="text-xs text-neutral-400 truncate max-w-xs">{post.excerpt}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="inline-block px-2 py-1 bg-neutral-800 dark:bg-neutral-100 rounded text-[10px] font-bold uppercase tracking-wider text-white dark:text-neutral-900">
                                                            {post.category}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-xs text-neutral-500 font-mono">
                                                        {post.date}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEdit(post)}
                                                                className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                                title="Editar"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(post.id)}
                                                                className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                title="Excluir"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
