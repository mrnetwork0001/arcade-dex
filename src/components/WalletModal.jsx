import React from 'react';
import { useWallet } from '../context/WalletContext';
import { X } from 'lucide-react';

export default function WalletModal() {
    const { isModalOpen, setIsModalOpen, connectWallet } = useWallet();

    if (!isModalOpen) return null;

    return (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3>Connect Wallet</h3>
                    <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--fg-color)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        className="nb-button"
                        onClick={() => connectWallet('metamask')}
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%', fontSize: '1.2rem' }}
                    >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" width={24} />
                        MetaMask
                    </button>

                    <button
                        className="nb-button secondary"
                        onClick={() => connectWallet('walletconnect')}
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%', fontSize: '1.2rem' }}
                    >
                        WalletConnect
                    </button>
                </div>

            </div>
        </div>
    );
}
