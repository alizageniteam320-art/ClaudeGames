"use client";
import React, { useEffect, useRef, useState } from 'react';
import styles from './SuperMarioGame.module.css';

const SuperMarioGame = ({ onExit }) => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [coins, setCoins] = useState(0);
    const [lives, setLives] = useState(3);
    const [time, setTime] = useState(300);
    const [gameState, setGameState] = useState('playing'); // playing, gameover, victory

    // Game Constants
    const GRAVITY = 0.5;
    const JUMP_POWER = -11.5;
    const MOVE_SPEED = 1.5;
    const ACCELERATION = 0.2;
    const TILE_SIZE = 32;

    // Refs for mutable game state
    const gameRef = useRef({
        keys: {},
        cameraX: 0,
        gameRunning: true,
        gameTime: 300,
        lastTime: 0,
        timerInterval: null
    });

    const levelRef = useRef(null);
    const playerRef = useRef(null);
    const enemiesRef = useRef([]);

    useEffect(() => {
        // RESET GAME STATE ON MOUNT
        gameRef.current.gameRunning = true;

        // --- Game Classes ---
        class Player {
            constructor(x, y) {
                this.x = x; this.y = y; this.width = 36; this.height = 36;
                this.velocityX = 0; this.velocityY = 0;
                this.onGround = false; this.facing = 1; this.invincible = false; this.invincibleTimer = 0;
            }

            update(level, enemies, canvasWidth, canvasHeight) {
                const keys = gameRef.current.keys;
                // Movement
                if (keys['ArrowLeft'] || keys['a']) {
                    this.velocityX -= ACCELERATION;
                    if (this.velocityX < -MOVE_SPEED) this.velocityX = -MOVE_SPEED;
                    this.facing = -1;
                }
                else if (keys['ArrowRight'] || keys['d']) {
                    this.velocityX += ACCELERATION;
                    if (this.velocityX > MOVE_SPEED) this.velocityX = MOVE_SPEED;
                    this.facing = 1;
                }
                else { this.velocityX *= 0.85; }

                // Jump
                if ((keys[' '] || keys['w'] || keys['ArrowUp']) && this.onGround) { this.velocityY = JUMP_POWER; this.onGround = false; }

                // Physics
                this.velocityY += GRAVITY;
                this.x += this.velocityX;
                this.y += this.velocityY;

                this.onGround = false;
                this.checkCollisions(level, enemies);

                // Camera
                gameRef.current.cameraX = this.x - canvasWidth / 2 + this.width / 2;
                if (gameRef.current.cameraX < 0) gameRef.current.cameraX = 0;
                if (gameRef.current.cameraX > level.width * TILE_SIZE - canvasWidth) {
                    gameRef.current.cameraX = level.width * TILE_SIZE - canvasWidth;
                }

                // Death
                if (this.y > canvasHeight) this.die();

                if (this.invincible) {
                    this.invincibleTimer--;
                    if (this.invincibleTimer <= 0) this.invincible = false;
                }
            }

            checkCollisions(level, enemies) {
                const gridX = Math.floor(this.x / TILE_SIZE);
                const gridY = Math.floor(this.y / TILE_SIZE);

                for (let y = gridY - 1; y <= gridY + 2; y++) {
                    for (let x = gridX - 1; x <= gridX + 2; x++) {
                        if (x >= 0 && x < level.width && y >= 0 && y < level.height) {
                            const tile = level.tiles[y][x];
                            if (tile === 1 || tile === 2) {
                                const tileRect = { x: x * TILE_SIZE, y: y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
                                if (this.intersects(tileRect)) this.resolveCollision(tileRect);
                            } else if (tile === 3) {
                                const coinRect = { x: x * TILE_SIZE + 8, y: y * TILE_SIZE + 8, width: 16, height: 16 };
                                if (this.intersects(coinRect)) { level.tiles[y][x] = 0; setCoins(c => c + 1); setScore(s => s + 100); }
                            } else if (tile === 4) {
                                const blockRect = { x: x * TILE_SIZE, y: y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
                                if (this.intersects(blockRect) && this.velocityY < 0) {
                                    level.tiles[y][x] = 2; setCoins(c => c + 1); setScore(s => s + 200); this.velocityY = 0;
                                }
                            } else if (tile === 5) {
                                const flagRect = { x: x * TILE_SIZE, y: y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE * 3 };
                                if (this.intersects(flagRect)) winGame();
                            }
                        }
                    }
                }

                enemies.forEach(enemy => {
                    if (this.intersects(enemy)) {
                        if (this.velocityY > 0 && this.y + this.height - 10 < enemy.y + enemy.height / 2) {
                            enemy.defeated = true; this.velocityY = JUMP_POWER / 2; setScore(s => s + 200);
                        } else if (!this.invincible) { this.die(); }
                    }
                });
            }

            intersects(rect) {
                return this.x < rect.x + rect.width && this.x + this.width > rect.x && this.y < rect.y + rect.height && this.y + this.height > rect.y;
            }

            resolveCollision(rect) {
                const overlapX = Math.min(this.x + this.width - rect.x, rect.x + rect.width - this.x);
                const overlapY = Math.min(this.y + this.height - rect.y, rect.y + rect.height - this.y);

                if (overlapX < overlapY) {
                    if (this.x < rect.x) this.x = rect.x - this.width; else this.x = rect.x + rect.width;
                    this.velocityX = 0;
                } else {
                    if (this.y < rect.y) { this.y = rect.y - this.height; this.velocityY = 0; this.onGround = true; }
                    else { this.y = rect.y + rect.height; this.velocityY = 0; }
                }
            }

            die() {
                setLives(l => { const newLives = l - 1; if (newLives <= 0) gameOver(); return newLives; });
                this.x = 100; this.y = 100; this.velocityX = 0; this.velocityY = 0; this.invincible = true; this.invincibleTimer = 120;
            }

            draw(ctx, cameraX) {
                ctx.save();
                ctx.translate(this.x - cameraX, this.y);
                ctx.scale(1.3, 1.3); // Scale up by 30%
                if (!this.invincible || Math.floor(this.invincibleTimer / 5) % 2 === 0) {
                    // Mario Colors (adjusted for local coordinates)
                    ctx.fillStyle = '#ff0000'; ctx.fillRect(6, 8, 16, 16);
                    ctx.fillStyle = '#ffdbac'; ctx.fillRect(8, 2, 12, 10);
                    ctx.fillStyle = '#ff0000'; ctx.fillRect(6, 0, 16, 4);
                    ctx.fillStyle = '#000'; ctx.fillRect(10, 5, 2, 2); ctx.fillRect(16, 5, 2, 2);
                    ctx.fillStyle = '#5c3a21'; ctx.fillRect(8, 8, 12, 2);
                    ctx.fillStyle = '#0000ff'; ctx.fillRect(8, 24, 5, 4); ctx.fillRect(15, 24, 5, 4);
                    ctx.fillStyle = '#5c3a21'; ctx.fillRect(6, 24, 7, 4); ctx.fillRect(15, 24, 7, 4);
                }
                ctx.restore();
            }
        }

        class Enemy {
            constructor(x, y) { this.x = x; this.y = y; this.width = 26; this.height = 26; this.velocityX = -1.5; this.velocityY = 0; this.defeated = false; }
            update(level, canvasHeight) {
                if (this.defeated) return;
                this.velocityY += GRAVITY; this.x += this.velocityX; this.y += this.velocityY;
                const gridX = Math.floor(this.x / TILE_SIZE); const gridY = Math.floor(this.y / TILE_SIZE);
                let onGround = false;
                for (let y = gridY; y <= gridY + 1; y++) {
                    for (let x = gridX - 1; x <= gridX + 1; x++) {
                        if (x >= 0 && x < level.width && y >= 0 && y < level.height) {
                            const tile = level.tiles[y][x];
                            if (tile === 1 || tile === 2) {
                                const tileRect = { x: x * TILE_SIZE, y: y * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
                                if (this.intersects(tileRect)) {
                                    if (this.velocityY > 0) { this.y = tileRect.y - this.height; this.velocityY = 0; onGround = true; }
                                    if (Math.abs(this.x + this.width / 2 - (tileRect.x + TILE_SIZE / 2)) < 20) this.velocityX *= -1;
                                }
                            }
                        }
                    }
                }
                if (onGround) {
                    const checkX = this.velocityX > 0 ? Math.floor((this.x + this.width + 5) / TILE_SIZE) : Math.floor((this.x - 5) / TILE_SIZE);
                    const checkY = Math.floor((this.y + this.height + 5) / TILE_SIZE);
                    if (checkX >= 0 && checkX < level.width && checkY < level.height && level.tiles[checkY][checkX] === 0) this.velocityX *= -1;
                }
                if (this.y > canvasHeight + 100) this.defeated = true;
            }
            intersects(rect) { return this.x < rect.x + rect.width && this.x + this.width > rect.x && this.y < rect.y + rect.height && this.y + this.height > rect.y; }
            draw(ctx, cameraX) {
                if (this.defeated) return;
                ctx.save(); ctx.translate(-cameraX, 0);
                ctx.fillStyle = '#8b4513'; ctx.fillRect(this.x, this.y + 4, this.width, this.height - 8);
                ctx.fillStyle = '#8b4513'; ctx.beginPath(); ctx.arc(this.x + this.width / 2, this.y + 8, 10, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(this.x + 9, this.y + 7, 4, 0, Math.PI * 2); ctx.fill(); ctx.arc(this.x + 17, this.y + 7, 4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(this.x + 9, this.y + 7, 2, 0, Math.PI * 2); ctx.fill(); ctx.arc(this.x + 17, this.y + 7, 2, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#654321'; ctx.fillRect(this.x + 2, this.y + this.height - 4, 8, 4); ctx.fillRect(this.x + this.width - 10, this.y + this.height - 4, 8, 4);
                ctx.restore();
            }
        }

        const initLevel = () => {
            const width = 200; const height = 15;
            const tiles = Array(height).fill().map(() => Array(width).fill(0));
            for (let x = 0; x < width; x++) { tiles[13][x] = 1; tiles[14][x] = 1; }
            for (let x = 5; x < 10; x++) tiles[10][x] = 1;
            tiles[7][12] = 4; tiles[7][14] = 4; tiles[7][16] = 4; tiles[7][25] = 4; tiles[7][26] = 4; tiles[7][27] = 4;
            for (let x = 30; x < 35; x++) tiles[9][x] = 3;
            for (let x = 40; x < 45; x++) tiles[10][x] = 1;
            for (let x = 50; x < 55; x++) tiles[8][x] = 1;
            for (let x = 60; x < 65; x++) tiles[10][x] = 1;
            for (let i = 0; i < 6; i++) for (let j = 0; j <= i; j++) tiles[13 - j][70 + i] = 1;
            tiles[7][80] = 4; tiles[7][82] = 4; tiles[7][84] = 4;
            for (let x = 90; x < 110; x++) tiles[10][x] = 1;
            for (let x = 95; x < 105; x++) tiles[7][x] = 3;
            for (let x = 115; x < 118; x++) tiles[11][x] = 1;
            for (let x = 120; x < 123; x++) tiles[9][x] = 1;
            for (let x = 125; x < 128; x++) tiles[11][x] = 1;
            tiles[7][135] = 4; tiles[7][137] = 4;
            tiles[11][145] = 2; tiles[12][145] = 2; tiles[13][145] = 2; tiles[10][145] = 2;
            tiles[11][146] = 2; tiles[12][146] = 2; tiles[13][146] = 2; tiles[10][146] = 2;
            for (let x = 150; x < 165; x++) tiles[10][x] = 1;
            for (let x = 155; x < 160; x++) tiles[7][x] = 3;
            for (let y = 5; y <= 13; y++) tiles[y][180] = 5;
            tiles[11][180] = 5; tiles[12][180] = 5; tiles[10][180] = 5;
            for (let x = 185; x < 195; x++) { tiles[12][x] = 2; tiles[11][x] = 2; }
            tiles[10][188] = 2; tiles[10][189] = 2; tiles[10][190] = 2; tiles[10][191] = 2;
            return { width, height, tiles };
        };

        levelRef.current = initLevel();
        playerRef.current = new Player(100, 100);
        enemiesRef.current = [new Enemy(400, 300), new Enemy(800, 300), new Enemy(1200, 300), new Enemy(2000, 300), new Enemy(2800, 300), new Enemy(3500, 300), new Enemy(4000, 300)];

        const loop = () => {
            if (!gameRef.current.gameRunning) return;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const { cameraX } = gameRef.current;
            const level = levelRef.current;
            const player = playerRef.current;
            const enemies = enemiesRef.current;

            player.update(level, enemies, canvas.width, canvas.height);
            enemies.forEach(e => e.update(level, canvas.height));

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(-cameraX, 0);
            for (let y = 0; y < level.height; y++) {
                for (let x = 0; x < level.width; x++) {
                    const tile = level.tiles[y][x];
                    const screenX = x * TILE_SIZE; const screenY = y * TILE_SIZE;
                    if (screenX + TILE_SIZE < cameraX || screenX > cameraX + canvas.width) continue;
                    if (tile === 1) { ctx.fillStyle = '#d2691e'; ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE); ctx.strokeStyle = '#8b4513'; ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE); }
                    else if (tile === 2) { ctx.fillStyle = '#8b6914'; ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE); ctx.strokeStyle = '#654321'; ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE); }
                    else if (tile === 3) { ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(screenX + 16, screenY + 16, 8, 0, Math.PI * 2); ctx.fill(); }
                    else if (tile === 4) { ctx.fillStyle = '#ffb300'; ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE); ctx.fillStyle = '#fff'; ctx.font = 'bold 24px Arial'; ctx.fillText('?', screenX + 10, screenY + 24); }
                    else if (tile === 5) { ctx.fillStyle = '#000'; ctx.fillRect(screenX + 14, screenY, 4, TILE_SIZE); if (y < 13) { ctx.fillStyle = '#ff0000'; ctx.fillRect(screenX + 18, screenY + 2, 12, 8); } }
                }
            }
            ctx.restore();
            player.draw(ctx, gameRef.current.cameraX);
            enemies.forEach(e => e.draw(ctx, gameRef.current.cameraX));
            requestAnimationFrame(loop);
        };

        const handleKeyDown = (e) => { gameRef.current.keys[e.key] = true; };
        const handleKeyUp = (e) => { gameRef.current.keys[e.key] = false; };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        gameRef.current.timerInterval = setInterval(() => {
            if (gameRef.current.gameRunning) {
                gameRef.current.gameTime--;
                setTime(gameRef.current.gameTime);
                if (gameRef.current.gameTime <= 0) gameOver();
            }
        }, 1000);

        requestAnimationFrame(loop);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            clearInterval(gameRef.current.timerInterval);
            gameRef.current.gameRunning = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const gameOver = () => { gameRef.current.gameRunning = false; setGameState('gameover'); };
    const winGame = () => { gameRef.current.gameRunning = false; setScore(s => s + gameRef.current.gameTime * 10); setGameState('victory'); };
    const restartGame = () => { window.location.reload(); };

    return (
        <div className={styles.gameContainer}>
            <div className={styles.hud}>
                <div className={styles.hudItem}><span>SCORE: {score}</span></div>
                <div className={`${styles.hudItem} ${styles.coin}`}><span>🪙 × {coins}</span></div>
                <div className={`${styles.hudItem} ${styles.lives}`}><span>❤️ × {lives}</span></div>
                <div className={styles.hudItem}><span>TIME: {time}</span></div>
                <button className={styles.button} onClick={onExit} style={{ padding: '5px 10px', fontSize: '0.8em' }}>EXIT</button>
            </div>
            <canvas ref={canvasRef} className={styles.canvas} width={800} height={480} />
            <div className={styles.controls}>Arrow Keys or A/D to Move | Space or W to Jump | Collect coins and reach the flag!</div>
            {gameState === 'gameover' && (
                <div className={styles.overlay}><h2 className={styles.gameOverTitle}>GAME OVER</h2><p className={styles.overlayText}>Final Score: {score}</p><button className={styles.button} onClick={restartGame}>Try Again</button><button className={styles.button} onClick={onExit}>Main Menu</button></div>
            )}
            {gameState === 'victory' && (
                <div className={styles.overlay}><h2 className={styles.victoryTitle}>🎉 VICTORY! 🎉</h2><p className={styles.overlayText}>You completed the level!</p><p className={styles.overlayText}>Final Score: {score}</p><button className={styles.button} onClick={restartGame}>Play Again</button><button className={styles.button} onClick={onExit}>Main Menu</button></div>
            )}
        </div>
    );
};
export default SuperMarioGame;
