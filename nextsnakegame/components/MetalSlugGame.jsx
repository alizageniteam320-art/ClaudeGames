"use client";
import React, { useEffect, useRef, useState } from 'react';
import styles from './MetalSlugGame.module.css';

const MetalSlugGame = ({ onExit }) => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [health, setHealth] = useState(100);
    const [ammo, setAmmo] = useState(30);
    const [grenades, setGrenades] = useState(5);
    const [gameState, setGameState] = useState('playing');

    // Game Constants
    const GRAVITY = 0.7;
    const JUMP_POWER = -13;
    const MOVE_SPEED = 5;
    const GROUND_OFFSET = 90; // Higher offset to match background street level

    // Mutable Game State
    const gameRef = useRef({
        keys: {},
        cameraX: 0,
        gameRunning: true,
        bullets: [],
        enemyBullets: [],
        grenades: [],
        particles: [],
        explosions: [],
        assets: {
            bg: null,
            player: null,
            enemy: null
        }
    });

    const levelRef = useRef({ width: 3000, platforms: [] });
    const playerRef = useRef(null);
    const enemiesRef = useRef([]);

    // Helper: Remove Solid White Background (Aggressive)
    const removeWhiteBackground = (img) => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            // Aggressive White Removal (>180) to ensure no gray boxes remain
            if (r > 180 && g > 180 && b > 180) {
                data[i + 3] = 0;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        const newImg = new Image();
        newImg.src = canvas.toDataURL();
        return newImg;
    };

    useEffect(() => {
        gameRef.current.gameRunning = true;

        // Load Assets
        const loadAssets = () => {
            const bg = new Image(); bg.src = '/assets/ms_bg_new.png';
            const p = new Image(); p.src = '/assets/ms_player_new.png';
            const e = new Image(); e.src = '/assets/ms_enemy_new.png';

            bg.onload = () => { gameRef.current.assets.bg = bg; };
            // Use timeout to ensure image data is loaded before processing
            p.onload = () => { setTimeout(() => gameRef.current.assets.player = removeWhiteBackground(p), 50); };
            e.onload = () => { setTimeout(() => gameRef.current.assets.enemy = removeWhiteBackground(e), 50); };
        };
        loadAssets();

        // --- CLASSES --- //
        class Player {
            constructor(x, y) {
                this.x = x; this.y = y; this.width = 40; this.height = 50;
                this.velocityX = 0; this.velocityY = 0;
                this.onGround = false; this.facing = 1;
                this.health = 100; this.maxHealth = 100;
                this.ammo = 30; this.maxAmmo = 30; this.grenades = 5;
                this.shootCooldown = 0; this.grenadeCooldown = 0; this.knifeCooldown = 0;
                this.isCrouching = false; this.invincible = false; this.invincibleTimer = 0;
                this.frameX = 0; this.frameY = 0; this.gameFrame = 0; this.state = 'IDLE';
            }
            update(canvasWidth, canvasHeight, keys, gameObj) {
                this.gameFrame++;
                let moving = false;

                if (keys['ArrowLeft']) { this.velocityX = -MOVE_SPEED; this.facing = -1; moving = true; }
                else if (keys['ArrowRight']) { this.velocityX = MOVE_SPEED; this.facing = 1; moving = true; }
                else { this.velocityX *= 0.8; }

                this.isCrouching = keys['ArrowDown'] && this.onGround;
                if ((keys[' '] || keys['w']) && this.onGround && !this.isCrouching) { this.velocityY = JUMP_POWER; this.onGround = false; this.state = 'JUMP'; }

                if (keys['z'] && this.shootCooldown === 0 && this.ammo > 0) {
                    this.shoot(gameObj); this.shootCooldown = 15; this.ammo--; setAmmo(this.ammo); this.state = 'SHOOT';
                }
                if (keys['x'] && this.grenadeCooldown === 0 && this.grenades > 0) {
                    this.throwGrenade(gameObj); this.grenadeCooldown = 60; this.grenades--; setGrenades(this.grenades);
                }
                if (keys['c'] && this.knifeCooldown === 0) { this.knife(gameObj); this.knifeCooldown = 30; }

                if (this.shootCooldown > 0) this.shootCooldown--;
                if (this.grenadeCooldown > 0) this.grenadeCooldown--;
                if (this.knifeCooldown > 0) this.knifeCooldown--;

                this.velocityY += GRAVITY;
                this.x += this.velocityX; this.y += this.velocityY;

                const floorY = canvasHeight - GROUND_OFFSET - this.height;
                if (this.y >= floorY) {
                    this.y = floorY; this.velocityY = 0; this.onGround = true;
                } else this.onGround = false;

                if (this.x < 0) this.x = 0;
                if (this.x > levelRef.current.width - this.width) this.x = levelRef.current.width - this.width;

                gameRef.current.cameraX = this.x - canvasWidth / 3;
                if (gameRef.current.cameraX < 0) gameRef.current.cameraX = 0;
                if (gameRef.current.cameraX > levelRef.current.width - canvasWidth) gameRef.current.cameraX = levelRef.current.width - canvasWidth;

                if (this.invincible) { this.invincibleTimer--; if (this.invincibleTimer <= 0) this.invincible = false; }
                if (this.onGround && this.ammo < this.maxAmmo && Math.random() < 0.005) { this.ammo++; setAmmo(this.ammo); }

                if (this.state === 'SHOOT' && this.shootCooldown < 10) this.state = 'IDLE';
                if (!this.onGround && this.state !== 'SHOOT') this.state = 'JUMP';
                else if (moving && this.onGround && this.state !== 'SHOOT') this.state = 'RUN';
                else if (this.onGround && this.state !== 'SHOOT') this.state = 'IDLE';

                this.animate();
            }
            animate() {
                // Map: 0:Idle, 1:Run, 2:Jump, 3:Shoot
                const animMap = { 'IDLE': 0, 'RUN': 1, 'JUMP': 2, 'SHOOT': 3 };
                this.frameY = animMap[this.state] || 0;
                const maxFrames = 6;
                if (this.gameFrame % 5 === 0) {
                    this.frameX++;
                    if (this.frameX >= maxFrames) this.frameX = 0;
                }
            }
            shoot(g) {
                const offsetY = this.isCrouching ? 25 : 20;
                g.bullets.push(new Bullet(this.x + (this.facing > 0 ? this.width : 0), this.y + offsetY, this.facing));
            }
            throwGrenade(g) { g.grenades.push(new Grenade(this.x + this.width / 2, this.y + 10, this.facing)); }
            knife(g) {
                const range = 40; const kX = this.x + (this.facing > 0 ? this.width : -range);
                enemiesRef.current.forEach(e => {
                    if (!e.dead && e.x < kX + range && e.x + e.width > kX && e.y < this.y + this.height && e.y + e.height > this.y) e.takeDamage(50, g);
                });
            }
            takeDamage(amount) {
                if (this.invincible) return;
                this.health -= amount; setHealth(this.health);
                this.invincible = true; this.invincibleTimer = 60;
                if (this.health <= 0) { this.health = 0; setHealth(0); setGameState('gameover'); gameRef.current.gameRunning = false; }
            }
            intersects(rect) { return this.x < rect.x + rect.width && this.x + this.width > rect.x && this.y < rect.y + rect.height && this.y + this.height > rect.y; }
            draw(ctx, camX, assets) {
                ctx.save(); ctx.translate(-camX, 0);
                if (assets.player && (!this.invincible || Math.floor(this.invincibleTimer / 5) % 2 === 0)) {
                    // Assuming 6x4 Grid for new sprites
                    const spriteW = assets.player.width / 6;
                    const spriteH = assets.player.height / 4;

                    ctx.save();
                    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                    ctx.scale(this.facing, 1);
                    // Draw Image with safe frame check
                    ctx.drawImage(assets.player,
                        (this.frameX % 6) * spriteW, this.frameY * spriteH, spriteW, spriteH,
                        -this.width / 2 - 20, -this.height / 2 - 15, this.width + 40, this.height + 30
                    );
                    ctx.restore();
                } else if (!assets.player) {
                    ctx.fillStyle = '#4a5f3a'; ctx.fillRect(this.x, this.y, this.width, this.height);
                }
                ctx.restore();
            }
        }

        class Bullet {
            constructor(x, y, dir) { this.x = x; this.y = y; this.width = 10; this.height = 4; this.speed = 12 * dir; this.active = true; }
            update(enemies, g, camX, cvsW) {
                this.x += this.speed;
                enemies.forEach(e => {
                    if (this.active && !e.dead && this.intersects(e)) {
                        e.takeDamage(25, g); this.active = false;
                        for (let i = 0; i < 5; i++) g.particles.push(new Particle(this.x, this.y, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, '#ffff00', 15));
                    }
                });
                if (this.x < camX - 50 || this.x > camX + cvsW + 50) this.active = false;
            }
            intersects(r) { return this.x < r.x + r.width && this.x + this.width > r.x && this.y < r.y + r.height && this.y + this.height > r.y; }
            draw(ctx, camX) { if (!this.active) return; ctx.save(); ctx.translate(-camX, 0); ctx.fillStyle = '#ffff00'; ctx.fillRect(this.x, this.y, this.width, this.height); ctx.restore(); }
        }

        class Grenade {
            constructor(x, y, dir) { this.x = x; this.y = y; this.width = 8; this.height = 8; this.vx = 8 * dir; this.vy = -10; this.timer = 90; this.active = true; }
            update(g, cvsH) {
                this.vy += GRAVITY; this.x += this.vx; this.y += this.vy;
                const floorY = cvsH - GROUND_OFFSET - this.height;
                if (this.y >= floorY) { this.y = floorY; this.vy *= -0.5; this.vx *= 0.8; }
                this.timer--;
                if (this.timer <= 0) {
                    g.explosions.push(new Explosion(this.x, this.y));
                    enemiesRef.current.forEach(e => {
                        const dist = Math.hypot(e.x + e.width / 2 - this.x, e.y + e.height / 2 - this.y);
                        if (dist < 80 && !e.dead) e.takeDamage(75, g);
                    });
                    this.active = false;
                }
            }
            draw(ctx, camX) {
                if (!this.active) return;
                ctx.save(); ctx.translate(-camX, 0);
                ctx.fillStyle = (this.timer < 30 && Math.floor(this.timer / 3) % 2 === 0) ? '#ff0000' : '#2c3e50';
                ctx.beginPath(); ctx.arc(this.x, this.y, 4, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
        }

        class Enemy {
            constructor(x, y, type = 'soldier') {
                this.x = x; this.y = y; this.width = 40; this.height = 50; this.type = type;
                this.health = type === 'soldier' ? 50 : 100; this.maxH = this.health;
                this.vx = type === 'soldier' ? -2 : -1; this.vy = 0; this.facing = -1; this.dead = false; this.shootCD = 0;
                this.frameX = 0; this.frameY = 0; this.gameFrame = 0; this.state = 'IDLE';
            }
            update(p, g, cvsH) {
                if (this.dead) return;
                this.gameFrame++;
                const dist = p.x - this.x;
                if (Math.abs(dist) < 400) {
                    this.facing = dist > 0 ? 1 : -1;
                    if (Math.abs(dist) > 50 && this.shootCD === 0) {
                        g.enemyBullets.push(new EnemyBullet(this.x + (this.facing > 0 ? this.width : 0), this.y + 15, this.facing));
                        this.shootCD = 60; this.state = 'SHOOT';
                    } else if (this.shootCD > 0) this.state = 'IDLE';
                    if (Math.abs(dist) > 100) { this.vx = this.facing * 1.5; this.state = 'RUN'; }
                    else { this.vx = 0; if (this.state !== 'SHOOT') this.state = 'IDLE'; }
                } else { this.vx = this.facing; this.state = 'RUN'; }

                this.x += this.vx; this.vy += GRAVITY; this.y += this.vy;
                const floorY = cvsH - GROUND_OFFSET - this.height;
                if (this.y >= floorY) { this.y = floorY; this.vy = 0; }
                if (this.shootCD > 0) this.shootCD--;
                this.animate();
            }
            animate() {
                // Enemy Map: 0:Idle, 1:Run, 2:Shoot, 3:Die
                const animMap = { 'IDLE': 0, 'RUN': 1, 'SHOOT': 2, 'DIE': 3 };
                this.frameY = animMap[this.state] || 0;
                const maxFrames = 6;
                if (this.gameFrame % 6 === 0) {
                    this.frameX++;
                    if (this.frameX >= maxFrames) this.frameX = 0;
                }
            }
            takeDamage(amt, g) {
                if (this.dead) return;
                this.health -= amt;
                if (this.health <= 0) {
                    this.dead = true; setScore(s => s + (this.type === 'soldier' ? 100 : 250));
                    for (let i = 0; i < 10; i++) g.particles.push(new Particle(this.x + 16, this.y + 20, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, '#ff4444', 30));
                }
            }
            draw(ctx, camX, assets) {
                if (this.dead) return;
                ctx.save(); ctx.translate(-camX, 0);
                if (assets.enemy) {
                    const spriteW = assets.enemy.width / 6;
                    const spriteH = assets.enemy.height / 4;
                    ctx.save();
                    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
                    ctx.scale(this.facing, 1);
                    ctx.drawImage(assets.enemy,
                        (this.frameX % 6) * spriteW, this.frameY * spriteH, spriteW, spriteH,
                        -this.width / 2 - 20, -this.height / 2 - 15, this.width + 40, this.height + 30
                    );
                    ctx.restore();
                } else {
                    ctx.fillStyle = this.type === 'soldier' ? '#8b4513' : '#4a0e0e'; ctx.fillRect(this.x, this.y, this.width, this.height);
                }
                ctx.fillStyle = '#333'; ctx.fillRect(this.x, this.y - 8, this.width, 4);
                ctx.fillStyle = '#f00'; ctx.fillRect(this.x, this.y - 8, this.width * (this.health / this.maxH), 4);
                ctx.restore();
            }
        }

        class EnemyBullet {
            constructor(x, y, dir) { this.x = x; this.y = y; this.width = 6; this.height = 3; this.speed = 8 * dir; this.active = true; }
            update(p, camX, cvsW) {
                this.x += this.speed;
                if (this.active && p.intersects(this)) { p.takeDamage(10); this.active = false; }
                if (this.x < camX - 50 || this.x > camX + cvsW + 50) this.active = false;
            }
            draw(ctx, camX) { if (!this.active) return; ctx.save(); ctx.translate(-camX, 0); ctx.fillStyle = '#ff6600'; ctx.fillRect(this.x, this.y, this.width, this.height); ctx.restore(); }
        }

        class Explosion {
            constructor(x, y) { this.x = x; this.y = y; this.r = 5; this.maxR = 40; this.active = true; }
            update() { this.r += 2; if (this.r > this.maxR) this.active = false; }
            draw(ctx, camX) { if (!this.active) return; ctx.save(); ctx.translate(-camX, 0); ctx.fillStyle = 'rgba(255,100,0,0.7)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
        }

        class Particle {
            constructor(x, y, vx, vy, c, life) { this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.c = c; this.life = life; this.active = true; }
            update() { this.x += this.vx; this.y += this.vy; this.life--; if (this.life <= 0) this.active = false; }
            draw(ctx, camX) { if (!this.active) return; ctx.save(); ctx.translate(-camX, 0); ctx.globalAlpha = this.life / 20; ctx.fillStyle = this.c; ctx.fillRect(this.x, this.y, 4, 4); ctx.restore(); }
        }

        // --- INIT --- //
        playerRef.current = new Player(100, 300);
        enemiesRef.current = [];
        for (let i = 0; i < 8; i++) enemiesRef.current.push(new Enemy(600 + i * 400, 300, i % 3 === 0 ? 'heavy' : 'soldier'));

        // --- LOOP --- //
        const loop = () => {
            if (!gameRef.current.gameRunning) return;
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const g = gameRef.current;
            const p = playerRef.current;
            const es = enemiesRef.current;

            p.update(canvas.width, canvas.height, g.keys, g);
            g.bullets.forEach(b => b.update(es, g, g.cameraX, canvas.width));
            g.grenades.forEach(gr => gr.update(g, canvas.height));
            es.forEach(e => e.update(p, g, canvas.height));
            g.enemyBullets.forEach(eb => eb.update(p, g.cameraX, canvas.width));
            g.explosions.forEach(e => e.update());
            g.particles.forEach(pt => pt.update());

            g.bullets = g.bullets.filter(b => b.active);
            g.enemyBullets = g.enemyBullets.filter(b => b.active);
            g.grenades = g.grenades.filter(gr => gr.active);
            g.explosions = g.explosions.filter(e => e.active);
            g.particles = g.particles.filter(pt => pt.active);

            if (p.x > 2800 && gameState !== 'victory') { setGameState('victory'); gameRef.current.gameRunning = false; }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Background (Fixed to COVER vertically)
            if (g.assets.bg) {
                const bgW = g.assets.bg.width;
                const bgH = g.assets.bg.height;

                // Force scale to match canvas height
                const scale = (canvas.height + 20) / bgH; // Add tiny overflow to avoid pixel gaps
                const destW = bgW * scale;

                const bgX = -(g.cameraX * 0.5) % destW;

                ctx.save();
                // Draw repeating background covering screen height
                ctx.drawImage(g.assets.bg, bgX, -10, destW, canvas.height + 20);
                ctx.drawImage(g.assets.bg, bgX + destW, -10, destW, canvas.height + 20);
                ctx.drawImage(g.assets.bg, bgX + destW * 2, -10, destW, canvas.height + 20);
                ctx.restore();
            } else {
                ctx.fillStyle = '#87ceeb'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            p.draw(ctx, g.cameraX, g.assets);
            es.forEach(e => e.draw(ctx, g.cameraX, g.assets));
            g.bullets.forEach(b => b.draw(ctx, g.cameraX));
            g.enemyBullets.forEach(eb => eb.draw(ctx, g.cameraX));
            g.grenades.forEach(gr => gr.draw(ctx, g.cameraX));
            g.explosions.forEach(e => e.draw(ctx, g.cameraX));
            g.particles.forEach(pt => pt.draw(ctx, g.cameraX));

            requestAnimationFrame(loop);
        };

        const handleDown = (e) => gameRef.current.keys[e.key] = true;
        const handleUp = (e) => gameRef.current.keys[e.key] = false;
        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);
        requestAnimationFrame(loop);

        return () => {
            gameRef.current.gameRunning = false;
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const restart = () => window.location.reload();

    return (
        <div className={styles.gameContainer}>
            <div className={styles.hud}>
                <div className={styles.hudItem}>SCORE: {score}</div>
                <div className={styles.hudItem}><div className={styles.healthBar}><div className={styles.healthFill} style={{ width: `${health}%` }}></div></div></div>
                <div className={styles.hudItem}>AMMO: <div className={styles.ammoBar}><div className={styles.ammoFill} style={{ width: `${(ammo / 30) * 100}%` }}></div></div></div>
                <div className={styles.hudItem}>GRENADES: {grenades}</div>
                <button className={styles.button} onClick={onExit} style={{ padding: '5px 10px', fontSize: '0.8em' }}>EXIT</button>
            </div>
            <canvas ref={canvasRef} className={styles.canvas} width={900} height={500} />
            <div className={styles.controls}>
                <div className={styles.controlsGrid}>
                    <div className={styles.controlItem}>ARROWS: MOVE</div>
                    <div className={styles.controlItem}>SPACE/W: JUMP</div>
                    <div className={styles.controlItem}>Z: SHOOT | X: GRENADE | C: KNIFE</div>
                </div>
            </div>
            {gameState === 'gameover' && <div className={styles.overlay}><h2 className={styles.gameOverTitle}>MISSION FAILED</h2><div className={styles.overlayText}>Score: {score}</div><button className={styles.button} onClick={restart}>TRY AGAIN</button></div>}
            {gameState === 'victory' && <div className={styles.overlay}><h2 className={styles.victoryTitle}>MISSION COMPLETE!</h2><div className={styles.overlayText}>Score: {score}</div><button className={styles.button} onClick={restart}>PLAY AGAIN</button></div>}
        </div>
    );
};
export default MetalSlugGame;
