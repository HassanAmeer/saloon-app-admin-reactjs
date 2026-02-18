import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, duration);
    }, []);

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto
                            flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl
                            animate-in fade-in slide-in-from-bottom-4 duration-300
                            min-w-[320px] max-w-md
                            backdrop-blur-xl border
                            ${toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800' : ''}
                            ${toast.type === 'error' ? 'bg-rose-50/90 border-rose-100 text-rose-800' : ''}
                            ${toast.type === 'warning' ? 'bg-amber-50/90 border-amber-100 text-amber-800' : ''}
                        `}
                    >
                        <div className="shrink-0">
                            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                            {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-500" />}
                            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                        </div>

                        <p className="text-sm font-black uppercase tracking-widest flex-1">{toast.message}</p>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 hover:bg-black/5 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 opacity-40 hover:opacity-100" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
