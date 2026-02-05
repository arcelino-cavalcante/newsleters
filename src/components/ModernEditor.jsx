import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, X, UploadCloud, Layout, Type, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { postService } from '../services/postService';
import { storageService } from '../services/storageService';

const ModernEditor = ({ onClose, initialPost = null }) => {
    const [metaOpen, setMetaOpen] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState([]);

    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const loadCats = async () => {
            const data = await categoryService.getAllCategories();
            setCategories(data.map(c => c.name).sort());
        };
        loadCats();
    }, []);

    const [postData, setPostData] = useState({
        title: initialPost?.title || '',
        excerpt: initialPost?.excerpt || '',
        category: initialPost?.category || 'Documentação',
        readTime: initialPost?.readTime || '5 min',
        content: []
    });

    // Initialize blocks from existing content or default empty
    const [blocks, setBlocks] = useState(() => {
        if (initialPost?.content) {
            return initialPost.content.map(line => {
                if (line.startsWith('## ')) {
                    return { type: 'header', content: line.replace('## ', '') };
                }
                return { type: 'paragraph', content: line };
            });
        }
        return [{ type: 'paragraph', content: '' }];
    });

    // Handle block changes
    const updateBlock = (index, value) => {
        const newBlocks = [...blocks];
        newBlocks[index].content = value;
        setBlocks(newBlocks);
    };

    // Add new block on Enter
    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const newBlocks = [...blocks];
            newBlocks.splice(index + 1, 0, { type: 'paragraph', content: '' });
            setBlocks(newBlocks);
            setTimeout(() => document.getElementById(`block-${index + 1}`)?.focus(), 0);
        }
        if (e.key === 'Backspace' && blocks[index].content === '' && blocks.length > 1) {
            e.preventDefault();
            const newBlocks = blocks.filter((_, i) => i !== index);
            setBlocks(newBlocks);
            setTimeout(() => document.getElementById(`block-${index - 1}`)?.focus(), 0);
        }
    };

    // Convert block type
    const toggleBlockType = (index) => {
        const newBlocks = [...blocks];
        newBlocks[index].type = newBlocks[index].type === 'header' ? 'paragraph' : 'header';
        setBlocks(newBlocks);
    };

    // Handle Image Upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await storageService.uploadFile(file, 'images');
            const newBlocks = [...blocks];
            newBlocks.push({ type: 'paragraph', content: `![Legenda da Imagem](${url})` });
            setBlocks(newBlocks);
        } catch (error) {
            alert('Erro no upload: ' + error.message);
        } finally {
            setIsUploading(false);
            e.target.value = null;
        }
    };

    // Handle File Upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await storageService.uploadFile(file, 'files');
            const newBlocks = [...blocks];
            newBlocks.push({ type: 'paragraph', content: `[${file.name}](${url})` });
            setBlocks(newBlocks);
        } catch (error) {
            alert('Erro no upload: ' + error.message);
        } finally {
            setIsUploading(false);
            e.target.value = null;
        }
    };

    const handlePublish = async () => {
        if (!postData.title) return alert('O título é obrigatório');
        setIsPublishing(true);

        try {
            // Convert blocks to content array
            const contentArray = blocks.map(b => b.type === 'header' ? `## ${b.content}` : b.content).filter(t => t.trim() !== '');

            const finalData = {
                ...postData,
                content: contentArray
            };

            if (initialPost?.id) {
                await postService.updatePost(initialPost.id, finalData);
                alert('Artigo atualizado com sucesso!');
            } else {
                await postService.createPost({
                    ...finalData,
                    date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
                });
                alert('Artigo publicado com sucesso!');
            }

            onClose();
            window.location.reload();
        } catch (error) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-neutral-950 overflow-y-auto animate-in fade-in duration-300">
            {/* Hidden Inputs */}
            <input type="file" ref={imageInputRef} hidden accept="image/*" onChange={handleImageUpload} />
            <input type="file" ref={fileInputRef} hidden accept=".pdf,.doc,.docx,.zip,.txt" onChange={handleFileUpload} />

            {/* Top Bar */}
            <nav className="sticky top-0 z-10 bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">Editor Profissional</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMetaOpen(true)}
                        className="text-xs font-bold uppercase tracking-widest px-4 py-2 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800"
                    >
                        Metadados
                    </button>
                    <button
                        onClick={() => imageInputRef.current.click()}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                        title="Inserir Imagem"
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 size={20} className="animate-spin text-neutral-400" /> : <ImageIcon size={20} className="text-neutral-600 dark:text-neutral-400" />}
                    </button>
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                        title="Anexar Arquivo"
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 size={20} className="animate-spin text-neutral-400" /> : <UploadCloud size={20} className="text-neutral-600 dark:text-neutral-400" />}
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="bg-neutral-900 text-white dark:bg-white dark:text-black text-xs font-bold uppercase tracking-widest px-6 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-black/5 dark:shadow-white/5"
                    >
                        {isPublishing ? 'Publicando...' : <><Save size={14} /> Publicar</>}
                    </button>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-6 py-20 min-h-screen">
                {/* Title Input */}
                <input
                    type="text"
                    placeholder="Título do Artigo"
                    className="w-full text-5xl md:text-6xl font-black bg-transparent border-none outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700 mb-12 text-neutral-900 dark:text-white"
                    value={postData.title}
                    onChange={e => setPostData({ ...postData, title: e.target.value })}
                    autoFocus
                />

                {/* Blocks Editor */}
                <div className="space-y-4">
                    {blocks.map((block, index) => (
                        <div key={index} className="group relative flex items-start gap-2">
                            <button
                                onClick={() => toggleBlockType(index)}
                                className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-neutral-400 hover:text-neutral-900 dark:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                                title="Alternar Título/Texto"
                            >
                                {block.type === 'header' ? <Type size={16} /> : <Layout size={16} />}
                            </button>

                            <textarea
                                id={`block-${index}`}
                                value={block.content}
                                onChange={(e) => {
                                    updateBlock(index, e.target.value);
                                    // Auto-resize
                                    e.target.style.height = 'auto';
                                    e.target.style.height = e.target.scrollHeight + 'px';
                                }}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                placeholder={block.type === 'header' ? "Título da Seção..." : "Comece a escrever..."}
                                className={`w-full bg-transparent border-none outline-none resize-none overflow-hidden placeholder:text-neutral-300 dark:placeholder:text-neutral-700 ${block.type === 'header'
                                    ? 'text-3xl font-bold mt-8 mb-4 text-neutral-900 dark:text-white tracking-tight'
                                    : 'text-lg leading-relaxed text-neutral-800 dark:text-neutral-200'
                                    }`}
                                rows={1}
                            />
                        </div>
                    ))}
                </div>

                <div
                    className="mt-12 opacity-40 hover:opacity-100 cursor-pointer flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-opacity text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    onClick={() => setBlocks([...blocks, { type: 'paragraph', content: '' }])}
                >
                    <Plus size={16} /> Novo Bloco
                </div>
            </div>

            {/* Metadata Sidebar */}
            {metaOpen && (
                <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 z-50 animate-in slide-in-from-right">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white">Configurações</h3>
                        <button onClick={() => setMetaOpen(false)} className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"><X size={18} /></button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-700 dark:text-neutral-300">Categoria</label>
                            <select
                                className="w-full p-2.5 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none text-neutral-900 dark:text-white focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
                                value={postData.category}
                                onChange={e => setPostData({ ...postData, category: e.target.value })}
                            >
                                {categories.map(cat => cat !== 'Todos' && <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-700 dark:text-neutral-300">Tempo de Leitura</label>
                            <input
                                type="text"
                                className="w-full p-2.5 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none text-neutral-900 dark:text-white focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
                                value={postData.readTime}
                                onChange={e => setPostData({ ...postData, readTime: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-700 dark:text-neutral-300">Resumo (SEO)</label>
                            <textarea
                                className="w-full p-2.5 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 rounded-lg outline-none h-32 resize-none text-neutral-900 dark:text-white focus:border-neutral-400 dark:focus:border-neutral-500 transition-colors"
                                value={postData.excerpt}
                                onChange={e => setPostData({ ...postData, excerpt: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModernEditor;
