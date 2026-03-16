import React, { useState, useEffect } from 'react';
import SwapCard from '../components/SwapCard';
import ActivityFeed from '../components/ActivityFeed';
import { useWallet } from '../context/WalletContext';

export default function Swap() {
    const { address } = useWallet();
    const [activities, setActivities] = useState([]);

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
        if (!address) return;

        setActivities(prev => {
            const newActs = [act, ...prev];
            const storageKey = `arcade_activities_${address.toLowerCase()}`;
            localStorage.setItem(storageKey, JSON.stringify(newActs));
            return newActs;
        });
    };

    return (
        <div style={{ padding: '2rem 0' }}>
            <div className="text-center mb-4">
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '-1px' }}>
                    Swap <span style={{ color: 'var(--accent-1)' }}>Stablecoins</span>
                </h1>
                <p className="mono" style={{ opacity: 0.8 }}>
                    Zero slippage. Lightning fast. Powered by Arc Network.
                </p>
            </div>

            <SwapCard onActivityAdd={handleActivityAdd} />
            <ActivityFeed activities={activities} />
        </div>
    );
}
