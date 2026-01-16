"use client";
import React from 'react';

const GeminiSettlementGame = ({ onExit }) => {
    return (
        <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#1a1a1a' }}>
            <div style={{ width: '100%', padding: '10px', display: 'flex', justifyContent: 'flex-end', background: '#333' }}>
                <button
                    onClick={onExit}
                    style={{
                        padding: '8px 16px',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontFamily: 'Segoe UI, sans-serif'
                    }}
                >
                    EXIT TO MENU
                </button>
            </div>
            <iframe
                src="/geminiSettlement.html"
                style={{
                    width: '100%',
                    height: 'calc(100vh - 50px)',
                    border: 'none',
                    background: '#1a1a1a'
                }}
                title="Spiceward"
            />
        </div>
    );
};

export default GeminiSettlementGame;
