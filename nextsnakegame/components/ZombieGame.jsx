"use client";
import React from 'react';

const ZombieGame = ({ onExit }) => {
    return (
        <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#0a0a0a' }}>
            <div style={{ width: '100%', padding: '10px', display: 'flex', justifyContent: 'flex-end', background: '#000' }}>
                <button
                    onClick={onExit}
                    style={{
                        padding: '8px 16px',
                        background: '#c1121f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontFamily: 'monospace'
                    }}
                >
                    ABORT MISSION
                </button>
            </div>
            <iframe
                src="/zombie-game-KILLABLE.html"
                style={{
                    width: '100%',
                    height: 'calc(100vh - 50px)',
                    border: 'none',
                    background: '#0a0a0a'
                }}
                title="Zombie Apocalypse"
            />
        </div>
    );
};

export default ZombieGame;
