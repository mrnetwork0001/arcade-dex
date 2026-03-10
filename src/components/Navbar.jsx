import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Wallet, Menu, X } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export default function Navbar() {
    const { theme, toggleTheme, address, isConnected, setIsModalOpen, disconnect } = useWallet();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileWalletOpen, setIsMobileWalletOpen] = useState(false);

    const formatAddress = (addr) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const closeNav = () => setIsMenuOpen(false);

    const renderActions = () => (
        <>
            <button onClick={toggleTheme} className="nb-button secondary" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {!isConnected ? (
                <button onClick={() => { setIsModalOpen(true); closeNav(); }} className="nb-button" style={{ padding: '0.75rem 1rem' }}>
                    Connect Wallet
                </button>
            ) : (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <span className="nb-pill" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Wallet size={16} />
                        {formatAddress(address)}
                    </span>
                    <button onClick={() => { disconnect(); closeNav(); }} className="nb-button danger" style={{ padding: '0.5rem 1rem' }}>
                        Disconnect
                    </button>
                </div>
            )}
        </>
    );

    return (
        <nav style={{ position: 'sticky', top: 0, zIndex: 100 }}>
            {/* LEFT: Logo */}
            <Link to="/" className="logo" onClick={closeNav}>
                ARCADE
            </Link>

            {/* CENTER: Navigation Links (and mobile actions) */}
            <div className={`nav-center ${isMenuOpen ? 'mobile-open' : ''}`} style={{
                position: isMenuOpen ? 'absolute' : 'absolute',
                left: isMenuOpen ? '0' : '50%',
                transform: isMenuOpen ? 'none' : 'translateX(-50%)',
                display: 'flex',
                gap: '2rem',
                alignItems: 'center'
            }}>
                <Link to="/" onClick={closeNav} style={{ textDecoration: 'none', color: 'var(--fg-color)', fontWeight: '700', fontSize: '1.2rem' }}>Home</Link>
                <Link to="/about" onClick={closeNav} style={{ textDecoration: 'none', color: 'var(--fg-color)', fontWeight: '700', fontSize: '1.2rem' }}>About</Link>
                <Link to="/faucet" onClick={closeNav} style={{ textDecoration: 'none', color: 'var(--fg-color)', fontWeight: '700', fontSize: '1.2rem' }}>Faucet</Link>
                <Link to="/bridge" onClick={closeNav} style={{ textDecoration: 'none', color: 'var(--fg-color)', fontWeight: '700', fontSize: '1.2rem' }}>Bridge</Link>

                {/* Mobile only actions added to menu bottom */}
                <div className="show-mobile-flex" style={{ gap: '1rem', alignItems: 'center', marginTop: '1rem', flexDirection: 'column' }}>
                    <div style={{ height: '2px', width: '80%', background: 'var(--border-color)', marginBottom: '1rem' }} />
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {renderActions()}
                    </div>
                </div>
            </div>

            {/* RIGHT: Actions (Desktop) & Hamburger Toggle */}
            <div className="nav-right" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div className="hide-mobile" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {renderActions()}
                </div>

                {/* MOBILE HEADER CONNECT/WALLET PILL */}
                <div className="show-mobile-flex" style={{ alignItems: 'center', position: 'relative' }}>
                    {!isConnected ? (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="nb-button"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                        >
                            Connect
                        </button>
                    ) : (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setIsMobileWalletOpen(!isMobileWalletOpen)}
                                className="nb-pill"
                                style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', border: '2px solid var(--border-color)' }}
                            >
                                <Wallet size={14} />
                                {formatAddress(address)}
                            </button>

                            {isMobileWalletOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '0.5rem',
                                    background: 'var(--bg-card)',
                                    border: '2px solid var(--border-color)',
                                    boxShadow: '4px 4px 0px var(--shadow-color)',
                                    padding: '0.5rem',
                                    zIndex: 50,
                                    borderRadius: '4px'
                                }}>
                                    <button
                                        onClick={() => { disconnect(); setIsMobileWalletOpen(false); }}
                                        className="nb-button danger"
                                        style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                                    >
                                        Disconnect
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* HAMBURGER TOGGLE */}
                <button
                    className="nb-button mobile-menu-btn"
                    style={{ padding: '0.5rem' }}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>
        </nav>
    );
}
