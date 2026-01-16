"use client";

import React, { useEffect, useRef, useState } from 'react';
import styles from './FightGame.module.css';

// Roster Config with Sprite Sheets AND Portraits
const ROSTER = [
    { id: 'karate', name: 'Karate', portrait: '/characters/fighter_karate.png', sheet: '/characters/spritesheet_karate.png', color: '#ffaaaa' },
    { id: 'brawler', name: 'Brawler', portrait: '/characters/fighter_brawler.png', sheet: '/characters/spritesheet_brawler.png', color: '#ff0000' },
    { id: 'wrestler', name: 'Jaguar', portrait: '/characters/fighter_wrestler.png', sheet: '/characters/spritesheet_wrestler.png', color: '#DAA520' },
    { id: 'assassin', name: 'Assassin', portrait: '/characters/fighter_assassin.png', sheet: '/characters/spritesheet_assassin.png', color: '#800080' },
    { id: 'cyborg', name: 'Cyborg', portrait: '/characters/fighter_cyborg.png', sheet: '/characters/spritesheet_cyborg.png', color: '#aaaaaa' },
];

const SPRITE_SIZE = 128; // Assumed frame size, adjusted in draw
const ANIMATION_MAP = {
    IDLE: { row: 0, frames: 4, speed: 10 },
    WALK: { row: 1, frames: 4, speed: 8 },
    PUNCH: { row: 2, frames: 3, speed: 5 },
    KICK: { row: 3, frames: 3, speed: 6 },
    HIT: { row: 0, frames: 1, speed: 10 }
};

