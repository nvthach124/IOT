import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const TOAST_CONFIG = {
    success: {
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        icon: 'check_circle',
        iconColor: '#d1fae5'
    },
    error: {
        gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        icon: 'error',
        iconColor: '#fee2e2'
    },
    warning: {
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        icon: 'warning',
        iconColor: '#fef3c7'
    },
    info: {
        gradient: 'linear-gradient(135deg, #34a7ad 0%, #2d8f94 100%)',
        icon: 'info',
        iconColor: '#ccf5f7'
    }
};

function ToastItem({ toast, onRemove }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const showTimer = setTimeout(() => setShow(true), 10);
        const hideTimer = setTimeout(() => {
            setShow(false);
            setTimeout(() => onRemove(toast.id), 300);
        }, 5000);
        return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
    }, [toast.id, onRemove]);

    const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;

    return (
        <div
            className={`toast-notification ${show ? 'show' : ''}`}
            style={{ background: config.gradient }}
        >
            <span className="material-symbols-outlined" style={{ color: config.iconColor, fontSize: '20px' }}>
                {config.icon}
            </span>
            <span className="toast-message">{toast.message}</span>
        </div>
    );
}

/**
 * Toast Provider - hook + portal
 */
let toastIdCounter = 0;

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = ++toastIdCounter;
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const ToastContainer = createPortal(
        <>
            {toasts.map((toast, index) => (
                <div key={toast.id} style={{ position: 'fixed', top: 20 + index * 70, right: 20, zIndex: 9999 }}>
                    <ToastItem toast={toast} onRemove={removeToast} />
                </div>
            ))}
        </>,
        document.body
    );

    return { showToast, ToastContainer };
}
