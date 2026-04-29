import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Code, Loader2, Play, Pause } from 'lucide-react';
import { adService } from '../services/adService';

const PLACEMENTS = {
    header: "Cabeçalho Global (<head>)",
    post_top: "Topo do Artigo",
    post_bottom: "Fim do Artigo",
    footer: "Rodapé do Site"
};

const AdManager = () => {
    const [ads, setAds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [editingAd, setEditingAd] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        placement: 'post_bottom',
        code: '',
        active: true
    });

    useEffect(() => {
        loadAds();
    }, []);

    const loadAds = async () => {
        setIsLoading(true);
        const data = await adService.getAllAds();
        setAds(data);
        setIsLoading(false);
    };

    const handleCreateNew = () => {
        setFormData({ name: '', placement: 'post_bottom', code: '', active: true });
        setEditingAd(null);
        setShowForm(true);
    };

    const handleEdit = (ad) => {
        setFormData({ name: ad.name, placement: ad.placement, code: ad.code, active: ad.active });
        setEditingAd(ad);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir este bloco de anúncio?")) {
            await adService.deleteAd(id);
            setAds(ads.filter(a => a.id !== id));
        }
    };

    const handleToggleStatus = async (ad) => {
        const newStatus = await adService.toggleAdStatus(ad.id, ad.active);
        setAds(ads.map(a => a.id === ad.id ? { ...a, active: newStatus } : a));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            if (editingAd) {
                const updated = await adService.updateAd(editingAd.id, formData);
                setAds(ads.map(a => a.id === updated.id ? updated : a));
            } else {
                const created = await adService.createAd(formData);
                setAds([...ads, created]);
            }
            setShowForm(false);
        } catch (error) {
            alert("Erro ao salvar: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (showForm) {
        return (
            <div className="bg-white rounded-2xl p-6 border border-neutral-200">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-neutral-900">
                        {editingAd ? 'Editar Anúncio/Script' : 'Novo Anúncio/Script'}
                    </h3>
                    <button 
                        onClick={() => setShowForm(false)}
                        className="text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
                    >
                        Cancelar
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-500">Nome de Identificação</label>
                            <input 
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="Ex: Banner AdSense Artigo"
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-black outline-none focus:border-neutral-500"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-500">Posição no Site</label>
                            <select 
                                value={formData.placement}
                                onChange={e => setFormData({...formData, placement: e.target.value})}
                                className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-black outline-none focus:border-neutral-500"
                            >
                                {Object.entries(PLACEMENTS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-neutral-500">Código HTML / JS</label>
                        <textarea 
                            required
                            value={formData.code}
                            onChange={e => setFormData({...formData, code: e.target.value})}
                            placeholder="Cole o código do anúncio (HTML ou <script>)"
                            className="w-full p-4 h-48 bg-neutral-50 border border-neutral-200 rounded-lg text-black outline-none focus:border-neutral-500 font-mono text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input 
                            type="checkbox"
                            id="active"
                            checked={formData.active}
                            onChange={e => setFormData({...formData, active: e.target.checked})}
                            className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 text-white"
                        />
                        <label htmlFor="active" className="text-sm font-bold text-neutral-900">Ativo</label>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button 
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-6 py-3 border border-neutral-200 rounded-lg text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-black transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-3 bg-neutral-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Salvar Código'}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-6 flex justify-between items-center border-b border-neutral-200">
                <div>
                    <h3 className="text-xl font-bold text-neutral-900">Gerenciador de Códigos</h3>
                    <p className="text-xs text-neutral-400">Insira scripts de anúncios e rastreamento (AdSense, Analytics, etc.)</p>
                </div>
                <button 
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                    <Plus size={16} /> Novo Código
                </button>
            </div>

            {isLoading ? (
                <div className="p-12 flex justify-center">
                    <Loader2 className="animate-spin text-neutral-400" size={32} />
                </div>
            ) : ads.length === 0 ? (
                <div className="p-12 text-center text-neutral-500">
                    <Code size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Nenhum código configurado no momento.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-100 bg-neutral-50">
                                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-neutral-500 w-1/3">Nome</th>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Posição</th>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-neutral-500">Status</th>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-bold text-neutral-500 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ads.map(ad => (
                                <tr key={ad.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                                    <td className="p-4">
                                        <div className="font-bold text-neutral-900 text-sm">{ad.name}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="inline-block px-2 py-1 bg-neutral-200 rounded text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                                            {PLACEMENTS[ad.placement] || ad.placement}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => handleToggleStatus(ad)}
                                            className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded transition-colors ${ad.active ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-neutral-800 text-neutral-500 hover:bg-neutral-700'}`}
                                        >
                                            {ad.active ? <Play size={12} /> : <Pause size={12} />}
                                            {ad.active ? 'Ativo' : 'Pausado'}
                                        </button>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleEdit(ad)}
                                                className="p-2 text-neutral-500 hover:text-blue-500 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(ad.id)}
                                                className="p-2 text-neutral-500 hover:text-red-500 transition-colors"
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
    );
};

export default AdManager;
