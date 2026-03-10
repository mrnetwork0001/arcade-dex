import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
    return (
        <div style={{ padding: '0.5rem 1rem', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
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

            <h1 style={{ fontSize: '3.5rem', marginBottom: '2rem', letterSpacing: '-1px' }}>
                What is <span style={{ color: 'var(--accent-3)' }}>Arcade</span>?
            </h1>

            <div style={{
                border: '4px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                padding: '3rem',
                boxShadow: '10px 10px 0px var(--shadow-color)'
            }}>
                <p className="mono" style={{ fontSize: '1rem', lineHeight: '1.8', marginBottom: '1.5rem', fontWeight: '500' }}>
                    <strong>Arcade</strong> is a high-speed, decentralized stablecoin FX platform built
                    natively on the <strong>Arc Network</strong>. It enables instant, low-cost swaps
                    between fiat-backed stablecoins like USDC and EURC; making
                    cross-border liquidity as simple as playing a game.
                </p>

                <p className="mono" style={{ fontSize: '1rem', lineHeight: '1.8', marginBottom: '3rem', fontWeight: '500' }}>
                    Traditional cross-border transactions are slow, expensive, and
                    riddled with intermediaries. Arcade eliminates all of that. By
                    leveraging Arc's native gas (USDC) and built-in FX capabilities,
                    there are no bridges, no wrapped tokens, and no hidden fees. Just
                    clean, one-click swaps at lightning speed.
                </p>

                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Why Arcade?</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                    <div style={{ border: '3px solid var(--border-color)', padding: '1rem', backgroundColor: '#e2e8f0', boxShadow: '4px 4px 0px var(--border-color)' }}>
                        <span className="mono" style={{ fontSize: '1rem', fontWeight: '600' }}>⚡ Zero slippage on stablecoin pairs</span>
                    </div>
                    <div style={{ border: '3px solid var(--border-color)', padding: '1rem', backgroundColor: '#e2e8f0', boxShadow: '4px 4px 0px var(--border-color)' }}>
                        <span className="mono" style={{ fontSize: '1rem', fontWeight: '600' }}>🔒 Non-custodial: your keys, your coins</span>
                    </div>
                    <div style={{ border: '3px solid var(--border-color)', padding: '1rem', backgroundColor: '#e2e8f0', boxShadow: '4px 4px 0px var(--border-color)' }}>
                        <span className="mono" style={{ fontSize: '1rem', fontWeight: '600' }}>💸 Near-zero gas fees powered by USDC</span>
                    </div>
                    <div style={{ border: '3px solid var(--border-color)', padding: '1rem', backgroundColor: '#e2e8f0', boxShadow: '4px 4px 0px var(--border-color)' }}>
                        <span className="mono" style={{ fontSize: '1rem', fontWeight: '600' }}>🌍 Seamless cross-border FX in seconds</span>
                    </div>
                    <div style={{ border: '3px solid var(--border-color)', padding: '1rem', backgroundColor: '#e2e8f0', boxShadow: '4px 4px 0px var(--border-color)' }}>
                        <span className="mono" style={{ fontSize: '1rem', fontWeight: '600' }}>🎮 Neo-Brutalist UI that's fun to use</span>
                    </div>
                </div>

                <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>How It Works</h2>

                <p className="mono" style={{ fontSize: '1rem', lineHeight: '1.8', marginBottom: '1.5rem', fontWeight: '500' }}>
                    Arcade connects directly to Arc Network's native FX engine. When
                    you initiate a swap, the protocol calculates the optimal rate,
                    executes the transaction on-chain, and settles in seconds. No order
                    books, no AMM impermanent loss; just deterministic FX rates backed
                    by real-world stablecoin reserves.
                </p>

                <p className="mono" style={{ fontSize: '1rem', lineHeight: '1.8', marginBottom: '3rem', fontWeight: '500' }}>
                    Whether you're a freelancer receiving payments in EURC and need
                    USDC, or a business managing multi-currency treasury operations,
                    Arcade makes it effortless.
                </p>

                <div style={{
                    border: '3px dashed var(--border-color)',
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-color)'
                }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                        Ready to swap? Head to the <Link to="/" style={{ color: 'var(--accent-3)', textDecoration: 'underline' }}>Swap page</Link> and try it out.
                    </span>
                </div>
            </div>
        </div>
    );
}
