import React, { useState, useEffect } from 'react';
import { Save, Loader2, Check, X } from 'lucide-react';
import { settingsService } from '../services/settingsService';
import { useModal } from './ModalProvider';

const SettingsManager = () => {
    const { toast } = useModal();
    const [settings, setSettings] = useState({
        siteTitle: '',
        siteSubtitle: '',
        navLogo: '',
        aboutText: '',
        footerText: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const data = await settingsService.getGeneralSettings();
        setSettings(data);
        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        try {
            await settingsService.updateGeneralSettings(settings);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

            // Force reload to apply changes globally if needed, 
            // though App.jsx should handle it if we trigger a re-fetch or use context.
            // For now, simple alert or feedback is enough.
        } catch (error) {
            toast('Erro ao salvar: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 max-w-2xl">
            <h2 className="text-lg font-bold uppercase tracking-widest text-neutral-900 mb-8 border-b border-neutral-100 pb-4">
                Configurações Gerais
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-neutral-700">
                        Título do Site (Hero)
                    </label>
                    <input
                        type="text"
                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-lg outline-none text-neutral-900 font-black uppercase tracking-tighter focus:border-neutral-400 transition-colors"
                        value={settings.siteTitle}
                        onChange={e => setSettings({ ...settings, siteTitle: e.target.value })}
                        placeholder="EX: O CAMINHO DO HOMEM"
                    />
                    <p className="mt-2 text-[10px] text-neutral-500">Texto principal de destaque na página inicial.</p>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-neutral-700">
                        Subtítulo
                    </label>
                    <input
                        type="text"
                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-lg outline-none text-neutral-900 font-bold uppercase tracking-widest focus:border-neutral-400 transition-colors"
                        value={settings.siteSubtitle}
                        onChange={e => setSettings({ ...settings, siteSubtitle: e.target.value })}
                        placeholder="EX: FILOSOFIA APLICADA"
                    />
                    <p className="mt-2 text-[10px] text-neutral-500">Pequeno texto acima do título principal.</p>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-neutral-700">
                        Logo da Navegação
                    </label>
                    <input
                        type="text"
                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-lg outline-none text-neutral-900 font-bold uppercase tracking-widest focus:border-neutral-400 transition-colors"
                        value={settings.navLogo}
                        onChange={e => setSettings({ ...settings, navLogo: e.target.value })}
                        placeholder="EX: MENSLOG"
                    />
                    <p className="mt-2 text-[10px] text-neutral-500">Nome exibido na barra superior.</p>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-neutral-700">
                        Texto 'Sobre' (Modal)
                    </label>
                    <textarea
                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-lg outline-none text-neutral-900 focus:border-neutral-400 transition-colors h-32 resize-none"
                        value={settings.aboutText}
                        onChange={e => setSettings({ ...settings, aboutText: e.target.value })}
                        placeholder="Descreva o propósito do site..."
                    />
                    <p className="mt-2 text-[10px] text-neutral-500">Texto exibido ao clicar no ícone de livro.</p>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-neutral-700">
                        Texto do Rodapé
                    </label>
                    <input
                        type="text"
                        className="w-full p-4 bg-neutral-50 border border-neutral-200 rounded-lg outline-none text-neutral-900 font-bold tracking-widest focus:border-neutral-400 transition-colors"
                        value={settings.footerText}
                        onChange={e => setSettings({ ...settings, footerText: e.target.value })}
                        placeholder="EX: © 2026 MensLog • Estoicismo Moderno"
                    />
                    <p className="mt-2 text-[10px] text-neutral-500">Aparece no final da página.</p>
                </div>

                <div className="pt-8 border-t border-neutral-100">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-900 mb-4">Frases do Dia (Rotativas)</h3>
                    <div className="space-y-4 mb-4">
                        {(settings.quotes || []).map((quote, idx) => (
                            <div key={idx} className="flex gap-4 items-start p-4 bg-neutral-50 border border-neutral-200 rounded-lg group">
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-white border border-neutral-200 rounded outline-none text-sm focus:border-neutral-400"
                                        value={quote.text}
                                        placeholder="Texto da frase"
                                        onChange={e => {
                                            const newQuotes = [...settings.quotes];
                                            newQuotes[idx].text = e.target.value;
                                            setSettings({ ...settings, quotes: newQuotes });
                                        }}
                                    />
                                    <input
                                        type="text"
                                        className="w-full p-2 bg-white border border-neutral-200 rounded outline-none text-xs text-neutral-600 focus:border-neutral-400"
                                        value={quote.author}
                                        placeholder="Autor"
                                        onChange={e => {
                                            const newQuotes = [...settings.quotes];
                                            newQuotes[idx].author = e.target.value;
                                            setSettings({ ...settings, quotes: newQuotes });
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newQuotes = settings.quotes.filter((_, i) => i !== idx);
                                        setSettings({ ...settings, quotes: newQuotes });
                                    }}
                                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors mt-1"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            const newQuotes = [...(settings.quotes || []), { text: '', author: '' }];
                            setSettings({ ...settings, quotes: newQuotes });
                        }}
                        className="text-xs font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        + Adicionar Nova Frase
                    </button>
                    <p className="mt-2 text-[10px] text-neutral-500">O sistema escolhe automaticamente uma destas frases a cada dia.</p>
                </div>

                <div className="pt-4 flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-neutral-900 text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Salvar Alterações
                    </button>

                    {success && (
                        <span className="text-green-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2 animate-in fade-in">
                            <Check size={16} /> Salvo com sucesso!
                        </span>
                    )}
                </div>
            </form>
        </div>
    );
};

export default SettingsManager;
