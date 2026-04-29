import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Trash2, Plus, LogOut, FileText, Search, Loader2, List, Folder, Settings, Sun, Moon, ArrowLeft, Megaphone, Clock, ChevronRight } from 'lucide-react';
import { postService } from '../services/postService';
import ModernEditor from './ModernEditor';
import CategoryManager from './CategoryManager';
import SettingsManager from './SettingsManager';
import AdManager from './AdManager';
import { useModal } from './ModalProvider';
// Removed Firebase

const AdminDashboard = ({ user }) => {
    const navigate = useNavigate();
    const { toast, confirm } = useModal();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingPost, setEditingPost] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('posts');

    useEffect(() => {
        if (activeTab === 'posts' && !showEditor) loadPosts();
    }, [activeTab, showEditor]);

    const loadPosts = async () => {
        setIsLoading(true);
        const data = await postService.getAllPosts();
        setPosts(data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
        setIsLoading(false);
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm('Tem certeza que deseja excluir este artigo? Esta ação não pode ser desfeita.', {
            title: 'Excluir Artigo',
            type: 'danger',
            confirmText: 'Excluir'
        });
        if (confirmed) {
            try {
                await postService.deletePost(id);
                setPosts(posts.filter(p => p.id !== id));
                toast('Artigo excluído com sucesso', 'success');
            } catch (error) {
                toast('Erro ao excluir: ' + error.message, 'error');
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

    const filteredPosts = posts.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showEditor) {
        return <ModernEditor onClose={handleCloseEditor} initialPost={editingPost} />;
    }

    return (
        <div className="min-h-screen bg-neutral-50 p-4 md:p-12 animate-in fade-in transition-colors duration-500">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="flex flex-col gap-4 mb-6 md:mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-neutral-900 mb-1">Painel Admin</h1>
                            <p className="text-xs md:text-sm text-neutral-500">Gerencie seus artigos e documentações</p>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="bg-white text-neutral-900 border border-neutral-200 p-2.5 md:px-4 md:py-3 rounded-lg hover:bg-neutral-50 transition-colors flex items-center gap-2"
                                title="Voltar para Leitores"
                            >
                                <ArrowLeft size={18} />
                                <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Voltar</span>
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('github_token');
                                    localStorage.removeItem('github_owner');
                                    localStorage.removeItem('github_repo');
                                    window.location.href = '/admin/login';
                                }}
                                className="bg-white text-red-500 border border-neutral-200 p-2.5 md:px-4 md:py-3 rounded-lg hover:bg-red-50 transition-colors"
                                title="Sair"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>

                    {/* New Article button — full width on mobile when on posts tab */}
                    {activeTab === 'posts' && (
                        <button
                            onClick={handleCreate}
                            className="w-full md:w-auto bg-neutral-900 text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Plus size={16} /> Novo Artigo
                        </button>
                    )}
                </header>

                {/* Tabs — scrollable on mobile */}
                <div className="flex gap-4 md:gap-6 border-b border-neutral-200 mb-6 md:mb-8 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    {[
                        { id: 'posts', icon: <List size={16} />, label: 'Artigos' },
                        { id: 'categories', icon: <Folder size={16} />, label: 'Categorias' },
                        { id: 'ads', icon: <Megaphone size={16} />, label: 'Anúncios' },
                        { id: 'settings', icon: <Settings size={16} />, label: 'Config' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-3 md:pb-4 whitespace-nowrap text-xs md:text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 md:gap-2 ${activeTab === tab.id ? 'text-neutral-900 border-b-2 border-neutral-900' : 'text-neutral-400 hover:text-neutral-600'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'categories' ? (
                    <CategoryManager />
                ) : activeTab === 'ads' ? (
                    <AdManager />
                ) : activeTab === 'settings' ? (
                    <SettingsManager />
                ) : (
                    <>
                        {/* Search Bar */}
                        <div className="relative mb-6 md:mb-8">
                            <Search className="absolute left-4 top-3.5 text-neutral-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar artigos..."
                                className="w-full pl-12 p-3 bg-white border border-neutral-200 rounded-xl outline-none focus:border-neutral-400 transition-colors text-neutral-900"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Posts — Card layout on mobile, Table on desktop */}
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                            {isLoading ? (
                                <div className="p-12 flex justify-center">
                                    <Loader2 className="animate-spin text-neutral-400" size={32} />
                                </div>
                            ) : filteredPosts.length === 0 ? (
                                <div className="p-12 text-center text-neutral-500">
                                    Nenhum artigo encontrado.
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table */}
                                    <div className="hidden md:block overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-neutral-200 bg-neutral-50">
                                                    <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-neutral-500 w-1/2">Título</th>
                                                    <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Categoria</th>
                                                    <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Data</th>
                                                    <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-neutral-500 text-right">Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredPosts.map(post => (
                                                    <tr key={post.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors group">
                                                        <td className="p-4">
                                                            <div className="font-bold text-neutral-900 text-sm">{post.title}</div>
                                                            <div className="text-xs text-neutral-400 truncate max-w-xs">{post.excerpt}</div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="inline-block px-2 py-1 bg-neutral-100 rounded text-[10px] font-bold uppercase tracking-wider text-neutral-600">
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
                                                                    className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Editar"
                                                                >
                                                                    <Edit2 size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(post.id)}
                                                                    className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

                                    {/* Mobile Card List */}
                                    <div className="md:hidden divide-y divide-neutral-100">
                                        {filteredPosts.map(post => (
                                            <div key={post.id} className="p-4 active:bg-neutral-50 transition-colors">
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1 min-w-0" onClick={() => handleEdit(post)}>
                                                        <h3 className="font-bold text-neutral-900 text-sm leading-snug mb-1 line-clamp-2">{post.title}</h3>
                                                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                                            <span className="inline-block px-1.5 py-0.5 bg-neutral-100 rounded">{post.category}</span>
                                                            <span className="flex items-center gap-0.5"><Clock size={10} /> {post.readTime}</span>
                                                            <span>{post.date}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            onClick={() => handleEdit(post)}
                                                            className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(post.id)}
                                                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
