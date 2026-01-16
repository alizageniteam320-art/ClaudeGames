"use client";

import React, { useEffect, useRef, useState } from 'react';
import styles from './SnakeGame.module.css';

export default function SnakeGame() {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    // Asset state
    const [assets, setAssets] = useState({
        head: null,
        body: null,
        food: null
    });

    // Game state refs
    const gameState = useRef({
        snake: [{ x: 10, y: 10 }],
        velocity: { x: 0, y: 0 },
        food: { x: 15, y: 15 },
        gameSpeed: 100,
        isPaused: false,
        loopId: null
    });

    // Ref to access latest assets in game loop
    const assetsRef = useRef(assets);

    useEffect(() => {
        assetsRef.current = assets;
    }, [assets]);

    const gridSize = 20;
    const tileCount = 20; // 400 / 20
    const scoreRef = useRef(0);

    useEffect(() => {
        const saved = localStorage.getItem('snakeHighScore');
        if (saved) setHighScore(parseInt(saved));

        startGame();

        return () => stopGame();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const state = gameState.current;

    const startGame = () => {
        if (state.loopId) clearInterval(state.loopId);
        state.snake = [{ x: 10, y: 10 }];
        state.velocity = { x: 0, y: 0 };
        state.food = { x: 15, y: 15 };
        state.gameSpeed = 100;
        state.isPaused = false;
        scoreRef.current = 0;
        setScore(0);
        setIsGameOver(false);
        placeFood();

        state.loopId = setInterval(gameLoop, state.gameSpeed);
    };

    const stopGame = () => {
        if (state.loopId) clearInterval(state.loopId);
    };

    const placeFood = () => {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        } while (state.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        state.food = newFood;
    };

    const gameLoop = () => {
        if (state.isPaused) return;

        if (state.velocity.x !== 0 || state.velocity.y !== 0) {
            const head = { x: state.snake[0].x + state.velocity.x, y: state.snake[0].y + state.velocity.y };

            // Wall Collision
            if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
                handleGameOver();
                return;
            }

            // Self Collision
            for (let i = 1; i < state.snake.length; i++) {
                if (head.x === state.snake[i].x && head.y === state.snake[i].y) {
                    handleGameOver();
                    return;
                }
            }

            state.snake.unshift(head);

            // Food Collision
            if (head.x === state.food.x && head.y === state.food.y) {
                scoreRef.current += 1;
                setScore(scoreRef.current);
                placeFood();

                // Speed up
                if (scoreRef.current % 5 === 0 && state.gameSpeed > 50) {
                    state.gameSpeed -= 5;
                    clearInterval(state.loopId);
                    state.loopId = setInterval(gameLoop, state.gameSpeed);
                }
            } else {
                state.snake.pop();
            }
        }

        draw();
    };

    const handleGameOver = () => {
        stopGame();
        setIsGameOver(true);
        if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
            localStorage.setItem('snakeHighScore', scoreRef.current);
        }
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const currentAssets = assetsRef.current;

        // Clear
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        ctx.strokeStyle = '#16213e';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gridSize, 0);
            ctx.lineTo(i * gridSize, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * gridSize);
            ctx.lineTo(canvas.width, i * gridSize);
            ctx.stroke();
        }

        // Snake
        state.snake.forEach((segment, index) => {
            const x = segment.x * gridSize;
            const y = segment.y * gridSize;

            if (index === 0) {
                // Head
                if (currentAssets.head) {
                    ctx.drawImage(currentAssets.head, x, y, gridSize, gridSize);
                } else {
                    ctx.fillStyle = '#4ecca3';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#4ecca3';
                    ctx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
                    ctx.shadowBlur = 0;
                }
            } else {
                // Body
                if (currentAssets.body) {
                    ctx.drawImage(currentAssets.body, x, y, gridSize, gridSize);
                } else {
                    ctx.fillStyle = '#45a589';
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = '#45a589';
                    ctx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
                    ctx.shadowBlur = 0;
                }
            }
        });

        // Food
        const fx = state.food.x * gridSize;
        const fy = state.food.y * gridSize;

        if (currentAssets.food) {
            ctx.drawImage(currentAssets.food, fx, fy, gridSize, gridSize);
        } else {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff6b6b';
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(
                fx + gridSize / 2,
                fy + gridSize / 2,
                gridSize / 2 - 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    };

    const handleKeyDown = (e) => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
        }

        if (e.key === ' ') {
            state.isPaused = !state.isPaused;
            return;
        }

        // Prevent reversing
        if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && state.velocity.y === 0) {
            state.velocity = { x: 0, y: -1 };
        } else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && state.velocity.y === 0) {
            state.velocity = { x: 0, y: 1 };
        } else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && state.velocity.x === 0) {
            state.velocity = { x: -1, y: 0 };
        } else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && state.velocity.x === 0) {
            state.velocity = { x: 1, y: 0 };
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRestart = () => {
        startGame();
    };

    const handleFileUpload = (type, event) => {
        const file = event.target.files[0];
        if (file) {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                setAssets(prev => ({ ...prev, [type]: img }));
            };
        }
    };

    return (
        <div className={styles.gameContainer}>
            <h1 className={styles.title}>🐍 Snake Game</h1>
            <div className={styles.scoreBoard}>
                <div className={styles.scoreItem}>Score: <span>{score}</span></div>
                <div className={styles.scoreItem}>High Score: <span>{highScore}</span></div>
            </div>

            <div style={{ position: 'relative' }}>
                <canvas
                    ref={canvasRef}
                    className={styles.canvas}
                    width={400}
                    height={400}
                />

                {isGameOver && (
                    <div className={styles.gameOver}>
                        <h2 className={styles.gameOverTitle}>Game Over!</h2>
                        <p className={styles.gameOverText}>Your Score: <span>{score}</span></p>
                        <button className={styles.button} onClick={handleRestart}>Play Again</button>
                    </div>
                )}
            </div>

            <div className={styles.controls}>
                Use Arrow Keys or WASD to move | Press Space to Pause
            </div>

            <div className={styles.uploadSection}>
                <h3>Customize Game Assets</h3>
                <p>Upload square images (PNG, JPG, GIF) for best results.</p>
                <div className={styles.uploadGrid}>
                    <div className={styles.uploadItem}>
                        <label>Snake Head</label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload('head', e)} />
                    </div>
                    <div className={styles.uploadItem}>
                        <label>Snake Body</label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload('body', e)} />
                    </div>
                    <div className={styles.uploadItem}>
                        <label>Food</label>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload('food', e)} />
                    </div>
                </div>
            </div>
        </div>
    );
}
