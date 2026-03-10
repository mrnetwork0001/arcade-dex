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
            <main className="container">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/faucet" element={<Faucet />} />
                </Routes>
            </main>
            <div id="toast-container"></div>
        </div>
    );
}

export default App;
