"use client";
import React from 'react';

const SettlementEnhancedGame = ({ onExit }) => {
    return (
        <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#1a1a2e' }}>
            <div style={{ width: '100%', padding: '10px', display: 'flex', justifyContent: 'flex-end', background: '#16213e' }}>
                <button
                    onClick={onExit}
                    style={{
                        padding: '8px 16px',
                        background: '#ff4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    EXIT TO MENU
                </button>
            </div>
            <iframe
                src="/settlement-enhanced.html"
                style={{
                    width: '100%',
                    height: 'calc(100vh - 50px)',
                    border: 'none',
                    background: '#fff'
                }}
                title="Settlement Overseer (Enhanced)"
            />
        </div>
    );
};

export default SettlementEnhancedGame;
