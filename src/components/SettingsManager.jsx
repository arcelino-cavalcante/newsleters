import React, { useState, useEffect } from 'react';
import { Save, Loader2, Check } from 'lucide-react';
import { settingsService } from '../services/settingsService';

const SettingsManager = () => {
    const [settings, setSettings] = useState({
        siteTitle: '',
        siteSubtitle: ''
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
            alert('Erro ao salvar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="bg-neutral-900 dark:bg-white rounded-2xl shadow-sm border border-neutral-800 dark:border-neutral-200 p-8 max-w-2xl">
            <h2 className="text-lg font-bold uppercase tracking-widest text-white dark:text-neutral-900 mb-8 border-b border-neutral-800 dark:border-neutral-100 pb-4">
                Configurações Gerais
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-neutral-300 dark:text-neutral-700">
                        Título do Site (Hero)
                    </label>
                    <input
                        type="text"
                        className="w-full p-4 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none text-neutral-900 dark:text-white font-black uppercase tracking-tighter focus:border-neutral-400 transition-colors"
                        value={settings.siteTitle}
                        onChange={e => setSettings({ ...settings, siteTitle: e.target.value })}
                        placeholder="EX: O CAMINHO DO HOMEM"
                    />
                    <p className="mt-2 text-[10px] text-neutral-500 dark:text-neutral-400">Texto principal de destaque na página inicial.</p>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-neutral-300 dark:text-neutral-700">
                        Subtítulo
                    </label>
                    <input
                        type="text"
                        className="w-full p-4 bg-neutral-950 dark:bg-neutral-50 border border-neutral-800 dark:border-neutral-200 rounded-lg outline-none text-white dark:text-neutral-900 font-bold uppercase tracking-widest focus:border-neutral-400 transition-colors"
                        value={settings.siteSubtitle}
                        onChange={e => setSettings({ ...settings, siteSubtitle: e.target.value })}
                        placeholder="EX: FILOSOFIA APLICADA"
                    />
                    <p className="mt-2 text-[10px] text-neutral-500 dark:text-neutral-400">Pequeno texto acima do título principal.</p>
                </div>

                <div className="pt-4 flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2"
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
