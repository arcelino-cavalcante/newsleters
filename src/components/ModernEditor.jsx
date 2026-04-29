import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, X, UploadCloud, Layout, Type, Save, Image as ImageIcon, Loader2, Quote, List, Eye, Edit3 } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { postService } from '../services/postService';
import { storageService } from '../services/storageService';

const DRAFT_KEY = 'menslog_editor_draft';

const ModernEditor = ({ onClose, initialPost = null }) => {
    const [metaOpen, setMetaOpen] = useState(false);
    const [isPreview, setIsPreview] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState([]);

    const imageInputRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initial state loading
    const loadInitialState = () => {
        if (initialPost) {
            return {
                title: initialPost.title || '',
                excerpt: initialPost.excerpt || '',
                category: initialPost.category || 'Documentação',
                readTime: initialPost.readTime || '5 min',
                content: initialPost.content || []
            };
        }
        
        // Try to load draft
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
            try {
                const parsedDraft = JSON.parse(draft);
                if (parsedDraft.title || parsedDraft.blocks?.length > 0) {
                    if (window.confirm("Você tem um rascunho não salvo. Deseja restaurá-lo?")) {
                        return parsedDraft;
                    } else {
                        localStorage.removeItem(DRAFT_KEY);
                    }
                }
            } catch (e) {
                console.error("Erro ao carregar rascunho", e);
            }
        }
        
        return {
            title: '',
            excerpt: '',
            category: 'Documentação',
            readTime: '0 min',
            content: []
        };
    };

    const initState = loadInitialState();

    const [postData, setPostData] = useState({
        title: initState.title,
        excerpt: initState.excerpt,
        category: initState.category,
        readTime: initState.readTime
    });

    const [blocks, setBlocks] = useState(() => {
        if (initState.blocks) return initState.blocks; // From draft
        if (initState.content && initState.content.length > 0) {
            return initState.content.map(line => {
                if (line.startsWith('## ')) return { type: 'header', content: line.replace('## ', '') };
                if (line.startsWith('> ')) return { type: 'quote', content: line.replace('> ', '') };
                if (line.startsWith('- ')) return { type: 'list', content: line.replace('- ', '') };
                return { type: 'paragraph', content: line };
            });
        }
        return [{ type: 'paragraph', content: '' }];
    });

    useEffect(() => {
        const loadCats = async () => {
            const data = await categoryService.getAllCategories();
            setCategories(data.map(c => c.name).sort());
        };
        loadCats();
    }, []);

    // Auto-save & Read Time Calculation
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!initialPost) { // Don't autosave to draft if editing existing
                localStorage.setItem(DRAFT_KEY, JSON.stringify({
                    ...postData,
                    blocks
                }));
            }

            // Calculate read time (approx 200 words per min)
            const textContent = blocks.map(b => b.content).join(' ') + ' ' + postData.title;
            const words = textContent.split(/\s+/).filter(w => w.length > 0).length;
            const minutes = Math.max(1, Math.ceil(words / 200));
            
            // Only update if changed to avoid infinite re-renders
            if (postData.readTime !== `${minutes} min` && minutes > 0 && textContent.trim().length > 0) {
                setPostData(prev => ({ ...prev, readTime: `${minutes} min` }));
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [postData.title, postData.excerpt, postData.category, blocks, initialPost]);


    // Handle block changes
    const updateBlock = (index, value) => {
        const newBlocks = [...blocks];
        newBlocks[index].content = value;
        setBlocks(newBlocks);
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const newBlocks = [...blocks];
            // If current is list, new block is also list
            const newType = blocks[index].type === 'list' ? 'list' : 'paragraph';
            newBlocks.splice(index + 1, 0, { type: newType, content: '' });
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

    // Cycle block types: paragraph -> header -> quote -> list -> paragraph
    const toggleBlockType = (index) => {
        const newBlocks = [...blocks];
        const types = ['paragraph', 'header', 'quote', 'list'];
        const currentIdx = types.indexOf(newBlocks[index].type);
        newBlocks[index].type = types[(currentIdx + 1) % types.length];
        setBlocks(newBlocks);
    };

    const getBlockIcon = (type) => {
        switch(type) {
            case 'header': return <Type size={16} />;
            case 'quote': return <Quote size={16} />;
            case 'list': return <List size={16} />;
            default: return <Layout size={16} />;
        }
    };

    const getBlockClass = (type) => {
        switch(type) {
            case 'header': return 'text-3xl font-bold mt-8 mb-4 text-neutral-900 dark:text-white tracking-tight';
            case 'quote': return 'text-xl italic border-l-4 border-neutral-300 dark:border-neutral-700 pl-4 py-2 my-4 text-neutral-600 dark:text-neutral-400';
            case 'list': return 'text-lg leading-relaxed text-neutral-800 dark:text-neutral-200 pl-6 relative before:content-["•"] before:absolute before:left-2 before:text-neutral-400';
            default: return 'text-lg leading-relaxed text-neutral-800 dark:text-neutral-200';
        }
    };

    // Handle Image Upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await storageService.uploadFile(file, 'images');
            const newBlocks = [...blocks];
            newBlocks.push({ type: 'paragraph', content: `![Legenda](${url})` });
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
            const contentArray = blocks.map(b => {
                if (b.type === 'header') return `## ${b.content}`;
                if (b.type === 'quote') return `> ${b.content}`;
                if (b.type === 'list') return `- ${b.content}`;
                return b.content;
            }).filter(t => t.trim() !== '');

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

            localStorage.removeItem(DRAFT_KEY);
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
                    <button onClick={onClose} className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Editor Profissional</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsPreview(!isPreview)}
                        className="text-xs font-bold uppercase tracking-widest px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-2"
                    >
                        {isPreview ? <><Edit3 size={16}/> Editar</> : <><Eye size={16}/> Preview</>}
                    </button>
                    <button
                        onClick={() => setMetaOpen(true)}
                        className="text-xs font-bold uppercase tracking-widest px-4 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
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
                        className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold uppercase tracking-widest px-6 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-black/5"
                    >
                        {isPublishing ? 'Publicando...' : <><Save size={14} /> Publicar</>}
                    </button>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-6 py-20 min-h-screen">
                {isPreview ? (
                    <div className="prose dark:prose-invert prose-neutral max-w-none">
                        <h1 className="text-5xl md:text-6xl font-black mb-12 text-neutral-900 dark:text-white">{postData.title || 'Sem Título'}</h1>
                        {blocks.map((b, i) => {
                            if (b.type === 'header') return <h2 key={i} className="text-3xl font-bold mt-8 mb-4 text-neutral-900 dark:text-white">{b.content}</h2>;
                            if (b.type === 'quote') return <blockquote key={i} className="border-l-4 border-neutral-300 dark:border-neutral-700 pl-4 italic my-4 text-neutral-600 dark:text-neutral-400">{b.content}</blockquote>;
                            if (b.type === 'list') return <ul key={i} className="list-disc pl-6 my-2 text-neutral-800 dark:text-neutral-200"><li>{b.content}</li></ul>;
                            return <p key={i} className="text-lg leading-relaxed mb-4 text-neutral-800 dark:text-neutral-200">{b.content}</p>;
                        })}
                    </div>
                ) : (
                    <>
                        <input
                            type="text"
                            placeholder="Título do Artigo"
                            className="w-full text-5xl md:text-6xl font-black bg-transparent border-none outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-800 mb-12 text-neutral-900 dark:text-white"
                            value={postData.title}
                            onChange={e => setPostData({ ...postData, title: e.target.value })}
                            autoFocus
                        />

                        <div className="space-y-4">
                            {blocks.map((block, index) => (
                                <div key={index} className="group relative flex items-start gap-2">
                                    <button
                                        onClick={() => toggleBlockType(index)}
                                        className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                                        title="Alternar Formatação (Texto, Título, Citação, Lista)"
                                    >
                                        {getBlockIcon(block.type)}
                                    </button>

                                    <textarea
                                        id={`block-${index}`}
                                        value={block.content}
                                        onChange={(e) => {
                                            updateBlock(index, e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        placeholder={block.type === 'header' ? "Título da Seção..." : "Comece a escrever..."}
                                        className={`w-full bg-transparent border-none outline-none resize-none overflow-hidden placeholder:text-neutral-300 dark:placeholder:text-neutral-700 ${getBlockClass(block.type)}`}
                                        rows={1}
                                    />
                                </div>
                            ))}
                        </div>

                        <div
                            className="mt-12 opacity-40 hover:opacity-100 cursor-pointer flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-opacity text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                            onClick={() => setBlocks([...blocks, { type: 'paragraph', content: '' }])}
                        >
                            <Plus size={16} /> Novo Bloco
                        </div>
                    </>
                )}
            </div>

            {/* Metadata Sidebar */}
            {metaOpen && (
                <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 z-50 animate-in slide-in-from-right">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white">Metadados</h3>
                        <button onClick={() => setMetaOpen(false)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white"><X size={18} /></button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-700 dark:text-neutral-400">Categoria</label>
                            <select
                                className="w-full p-2.5 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none text-neutral-900 dark:text-white focus:border-neutral-400 transition-colors"
                                value={postData.category}
                                onChange={e => setPostData({ ...postData, category: e.target.value })}
                            >
                                {categories.map(cat => cat !== 'Todos' && <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-700 dark:text-neutral-400">Tempo de Leitura (Automático)</label>
                            <input
                                type="text"
                                className="w-full p-2.5 text-sm bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                                value={postData.readTime}
                                readOnly
                                disabled
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-700 dark:text-neutral-400">Resumo (SEO)</label>
                            <textarea
                                className="w-full p-2.5 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none h-32 resize-none text-neutral-900 dark:text-white focus:border-neutral-400 transition-colors"
                                value={postData.excerpt}
                                onChange={e => setPostData({ ...postData, excerpt: e.target.value })}
                                placeholder="Um resumo curto para atrair leitores..."
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModernEditor;
