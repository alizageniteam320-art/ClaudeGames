"use client";
import React from 'react';

const HoccusPoccusGame = ({ onExit }) => {
    return (
        <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#000' }}>
            <div style={{ width: '100%', padding: '10px', display: 'flex', justifyContent: 'flex-end', background: '#110000', borderBottom: '1px solid #330000' }}>
                <button
                    onClick={onExit}
                    style={{
                        padding: '8px 16px',
                        background: '#550000',
                        color: '#ffcccc',
                        border: '1px solid #ff0000',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontFamily: 'Courier New, monospace',
                        textShadow: '0 0 5px red',
                        transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#ff0000';
                        e.target.style.color = '#000';
                        e.target.style.boxShadow = '0 0 15px red';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = '#550000';
                        e.target.style.color = '#ffcccc';
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    EXIT DREAM
                </button>
            </div>
            <iframe
                src="/hoccus_poccus.html"
                style={{
                    width: '100%',
                    height: 'calc(100vh - 50px)',
                    border: 'none',
                    background: '#000'
                }}
                title="Hoccus Poccus"
                allow="pointer-lock; fullscreen"
            />
        </div>
    );
};

export default HoccusPoccusGame;
