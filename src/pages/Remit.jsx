import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { Send, Globe, ChevronRight, CheckCircle, Plane } from 'lucide-react';
import { parseUnits } from 'ethers';
import { getArcadeSignature } from '../utils/permit2';
import { executeSwapEdge } from '../utils/backend';
import NotificationModal from '../components/NotificationModal';

const USDC_ADDR = "0x3600000000000000000000000000000000000000";
const EURC_ADDR = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";
const RATE = 0.92;

export default function Remit() {
    const { isConnected, balances, signer, setIsModalOpen } = useWallet();
    const [amount, setAmount] = useState('');
    const [sendToken, setSendToken] = useState('USDC'); // USDC or EURC
    const [recipient, setRecipient] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState('input'); // input, sending, success
    const [txHash, setTxHash] = useState('');
    const [notification, setNotification] = useState({ open: false, title: '', message: '' });
    const [isDescOpen, setIsDescOpen] = useState(false);

    const receiveToken = sendToken === 'USDC' ? 'EURC' : 'USDC';
    const displayRate = sendToken === 'USDC' ? RATE : (1 / RATE).toFixed(4);
    const receivedAmount = amount ? (sendToken === 'USDC' ? parseFloat(amount) * RATE : parseFloat(amount) / RATE).toFixed(2) : '0.00';

    const showNotify = (title, message) => {
        setNotification({ open: true, title, message });
    };

    const handleSend = async () => {
        if (!amount || !recipient) return;
        if (recipient.length < 42) {
            showNotify("Invalid Address", "Please enter a valid Arc Network recipient address.");
            return;
        }

        try {
            setLoading(true);
            setStep('sending');

            const amountRaw = parseUnits(amount, 6);
            const nonce = Math.floor(Math.random() * 1000000);
            const deadline = Math.floor(Date.now() / 1000) + 3600;

            // Use correct token address for permit
            const tokenInAddr = sendToken === 'USDC' ? USDC_ADDR : EURC_ADDR;
            const isFlipped = sendToken === 'EURC';

            // Get signature for the chosen token
            const { signature, permitData } = await getArcadeSignature(signer, tokenInAddr, amountRaw, nonce, deadline);

            // Execute via relayer
            const userAddr = await signer.getAddress();
            const result = await executeSwapEdge(amount, signature, permitData, isFlipped, userAddr, recipient);

            setTxHash(result.txHash);
            setStep('success');
            
            // Celebration!
            import('https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/+esm').then(({ default: confetti }) => {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#ffb400', '#ff4d4d', '#4d79ff']
                });
            });

        } catch (err) {
            console.error(err);
            showNotify("Transfer Failed", err.message);
            setStep('input');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem 1rem', maxWidth: '600px', margin: '0 auto' }}>
            {/* Background Dots */}
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 1px)',
                backgroundSize: '20px 20px', opacity: 0.05, pointerEvents: 'none', zIndex: -1
            }} />

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--accent-1)' }}>Global</span> Remit
                </h1>
                <p className="mono" style={{ fontWeight: 'bold', opacity: 0.7 }}>
                    Swap & Send cross-border in one click.
                </p>
            </div>

            <div 
                onClick={() => setIsDescOpen(!isDescOpen)}
                style={{ 
                    marginBottom: '2.5rem', 
                    padding: '1.5rem', 
                    border: '3px dashed var(--accent-1)', 
                    backgroundColor: 'rgba(255, 180, 0, 0.05)',
                    boxShadow: '6px 6px 0px var(--shadow-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '1.1rem' }}>What is Arcade Remit?</strong>
                    <ChevronRight 
                        size={24} 
                        style={{ 
                            transform: isDescOpen ? 'rotate(90deg)' : 'rotate(0deg)', 
                            transition: 'transform 0.3s' 
                        }} 
                    />
                </div>
                
                {isDescOpen && (
                    <p className="mono" style={{ fontSize: '0.95rem', lineHeight: '1.6', margin: '1rem 0 0 0', animation: 'fadeIn 0.3s' }}>
                        It's a next-generation cross-border payment utility. By bypassing traditional banking intermediaries, Arcade allows you to convert and deliver funds to anyone, anywhere on the Arc Network in a single transaction; eliminating high FX markups and multi-day wait times.
                    </p>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {step === 'input' && (
                <div className="nb-card" style={{ padding: '2.5rem' }}>
                    <div className="mb-2">
                        <label style={{ display: 'block', fontWeight: '900', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Recipient Address</label>
                        <input 
                            className="nb-input"
                            placeholder="0x..." 
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                        />
                    </div>

                    <div className="mb-2">
                        <label style={{ display: 'block', fontWeight: '900', marginBottom: '0.5rem', textTransform: 'uppercase' }}>You Send</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                className="nb-input"
                                placeholder="0.00" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                style={{ paddingRight: '7rem' }}
                            />
                            <div style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)' }}>
                                <select 
                                    className="mono"
                                    value={sendToken}
                                    onChange={(e) => setSendToken(e.target.value)}
                                    style={{ 
                                        background: 'var(--accent-1)', 
                                        border: '2px solid #000', 
                                        padding: '0.2rem 0.5rem', 
                                        fontWeight: '900', 
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="USDC">USDC</option>
                                    <option value="EURC">EURC</option>
                                </select>
                            </div>
                        </div>
                        <div className="mono" style={{ marginTop: '0.5rem', fontSize: '0.85rem', opacity: 0.6 }}>
                            Wallet: {parseFloat(balances[sendToken] || 0).toFixed(2)} {sendToken}
                        </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', border: '2px dashed var(--border-color)', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="mono" style={{ fontSize: '0.9rem' }}>They Receive:</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-4)' }}>
                                {receivedAmount} {receiveToken}
                            </span>
                        </div>
                        <div className="mono" style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.25rem' }}>
                            Rate: 1 {sendToken} ≈ {displayRate} {receiveToken} • Low Gas
                        </div>
                    </div>

                    {!isConnected ? (
                        <button className="nb-button" style={{ width: '100%' }} onClick={() => setIsModalOpen(true)}>
                            Connect Wallet
                        </button>
                    ) : (
                        <button 
                            className="nb-button success dark-text" 
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.2rem' }}
                            onClick={handleSend}
                            disabled={!amount || !recipient || loading}
                        >
                            {loading ? 'Processing...' : 'Send International'} <Globe size={20} />
                        </button>
                    )}
                </div>
            )}

            {step === 'sending' && (
                <div className="nb-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Plane size={64} className="spin" style={{ color: 'var(--accent-3)', marginBottom: '2rem' }} />
                    <h2 style={{ fontSize: '2rem' }}>Executing Transfer...</h2>
                    <p className="mono">Swapping {sendToken} to {receiveToken} and routing to destination.</p>
                </div>
            )}

            {step === 'success' && (
                <div className="nb-card" style={{ position: 'relative', overflow: 'hidden', padding: '0' }}>
                    {/* Passport Style Success */}
                    <div style={{ background: 'var(--accent-1)', padding: '1.5rem', borderBottom: '4px solid #000', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Globe size={32} />
                        <h2 style={{ margin: 0, color: '#000' }}>TRANSACTION ARRIVED</h2>
                    </div>
                    
                    <div style={{ padding: '2.5rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <CheckCircle size={80} color="var(--accent-4)" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '2rem' }}>SUCCESS!</h3>
                            <p className="mono" style={{ fontSize: '1.1rem' }}>{receivedAmount} {receiveToken} has been delivered.</p>
                        </div>

                        <div style={{ border: '3px solid var(--border-color)', padding: '1.5rem', backgroundColor: 'var(--bg-color)' }}>
                            <div className="flex justify-between mb-1">
                                <span className="mono" style={{ opacity: 0.6 }}>Recipient:</span>
                                <span className="mono" style={{ fontWeight: 'bold' }}>{recipient.slice(0, 6)}...{recipient.slice(-4)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="mono" style={{ opacity: 0.6 }}>Network:</span>
                                <span className="mono" style={{ fontWeight: 'bold' }}>Arc Testnet</span>
                            </div>
                        </div>

                        <button 
                            className="nb-button mt-2" 
                            style={{ width: '100%' }}
                            onClick={() => {
                                setAmount('');
                                setRecipient('');
                                setStep('input');
                            }}
                        >
                            Send Another
                        </button>
                        
                        {txHash && (
                            <a 
                                href={`https://testnet.arcscan.app/tx/${txHash}`} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem', color: 'var(--fg-color)', fontWeight: 'bold', fontSize: '0.9rem' }}
                            >
                                View on Explorer
                            </a>
                        )}
                    </div>
                </div>
            )}

            <NotificationModal 
                isOpen={notification.open}
                onClose={() => setNotification({ ...notification, open: false })}
                title={notification.title}
                message={notification.message}
            />
        </div>
    );
}
