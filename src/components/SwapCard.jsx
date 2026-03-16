import React, { useState, useEffect } from 'react';
import { ArrowDown, ChevronDown, RefreshCw } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { checkPermit2Allowance, approvePermit2, getArcadeSignature } from '../utils/permit2';
import { executeSwapEdge } from '../utils/backend';
import { parseUnits } from 'ethers';
import NotificationModal from './NotificationModal';

const USDC_ADDR = "0x3600000000000000000000000000000000000000";
const EURC_ADDR = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

const USDC_ICON = "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png";
const EURC_ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%2310b981'/%3E%3Ctext x='50' y='74' font-family='Arial, sans-serif' font-size='65' font-weight='bold' fill='white' text-anchor='middle'%3E€%3C/text%3E%3C/svg%3E";

const USDC_EURC_RATE = 0.92;

export default function SwapCard({ onActivityAdd }) {
    const { isConnected, balances, setBalances, signer, setIsModalOpen, refreshBalances } = useWallet();
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [isFlipped, setIsFlipped] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [progress, setProgress] = useState(0);
    const [notification, setNotification] = useState({ open: false, title: '', message: '', onConfirm: null });

    const showNotify = (title, message, onConfirm = null) => {
        setNotification({ open: true, title, message, onConfirm });
    };

    const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
    const [toDropdownOpen, setToDropdownOpen] = useState(false);

    const fromToken = isFlipped ? 'EURC' : 'USDC';
    const toToken = isFlipped ? 'USDC' : 'EURC';
    const fromBalance = balances[fromToken] || '0';
    const toBalance = balances[toToken] || '0';

    const fromIcon = isFlipped ? EURC_ICON : USDC_ICON;
    const toIcon = isFlipped ? USDC_ICON : EURC_ICON;

    // Refresh allowance on start
    useEffect(() => {
        const checkAllowance = async () => {
            if (isConnected && signer) {
                try {
                    const tokenAddr = isFlipped ? EURC_ADDR : USDC_ADDR;
                    const allowed = await checkPermit2Allowance(signer, tokenAddr);
                    setIsApproved(allowed);
                } catch (err) {
                    console.error("Allowance check error", err);
                }
            }
        };
        checkAllowance();
    }, [isConnected, signer, isFlipped]);

    const handleAmountChange = (e) => {
        const val = e.target.value;
        if (val === '' || /^\d*\.?\d*$/.test(val)) {
            setFromAmount(val);
            if (val) {
                const rate = isFlipped ? (1 / USDC_EURC_RATE) : USDC_EURC_RATE;
                setToAmount((parseFloat(val) * rate).toFixed(4));
            } else {
                setToAmount('');
            }
        }
    };

    const setPercentage = (pct) => {
        const amount = (parseFloat(fromBalance) * pct).toFixed(2);
        setFromAmount(amount);
        const rate = isFlipped ? (1 / USDC_EURC_RATE) : USDC_EURC_RATE;
        setToAmount((parseFloat(amount) * rate).toFixed(4));
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
        setFromAmount('');
        setToAmount('');
        setFromDropdownOpen(false);
        setToDropdownOpen(false);
    };

    const handleSetupWallet = async () => {
        try {
            setLoading(true);
            setStatusText('Approving Permit2...');
            const tokenAddr = isFlipped ? EURC_ADDR : USDC_ADDR;
            await approvePermit2(signer, tokenAddr);
            setIsApproved(true);

            // Alert user that setup is complete

            setIsApproved(true);
            showNotify("Success", "Wallet Setup Complete!");
        } catch (err) {
            console.error(err);
            showNotify("Error", "Failed to setup wallet");
        } finally {
            setLoading(false);
            setStatusText('');
        }
    };

    const executeSwap = async () => {
        if (!fromAmount || parseFloat(fromAmount) <= 0) return;
        if (parseFloat(fromAmount) > parseFloat(fromBalance)) {
            showNotify("Insufficient Balance", `You don't have enough ${fromToken} to complete this swap.`);
            return;
        }

        const tokenAddr = isFlipped ? EURC_ADDR : USDC_ADDR;
        const amountRaw = parseUnits(fromAmount, 6);

        try {
            const allowedForSwap = await checkPermit2Allowance(signer, tokenAddr, amountRaw);
            if (!allowedForSwap) {
                showNotify(
                    "Allowance Required", 
                    "Your token allowance is less than the swap amount. Would you like to increase your allowance?",
                    handleSetupWallet
                );
                return;
            }
        } catch (err) {
            console.error("Allowance check error", err);
        }

        try {
            setLoading(true);
            setProgress(10);
            setStatusText('Getting Signature...');

            const nonce = Math.floor(Math.random() * 1000000);
            const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hr

            const { signature, permitData } = await getArcadeSignature(signer, tokenAddr, amountRaw, nonce, deadline);

            setProgress(50);
            setStatusText('Executing One-Click Swap...');

            const userAddr = await signer.getAddress();
            const result = await executeSwapEdge(fromAmount, signature, permitData, isFlipped, userAddr);

            setProgress(100);
            setStatusText('Success!');

            setTimeout(() => {
                // Manually adjust the local mocked balances since we are not hitting the real testnet contract
                const oldFromBalance = parseFloat(fromBalance);
                const oldToBalance = parseFloat(toBalance);
                const newFromBalance = (oldFromBalance - parseFloat(fromAmount)).toFixed(6);
                const newToBalance = (oldToBalance + parseFloat(toAmount)).toFixed(6);

                // Pass these modified balances back to the WalletContext so they stay persistent
                setBalances(prev => ({
                    ...prev,
                    [fromToken]: newFromBalance,
                    [toToken]: newToBalance
                }));

                onActivityAdd({
                    pair: `${fromToken} → ${toToken}`,
                    amount: `${fromAmount} ${fromToken}`,
                    status: 'confirmed',
                    timestamp: Date.now(),
                    txHash: result.txHash
                });
                setFromAmount('');
                setToAmount('');
                setProgress(0);
                setStatusText('');

                // Applause sound
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => { });

                // Confetti Burst via ES modules
                import('https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/+esm').then(({ default: confetti }) => {
                    confetti({
                        particleCount: 200,
                        spread: 160,
                        origin: { y: 0.6 },
                        colors: ['#ffb400', '#ff4d4d', '#4d79ff', '#4dff88'], // Neo-brutalist theme colors
                        zIndex: 9999
                    });
                });

            }, 1000);

        } catch (err) {
            console.error(err);
            showNotify("Swap Failed", err.message || err.reason || "An unexpected error occurred.");
            setProgress(0);
            setStatusText('');
        } finally {
            if (!statusText.includes('Success')) {
                setLoading(false);
            } else {
                setTimeout(() => setLoading(false), 1000);
            }
        }
    };

    const renderDropdownPopup = (isOpen, setIsOpen) => {
        if (!isOpen) return null;
        return (
            <div style={{
                position: 'absolute', top: '100%', right: '-4px', marginTop: '14px', width: '220px',
                background: 'var(--bg-card)', border: '4px solid var(--border-color)',
                boxShadow: '8px 8px 0px var(--shadow-color)', zIndex: 50,
                display: 'flex', flexDirection: 'column'
            }}>
                {/* Active token */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--accent-1)', borderBottom: '4px solid var(--border-color)', cursor: 'pointer' }} onClick={() => setIsOpen(false)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                        <img src={fromIcon} alt={fromToken} width="24" height="24" /> {fromToken}
                    </div>
                    <span className="mono" style={{ opacity: 0.6, fontSize: '0.9rem' }}>{parseFloat(fromBalance).toFixed(2)}</span>
                </div>

                {/* Inactive token */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', cursor: 'pointer', background: 'var(--bg-color)' }} onClick={() => { setIsOpen(false); handleFlip(); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                        <img src={toIcon} alt={toToken} width="24" height="24" /> {toToken}
                    </div>
                    <span className="mono" style={{ opacity: 0.6, fontSize: '0.9rem' }}>{parseFloat(toBalance).toFixed(2)}</span>
                </div>
            </div>
        );
    };

    const renderToDropdownPopup = (isOpen, setIsOpen) => {
        if (!isOpen) return null;
        return (
            <div style={{
                position: 'absolute', top: '100%', right: '-4px', marginTop: '14px', width: '220px',
                background: 'var(--bg-card)', border: '4px solid var(--border-color)',
                boxShadow: '8px 8px 0px var(--shadow-color)', zIndex: 50,
                display: 'flex', flexDirection: 'column'
            }}>
                {/* Active token */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--accent-1)', borderBottom: '4px solid var(--border-color)', cursor: 'pointer' }} onClick={() => setIsOpen(false)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                        <img src={toIcon} alt={toToken} width="24" height="24" /> {toToken}
                    </div>
                    <span className="mono" style={{ opacity: 0.6, fontSize: '0.9rem' }}>{parseFloat(toBalance).toFixed(2)}</span>
                </div>

                {/* Inactive token */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', cursor: 'pointer', background: 'var(--bg-color)' }} onClick={() => { setIsOpen(false); handleFlip(); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                        <img src={fromIcon} alt={fromToken} width="24" height="24" /> {fromToken}
                    </div>
                    <span className="mono" style={{ opacity: 0.6, fontSize: '0.9rem' }}>{parseFloat(fromBalance).toFixed(2)}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="swap-container mb-2">
            <div className="nb-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span className="nb-pill">Network: Arc Testnet</span>
                        <span className="nb-pill">Gas: USDC</span>
                    </div>
                    <button 
                        onClick={refreshBalances} 
                        className="refresh-btn"
                        title="Refresh Balance"
                        style={{
                            background: 'var(--bg-card)',
                            border: '3px solid var(--border-color)',
                            padding: '0.4rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '3px 3px 0px var(--shadow-color)',
                            transition: 'all 0.1s'
                        }}
                    >
                        <RefreshCw size={16} className={loading ? "spin" : ""} />
                    </button>
                </div>

                {/* FROM */}
                <div className="swap-input-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        <span>From</span>
                        <span className="mono" style={{ opacity: 0.6 }}>Balance: {parseFloat(fromBalance).toFixed(2)} {fromToken}</span>
                    </div>
                    <div className="amount-input-row">
                        <input
                            type="text"
                            placeholder="0.0"
                            value={fromAmount}
                            onChange={handleAmountChange}
                            disabled={loading}
                            className="mono"
                        />
                        <div style={{ position: 'relative' }}>
                            <div
                                onClick={() => !loading && setFromDropdownOpen(!fromDropdownOpen)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 1rem', background: '#e0e5ea',
                                    border: '4px solid var(--border-color)', boxShadow: '4px 4px 0px var(--shadow-color)',
                                    fontWeight: 'bold', cursor: 'pointer'
                                }}
                            >
                                <img src={fromIcon} alt={fromToken} width="24" height="24" />
                                <span style={{ color: '#000' }}>{fromToken}</span>
                                <ChevronDown size={20} color="#000" />
                            </div>
                            {renderDropdownPopup(fromDropdownOpen, setFromDropdownOpen)}
                        </div>
                    </div>
                    <div className="percentages">
                        {[0.25, 0.5, 0.75, 1].map(pct => (
                            <button key={pct} className="percent-btn" onClick={() => setPercentage(pct)} disabled={loading}>
                                {pct * 100}%
                            </button>
                        ))}
                    </div>
                </div>

                {/* FLIP */}
                <button className="swap-icon-btn" onClick={handleFlip} disabled={loading}>
                    <ArrowDown size={20} className={loading && progress > 0 ? "spin" : ""} />
                </button>

                {/* TO */}
                <div className="swap-input-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        <span>To (Estimated)</span>
                        <span className="mono" style={{ opacity: 0.6 }}>Balance: {parseFloat(toBalance).toFixed(2)} {toToken}</span>
                    </div>
                    <div className="amount-input-row">
                        <input
                            type="text"
                            placeholder="0.0"
                            value={toAmount}
                            readOnly
                            className="mono"
                            style={{ opacity: 0.7 }}
                        />
                        <div style={{ position: 'relative' }}>
                            <div
                                onClick={() => !loading && setToDropdownOpen(!toDropdownOpen)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 1rem', background: '#e0e5ea',
                                    border: '4px solid var(--border-color)', boxShadow: '4px 4px 0px var(--shadow-color)',
                                    fontWeight: 'bold', cursor: 'pointer'
                                }}
                            >
                                <img src={toIcon} alt={toToken} width="24" height="24" />
                                <span style={{ color: '#000' }}>{toToken}</span>
                                <ChevronDown size={20} color="#000" />
                            </div>
                            {renderToDropdownPopup(toDropdownOpen, setToDropdownOpen)}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold' }} className="mono">
                    <span>Rate</span>
                    <span>1 {fromToken} = {(isFlipped ? 1 / USDC_EURC_RATE : USDC_EURC_RATE).toFixed(4)} {toToken}</span>
                </div>

                <div className="mt-1">
                    {!isConnected ? (
                        <button className="nb-button" style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }} onClick={() => setIsModalOpen(true)}>
                            Connect Wallet to Swap
                        </button>
                    ) : !isApproved ? (
                        <button className="nb-button secondary" style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }} onClick={handleSetupWallet} disabled={loading}>
                            {loading ? statusText : 'Setup Wallet'}
                        </button>
                    ) : (
                        <button className="nb-button success dark-text" style={{ width: '100%', fontSize: '1.2rem', padding: '1rem' }} onClick={executeSwap} disabled={loading || !fromAmount}>
                            {loading ? statusText : 'Execute One-Click Swap ⚡'}
                        </button>
                    )}
                </div>

                {loading && progress > 0 && (
                    <div className="progress-container">
                        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                )}
            </div>

            <NotificationModal 
                isOpen={notification.open}
                onClose={() => setNotification({ ...notification, open: false })}
                title={notification.title}
                message={notification.message}
                onConfirm={notification.onConfirm}
                confirmText={notification.onConfirm ? "Increase" : "OK"}
            />
        </div>
    );
}
