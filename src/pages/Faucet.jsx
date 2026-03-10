import React from 'react';
import { Droplet, ExternalLink } from 'lucide-react';

export default function Faucet() {
    return (
        <>
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
                opacity: 0.1,
                pointerEvents: 'none',
                zIndex: -1
            }} />

            <div className="container" style={{ maxWidth: '800px', marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '3rem', marginBottom: '2rem', textTransform: 'uppercase' }}>
                    <Droplet strokeWidth={3} size={40} /> FUEL YOUR WALLET
                </h1>

                <div style={{
                    border: '4px dashed var(--border-color)',
                    backgroundColor: 'var(--bg-color)', // to cover the dots if needed, or slightly darker
                    padding: '2rem 3rem',
                    marginBottom: '2.5rem',
                    textAlign: 'center',
                    width: '100%',
                    boxShadow: '8px 8px 0px var(--shadow-color)'
                }}>
                    <p className="mono" style={{ fontSize: '1.25rem', lineHeight: '1.6' }}>
                        Arcade runs on the <strong>Arc Testnet</strong>. You need <strong>Testnet USDC</strong> to pay<br />
                        for gas and trade. Use the official Circle Faucet below to get<br />
                        topped up.
                    </p>
                </div>

                <a
                    href="https://faucet.circle.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="nb-button"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        textDecoration: 'none',
                        padding: '1.5rem 3rem',
                        fontSize: '1.25rem',
                        backgroundColor: 'var(--accent-1)',
                        color: '#000'
                    }}
                >
                    OPEN OFFICIAL FAUCET <ExternalLink size={24} />
                </a>
            </div>
        </>
    );
}
