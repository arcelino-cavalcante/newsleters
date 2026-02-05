import React, { useState } from 'react';
import { Copy, Plus, Trash, Eye, Code } from 'lucide-react';
import { categories } from '../data/posts';

const PostGenerator = ({ onClose }) => {
    const [postData, setPostData] = useState({
        id: Date.now(),
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
        category: 'Documentação',
        readTime: '5 min',
        title: '',
        excerpt: '',
        content: []
    });

    const [currentParagraph, setCurrentParagraph] = useState('');
    const [isHeader, setIsHeader] = useState(false);

    const addContent = () => {
        if (!currentParagraph.trim()) return;
        const text = isHeader ? `## ${currentParagraph}` : currentParagraph;
        setPostData({ ...postData, content: [...postData.content, text] });
        setCurrentParagraph('');
        setIsHeader(false);
    };

    const removeContent = (index) => {
        const newContent = postData.content.filter((_, i) => i !== index);
        setPostData({ ...postData, content: newContent });
    };

    const generateCode = () => {
        const code = JSON.stringify(postData, null, 4);
        navigator.clipboard.writeText(code + ',');
        alert('Código copiado! Cole no arquivo src/data/posts.js');
    };

    return (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-neutral-950 overflow-y-auto animate-in slide-in-from-bottom">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <header className="flex justify-between items-center mb-12">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Gerador de Conteúdo</h2>
                    <button onClick={onClose} className="text-sm font-bold uppercase tracking-widest hover:underline">Fechar</button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Form */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Título</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-neutral-100 dark:bg-neutral-900 border border-transparent focus:border-black dark:focus:border-white outline-none rounded-lg"
                                value={postData.title}
                                onChange={e => setPostData({ ...postData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Categoria</label>
                                <select
                                    className="w-full p-3 bg-neutral-100 dark:bg-neutral-900 outline-none rounded-lg"
                                    value={postData.category}
                                    onChange={e => setPostData({ ...postData, category: e.target.value })}
                                >
                                    {categories.map(cat => cat !== 'Todos' && <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Tempo Leitura</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-neutral-100 dark:bg-neutral-900 outline-none rounded-lg"
                                    value={postData.readTime}
                                    onChange={e => setPostData({ ...postData, readTime: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-60">Resumo</label>
                            <textarea
                                className="w-full p-3 bg-neutral-100 dark:bg-neutral-900 outline-none rounded-lg h-24 resize-none"
                                value={postData.excerpt}
                                onChange={e => setPostData({ ...postData, excerpt: e.target.value })}
                            />
                        </div>

                        <div className="p-6 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold uppercase tracking-widest opacity-60">Adicionar Conteúdo</label>
                                <button
                                    onClick={() => setIsHeader(!isHeader)}
                                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${isHeader ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-neutral-200 dark:bg-neutral-800'}`}
                                >
                                    {isHeader ? 'Cabeçalho (H2)' : 'Parágrafo'}
                                </button>
                            </div>
                            <textarea
                                className="w-full p-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 outline-none rounded-lg h-32 resize-none"
                                placeholder={isHeader ? "Digite o título da seção..." : "Digite o conteúdo do parágrafo..."}
                                value={currentParagraph}
                                onChange={e => setCurrentParagraph(e.target.value)}
                            />
                            <button
                                onClick={addContent}
                                className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest text-xs rounded-lg hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
                            >
                                <Plus size={14} /> Adicionar Bloco
                            </button>
                        </div>
                    </div>

                    {/* Preview / Output */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold uppercase tracking-widest opacity-60">Preview da Estrutura</label>
                            <button
                                onClick={generateCode}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400 hover:underline"
                            >
                                <Code size={14} /> Copiar Código
                            </button>
                        </div>

                        <div className="bg-neutral-100 dark:bg-neutral-900 p-6 rounded-xl h-[600px] overflow-y-auto space-y-4">
                            {postData.content.length === 0 && <p className="opacity-30 text-center italic mt-20">Nenhum conteúdo adicionado ainda.</p>}

                            {postData.content.map((block, idx) => (
                                <div key={idx} className="group relative bg-white dark:bg-neutral-950 p-4 rounded-lg shadow-sm">
                                    <button
                                        onClick={() => removeContent(idx)}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
                                    >
                                        <Trash size={12} />
                                    </button>

                                    {block.startsWith('## ') ? (
                                        <h3 className="font-black text-lg">{block.replace('## ', '')}</h3>
                                    ) : (
                                        <p className="text-sm opacity-80 leading-relaxed">{block}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostGenerator;
