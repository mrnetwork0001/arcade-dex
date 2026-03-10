import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

export default function ActivityFeed({ activities }) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    if (!activities || activities.length === 0) {
        return null;
    }

    const itemsPerPage = 5;
    const totalPages = Math.ceil(activities.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const currentItems = activities.slice(startIdx, startIdx + itemsPerPage);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(p => p + 1);
    };
    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(p => p - 1);
    };

    return (
        <div className="mt-2" style={{ maxWidth: '480px', margin: '2rem auto' }}>
            <div
                className="nb-card"
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isOpen ? '1rem' : '0' }}
                onClick={() => setIsOpen(!isOpen)}
            >
                <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', margin: 0 }}>Recent Activity</h3>
                {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </div>

            {isOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {currentItems.map((tx, idx) => (
                        <div key={idx} className="nb-card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{tx.pair}</div>
                                <div className="mono" style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                                    {tx.amount} • {new Date(tx.timestamp).toLocaleTimeString()}
                                </div>
                                {tx.txHash && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <a
                                            href={`https://testnet.arcscan.app/tx/${tx.txHash}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'inherit', fontWeight: 'bold' }}
                                        >
                                            View on Arc Explorer <ExternalLink size={12} />
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div>
                                <span className="nb-pill" style={{
                                    borderColor: tx.status === 'confirmed' ? 'var(--accent-4)' : 'var(--accent-1)',
                                    color: tx.status === 'confirmed' ? 'var(--accent-4)' : 'var(--accent-1)'
                                }}>
                                    {tx.status}
                                </span>
                            </div>
                        </div>
                    ))}

                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                            <button
                                className="nb-button"
                                style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}
                                onClick={handlePrev}
                                disabled={currentPage === 1}
                            >
                                Prev
                            </button>
                            <span className="mono" style={{ fontWeight: 'bold' }}>{currentPage} / {totalPages}</span>
                            <button
                                className="nb-button"
                                style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}
                                onClick={handleNext}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
