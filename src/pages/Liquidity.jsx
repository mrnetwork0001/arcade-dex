import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { Plus, Minus, Info, Droplets } from 'lucide-react';
import { Contract, parseUnits, formatUnits } from 'ethers';
import NotificationModal from '../components/NotificationModal';
import ActivityFeed from '../components/ActivityFeed';

const USDC_ADDR = "0x3600000000000000000000000000000000000000";
const EURC_ADDR = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";
const ESCROW_ADDR = "0x5404fAFAe95ABdD4d5e4B6dbF6e62856374dA5D1";

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) public returns (bool)",
    "function allowance(address owner, address spender) public view returns (uint256)",
    "function balanceOf(address account) public view returns (uint256)"
];

const ESCROW_ABI = [
    "function depositLiquidity(address token, uint256 amount) external",
    "function withdrawLiquidity(address token, uint256 amount) external",
    "function lpBalances(address user, address token) public view returns (uint256)"
];

export default function Liquidity() {
    const { isConnected, address, signer, refreshBalances, setIsModalOpen, balances } = useWallet();
    const [token, setToken] = useState('USDC');
    const [amount, setAmount] = useState('');
    const [lpBalance, setLpBalance] = useState('0');
    const [loading, setLoading] = useState(false);
    const [poolInfo, setPoolInfo] = useState({ usdc: '0', eurc: '0' });
    const [notification, setNotification] = useState({ open: false, title: '', message: '' });
    const [activities, setActivities] = useState([]);

    const showNotify = (title, message) => {
        setNotification({ open: true, title, message });
    };

    useEffect(() => {
        if (isConnected && address && signer) {
            fetchLpBalance();
            fetchPoolInfo();
            loadActivities();
        } else {
            setActivities([]);
        }
    }, [isConnected, address, token]);

    const loadActivities = () => {
        const storageKey = `arcade_lp_activities_${address.toLowerCase()}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setActivities(JSON.parse(saved));
            } catch (e) {
                setActivities([]);
            }
        }
    };

    const handleActivityAdd = (act) => {
        setActivities(prev => {
            const newActs = [act, ...prev];
            const storageKey = `arcade_lp_activities_${address.toLowerCase()}`;
            localStorage.setItem(storageKey, JSON.stringify(newActs));
            return newActs;
        });
    };

    const fetchLpBalance = async () => {
        try {
            const contract = new Contract(ESCROW_ADDR, ESCROW_ABI, signer);
            const tokenAddr = token === 'USDC' ? USDC_ADDR : EURC_ADDR;
            const balance = await contract.lpBalances(address, tokenAddr);
            setLpBalance(formatUnits(balance, 6));
        } catch (err) {
            console.error("Fetch LP Error:", err);
        }
    };

    const fetchPoolInfo = async () => {
        try {
            const usdcContract = new Contract(USDC_ADDR, ERC20_ABI, signer);
            const eurcContract = new Contract(EURC_ADDR, ERC20_ABI, signer);
            const uBal = await usdcContract.balanceOf(ESCROW_ADDR);
            const eBal = await eurcContract.balanceOf(ESCROW_ADDR);
            setPoolInfo({
                usdc: formatUnits(uBal, 6),
                eurc: formatUnits(eBal, 6)
            });
        } catch (err) {
            console.error("Pool info error:", err);
        }
    };

    const handleDeposit = async () => {
        if (!amount || parseFloat(amount) <= 0) return;
        setLoading(true);
        try {
            const tokenAddr = token === 'USDC' ? USDC_ADDR : EURC_ADDR;
            const tokenContract = new Contract(tokenAddr, ERC20_ABI, signer);
            const amountRaw = parseUnits(amount, 6);

            // Check allowance
            const allowance = await tokenContract.allowance(address, ESCROW_ADDR);
            if (allowance < amountRaw) {
                const txApp = await tokenContract.approve(ESCROW_ADDR, amountRaw);
                await txApp.wait();
            }

            const escrow = new Contract(ESCROW_ADDR, ESCROW_ABI, signer);
            const tx = await escrow.depositLiquidity(tokenAddr, amountRaw);
            await tx.wait();

            handleActivityAdd({
                pair: `Deposit ${token}`,
                amount: `${amount} ${token}`,
                status: 'confirmed',
                timestamp: Date.now(),
                txHash: tx.hash
            });

            showNotify("Success", "Liquidity added successfully!");
            setAmount('');
            fetchLpBalance();
            fetchPoolInfo();
            refreshBalances();
        } catch (err) {
            console.error(err);
            showNotify("Deposit Failed", err.reason || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!amount || parseFloat(amount) <= 0) return;
        setLoading(true);
        try {
            const tokenAddr = token === 'USDC' ? USDC_ADDR : EURC_ADDR;
            const escrow = new Contract(ESCROW_ADDR, ESCROW_ABI, signer);
            const amountRaw = parseUnits(amount, 6);

            const tx = await escrow.withdrawLiquidity(tokenAddr, amountRaw);
            await tx.wait();

            showNotify("Success", "Liquidity withdrawn successfully!");
            setAmount('');
            fetchLpBalance();
            fetchPoolInfo();
            refreshBalances();
        } catch (err) {
            console.error(err);
            showNotify("Withdraw Failed", err.reason || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="responsive-h1" style={{ letterSpacing: '-1px' }}>
                <span style={{ color: 'var(--accent-4)' }}>Pool</span> Depth
            </h1>

            <div style={{ 
                marginBottom: '2.5rem', 
                padding: '1.5rem', 
                border: '3px solid var(--accent-4)', 
                backgroundColor: 'rgba(0, 132, 61, 0.05)',
                boxShadow: '6px 6px 0px var(--shadow-color)'
            }}>
                <p className="mono" style={{ fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>
                    <strong>Liquidity Provision:</strong> Add assets to the Arcade Escrow to facilitate cross-chain stablecoin swaps. As a liquidity provider, you enable the lightning-fast FX experience Arcade is known for.
                </p>
            </div>

            <div className="grid-2 responsive-grid">
                {/* Stats Card */}
                <div className="nb-card" style={{ height: 'fit-content' }}>
                    <div className="flex items-center gap-1 mb-2">
                        <Droplets className="text-accent-4" />
                        <h2 style={{ margin: 0 }}>Global Pool</h2>
                    </div>
                    <p className="mono" style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                        Total liquidity currently available in the Arcade Escrow for swapping.
                    </p>

                    <div className="flex-col gap-1 stats-grid">
                        <div style={{ border: '3px solid var(--border-color)', padding: '1rem', background: 'var(--bg-color)' }}>
                            <span className="mono" style={{ fontWeight: 700 }}>USDC Depth</span>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{parseFloat(poolInfo.usdc).toLocaleString()} USDC</div>
                        </div>
                        <div style={{ border: '3px solid var(--border-color)', padding: '1rem', background: 'var(--bg-color)' }}>
                            <span className="mono" style={{ fontWeight: 700 }}>EURC Depth</span>
                            <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{parseFloat(poolInfo.eurc).toLocaleString()} EURC</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                        <Info size={20} style={{ flexShrink: 0 }} />
                        <p style={{ fontSize: '0.85rem', margin: 0 }}>
                            Low pool depth causes trades to fail. Adding liquidity ensures a smooth experience for all FX traders.
                        </p>
                    </div>
                </div>

                {/* Manage Card */}
                <div className="nb-card">
                    <h2 style={{ marginBottom: '1.5rem' }}>Manage Assets</h2>
                    
                    <div className="flex gap-1 mb-2">
                        <button 
                            className={`nb-button ${token === 'USDC' ? '' : 'secondary'}`} 
                            style={{ flex: 1, padding: '0.5rem' }}
                            onClick={() => setToken('USDC')}
                        >USDC</button>
                        <button 
                            className={`nb-button ${token === 'EURC' ? '' : 'secondary'}`} 
                            style={{ flex: 1, padding: '0.5rem' }}
                            onClick={() => setToken('EURC')}
                        >EURC</button>
                    </div>

                    <div className="swap-input-group mt-1">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                            <span>Amount to Deposit</span>
                            <div style={{ textAlign: 'right' }}>
                                <div className="mono" style={{ opacity: 0.6, fontSize: '0.85rem' }}>Balance: {parseFloat(balances[token] || 0).toFixed(2)}</div>
                                <div className="mono" style={{ opacity: 0.6, fontSize: '0.85rem' }}>Deposited: {parseFloat(lpBalance).toFixed(2)}</div>
                            </div>
                        </div>
                        <div className="amount-input-row">
                            <input
                                type="text"
                                placeholder="0.0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="mono"
                                style={{ border: 'none', background: 'transparent', fontSize: '1.5rem', width: '100%' }}
                            />
                            <span style={{ fontWeight: 900 }}>{token}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', padding: '0 0.5rem' }}>
                        <input 
                            type="range"
                            min="0"
                            max="100"
                            value={
                                !amount ? 0 : 
                                (parseFloat(amount) / (parseFloat(balances[token]) || 1) * 100)
                            }
                            onChange={(e) => {
                                const percent = parseFloat(e.target.value);
                                const maxBalance = parseFloat(balances[token]) || 0;
                                const newAmount = (percent / 100) * maxBalance;
                                setAmount(newAmount.toFixed(2));
                            }}
                            style={{
                                width: '100%',
                                height: '12px',
                                appearance: 'none',
                                background: 'var(--border-color)',
                                border: '2px solid var(--fg-color)',
                                boxShadow: '3px 3px 0px var(--shadow-color)',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                            {[0, 25, 50, 75, 100].map(p => (
                                <button 
                                    key={p} 
                                    className="nb-button secondary"
                                    style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }}
                                    onClick={() => {
                                        const maxBalance = parseFloat(balances[token]) || 0;
                                        setAmount(((p / 100) * maxBalance).toFixed(2));
                                    }}
                                >
                                    {p}%
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem', flexDirection: window.innerWidth < 480 ? 'column' : 'row' }}>
                        <button 
                            className="nb-button success" 
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            onClick={handleDeposit}
                            disabled={loading || !isConnected}
                        >
                            <Plus size={20} /> Deposit
                        </button>
                        <button 
                            className="nb-button danger" 
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                            onClick={handleWithdraw}
                            disabled={loading || !isConnected}
                        >
                            <Minus size={20} /> Withdraw
                        </button>
                    </div>

                    {!isConnected && (
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <p style={{ color: 'var(--accent-2)', fontWeight: 'bold', marginBottom: '1rem' }}>
                                Connect wallet to manage liquidity.
                            </p>
                            <button className="nb-button" style={{ width: '100%' }} onClick={() => setIsModalOpen(true)}>
                                Connect Wallet
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <NotificationModal 
                isOpen={notification.open}
                onClose={() => setNotification({ ...notification, open: false })}
                title={notification.title}
                message={notification.message}
                confirmText="OK"
            />

            <ActivityFeed activities={activities} />
        </div>
    );
}
