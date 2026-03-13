import React from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function NotificationModal({ isOpen, onClose, title, message, onConfirm, confirmText = "Confirm", type = "info" }) {
    if (!isOpen) return null;

    const accentColor = type === 'danger' ? 'var(--accent-2)' : 'var(--accent-3)';

    return (
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2000 }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle color={accentColor} />
                        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{title}</h3>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--fg-color)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="mono" style={{ marginBottom: '2rem', lineHeight: '1.6', fontSize: '1rem' }}>
                    {message}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        className="nb-button secondary" 
                        style={{ flex: 1, backgroundColor: '#e0e5ea' }} 
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button 
                        className={`nb-button ${type === 'danger' ? 'danger' : 'success'}`}
                        style={{ flex: 1.5 }}
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
