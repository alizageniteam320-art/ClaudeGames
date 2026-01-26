"use client";

import { useState } from 'react';
import SnakeGame from '../components/SnakeGame';
import FightGame from '../components/FightGame';
import SuperMarioGame from '../components/SuperMarioGame';
import MetalSlugGame from '../components/MetalSlugGame';
import MinecraftGame from '../components/MinecraftGame';
import BlockBlastGame from '../components/BlockBlastGame';
import SettlementGame from '../components/SettlementGame';
import GeminiSettlementGame from '../components/GeminiSettlementGame';
import SettlementEnhancedGame from '../components/SettlementEnhancedGame';
import CarGame from '../components/CarGame';
import ZombieGame from '../components/ZombieGame';
import HoccusPoccusGame from '../components/HoccusPoccusGame';
import DuckHuntGame from '../components/DuckHuntGame';
import BubbleShootingGame from '../components/BubbleShootingGame';

export default function Home() {
  const [activeGame, setActiveGame] = useState('snake');

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', minHeight: '100vh', background: 'linear-gradient(to bottom, #1a1a2e, #16213e)' }}>
      <h1 style={{ color: '#fff', marginBottom: '10px', marginTop: '20px', fontFamily: 'sans-serif' }}>RETRO ARCADE</h1>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => setActiveGame('metalslug')}
          style={{
            padding: '10px 20px', fontSize: '1.2em', borderRadius: '10px', border: 'none',
            background: activeGame === 'metalslug' ? '#556b2f' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
            border: activeGame === 'metalslug' ? '2px solid #fff' : 'none' // Added highlight
          }}
        >
          <span>🔫</span> Metal Slug
        </button>
        <button
          onClick={() => setActiveGame('minecraft')}
          style={{
            padding: '10px 20px', fontSize: '1.2em', borderRadius: '10px', border: 'none',
            background: activeGame === 'minecraft' ? '#2ecc71' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
          }}
        >
          <span>⛏️</span> Minecraft
        </button>
        <button
          onClick={() => setActiveGame('blockblast')}
          style={{
            padding: '10px 20px', fontSize: '1.2em', borderRadius: '10px', border: 'none',
            background: activeGame === 'blockblast' ? '#ff6b6b' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
          }}
        >
          <span>🧩</span> Block Blast
        </button>
        <button
          onClick={() => setActiveGame('snake')}
          style={{
            padding: '10px 20px', fontSize: '1.2em', borderRadius: '10px', border: 'none',
            background: activeGame === 'snake' ? '#fff' : 'rgba(255,255,255,0.1)',
            color: activeGame === 'snake' ? '#333' : '#fff',
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
          }}
        >
          <span>🐍</span> Snake Game
        </button>
        <button
          onClick={() => setActiveGame('fight')}
          style={{
            padding: '10px 20px', fontSize: '1.2em', borderRadius: '10px', border: 'none',
            background: activeGame === 'fight' ? '#ffd700' : 'rgba(255,255,255,0.1)',
            color: activeGame === 'fight' ? '#333' : '#fff',
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
          }}
        >
          <span>⚔️</span> 2D Fighter
        </button>
        <button
          onClick={() => setActiveGame('mario')}
          style={{
            padding: '10px 20px', fontSize: '1.2em', borderRadius: '10px', border: 'none',
            background: activeGame === 'mario' ? '#ff0000' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
          }}
        >
          <span>🍄</span> Super Mario
        </button>

        <button
          onClick={() => setActiveGame('settlement')}
          style={{
            padding: '10px 20px', fontSize: '1.2em', borderRadius: '10px', border: 'none',
            background: activeGame === 'settlement' ? '#4a4a8e' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
          }}
        >
          <span>🏰</span> Settlement
        </button>
        <button
          onClick={() => setActiveGame('geminiSettlement')}
          style={{
            padding: '10px 20px', fontSize: '1.2em', borderRadius: '10px', border: 'none',
            background: activeGame === 'geminiSettlement' ? '#8e44ad' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
          }}
        >
          <span>👾</span> Spiceward
        </button>
        <button
          onClick={() => setActiveGame('settlement-enhanced')}
          style={{
            padding: '10px 20px', fontSize: '1.2em', borderRadius: '10px', border: 'none',
            background: activeGame === 'settlement-enhanced' ? '#00b894' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
          }}
        >
          <span>🏘️</span> Settlement 2.0
        </button>
        <button
          onClick={() => setActiveGame('car')}
          style={{
            padding: '10px 20px', fontSize: '1.2em', borderRadius: '10px', border: 'none',
            background: activeGame === 'car' ? '#d35400' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
          }}
        >
          <span>🏎️</span> Neon Racer
        </button>
        <button
          onClick={() => setActiveGame('zombie')}
          style={{
            padding: '10px 20px', fontSize: '1.2em', borderRadius: '10px', border: 'none',
            background: activeGame === 'zombie' ? '#c1121f' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
          }}
        >
          <span>🧟</span> Zombie Apocalypse
        </button>
        <button
          onClick={() => setActiveGame('hoccuspoccus')}
          style={{
            padding: '10px 20px', fontSize: '1.2em', borderRadius: '10px', border: 'none',
            background: activeGame === 'hoccuspoccus' ? '#000' : 'rgba(255,255,255,0.1)',
            color: activeGame === 'hoccuspoccus' ? '#ff0000' : '#fff',
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s',
            boxShadow: activeGame === 'hoccuspoccus' ? '0 0 10px red' : 'none'
          }}
        >
          <span>🔮</span> Hoccus Poccus
        </button>
        <button
          onClick={() => setActiveGame('duckhunt')}
          style={{
            padding: '10px 20px', fontSize: '1.2em', borderRadius: '10px', border: 'none',
            background: activeGame === 'duckhunt' ? '#8B4513' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
          }}
        >
          <span>🦆</span> Duck Hunt
        </button>
        <button
          onClick={() => setActiveGame('bubbleshooter')}
          style={{
            padding: '10px 20px', fontSize: '1.2em', borderRadius: '10px', border: 'none',
            background: activeGame === 'bubbleshooter' ? '#FF69B4' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
          }}
        >
          <span>🫧</span> Bubble Shooter
        </button>
      </div>

      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {activeGame === 'snake' && <SnakeGame />}
        {activeGame === 'fight' && <FightGame />}
        {activeGame === 'mario' && <SuperMarioGame onExit={() => setActiveGame('snake')} />}
        {activeGame === 'metalslug' && <MetalSlugGame onExit={() => setActiveGame('snake')} />}
        {activeGame === 'minecraft' && <MinecraftGame onExit={() => setActiveGame('snake')} />}
        {activeGame === 'blockblast' && <BlockBlastGame onExit={() => setActiveGame('snake')} />}
        {activeGame === 'settlement' && <SettlementGame onExit={() => setActiveGame('snake')} />}
        {activeGame === 'geminiSettlement' && <GeminiSettlementGame onExit={() => setActiveGame('snake')} />}
        {activeGame === 'settlement-enhanced' && <SettlementEnhancedGame onExit={() => setActiveGame('snake')} />}
        {activeGame === 'car' && <CarGame onExit={() => setActiveGame('snake')} />}
        {activeGame === 'zombie' && <ZombieGame onExit={() => setActiveGame('snake')} />}
        {activeGame === 'hoccuspoccus' && <HoccusPoccusGame onExit={() => setActiveGame('snake')} />}
        {activeGame === 'duckhunt' && <DuckHuntGame onExit={() => setActiveGame('snake')} />}
        {activeGame === 'bubbleshooter' && <BubbleShootingGame onExit={() => setActiveGame('snake')} />}
      </div>
    </main>
  );
}
