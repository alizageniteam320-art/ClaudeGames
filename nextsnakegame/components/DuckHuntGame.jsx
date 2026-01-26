"use client";
import React from 'react';

const DuckHuntGame = ({ onExit }) => {
    return (
        <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#000' }}>
            <div style={{ width: '100%', padding: '10px', display: 'flex', justifyContent: 'flex-end', background: '#333' }}>
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
                src="/duck_hunt.html"
                style={{
                    width: '100%',
                    height: 'calc(100vh - 50px)',
                    border: 'none',
                    background: '#000'
                }}
                title="Duck Hunt Game"
            />
        </div>
    );
};

export default DuckHuntGame;
