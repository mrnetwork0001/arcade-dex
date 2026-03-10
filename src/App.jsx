import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Faucet from './pages/Faucet';
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
            <main className="container" style={{ paddingBottom: '4rem' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/faucet" element={<Faucet />} />
                </Routes>
            </main>

            <footer style={{
                textAlign: 'center',
                padding: '1.5rem',
                marginTop: 'auto',
                fontWeight: '600',
                fontSize: '1rem',
                borderTop: 'var(--border-width) solid var(--border-color)',
                backgroundColor: 'var(--bg-card)'
            }}>
                Built by <a href="https://x.com/encrypt_wizard" target="_blank" rel="noopener noreferrer" style={{
                    color: 'var(--accent-1)',
                    textDecoration: 'none',
                    fontWeight: '800',
                    borderBottom: '2px solid var(--accent-1)'
                }}>MrNetwork</a> ⚡
            </footer>

            <div id="toast-container"></div>
        </div>
    );
}

export default App;
