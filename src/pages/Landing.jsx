import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Activity, ArrowRight, Play } from 'lucide-react';

const phrases = [
    { prefix: "FX Trading made", text: "Super Easy." },
    { prefix: "FX Trading with", text: "Zero Slippage." },
    { prefix: "FX Trading at", text: "Lightning Fast." },
    { prefix: "FX Trading with", text: "Gas Optimized." }
];

export default function Landing() {
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

    const currentPrefix = phrases[phraseIndex % phrases.length].prefix;

    return (
        <div style={{ position: 'relative' }}>
            {/* Dotted Background */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                opacity: 0.1,
                pointerEvents: 'none',
                zIndex: -1
            }} />

            {/* Hero Section */}
            <div className="text-center mb-2 hero-section" style={{ paddingTop: '4rem' }}>
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
                    maxWidth: '800px',
                    boxShadow: '8px 8px 0px var(--shadow-color)',
                    padding: '2rem'
                }}>
                    <p className="mono hero-desc" style={{ lineHeight: '1.7', margin: '0 0 2rem 0', fontSize: '1.1rem' }}>
                        Arcade is a high-speed, decentralized stablecoin FX platform built natively on the Arc Network. 
                        It enables instant, low-cost swaps between fiat-backed stablecoins like USDC and EURC.
                    </p>
                    
                    <Link to="/swap" className="nb-button" style={{ 
                        fontSize: '1.5rem', 
                        padding: '1rem 2.5rem', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        textDecoration: 'none'
                    }}>
                        Launch App <Play size={24} fill="currentColor" />
                    </Link>
                </div>
            </div>

            {/* About Content Section */}
            <div style={{ maxWidth: '900px', margin: '4rem auto', padding: '0 1rem' }}>
                <div style={{
                    border: '4px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    padding: 'clamp(1.5rem, 5vw, 4rem)',
                    boxShadow: '12px 12px 0px var(--shadow-color)',
                    marginBottom: '6rem'
                }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
                        What is <span style={{ color: 'var(--accent-3)' }}>Arcade</span>?
                    </h2>
                    
                    <p className="mono" style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem', fontWeight: '500' }}>
                        Traditional cross-border transactions are slow, expensive, and riddled with intermediaries. 
                        <strong> Arcade eliminates all of that.</strong> By leveraging Arc's native gas (USDC) and built-in FX capabilities, there are no bridges, no wrapped tokens, and no hidden fees.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '3rem', marginBottom: '3rem' }}>
                        <div style={featureStyle}>
                            <Zap size={24} color="var(--accent-1)" />
                            <span className="mono" style={{ fontWeight: '600' }}>Zero slippage on stablecoin pairs</span>
                        </div>
                        <div style={featureStyle}>
                            <ShieldCheck size={24} color="var(--accent-2)" />
                            <span className="mono" style={{ fontWeight: '600' }}>Non-custodial & Secure</span>
                        </div>
                        <div style={featureStyle}>
                            <Activity size={24} color="var(--accent-3)" />
                            <span className="mono" style={{ fontWeight: '600' }}>Near-zero gas fees in USDC</span>
                        </div>
                    </div>

                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>How It Works</h2>
                    <p className="mono" style={{ fontSize: '1rem', lineHeight: '1.8', marginBottom: '2rem' }}>
                        Arcade connects directly to Arc Network's native FX engine. When you initiate a swap, 
                        the protocol calculates the optimal rate and executes the transaction on-chain instantly. 
                        No order books, no AMM impermanent loss; just deterministic FX rates.
                    </p>

                    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                        <Link to="/swap" style={{ 
                            color: 'var(--accent-3)', 
                            fontSize: '1.2rem', 
                            fontWeight: '800', 
                            textDecoration: 'underline',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}>
                            Ready to trade? Go to Swap <ArrowRight size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

const featureStyle = {
    border: '3px solid var(--border-color)',
    padding: '1.5rem',
    backgroundColor: 'var(--bg-color)',
    boxShadow: '6px 6px 0px var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
};
