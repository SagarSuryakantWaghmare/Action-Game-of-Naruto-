// Modern Naruto Action Game - Enhanced Version
class NarutoGame {
    constructor() {
        // Game state
        this.gameState = 'loading'; // loading, menu, playing, paused, gameOver
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('narutoHighScore')) || 0;
        this.level = 1;
        this.lives = 3;
        this.chakra = 100;
        this.speed = 1;
        this.gameRunning = false;
        this.powerups = [];
        this.particles = [];
        this.obstacles = [];
        this.collectibles = [];
        
        // Settings
        this.settings = {
            sfxVolume: 70,
            musicVolume: 50,
            difficulty: 'normal'
        };
        
        // Audio
        this.audio = {
            bgMusic: null,
            gameOver: null,
            jump: null,
            collect: null,
            powerup: null
        };
        
        // DOM elements
        this.elements = {};
        
        // Game flags
        this.canJump = true;
        this.invincible = false;
        this.shadowCloneActive = false;
        
        // Auto score system
        this.autoScoreTimer = null;
        this.lastScoreTime = 0;
        
        this.init();
    }
    
    init() {
        this.initializeElements();
        this.loadAudio();
        this.setupEventListeners();
        this.loadSettings();
        this.showLoadingScreen();
    }
    
    initializeElements() {
        // Get all DOM elements
        this.elements = {
            loadingScreen: document.getElementById('loadingScreen'),
            mainMenu: document.getElementById('mainMenu'),
            gameContainer: document.getElementById('gameContainer'),
            naruto: document.getElementById('naruto'),
            shika: document.getElementById('shika'),
            scoreCount: document.getElementById('scoreCount'),
            highScore: document.getElementById('highScore'),
            level: document.getElementById('level'),
            lives: document.getElementById('lives'),
            chakra: document.querySelector('.chakra-fill'),
            gameOverScreen: document.getElementById('gameOverScreen'),
            pauseScreen: document.getElementById('pauseScreen'),
            finalScore: document.getElementById('finalScore'),
            newRecord: document.getElementById('newRecord'),
            powerupDisplay: document.getElementById('powerupDisplay'),
            obstacles: document.getElementById('obstacles'),
            collectibles: document.getElementById('collectibles'),
            particles: document.getElementById('particles')
        };
    }
    
    loadAudio() {
        try {
            this.audio.bgMusic = new Audio('Assets/Naruto -Main Theme.m4a');
            this.audio.gameOver = new Audio('Assets/gameOver.mp3');
            this.audio.bgMusic.loop = true;
            this.audio.bgMusic.volume = this.settings.musicVolume / 100;
            this.audio.gameOver.volume = this.settings.sfxVolume / 100;
        } catch (error) {
            console.log('Audio files not found, continuing without sound');
        }
    }
    
    setupEventListeners() {
        // Menu buttons
        document.getElementById('startBtn')?.addEventListener('click', () => this.startGame());
        document.getElementById('instructionsBtn')?.addEventListener('click', () => this.showModal('instructionsModal'));
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.showModal('settingsModal'));
        document.getElementById('leaderboardBtn')?.addEventListener('click', () => this.showLeaderboard());
        
        // Game buttons
        document.getElementById('pauseBtn')?.addEventListener('click', () => this.pauseGame());
        document.getElementById('resumeBtn')?.addEventListener('click', () => this.resumeGame());
        document.getElementById('playAgainBtn')?.addEventListener('click', () => this.startGame());
        document.getElementById('mainMenuBtn')?.addEventListener('click', () => this.showMainMenu());
        document.getElementById('pauseMenuBtn')?.addEventListener('click', () => this.showMainMenu());
        
        // Modal close buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });
        
        // Settings controls
        document.getElementById('sfxVolume')?.addEventListener('input', this.updateSettings.bind(this));
        document.getElementById('musicVolume')?.addEventListener('input', this.updateSettings.bind(this));
        document.getElementById('difficulty')?.addEventListener('change', this.updateSettings.bind(this));
        
        // Clear scores
        document.getElementById('clearScores')?.addEventListener('click', () => {
            localStorage.removeItem('narutoHighScore');
            this.highScore = 0;
            this.updateLeaderboard();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // Window events
        window.addEventListener('blur', () => {
            if (this.gameState === 'playing') this.pauseGame();
        });
    }
    
    showLoadingScreen() {
        setTimeout(() => {
            this.elements.loadingScreen.style.display = 'none';
            this.showMainMenu();
        }, 3000);
    }
    
    showMainMenu() {
        this.gameState = 'menu';
        this.elements.mainMenu.style.display = 'flex';
        this.elements.gameContainer.style.display = 'none';
        this.elements.pauseScreen.style.display = 'none';
        this.elements.gameOverScreen.style.display = 'none';
        this.stopBackgroundMusic();
    }
    
    showModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }
    
    startGame() {
        this.gameState = 'playing';
        this.gameRunning = true;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.chakra = 100;
        this.speed = 1;
        this.powerups = [];
        this.obstacles = [];
        this.collectibles = [];
        this.invincible = false;
        this.shadowCloneActive = false;
        this.lastScoreTime = Date.now();
        
        // Clear any existing auto score timer
        if (this.autoScoreTimer) {
            clearInterval(this.autoScoreTimer);
        }
        
        // Hide menus and show game
        this.elements.mainMenu.style.display = 'none';
        this.elements.gameContainer.style.display = 'block';
        this.elements.gameOverScreen.style.display = 'none';
        this.elements.pauseScreen.style.display = 'none';
        
        // Reset character positions
        this.resetCharacters();
        this.updateHUD();
        this.playBackgroundMusic();
        this.startAutoScore();
        this.startGameLoop();
    }
    
    resetCharacters() {
        this.elements.naruto.style.left = '100px';
        this.elements.naruto.style.bottom = '50px';
        this.elements.naruto.className = 'naruto';
        
        this.elements.shika.style.left = '100vw';
        this.elements.shika.className = 'shika shikaMove';
    }
    
    pauseGame() {
        if (this.gameState !== 'playing') return;
        this.gameState = 'paused';
        this.gameRunning = false;
        this.elements.pauseScreen.style.display = 'flex';
        this.pauseBackgroundMusic();
        
        // Pause auto score timer
        if (this.autoScoreTimer) {
            clearInterval(this.autoScoreTimer);
        }
    }
    
    resumeGame() {
        if (this.gameState !== 'paused') return;
        this.gameState = 'playing';
        this.gameRunning = true;
        this.elements.pauseScreen.style.display = 'none';
        this.playBackgroundMusic();
        
        // Resume auto score timer
        this.startAutoScore();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.gameRunning = false;
        
        // Clear auto score timer
        if (this.autoScoreTimer) {
            clearInterval(this.autoScoreTimer);
            this.autoScoreTimer = null;
        }
        
        // Stop animations
        this.elements.shika.classList.remove('shikaMove');
        
        // Check for high score
        let isNewRecord = false;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('narutoHighScore', this.highScore.toString());
            isNewRecord = true;
        }
        
        // Show game over screen
        this.elements.finalScore.textContent = `Final Score: ${this.score}`;
        this.elements.newRecord.style.display = isNewRecord ? 'block' : 'none';
        this.elements.gameOverScreen.style.display = 'flex';
        
        // Play game over sound
        this.stopBackgroundMusic();
        this.playSound('gameOver');
        
        // Add screen shake effect
        this.screenShake();
    }
    
    handleKeyDown(e) {
        if (this.gameState !== 'playing') {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                if (this.gameState === 'menu') this.startGame();
                else if (this.gameState === 'paused') this.resumeGame();
                else if (this.gameState === 'gameOver') this.startGame();
            }
            return;
        }
        
        e.preventDefault();
        const naruto = this.elements.naruto;
        
        switch (e.code) {
            case 'Space':
            case 'ArrowUp':
                this.jump();
                break;
            case 'ArrowDown':
                this.slide();
                break;
            case 'ArrowLeft':
                this.moveLeft();
                break;
            case 'ArrowRight':
                this.moveRight();
                break;
            case 'KeyS':
                this.useShadowClone();
                break;
            case 'Escape':
                this.pauseGame();
                break;
        }
    }
    
    handleKeyUp(e) {
        // Handle key release events if needed
    }
    
    jump() {
        if (!this.canJump || this.elements.naruto.classList.contains('JumpNaruto')) return;
        
        this.canJump = false;
        this.elements.naruto.classList.add('JumpNaruto');
        this.createParticles(this.elements.naruto, '#ff9d00');
        
        setTimeout(() => {
            this.elements.naruto.classList.remove('JumpNaruto');
            this.canJump = true;
        }, 800);
    }
    
    slide() {
        if (this.elements.naruto.classList.contains('SlideNaruto')) return;
        
        this.elements.naruto.classList.add('SlideNaruto');
        setTimeout(() => {
            this.elements.naruto.classList.remove('SlideNaruto');
        }, 600);
    }
    
    moveLeft() {
        const currentLeft = parseInt(getComputedStyle(this.elements.naruto).left) || 100;
        const newLeft = Math.max(20, currentLeft - 80);
        this.elements.naruto.style.left = newLeft + 'px';
    }
    
    moveRight() {
        const currentLeft = parseInt(getComputedStyle(this.elements.naruto).left) || 100;
        const newLeft = Math.min(window.innerWidth - 200, currentLeft + 80);
        this.elements.naruto.style.left = newLeft + 'px';
    }
    
    useShadowClone() {
        if (this.chakra < 30 || this.shadowCloneActive) return;
        
        this.chakra -= 30;
        this.shadowCloneActive = true;
        this.invincible = true;
        
        this.showPowerup('Shadow Clone Active!', 3000);
        this.createParticles(this.elements.naruto, '#3498db');
        
        setTimeout(() => {
            this.shadowCloneActive = false;
            this.invincible = false;
        }, 3000);
        
        this.updateHUD();
    }
    
    startGameLoop() {
        const gameLoop = () => {
            if (!this.gameRunning) return;
            
            this.updateGame();
            this.checkCollisions();
            this.updatePowerups();
            this.updateParticles();
            this.spawnCollectibles();
            this.increaseDifficulty();
            
            requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    }
    
    startAutoScore() {
        // Add 1 point every 2 seconds
        this.autoScoreTimer = setInterval(() => {
            if (this.gameRunning) {
                this.score += 1;
                this.updateHUD();
            }
        }, 2000);
    }
    
    updateGame() {
        // Update chakra regeneration
        if (this.chakra < 100) {
            this.chakra += 0.2;
            this.chakra = Math.min(100, this.chakra);
        }
        
        // Update HUD
        this.updateHUD();
    }
    
    checkCollisions() {
        const naruto = this.elements.naruto;
        const shika = this.elements.shika;
        
        const narutoRect = naruto.getBoundingClientRect();
        const shikaRect = shika.getBoundingClientRect();
        
        // Check collision with Shikamaru
        if (this.isColliding(narutoRect, shikaRect) && !this.invincible) {
            // Check if Naruto is jumping on Shikamaru (landing on top)
            const isJumpingOn = naruto.classList.contains('JumpNaruto') && 
                               narutoRect.bottom <= shikaRect.top + 30 && // Naruto is above Shikamaru
                               narutoRect.right > shikaRect.left + 20 && 
                               narutoRect.left < shikaRect.right - 20;
            
            if (isJumpingOn) {
                // Successfully jumped on Shikamaru
                this.score += 1;
                this.updateHUD();
                this.createParticles(shika, '#00ff00'); // Green particles for successful jump
                this.showPowerup('+1 Jump Bonus!', 1000);
                this.playSound('collect');
                this.respawnEnemy();
                return;
            } else {
                // Regular collision - take damage
                this.takeDamage();
                return;
            }
        }
        
        // Check if Naruto successfully avoided Shikamaru
        const shikaLeft = parseInt(getComputedStyle(shika).left);
        if (shikaLeft < -200 && shika.classList.contains('shikaMove')) {
            this.score += 10;
            this.updateHUD(); // Force HUD update when score changes
            this.respawnEnemy();
        }
    }
    
    isColliding(rect1, rect2) {
        const margin = 20; // Collision margin for better gameplay
        return !(rect1.right - margin < rect2.left + margin ||
                rect1.left + margin > rect2.right - margin ||
                rect1.bottom - margin < rect2.top + margin ||
                rect1.top + margin > rect2.bottom - margin);
    }
    
    takeDamage() {
        if (this.invincible) return;
        
        this.lives--;
        this.invincible = true;
        
        // Visual feedback
        this.elements.naruto.style.filter = 'brightness(0.5) sepia(1) hue-rotate(-50deg)';
        this.screenShake();
        
        setTimeout(() => {
            this.elements.naruto.style.filter = '';
            this.invincible = false;
        }, 1000);
        
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.respawnEnemy();
        }
        
        this.updateHUD();
    }
    
    respawnEnemy() {
        this.elements.shika.classList.remove('shikaMove');
        this.elements.shika.style.left = '100vw';
        
        setTimeout(() => {
            this.elements.shika.classList.add('shikaMove');
            // Increase speed based on level
            const duration = Math.max(1.5, 4 - (this.level * 0.3));
            this.elements.shika.style.animationDuration = duration + 's';
        }, 100);
    }
    
    spawnCollectibles() {
        if (Math.random() < 0.01) { // 1% chance per frame
            this.createChakraOrb();
        }
    }
    
    createChakraOrb() {
        const orb = document.createElement('div');
        orb.className = 'chakra-orb';
        orb.style.left = '100vw';
        orb.style.bottom = Math.random() * 200 + 100 + 'px';
        
        this.elements.collectibles.appendChild(orb);
        
        const moveOrb = () => {
            const currentLeft = parseInt(orb.style.left);
            if (currentLeft < -50) {
                orb.remove();
                return;
            }
            
            orb.style.left = (currentLeft - 3) + 'px';
            
            // Check collision with Naruto
            const orbRect = orb.getBoundingClientRect();
            const narutoRect = this.elements.naruto.getBoundingClientRect();
            
            if (this.isColliding(orbRect, narutoRect)) {
                this.chakra = Math.min(100, this.chakra + 20);
                this.score += 5;
                this.updateHUD(); // Force HUD update when score changes
                this.createParticles(orb, '#3498db');
                this.playSound('collect');
                orb.remove();
                return;
            }
            
            requestAnimationFrame(moveOrb);
        };
        
        moveOrb();
    }
    
    increaseDifficulty() {
        // Calculate level based on score: level 1 at 10 points, level 2 at 20 points, etc.
        const newLevel = Math.floor(this.score / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.showPowerup(`Level ${this.level}!`, 2000);
            
            // Spawn bonus chakra orbs on level up
            for (let i = 0; i < 3; i++) {
                setTimeout(() => this.createChakraOrb(), i * 500);
            }
        }
    }
    
    createParticles(element, color) {
        const rect = element.getBoundingClientRect();
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = rect.left + rect.width / 2 + 'px';
            particle.style.top = rect.top + rect.height / 2 + 'px';
            particle.style.backgroundColor = color;
            
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            this.elements.particles.appendChild(particle);
            
            let life = 1;
            const animate = () => {
                life -= 0.02;
                if (life <= 0) {
                    particle.remove();
                    return;
                }
                
                const currentLeft = parseInt(particle.style.left);
                const currentTop = parseInt(particle.style.top);
                
                particle.style.left = (currentLeft + vx * 0.02) + 'px';
                particle.style.top = (currentTop + vy * 0.02) + 'px';
                particle.style.opacity = life;
                
                requestAnimationFrame(animate);
            };
            
            animate();
        }
    }
    
    showPowerup(text, duration) {
        const powerup = document.createElement('div');
        powerup.className = 'powerup-item';
        powerup.textContent = text;
        
        this.elements.powerupDisplay.appendChild(powerup);
        
        setTimeout(() => {
            powerup.remove();
        }, duration);
    }
    
    updatePowerups() {
        // Update any active powerups
    }
    
    updateParticles() {
        // Particles are handled individually
    }
    
    screenShake() {
        const container = this.elements.gameContainer;
        container.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            container.style.animation = '';
        }, 500);
    }
    
    updateHUD() {
        this.elements.scoreCount.textContent = `Score: ${this.score}`;
        this.elements.highScore.textContent = `Best: ${this.highScore}`;
        this.elements.level.textContent = `Level: ${this.level}`;
        this.elements.lives.textContent = `❤️ ${this.lives}`;
        
        // Update chakra bar
        this.elements.chakra.style.width = this.chakra + '%';
        
        // Change chakra bar color based on level
        if (this.chakra < 30) {
            this.elements.chakra.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
        } else {
            this.elements.chakra.style.background = 'linear-gradient(90deg, #3498db, #2980b9)';
        }
    }
    
    showLeaderboard() {
        const modal = document.getElementById('leaderboardModal');
        const list = document.getElementById('leaderboardList');
        
        list.innerHTML = `
            <div class="leaderboard-item">
                <span>Your Best Score:</span>
                <span>${this.highScore}</span>
            </div>
        `;
        
        modal.style.display = 'block';
    }
    
    updateLeaderboard() {
        // Update the leaderboard display
        this.showLeaderboard();
    }
    
    updateSettings() {
        const sfx = document.getElementById('sfxVolume');
        const music = document.getElementById('musicVolume');
        const difficulty = document.getElementById('difficulty');
        
        if (sfx) {
            this.settings.sfxVolume = parseInt(sfx.value);
            document.getElementById('sfxValue').textContent = sfx.value + '%';
        }
        
        if (music) {
            this.settings.musicVolume = parseInt(music.value);
            document.getElementById('musicValue').textContent = music.value + '%';
            if (this.audio.bgMusic) {
                this.audio.bgMusic.volume = this.settings.musicVolume / 100;
            }
        }
        
        if (difficulty) {
            this.settings.difficulty = difficulty.value;
        }
        
        this.saveSettings();
    }
    
    saveSettings() {
        localStorage.setItem('narutoGameSettings', JSON.stringify(this.settings));
    }
    
    loadSettings() {
        const saved = localStorage.getItem('narutoGameSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
        
        // Apply settings to UI
        const sfx = document.getElementById('sfxVolume');
        const music = document.getElementById('musicVolume');
        const difficulty = document.getElementById('difficulty');
        
        if (sfx) sfx.value = this.settings.sfxVolume;
        if (music) music.value = this.settings.musicVolume;
        if (difficulty) difficulty.value = this.settings.difficulty;
        
        this.updateSettings();
    }
    
    playBackgroundMusic() {
        if (this.audio.bgMusic && this.settings.musicVolume > 0) {
            this.audio.bgMusic.currentTime = 0;
            this.audio.bgMusic.play().catch(() => {
                console.log('Could not play background music');
            });
        }
    }
    
    stopBackgroundMusic() {
        if (this.audio.bgMusic) {
            this.audio.bgMusic.pause();
        }
    }
    
    pauseBackgroundMusic() {
        if (this.audio.bgMusic) {
            this.audio.bgMusic.pause();
        }
    }
    
    playSound(type) {
        if (this.audio[type] && this.settings.sfxVolume > 0) {
            this.audio[type].currentTime = 0;
            this.audio[type].play().catch(() => {
                console.log(`Could not play ${type} sound`);
            });
        }
    }
}

// Add shake animation to CSS dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
        20%, 40%, 60%, 80% { transform: translateX(2px); }
    }
`;
document.head.appendChild(shakeStyle);

// Initialize the game when the page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new NarutoGame();
});

// Export for debugging (optional)
window.NarutoGame = NarutoGame;
