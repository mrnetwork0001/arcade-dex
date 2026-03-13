import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Faucet from './pages/Faucet';
import Bridge from './pages/Bridge';
import Liquidity from './pages/Liquidity';
import Remit from './pages/Remit';
import WalletModal from './components/WalletModal';
import { useWallet } from './context/WalletContext';

function App() {
    const { theme } = useWallet();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Toast container in App root
    return (
        <div className="app-container">
            <Navbar />
            <WalletModal />
            <main className="container" style={{ paddingBottom: '4rem' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/faucet" element={<Faucet />} />
                    {/* <Route path="/pool" element={<Liquidity />} /> */}
                    <Route path="/bridge" element={<Bridge />} />
                    {/* <Route path="/remit" element={<Remit />} /> */}
                </Routes>
            </main>

            <footer style={{
                textAlign: 'center',
                padding: '2rem 1.5rem',
                marginTop: 'auto',
                fontWeight: '600',
                fontSize: '0.9rem',
                borderTop: 'var(--border-width) solid var(--border-color)',
                backgroundColor: 'var(--bg-card)'
            }}>
                <div style={{ marginBottom: '0.5rem', opacity: 0.8 }}>
                    Built by <a href="https://x.com/encrypt_wizard" target="_blank" rel="noopener noreferrer" style={{
                    color: 'var(--accent-1)',
                    textDecoration: 'none',
                    fontWeight: '800',
                    borderBottom: '2px solid var(--accent-1)'
                }}>MrNetwork</a>
                </div>
                <div style={{ maxWidth: '600px', margin: '0 auto', fontSize: '0.8rem', color: 'var(--accent-4)', fontWeight: 'bold', border: '2px dashed var(--accent-4)', padding: '0.5rem' }}>
                    ⚠️ DISCLAIMER: This is a TESTNET application. No real-world funds are used. 
                    All transactions occur on the Arc Testnet.
                </div>
            </footer>

            <div id="toast-container"></div>
        </div>
    );
}

export default App;
