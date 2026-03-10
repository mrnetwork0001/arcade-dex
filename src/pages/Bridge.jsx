import React from 'react';
import { Link } from 'react-router-dom';

export default function Bridge() {
    return (
        <div style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
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
                <span style={{ color: 'var(--accent-3)' }}>Bridge</span>
            </h1>

            <div style={{
                border: '4px solid var(--border-color)',
                backgroundColor: 'var(--bg-color)',
                padding: 'clamp(1.5rem, 4vw, 3rem)',
                boxShadow: '10px 10px 0px var(--shadow-color)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    backgroundColor: 'var(--accent-1)',
                    color: 'var(--bg-color)',
                    padding: 'clamp(1rem, 4vw, 2rem)',
                    transform: 'rotate(-3deg)',
                    border: '4px solid var(--border-color)',
                    boxShadow: '8px 8px 0px var(--shadow-color)',
                    marginBottom: '3rem',
                    position: 'relative',
                    zIndex: 10
                }}>
                    <h2 style={{ fontSize: 'clamp(2.1rem, 8vw, 4rem)', fontWeight: '900', margin: 0, letterSpacing: '2px', textTransform: 'uppercase' }}>
                        COMING SOON
                    </h2>
                </div>

                <p className="mono" style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '2rem', fontWeight: '600' }}>
                    Users will soon be able to bridge stablecoin (USDC) directly from other chains to the Arc testnet network.
                </p>

                <div style={{
                    border: '3px dashed var(--border-color)',
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-color)',
                    marginTop: '2rem'
                }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                        In the meantime, head back to the <Link to="/" style={{ color: 'var(--accent-3)', textDecoration: 'underline' }}>Swap page</Link>.
                    </span>
                </div>
            </div>
        </div>
    );
}
