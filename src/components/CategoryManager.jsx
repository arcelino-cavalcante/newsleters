import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Eye, EyeOff, Check, X, Loader2, AlertTriangle } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { useModal } from './ModalProvider';

const CategoryManager = () => {
    const { toast, confirm } = useModal();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        const data = await categoryService.getAllCategories();
        // Sort: Visible first, then alphabetical
        setCategories(data.sort((a, b) => {
            if (a.visible === b.visible) return a.name.localeCompare(b.name);
            return b.visible ? 1 : -1;
        }));
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        try {
            await categoryService.createCategory(newName.trim());
            setNewName('');
            loadCategories();
        } catch (error) {
            toast('Erro ao criar: ' + error.message, 'error');
        }
    };

    const handleToggleVisibility = async (category) => {
        try {
            await categoryService.updateCategory(category.id, { visible: !category.visible });
            loadCategories();
        } catch (error) {
            toast('Erro ao atualizar: ' + error.message, 'error');
        }
    };

    const handleDelete = async (category) => {
        const confirmed = await confirm(`Excluir a categoria "${category.name}" moverá todos os seus posts para "Sem Categoria". Deseja continuar?`, {
            title: 'Excluir Categoria',
            type: 'danger',
            confirmText: 'Excluir'
        });
        if (confirmed) {
            try {
                await categoryService.deleteCategory(category.id, category.name);
                loadCategories();
                toast('Categoria excluída', 'success');
            } catch (error) {
                toast('Erro ao excluir: ' + error.message, 'error');
            }
        }
    };

    const startEdit = (category) => {
        setEditingId(category.id);
        setEditName(category.name);
    };

    const saveEdit = async () => {
        try {
            await categoryService.updateCategory(editingId, { name: editName });
            setEditingId(null);
            loadCategories();
        } catch (error) {
            toast('Erro ao atualizar: ' + error.message, 'error');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6 border-b border-neutral-100 bg-neutral-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-lg font-bold uppercase tracking-widest text-neutral-900">Gerenciar Categorias</h2>

                <form onSubmit={handleCreate} className="flex gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Nova categoria..."
                        className="pl-4 pr-4 py-2 bg-white border border-neutral-200 rounded-lg outline-none text-sm w-full md:w-64 focus:border-neutral-400 transition-colors text-neutral-900"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                    />
                    <button type="submit" className="bg-neutral-900 text-white p-2 rounded-lg hover:opacity-80 transition-opacity">
                        <Plus size={18} />
                    </button>
                </form>
            </div>

            <div className="p-0">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <tbody>
                            {categories.map(cat => (
                                <tr key={cat.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors group">
                                    <td className="p-4 w-full">
                                        {editingId === cat.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    autoFocus
                                                    className="bg-transparent border-b border-black outline-none font-bold text-sm w-full"
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                />
                                                <button onClick={saveEdit} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={16} /></button>
                                                <button onClick={() => setEditingId(null)} className="text-red-600 hover:bg-red-50 p-1 rounded"><X size={16} /></button>
                                            </div>
                                        ) : (
                                            <div className={`font-bold text-sm ${!cat.visible ? 'opacity-40 line-through decoration-neutral-300 text-neutral-900' : 'text-neutral-900'}`}>
                                                {cat.name}
                                                {!cat.visible && <span className="ml-2 text-[10px] bg-neutral-200 text-neutral-900 px-2 py-0.5 rounded no-underline inline-block decoration-0">Oculta</span>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleToggleVisibility(cat)}
                                                className={`p-2 rounded-lg transition-colors ${cat.visible ? 'text-neutral-400 hover:text-neutral-900' : 'text-neutral-900 bg-neutral-100'}`}
                                                title="Visibilidade"
                                            >
                                                {cat.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                            <button
                                                onClick={() => startEdit(cat)}
                                                className="p-2 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat)}
                                                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="p-4 bg-neutral-50 text-xs text-neutral-500 flex items-center gap-2 font-medium">
                <AlertTriangle size={14} />
                <span>Categorias ocultas não aparecem no menu, e seus posts ficam inacessíveis pelo filtro.</span>
            </div>
        </div>
    );
};

export default CategoryManager;
