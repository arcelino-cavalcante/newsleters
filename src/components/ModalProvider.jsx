import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info, Loader2 } from 'lucide-react';

const ModalContext = createContext(null);

// ─── Toast Notification (replaces alert) ───
const Toast = ({ toast, onDismiss }) => {
    useEffect(() => {
        if (toast.autoDismiss !== false) {
            const timer = setTimeout(() => onDismiss(toast.id), 3500);
            return () => clearTimeout(timer);
        }
    }, [toast, onDismiss]);

    const icons = {
        success: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />,
        error: <AlertCircle size={18} className="text-red-400 shrink-0" />,
        warning: <AlertTriangle size={18} className="text-amber-400 shrink-0" />,
        info: <Info size={18} className="text-blue-400 shrink-0" />,
    };

    const borderColors = {
        success: 'border-emerald-500/30',
        error: 'border-red-500/30',
        warning: 'border-amber-500/30',
        info: 'border-blue-500/30',
    };

    return (
        <div className={`flex items-start gap-3 bg-neutral-950 text-white px-4 py-3.5 rounded-xl border ${borderColors[toast.type] || borderColors.info} shadow-2xl shadow-black/40 max-w-sm w-full animate-in slide-in-from-top fade-in duration-300`}>
            {icons[toast.type] || icons.info}
            <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>
            <button onClick={() => onDismiss(toast.id)} className="text-neutral-500 hover:text-white transition-colors shrink-0 p-0.5">
                <X size={14} />
            </button>
        </div>
    );
};

// ─── Confirm Dialog (replaces window.confirm) ───
const ConfirmDialog = ({ dialog, onResolve }) => {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onResolve(false)} />
            
            {/* Dialog */}
            <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-sm border border-neutral-200 dark:border-neutral-800 animate-in zoom-in-95 fade-in duration-200 overflow-hidden">
                {/* Accent bar */}
                <div className={`h-1 w-full ${dialog.type === 'danger' ? 'bg-red-500' : 'bg-neutral-900 dark:bg-white'}`} />
                
                <div className="p-6">
                    {dialog.type === 'danger' && (
                        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center mb-4">
                            <AlertTriangle size={24} className="text-red-500" />
                        </div>
                    )}
                    
                    <h3 className="text-lg font-black uppercase tracking-tight text-neutral-900 dark:text-white mb-2">
                        {dialog.title || 'Confirmar'}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        {dialog.message}
                    </p>
                </div>

                <div className="flex gap-3 p-4 pt-0">
                    <button
                        onClick={() => onResolve(false)}
                        className="flex-1 px-4 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 active:scale-[0.98] transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onResolve(true)}
                        className={`flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-lg active:scale-[0.98] transition-all ${
                            dialog.type === 'danger'
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90'
                        }`}
                    >
                        {dialog.confirmText || 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Provider ───
export const ModalProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [globalLoading, setGlobalLoading] = useState(false);
    const [globalLoadingMessage, setGlobalLoadingMessage] = useState('');
    const resolveRef = useRef(null);

    useEffect(() => {
        const handleLoading = (e) => {
            setGlobalLoading(e.detail.isLoading);
            setGlobalLoadingMessage(e.detail.message || '');
        };
        window.addEventListener('global-loading', handleLoading);
        return () => window.removeEventListener('global-loading', handleLoading);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const confirm = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            resolveRef.current = resolve;
            setConfirmDialog({
                message,
                title: options.title,
                type: options.type || 'default', // 'default' | 'danger'
                confirmText: options.confirmText,
            });
        });
    }, []);

    const handleConfirmResolve = useCallback((value) => {
        if (resolveRef.current) {
            resolveRef.current(value);
            resolveRef.current = null;
        }
        setConfirmDialog(null);
    }, []);

    return (
        <ModalContext.Provider value={{ toast, confirm }}>
            {children}

            {/* Toasts Container */}
            {toasts.length > 0 && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] flex flex-col gap-2 items-center w-full px-4 pointer-events-none">
                    {toasts.map(t => (
                        <div key={t.id} className="pointer-events-auto">
                            <Toast toast={t} onDismiss={dismissToast} />
                        </div>
                    ))}
                </div>
            )}

            {/* Confirm Dialog */}
            {confirmDialog && (
                <ConfirmDialog dialog={confirmDialog} onResolve={handleConfirmResolve} />
            )}
            
            {/* Global Loading Spinner */}
            {globalLoading && (
                <div className="fixed inset-0 z-[400] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
                        <Loader2 className="w-8 h-8 text-neutral-900 dark:text-white animate-spin" />
                        {globalLoadingMessage && (
                            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                {globalLoadingMessage}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const ctx = useContext(ModalContext);
    if (!ctx) throw new Error('useModal must be used within ModalProvider');
    return ctx;
};
