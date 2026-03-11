import React, { useState, useEffect } from 'react';
import SwapCard from '../components/SwapCard';
import WalletModal from '../components/WalletModal';
import ActivityFeed from '../components/ActivityFeed';
import { ShieldCheck, Zap, Activity } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const phrases = [
    { prefix: "FX Trading made", text: "Super Easy." },
    { prefix: "FX Trading with", text: "Zero Slippage." },
    { prefix: "FX Trading at", text: "Lightning Fast." },
    { prefix: "FX Trading with", text: "Gas Optimized." }
];

export default function Home() {
    const { address } = useWallet();
    const [activities, setActivities] = useState([]);
    const [typedText, setTypedText] = useState('');
    const [phraseIndex, setPhraseIndex] = useState(0);

    useEffect(() => {
        let currentIndex = 0;
        let isDeleting = false;
        let timeoutId;

        const type = () => {
            const currentItem = phrases[phraseIndex % phrases.length];
            const currentText = currentItem.text;
            const currentSpeed = isDeleting ? 50 : 100;
            
            setTypedText(currentText.substring(0, currentIndex));

            if (!isDeleting && currentIndex === currentText.length) {
                timeoutId = setTimeout(() => {
                    isDeleting = true;
                    type();
                }, 2000);
            } else if (isDeleting && currentIndex === 0) {
                isDeleting = false;
                setPhraseIndex(prev => prev + 1);
                timeoutId = setTimeout(type, 500);
            } else {
                currentIndex += isDeleting ? -1 : 1;
                timeoutId = setTimeout(type, currentSpeed);
            }
        };

        timeoutId = setTimeout(type, 500);

        return () => clearTimeout(timeoutId);
    }, [phraseIndex]);

    useEffect(() => {
        if (!address) {
            setActivities([]);
            return;
        }

        const storageKey = `arcade_activities_${address.toLowerCase()}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                setActivities(JSON.parse(saved));
            } catch (e) {
                setActivities([]);
            }
        } else {
            setActivities([]);
        }
    }, [address]);

    const handleActivityAdd = (act) => {
        if (!address) return; // shouldn't happen during a valid swap

        setActivities(prev => {
            const newActs = [act, ...prev];
            const storageKey = `arcade_activities_${address.toLowerCase()}`;
            localStorage.setItem(storageKey, JSON.stringify(newActs));
            return newActs;
        });
    };

    const currentPrefix = phrases[phraseIndex % phrases.length].prefix;

    return (
        <>
            <WalletModal />

            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                opacity: 0.1,
                pointerEvents: 'none',
                zIndex: -1
            }} />

            {/* Hero Section */}
            <div className="text-center mb-2 hero-section">
                <h1 className="hero-title" style={{ marginBottom: '3rem', lineHeight: '1.2', textTransform: 'none', letterSpacing: '-1px' }}>
                    {currentPrefix} <br />
                    <span style={{ position: 'relative', display: 'inline-block', minWidth: '350px', textAlign: 'left' }}>
                        {typedText}<span className="cursor"></span>
                        <svg
                            style={{ position: 'absolute', bottom: '2px', left: '-5%', width: '110%', height: '24px', zIndex: -1 }}
                            viewBox="0 0 200 24"
                            preserveAspectRatio="none"
                        >
                            <path d="M5,18 Q50,6 100,14 T195,16" fill="none" stroke="var(--accent-1)" strokeWidth="12" strokeLinecap="round" />
                        </svg>
                    </span>
                </h1>

                <div className="hero-box" style={{
                    border: '4px dashed var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    margin: '0 auto 3rem auto',
                    textAlign: 'center',
                    maxWidth: '700px',
                    boxShadow: '8px 8px 0px var(--shadow-color)'
                }}>
                    <p className="mono hero-desc" style={{ lineHeight: '1.7', margin: 0 }}>
                        One-click liquidity for the Arc Network. Arcade handles the complex FX logic under the hood so you can swap USDC to EURC at lightning speed with zero slippage.
                    </p>
                </div>
            </div>

            <SwapCard onActivityAdd={handleActivityAdd} />

            <ActivityFeed activities={activities} />
        </>
    );
}