export default function FightGame() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    // Mode: 'Select' | 'Loading' | 'Fight'
    const [gameStateMode, setGameStateMode] = useState('Select');
    const [p1Selection, setP1Selection] = useState(0);
    const [p2Selection, setP2Selection] = useState(1);
    const [selectionStep, setSelectionStep] = useState(1);

    const [p1Health, setP1Health] = useState(100);
    const [p2Health, setP2Health] = useState(100);
    const [gameTime, setGameTime] = useState(99);
    const [gameOverState, setGameOverState] = useState(null);

    // Assets now hold the PROCESSED (Transparent) spritesheets
    const [assets, setAssets] = useState({
        p1Sheet: null,
        p2Sheet: null,
        background: null
    });

    const assetsRef = useRef(assets);
    useEffect(() => {
        assetsRef.current = assets;
    }, [assets]);

    const GRAVITY = 0.8;
    const GROUND_LEVEL = 330;

    const fxRef = useRef([]);

    class Fighter {
        constructor(x, color, controls, id) {
            this.id = id;
            this.x = x;
            this.y = GROUND_LEVEL;
            this.width = 80;
            this.height = 130;
            this.color = color;
            this.velocityY = 0;
            this.velocityX = 0;
            this.health = 100;
            this.isJumping = false;
            this.isCrouching = false;

            // Animation State
            this.state = 'IDLE';
            this.frameX = 0;
            this.frameY = 0;
            this.gameFrame = 0;

            this.facing = id === 1 ? 1 : -1;
            this.controls = controls;
            this.speed = 5;

            this.hitStun = 0;
            this.hitboxActive = false;
        }

        update(canvasWidth, opponentX) {
            this.gameFrame++;

            let nextState = 'IDLE';

            if (this.hitStun > 0) {
                this.hitStun--;
                this.state = 'HIT';
                this.velocityX *= 0.8;
                if (this.hitStun <= 0) this.state = 'IDLE';
                this.x += this.velocityX;
            } else {
                if (this.y < GROUND_LEVEL || this.velocityY < 0) {
                    this.velocityY += GRAVITY;
                    this.y += this.velocityY;
                }
                if (this.y >= GROUND_LEVEL) {
                    this.y = GROUND_LEVEL;
                    this.velocityY = 0;
                    this.isJumping = false;
                }

                this.x += this.velocityX;
                this.velocityX *= 0.5;

                if (Math.abs(this.velocityX) > 1) nextState = 'WALK';
                if (this.state === 'PUNCH' || this.state === 'KICK') {
                    if (this.frameX >= ANIMATION_MAP[this.state].frames - 1) {
                        nextState = 'IDLE';
                        this.hitboxActive = false;
                    } else {
                        nextState = this.state;
                    }
                }

                if (nextState !== 'PUNCH' && nextState !== 'KICK' && this.hitStun <= 0) {
                    this.state = nextState;
                    this.facing = this.x + this.width / 2 < opponentX + 25 ? 1 : -1;
                }
            }

            if (this.x < 0) this.x = 0;
            if (this.x > canvasWidth - this.width) this.x = canvasWidth - this.width;

            this.updateAnimation();
        }

        updateAnimation() {
            const anim = ANIMATION_MAP[this.state] || ANIMATION_MAP.IDLE;
            this.frameY = anim.row;

            if (this.gameFrame % anim.speed === 0) {
                this.frameX++;
                if (this.frameX >= anim.frames) {
                    if (this.state === 'PUNCH' || this.state === 'KICK') {
                        // handled in update
                    } else {
                        this.frameX = 0;
                    }
                }

                if ((this.state === 'PUNCH' || this.state === 'KICK') && this.frameX === 1) {
                    this.hitboxActive = true;
                } else {
                    this.hitboxActive = false;
                }
            }
        }

        draw(ctx, currentAssets) {
            const prefix = this.id === 1 ? 'p1' : 'p2';
            const spriteSheet = currentAssets[`${prefix}Sheet`];

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath(); ctx.ellipse(this.x + this.width / 2, this.y, 40, 10, 0, 0, Math.PI * 2); ctx.fill();

            if (spriteSheet && spriteSheet.complete && spriteSheet.naturalWidth > 0) {
                const sheetW = spriteSheet.naturalWidth;
                const sheetH = spriteSheet.naturalHeight;
                const frameW = sheetW / 4;
                const frameH = sheetH / 4;
                const gutter = 4; // Use gutter to prevent texture bleeding

                ctx.save();
                ctx.translate(this.x + this.width / 2, this.y);
                ctx.scale(this.facing, 1);

                ctx.drawImage(
                    spriteSheet,
                    (this.frameX * frameW) + gutter, (this.frameY * frameH) + gutter,
                    frameW - (gutter * 2), frameH - (gutter * 2),
                    -this.width, -this.height,
                    this.width * 2, this.height
                );

                ctx.restore();
            } else {
                this.drawFallback(ctx);
            }
        }

        drawFallback(ctx) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y - this.height, this.width, this.height);
        }

        jump() { if (!this.isJumping && this.state !== 'HIT' && this.y >= GROUND_LEVEL) { this.velocityY = -18; this.isJumping = true; } }
        crouch() { this.isCrouching = true; }
        stand() { this.isCrouching = false; }
        moveLeft() { if (this.state !== 'PUNCH' && this.state !== 'KICK' && this.hitStun <= 0) { this.velocityX = -this.speed; } }
        moveRight() { if (this.state !== 'PUNCH' && this.state !== 'KICK' && this.hitStun <= 0) { this.velocityX = this.speed; } }

        punch() {
            if (this.state !== 'PUNCH' && this.state !== 'KICK' && this.hitStun <= 0) {
                this.state = 'PUNCH'; this.frameX = 0;
            }
        }
        kick() {
            if (this.state !== 'PUNCH' && this.state !== 'KICK' && this.hitStun <= 0) {
                this.state = 'KICK'; this.frameX = 0;
            }
        }

        getHitbox() {
            if (!this.hitboxActive) return null;
            const reach = 60; const footY = this.y;
            if (this.state === 'PUNCH') return { x: this.x + this.width / 2 + (this.facing * 30), y: footY - 90, width: reach, height: 40, damage: 8 };
            else if (this.state === 'KICK') return { x: this.x + this.width / 2 + (this.facing * 40), y: footY - 60, width: reach, height: 50, damage: 12 };
            return null;
        }

        getBodyBox() { return { x: this.x, y: this.y - 120, width: this.width, height: 120 }; }
        takeDamage(damage) {
            this.health -= damage;
            if (this.health < 0) this.health = 0;
            this.hitStun = 20;
            this.state = 'HIT';
            this.hitboxActive = false;
            this.velocityX = -this.facing * 10;
        }
    }

    const gameState = useRef({
        player1: new Fighter(150, '#ff4444', { up: 'w', down: 's', left: 'a', right: 'd', punch: 'f', kick: 'g' }, 1),
        player2: new Fighter(550, '#4444ff', { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', punch: 'Numpad1', kick: 'Numpad2' }, 2),
        isPaused: false,
        gameLoopId: null,
        timerLoopId: null,
        time: 99
    });

    const keys = useRef({});

    useEffect(() => {
        const handleKeyDown = (e) => {
            keys.current[e.key.toLowerCase()] = true; keys.current[e.code] = true;
            if (gameStateMode === 'Select') { handleSelectionInput(e); return; }
            if (gameOverState) { if (e.key === 'Enter') showSelectScreen(); return; }

            const state = gameState.current;
            const p1 = state.player1;
            if (e.key.toLowerCase() === p1.controls.up) p1.jump();
            if (e.key.toLowerCase() === p1.controls.down) p1.crouch();
            if (e.key.toLowerCase() === p1.controls.left) p1.moveLeft();
            if (e.key.toLowerCase() === p1.controls.right) p1.moveRight();
            if (e.key.toLowerCase() === p1.controls.punch) p1.punch();
            if (e.key.toLowerCase() === p1.controls.kick) p1.kick();

            const p2 = state.player2;
            if ((e.key === p2.controls.up || e.code === 'ArrowUp')) { e.preventDefault(); p2.jump(); }
            if ((e.key === p2.controls.down || e.code === 'ArrowDown')) { e.preventDefault(); p2.crouch(); }
            if ((e.key === p2.controls.left || e.code === 'ArrowLeft')) { e.preventDefault(); p2.moveLeft(); }
            if ((e.key === p2.controls.right || e.code === 'ArrowRight')) { e.preventDefault(); p2.moveRight(); }
            if (e.code === 'Numpad1' || e.key === '1') p2.punch();
            if (e.code === 'Numpad2' || e.key === '2') p2.kick();
        };

        const handleKeyUp = (e) => {
            keys.current[e.key.toLowerCase()] = false; keys.current[e.code] = false;
            if (gameStateMode === 'Fight') {
                const state = gameState.current;
                if (e.key.toLowerCase() === 's') state.player1.stand();
                if (e.key === 'ArrowDown' || e.code === 'ArrowDown') state.player2.stand();
            }
        };

        window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);

        if (gameStateMode === 'Fight') {
            startGame();
        }

        return () => { stopGame(); window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameStateMode, selectionStep, p1Selection, p2Selection]);

    const handleSelectionInput = (e) => {
        if (selectionStep === 1) {
            if (e.key === 'a' || e.key === 'ArrowLeft') setP1Selection(prev => (prev > 0 ? prev - 1 : ROSTER.length - 1));
            else if (e.key === 'd' || e.key === 'ArrowRight') setP1Selection(prev => (prev < ROSTER.length - 1 ? prev + 1 : 0));
            else if (e.key === 'f' || e.key === 'Enter') setSelectionStep(2);
        } else if (selectionStep === 2) {
            if (e.key === 'ArrowLeft' || e.key === 'a') setP2Selection(prev => (prev > 0 ? prev - 1 : ROSTER.length - 1));
            else if (e.key === 'ArrowRight' || e.key === 'd') setP2Selection(prev => (prev < ROSTER.length - 1 ? prev + 1 : 0));
            else if (e.key === 'Enter' || e.key === 'Numpad1' || e.key === '1') loadSelectedFightersAndStart();
        }
    };

    /** Process Image to Remove White Background */
    const removeWhiteBackground = (img) => {
        const cvs = document.createElement('canvas');
        cvs.width = img.width; cvs.height = img.height;
        const ctx = cvs.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, cvs.width, cvs.height);
        const data = imgData.data;
        // Simple Chroma Key for White/Near-White
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i]; const g = data[i + 1]; const b = data[i + 2];
            if (r > 240 && g > 240 && b > 240) {
                data[i + 3] = 0; // Alpha 0
            }
        }
        ctx.putImageData(imgData, 0, 0);
        const newImg = new Image();
        newImg.src = cvs.toDataURL();
        return newImg;
    };

    const loadSelectedFightersAndStart = () => {
        setGameStateMode('Loading');

        const p1Char = ROSTER[p1Selection];
        const p2Char = ROSTER[p2Selection];

        // Load Sheets (for animation)
        const img1 = new Image(); img1.src = p1Char.sheet;
        const img2 = new Image(); img2.src = p2Char.sheet;

        let loadedCount = 0;
        let forced = false;

        const checkLoad = () => {
            if (forced) return;
            loadedCount++;
            if (loadedCount >= 2) {
                // Process Images
                try {
                    const cleanSheet1 = removeWhiteBackground(img1);
                    const cleanSheet2 = removeWhiteBackground(img2);

                    const ready1 = new Image(); ready1.src = cleanSheet1.src;
                    const ready2 = new Image(); ready2.src = cleanSheet2.src;

                    setAssets(prev => ({ ...prev, p1Sheet: ready1, p2Sheet: ready2 }));
                    setGameStateMode('Fight');
                } catch (e) {
                    console.error("Chroma Key Failed", e);
                    // Fallback to raw
                    setAssets(prev => ({ ...prev, p1Sheet: img1, p2Sheet: img2 }));
                    setGameStateMode('Fight');
                }
            }
        };

        img1.onload = checkLoad; img1.onerror = () => { console.error("Failed P1"); checkLoad(); };
        img2.onload = checkLoad; img2.onerror = () => { console.error("Failed P2"); checkLoad(); };

        setTimeout(() => {
            if (gameStateMode === 'Loading' && !forced) {
                forced = true;
                setAssets(prev => ({ ...prev, p1Sheet: img1, p2Sheet: img2 }));
                setGameStateMode('Fight');
            }
        }, 4000);
    };

    const showSelectScreen = () => {
        stopGame();
        setGameStateMode('Select');
        setSelectionStep(1);
        setGameOverState(null);
    };

    const startGame = () => {
        const state = gameState.current;
        if (state.gameLoopId) clearInterval(state.gameLoopId);
        if (state.timerLoopId) clearInterval(state.timerLoopId);

        state.player1 = new Fighter(150, ROSTER[p1Selection].color, { up: 'w', down: 's', left: 'a', right: 'd', punch: 'f', kick: 'g' }, 1);
        state.player2 = new Fighter(550, ROSTER[p2Selection].color, { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', punch: 'Numpad1', kick: 'Numpad2' }, 2);
        state.time = 99;

        setGameTime(99); setP1Health(100); setP2Health(100); setGameOverState(null);
        fxRef.current = [];
        state.gameLoopId = setInterval(gameLoop, 1000 / 60); state.timerLoopId = setInterval(timerLoop, 1000);
    };

    const stopGame = () => {
        const state = gameState.current;
        if (state.gameLoopId) clearInterval(state.gameLoopId);
        if (state.timerLoopId) clearInterval(state.timerLoopId);
    };

    const timerLoop = () => {
        const state = gameState.current;
        if (state.time > 0) { state.time--; setGameTime(state.time); if (state.time <= 0) endGame(); }
    };

    const checkCollision = (hitbox, bodybox) => {
        return hitbox.x < bodybox.x + bodybox.width && hitbox.x + hitbox.width > bodybox.x && hitbox.y < bodybox.y + bodybox.height && hitbox.y + hitbox.height > bodybox.y;
    };

    const triggerShake = () => { if (containerRef.current) { containerRef.current.style.transform = `translate(${Math.random() * 8 - 4}px, ${Math.random() * 8 - 4}px)`; setTimeout(() => { if (containerRef.current) containerRef.current.style.transform = 'none'; }, 50); } };
    const spawnSpark = (x, y) => { fxRef.current.push({ x, y, life: 10 }); };

    const gameLoop = () => {
        if (gameOverState) return;

        try {
            const state = gameState.current;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const p1 = state.player1; const p2 = state.player2; const currentAssets = assetsRef.current;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Env
            if (currentAssets.background) {
                ctx.drawImage(currentAssets.background, 0, 0, canvas.width, canvas.height);
            } else {
                const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
                grad.addColorStop(0, '#87CEEB');
                grad.addColorStop(0.5, '#E0F7FA');
                grad.addColorStop(0.5, '#4caf50');
                grad.addColorStop(1, '#2e7d32');
                ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#6d4c41'; ctx.fillRect(0, GROUND_LEVEL, canvas.width, canvas.height - GROUND_LEVEL);
            }

            p1.update(canvas.width, p2.x);
            p2.update(canvas.width, p1.x);

            const p1Hitbox = p1.getHitbox(); const p2Hitbox = p2.getHitbox();
            const p1Body = p1.getBodyBox(); const p2Body = p2.getBodyBox();

            if (p1Hitbox && checkCollision(p1Hitbox, p2Body)) { p2.takeDamage(p1Hitbox.damage); p1.hitboxActive = false; setP2Health(p2.health); triggerShake(); spawnSpark(p1Hitbox.x + p1Hitbox.width / 2, p1Hitbox.y); }
            if (p2Hitbox && checkCollision(p2Hitbox, p1Body)) { p1.takeDamage(p2Hitbox.damage); p2.hitboxActive = false; setP1Health(p1.health); triggerShake(); spawnSpark(p2Hitbox.x + p2Hitbox.width / 2, p2Hitbox.y); }

            p1.draw(ctx, currentAssets);
            p2.draw(ctx, currentAssets);

            for (let i = fxRef.current.length - 1; i >= 0; i--) {
                const fx = fxRef.current[i]; fx.life--; if (fx.life <= 0) { fxRef.current.splice(i, 1); continue; }
                ctx.save(); ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = `rgba(255, 200, 50, ${fx.life / 10})`; ctx.beginPath(); ctx.arc(fx.x, fx.y, 30 + (10 - fx.life) * 3, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = `rgba(255, 255, 255, ${fx.life / 5})`; ctx.beginPath(); ctx.arc(fx.x, fx.y, 10 + (10 - fx.life), 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }

            if (p1.health <= 0 || p2.health <= 0) endGame();

        } catch (e) {
            console.error("GAME CRASH", e);
            stopGame();
        }
    };

    const endGame = () => { stopGame(); const state = gameState.current; const p1 = state.player1; const p2 = state.player2; let winner = "DRAW"; let method = "TIME UP"; if (p1.health <= 0 && p2.health <= 0) { method = "DOUBLE K.O."; } else if (p1.health <= 0) { winner = "PLAYER 2 WINS"; method = "K.O."; } else if (p2.health <= 0) { winner = "PLAYER 1 WINS"; method = "K.O."; } else if (state.time <= 0) { if (p1.health > p2.health) winner = "PLAYER 1 WINS"; else if (p2.health > p1.health) winner = "PLAYER 2 WINS"; } setGameOverState({ winner, method }); };

    const handleFileUpload = (type, event) => {
        const file = event.target.files[0];
        if (file) {
            const img = new Image(); img.src = URL.createObjectURL(file);
            img.onload = () => { setAssets(prev => ({ ...prev, [type]: img })); };
        }
    };

    if (gameStateMode === 'Loading') {
        return (
            <div className={styles.gameContainer} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#333', height: '450px' }}>
                <h1 style={{ color: '#fff', animation: 'pulse 1s infinite' }}>RENDERING ASSETS...</h1>
                <p style={{ color: '#aaa', marginBottom: '20px' }}>Optimizing high-res sprites.</p>
                <div style={{ color: '#666', fontSize: '0.8em' }}>Cleaning transparency...</div>
                <button onClick={() => { setGameStateMode('Fight'); }} className={styles.button} style={{ marginTop: '20px' }}>
                    FORCE START
                </button>
            </div>
        );
    }

    if (gameStateMode === 'Select') {
        const p1Char = ROSTER[p1Selection];
        const p2Char = ROSTER[p2Selection];
        return (
            <div className={styles.gameContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', height: '450px' }}>
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <h1 style={{ color: '#ffd700', fontSize: '3em', margin: '0 0 20px 0', textShadow: '2px 2px #fff' }}>CHARACTER SELECT</h1>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'center', border: selectionStep === 1 ? '4px solid #f00' : '2px solid #555', padding: '20px', borderRadius: '10px', background: selectionStep === 1 ? '#220' : '#000' }}>
                            <h2 style={{ color: '#f00' }}>PLAYER 1</h2>
                            <img src={p1Char.portrait} alt={p1Char.name} style={{ width: '100px', height: '150px', objectFit: 'contain', background: '#333', marginBottom: '10px' }} />
                            <div style={{ color: '#fff', fontSize: '1.5em' }}>{p1Char.name}</div>
                            {selectionStep === 1 && <div style={{ color: '#888', fontSize: '0.8em' }}>AD to Pick, F to Confirm</div>}
                        </div>
                        <div style={{ fontSize: '3em', color: '#555', fontStyle: 'italic' }}>VS</div>
                        <div style={{ textAlign: 'center', border: selectionStep === 2 ? '4px solid #00f' : '2px solid #555', padding: '20px', borderRadius: '10px', background: selectionStep === 2 ? '#002' : '#000' }}>
                            <h2 style={{ color: '#66f' }}>PLAYER 2</h2>
                            <img src={p2Char.portrait} alt={p2Char.name} style={{ width: '100px', height: '150px', objectFit: 'contain', background: '#333', marginBottom: '10px' }} />
                            <div style={{ color: '#fff', fontSize: '1.5em' }}>{p2Char.name}</div>
                            {selectionStep === 2 && <div style={{ color: '#888', fontSize: '0.8em' }}>Arrows to Pick, ENTER to Confirm</div>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.gameContainer} ref={containerRef}>
            <div className={styles.hud}>
                <div className={`${styles.playerInfo} ${styles.playerInfoLeft}`}>
                    <div className={styles.healthBarContainer}><div className={`${styles.healthBar} ${styles.healthBarP1}`} style={{ width: `${p1Health}%` }}></div></div>
                    <div className={styles.playerName}>P1: {ROSTER[p1Selection].name.toUpperCase()}</div>
                </div>
                <div className={styles.timer}>{gameTime}</div>
                <div className={`${styles.playerInfo} ${styles.playerInfoRight}`}>
                    <div className={styles.healthBarContainer}><div className={`${styles.healthBar} ${styles.healthBarP2}`} style={{ width: `${p2Health}%` }}></div></div>
                    <div className={styles.playerName}>P2: {ROSTER[p2Selection].name.toUpperCase()}</div>
                </div>
            </div>

            <canvas ref={canvasRef} className={styles.canvas} width={800} height={450} />

            {gameOverState && (
                <div className={styles.gameOver}>
                    <h2 className={styles.gameOverTitle}>{gameOverState.method}</h2>
                    <p className={styles.gameOverText}>{gameOverState.winner}</p>
                    <button className={styles.button} onClick={showSelectScreen}>NEW FIGHT</button>
                </div>
            )}

            <div className={styles.controls}>
                <div className={styles.controlSection}><h3>P1 (RED)</h3><p>WASD + F / G</p></div>
                <div className={styles.controlSection}><h3>P2 (BLUE)</h3><p>ARROWS + 1 / 2</p></div>
            </div>
            <div className={styles.uploadSection}>
                <div className={styles.uploadRow}>
                    <div className={styles.uploadGroup} style={{ flex: 1, minWidth: '150px' }}><h4>Backdrop</h4><input type="file" accept="image/*" onChange={(e) => handleFileUpload('background', e)} /></div>
                </div>
            </div>
        </div>
    );
}
