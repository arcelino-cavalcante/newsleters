import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, Plus, X, UploadCloud, Layout, Type, Save, Image as ImageIcon, Loader2,
    Bold, Italic, Link as LinkIcon, Quote, List, AlertCircle
} from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { postService } from '../services/postService';
import { storageService } from '../services/storageService';

const ModernEditor = ({ onClose, initialPost = null }) => {
    const [metaOpen, setMetaOpen] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [activeBlock, setActiveBlock] = useState(null);

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

    // Initialize blocks
    const [blocks, setBlocks] = useState(() => {
        if (initialPost?.content) {
            return initialPost.content.map(line => {
                if (line.startsWith('## ')) return { type: 'header', content: line.replace('## ', '') };
                if (line.startsWith('> ')) return { type: 'quote', content: line.replace('> ', '') };
                if (line.startsWith('- ')) return { type: 'list', content: line.replace('- ', '') };
                return { type: 'paragraph', content: line };
            });
        }
        return [{ type: 'paragraph', content: '' }];
    });

    const updateBlock = (index, value) => {
        const newBlocks = [...blocks];
        newBlocks[index].content = value;
        setBlocks(newBlocks);
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const newBlocks = [...blocks];
            const nextType = blocks[index].type === 'list' ? 'list' : 'paragraph';
            newBlocks.splice(index + 1, 0, { type: nextType, content: '' });
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

    const toggleBlockType = (index, type) => {
        const newBlocks = [...blocks];
        newBlocks[index].type = newBlocks[index].type === type ? 'paragraph' : type;
        setBlocks(newBlocks);
    };

    const insertText = (text) => {
        if (activeBlock === null) return;
        const input = document.getElementById(`block-${activeBlock}`);
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const current = blocks[activeBlock].content;
        const before = current.substring(0, start);
        const after = current.substring(end);

        updateBlock(activeBlock, before + text + after);
        setTimeout(() => {
            input.focus();
            input.setSelectionRange(start + text.length, start + text.length);
        }, 0);
    };

    const formatText = (format) => {
        if (activeBlock === null) return;
        const input = document.getElementById(`block-${activeBlock}`);
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const current = blocks[activeBlock].content;
        const selected = current.substring(start, end);

        if (!selected) return;

        let formatted = selected;
        if (format === 'bold') formatted = `**${selected}**`;
        if (format === 'italic') formatted = `*${selected}*`;

        const before = current.substring(0, start);
        const after = current.substring(end);

        updateBlock(activeBlock, before + formatted + after);

        setTimeout(() => {
            input.focus();
            input.setSelectionRange(start, start + formatted.length);
        }, 0);
    };

    const handlePublish = async () => {
        if (!postData.title) return alert('O título é obrigatório');
        setIsPublishing(true);

        try {
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
            } else {
                await postService.createPost({
                    ...finalData,
                    date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
                });
            }
            alert('Salvo com sucesso!');
            onClose();
            // window.location.reload(); // Removed reload to make it smoother
        } catch (error) {
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setIsPublishing(false);
        }
    };

    const getBlockPlaceholder = (type) => {
        switch (type) {
            case 'header': return 'Título da Seção...';
            case 'quote': return 'Digite a citação...';
            case 'list': return 'Item da lista...';
            default: return 'Comece a escrever... (/ para comandos)';
        }
    };

    const getBlockClass = (type) => {
        switch (type) {
            case 'header': return 'text-3xl font-bold mt-8 mb-4 text-neutral-900 dark:text-white tracking-tight';
            case 'quote': return 'text-xl italic text-neutral-600 dark:text-neutral-400 border-l-4 border-neutral-300 dark:border-neutral-700 pl-4 py-2 my-4';
            case 'list': return 'list-item list-inside ml-4 text-lg text-neutral-800 dark:text-neutral-200';
            default: return 'text-lg leading-relaxed text-neutral-800 dark:text-neutral-200';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-neutral-950 flex flex-col animate-in fade-in duration-300">
            {/* Toolbar */}
            <nav className="border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur px-6 py-3 flex justify-between items-center bg-white dark:bg-neutral-950 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-2" />
                    <div className="flex gap-1">
                        <button onClick={() => formatText('bold')} className="p-2 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded" title="Negrito"><Bold size={18} /></button>
                        <button onClick={() => formatText('italic')} className="p-2 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded" title="Itálico"><Italic size={18} /></button>
                        <button onClick={() => insertText('[Texto](url)')} className="p-2 text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded" title="Link"><LinkIcon size={18} /></button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setMetaOpen(!metaOpen)} className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${metaOpen ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900'}`}>
                        Configurações
                    </button>
                    <button
                        onClick={handlePublish}
                        disabled={isPublishing}
                        className="bg-black text-white dark:bg-white dark:text-black px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity flex items-center gap-2"
                    >
                        {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {isPublishing ? 'Salvando...' : 'Publicar'}
                    </button>
                </div>
            </nav>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Editor Area */}
                <div className="flex-1 overflow-y-auto px-6 py-12 md:px-20 md:py-16 scroll-smooth">
                    <div className="max-w-4xl mx-auto min-h-[80vh]">
                        <input
                            type="text"
                            placeholder="Título do Artigo"
                            className="w-full text-5xl md:text-6xl font-black bg-transparent border-none outline-none placeholder:text-neutral-200 dark:placeholder:text-neutral-800 mb-8 text-neutral-900 dark:text-white"
                            value={postData.title}
                            onChange={e => setPostData({ ...postData, title: e.target.value })}
                            autoFocus
                        />

                        <div className="space-y-4">
                            {blocks.map((block, index) => (
                                <div key={index} className="group relative flex items-start -ml-12 pl-12">
                                    {/* Trigger Actions */}
                                    <div className="absolute left-0 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <button onClick={() => toggleBlockType(index, 'header')} className={`p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 ${block.type === 'header' ? 'text-black dark:text-white' : 'text-neutral-400'}`} title="Título"><Type size={16} /></button>
                                        <button onClick={() => toggleBlockType(index, 'quote')} className={`p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 ${block.type === 'quote' ? 'text-black dark:text-white' : 'text-neutral-400'}`} title="Citação"><Quote size={16} /></button>
                                        <button onClick={() => toggleBlockType(index, 'list')} className={`p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 ${block.type === 'list' ? 'text-black dark:text-white' : 'text-neutral-400'}`} title="Lista"><List size={16} /></button>
                                    </div>

                                    <textarea
                                        id={`block-${index}`}
                                        value={block.content}
                                        onClick={() => setActiveBlock(index)}
                                        onChange={(e) => {
                                            updateBlock(index, e.target.value);
                                            e.target.style.height = 'auto';
                                            e.target.style.height = e.target.scrollHeight + 'px';
                                        }}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        placeholder={getBlockPlaceholder(block.type)}
                                        className={`w-full bg-transparent border-none outline-none resize-none overflow-hidden placeholder:text-neutral-200 dark:placeholder:text-neutral-800 ${getBlockClass(block.type)}`}
                                        rows={1}
                                    />
                                </div>
                            ))}
                        </div>

                        <div
                            className="mt-8 py-8 border-t border-dashed border-neutral-200 dark:border-neutral-800 text-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer transition-colors"
                            onClick={() => setBlocks([...blocks, { type: 'paragraph', content: '' }])}
                        >
                            <Plus className="mx-auto mb-2" />
                            <span className="text-xs font-bold uppercase tracking-widest">Adicionar Novo Bloco</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar Metadata */}
                {metaOpen && (
                    <div className="w-80 border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 p-6 overflow-y-auto animate-in slide-in-from-right duration-300 z-30">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900 dark:text-white mb-6">Metadados do Artigo</h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-500 dark:text-neutral-400">Categoria</label>
                                <select
                                    className="w-full p-3 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none text-sm focus:border-black dark:focus:border-white transition-colors"
                                    value={postData.category}
                                    onChange={e => setPostData({ ...postData, category: e.target.value })}
                                >
                                    {categories.map(c => c !== 'Todos' && <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-500 dark:text-neutral-400">Tempo de Leitura</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none text-sm focus:border-black dark:focus:border-white transition-colors"
                                    value={postData.readTime}
                                    onChange={e => setPostData({ ...postData, readTime: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-500 dark:text-neutral-400">Resumo</label>
                                <textarea
                                    className="w-full p-3 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none text-sm focus:border-black dark:focus:border-white transition-colors min-h-[120px] resize-none leading-relaxed"
                                    value={postData.excerpt}
                                    onChange={e => setPostData({ ...postData, excerpt: e.target.value })}
                                    placeholder="Breve descrição para aparecer na lista..."
                                />
                            </div>

                            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                <p className="text-[10px] text-neutral-400 leading-relaxed">
                                    <AlertCircle size={12} className="inline mr-1" />
                                    Dica: Use <strong>##</strong> para subtítulos, <strong>-</strong> para listas e <strong>&gt;</strong> para citações diretamente no texto.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModernEditor;
