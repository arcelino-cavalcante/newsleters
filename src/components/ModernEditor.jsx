import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, X, UploadCloud, Layout, Type, Save, Image as ImageIcon, Loader2, Quote, List, Eye, Edit3, Settings, Code } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { postService } from '../services/postService';
import { storageService } from '../services/storageService';
import { useModal } from './ModalProvider';

const DRAFT_KEY = 'menslog_editor_draft';

const ModernEditor = ({ onClose, initialPost = null }) => {
    const { toast, confirm } = useModal();
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
                    // Draft restoration is handled after mount
                    return parsedDraft;
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
                if (line.startsWith('```') && line.endsWith('```')) {
                    // Extract code without the backticks. Allow optional lang tag on first line.
                    const match = line.match(/^```.*\n([\s\S]*)\n```$/);
                    return { type: 'code', content: match ? match[1] : line.replace(/```/g, '').trim() };
                }
                if (line.startsWith('### ')) return { type: 'subheader', content: line.replace('### ', '') };
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

    // Cycle block types: paragraph -> header -> subheader -> quote -> list -> code -> paragraph
    const toggleBlockType = (index) => {
        const newBlocks = [...blocks];
        const types = ['paragraph', 'header', 'subheader', 'quote', 'list', 'code'];
        const currentIdx = types.indexOf(newBlocks[index].type);
        newBlocks[index].type = types[(currentIdx + 1) % types.length];
        setBlocks(newBlocks);
    };

    const getBlockIcon = (type) => {
        switch(type) {
            case 'header': return <Type size={16} />;
            case 'subheader': return <Type size={14} className="opacity-70" />;
            case 'quote': return <Quote size={16} />;
            case 'list': return <List size={16} />;
            case 'code': return <Code size={16} />;
            default: return <Layout size={16} />;
        }
    };

    const getBlockClass = (type) => {
        switch(type) {
            case 'header': return 'text-2xl md:text-3xl font-bold mt-6 md:mt-8 mb-3 md:mb-4 text-neutral-900 dark:text-white tracking-tight';
            case 'subheader': return 'text-xl md:text-2xl font-bold mt-5 md:mt-6 mb-2 md:mb-3 text-neutral-800 dark:text-neutral-200 tracking-tight';
            case 'quote': return 'text-lg md:text-xl italic border-l-4 border-neutral-300 dark:border-neutral-700 pl-4 py-2 my-4 text-neutral-600 dark:text-neutral-400';
            case 'list': return 'text-base md:text-lg leading-relaxed text-neutral-800 dark:text-neutral-200 pl-6 relative before:content-["•"] before:absolute before:left-2 before:text-neutral-400';
            case 'code': return 'text-sm font-mono bg-neutral-900 text-neutral-200 p-4 rounded-lg my-4 whitespace-pre-wrap outline-none border-none resize-none overflow-x-auto';
            default: return 'text-base md:text-lg leading-relaxed text-neutral-800 dark:text-neutral-200';
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
            toast('Erro no upload: ' + error.message, 'error');
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
            toast('Erro no upload: ' + error.message, 'error');
        } finally {
            setIsUploading(false);
            e.target.value = null;
        }
    };

    const handlePublish = async () => {
        if (!postData.title) return toast('O título é obrigatório', 'warning');
        setIsPublishing(true);

        try {
            // Convert blocks to content array
            const contentArray = blocks.map(b => {
                if (b.type === 'header') return `## ${b.content}`;
                if (b.type === 'subheader') return `### ${b.content}`;
                if (b.type === 'quote') return `> ${b.content}`;
                if (b.type === 'list') return `- ${b.content}`;
                if (b.type === 'code') return `\`\`\`javascript\n${b.content}\n\`\`\``;
                return b.content;
            }).filter(t => t.trim() !== '');

            const finalData = {
                ...postData,
                content: contentArray
            };

            if (initialPost?.id) {
                await postService.updatePost(initialPost.id, finalData);
                toast('Artigo atualizado com sucesso!', 'success');
            } else {
                await postService.createPost({
                    ...finalData,
                    date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
                });
                toast('Artigo publicado com sucesso!', 'success');
            }

            localStorage.removeItem(DRAFT_KEY);
            onClose();
            window.location.reload();
        } catch (error) {
            toast('Erro ao salvar: ' + error.message, 'error');
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-neutral-950 overflow-y-auto animate-in fade-in duration-300">
            {/* Hidden Inputs */}
            <input type="file" ref={imageInputRef} hidden accept="image/*" onChange={handleImageUpload} />
            <input type="file" ref={fileInputRef} hidden accept=".pdf,.doc,.docx,.zip,.txt" onChange={handleFileUpload} />

            {/* Top Bar — Mobile-first: two rows on small screens */}
            <nav className="sticky top-0 z-10 bg-white/95 dark:bg-neutral-950/95 backdrop-blur border-b border-neutral-200 dark:border-neutral-800 px-4 md:px-6 py-3 md:py-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 md:gap-4">
                        <button onClick={onClose} className="p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-neutral-500 hidden sm:inline">Editor</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-3">
                        <button
                            onClick={() => setIsPreview(!isPreview)}
                            className="p-2 md:px-4 md:py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors flex items-center gap-1 md:gap-2"
                            title={isPreview ? 'Editar' : 'Preview'}
                        >
                            {isPreview ? <Edit3 size={18}/> : <Eye size={18}/>}
                            <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">{isPreview ? 'Editar' : 'Preview'}</span>
                        </button>
                        <button
                            onClick={() => setMetaOpen(true)}
                            className="p-2 md:px-4 md:py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                            title="Metadados"
                        >
                            <Settings size={18} className="md:hidden" />
                            <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">Metadados</span>
                        </button>
                        <button
                            onClick={() => imageInputRef.current.click()}
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                            title="Inserir Imagem"
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 size={18} className="animate-spin text-neutral-400" /> : <ImageIcon size={18} className="text-neutral-600 dark:text-neutral-400" />}
                        </button>
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors hidden sm:flex"
                            title="Anexar Arquivo"
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 size={18} className="animate-spin text-neutral-400" /> : <UploadCloud size={18} className="text-neutral-600 dark:text-neutral-400" />}
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] md:text-xs font-bold uppercase tracking-widest px-3 md:px-6 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1 md:gap-2 shadow-lg shadow-black/5 ml-1"
                        >
                            {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> <span className="hidden sm:inline">Publicar</span></>}
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-20 min-h-screen">
                {isPreview ? (
                    <div className="prose dark:prose-invert prose-neutral max-w-none">
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-8 md:mb-12 text-neutral-900 dark:text-white">{postData.title || 'Sem Título'}</h1>
                        {blocks.map((b, i) => {
                            if (b.type === 'header') return <h2 key={i} className="text-2xl md:text-3xl font-bold mt-6 md:mt-8 mb-3 md:mb-4 text-neutral-900 dark:text-white">{b.content}</h2>;
                            if (b.type === 'quote') return <blockquote key={i} className="border-l-4 border-neutral-300 dark:border-neutral-700 pl-4 italic my-4 text-neutral-600 dark:text-neutral-400">{b.content}</blockquote>;
                            if (b.type === 'list') return <ul key={i} className="list-disc pl-6 my-2 text-neutral-800 dark:text-neutral-200"><li>{b.content}</li></ul>;
                            return <p key={i} className="text-base md:text-lg leading-relaxed mb-4 text-neutral-800 dark:text-neutral-200">{b.content}</p>;
                        })}
                    </div>
                ) : (
                    <>
                        <input
                            type="text"
                            placeholder="Título do Artigo"
                            className="w-full text-3xl sm:text-4xl md:text-6xl font-black bg-transparent border-none outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-800 mb-8 md:mb-12 text-neutral-900 dark:text-white"
                            value={postData.title}
                            onChange={e => setPostData({ ...postData, title: e.target.value })}
                            autoFocus
                        />

                        <div className="space-y-3 md:space-y-4">
                            {blocks.map((block, index) => (
                                <div key={index} className="group relative flex items-start gap-1 md:gap-2">
                                    <button
                                        onClick={() => toggleBlockType(index)}
                                        className="mt-1 md:mt-2 opacity-60 md:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity p-1 md:p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded shrink-0"
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
                            className="mt-8 md:mt-12 opacity-60 hover:opacity-100 active:opacity-100 cursor-pointer flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-opacity text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white py-3"
                            onClick={() => setBlocks([...blocks, { type: 'paragraph', content: '' }])}
                        >
                            <Plus size={16} /> Novo Bloco
                        </div>
                    </>
                )}
            </div>

            {/* Metadata Sidebar — Full screen on mobile, sidebar on desktop */}
            {metaOpen && (
                <>
                    {/* Overlay backdrop */}
                    <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setMetaOpen(false)} />
                    <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:left-auto md:right-0 md:w-80 bg-white dark:bg-neutral-900 border-t md:border-t-0 md:border-l border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 z-50 animate-in slide-in-from-bottom md:slide-in-from-right max-h-[85vh] md:max-h-none overflow-y-auto rounded-t-2xl md:rounded-none">
                        <div className="flex justify-between items-center mb-6 md:mb-8">
                            {/* Mobile drag handle */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full md:hidden" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900 dark:text-white">Metadados</h3>
                            <button onClick={() => setMetaOpen(false)} className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white p-2"><X size={18} /></button>
                        </div>

                        <div className="space-y-5 md:space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-700 dark:text-neutral-400">Categoria</label>
                                <select
                                    className="w-full p-3 md:p-2.5 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none text-neutral-900 dark:text-white focus:border-neutral-400 transition-colors"
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
                                    className="w-full p-3 md:p-2.5 text-sm bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
                                    value={postData.readTime}
                                    readOnly
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-700 dark:text-neutral-400">Resumo (SEO)</label>
                                <textarea
                                    className="w-full p-3 md:p-2.5 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none h-32 resize-none text-neutral-900 dark:text-white focus:border-neutral-400 transition-colors"
                                    value={postData.excerpt}
                                    onChange={e => setPostData({ ...postData, excerpt: e.target.value })}
                                    placeholder="Um resumo curto para atrair leitores..."
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ModernEditor;
