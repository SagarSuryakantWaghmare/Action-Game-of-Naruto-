// Initialize variables
let score = 0;
const scoreCount = document.querySelector('#scoreCount');
let cross = true;
let audio, audioover;
let gameOverFlag = false;
let updateScoreFlag = true; // Flag to control updating score

// Function to update score display
function updateScore(score) {
    const scoreCount = document.getElementById('scoreCount');
    scoreCount.innerHTML = "Naruto Score: " + score;
}

// Function to play game audio
function playGameAudio() {
    audio.play();
}

// Function to handle keydown events
function handleKeyDown(e) {
    console.log('key code is:', e.keyCode);
    const naruto = document.querySelector('.naruto');
    let narutoX;

    switch (e.keyCode) {
        case 38: // Up arrow key for jump
            naruto.classList.add('JumpNaruto');
            setTimeout(() => {
                naruto.classList.remove('JumpNaruto');
            }, 700);
            break;
        case 39: // Right arrow key for moving right
            narutoX = parseInt(window.getComputedStyle(naruto, null).getPropertyValue('left'));
            naruto.style.left = narutoX + 120 + "px";
            break;
        case 37: // Left arrow key for moving left
            narutoX = parseInt(window.getComputedStyle(naruto, null).getPropertyValue('left'));
            naruto.style.left = narutoX - 120 + "px";
            break;
    }
}

// Event listener for DOMContentLoaded to start playing audio
document.addEventListener('DOMContentLoaded', () => {
    const audio = new Audio('Assets/Naruto -Main Theme.m4a');
    const audioover = new Audio('Assets/gameOver.mp3');
    playGameAudio();
});

// Event listener for keydown events to handle player controls
document.addEventListener('keydown', handleKeyDown);

// Main game loop
setInterval(() => {
    const naruto = document.querySelector('.naruto');
    const gameOver = document.querySelector('.gameOver');
    const shika = document.querySelector('.shika');

    const nx = parseInt(window.getComputedStyle(naruto, null).getPropertyValue('left'));
    const ny = parseInt(window.getComputedStyle(naruto, null).getPropertyValue('top'));
    const sx = parseInt(window.getComputedStyle(shika, null).getPropertyValue('left'));
    const sy = parseInt(window.getComputedStyle(shika, null).getPropertyValue('top'));

    const offsetX = Math.abs(nx - sx);
    const offsetY = Math.abs(ny - sy);

    // Check if Naruto hits Shika
    if (offsetX < 90 && offsetY < 50 && offsetX > 20 && !gameOverFlag) {
        gameOver.style.visibility = 'visible';
        shika.classList.remove('shikaMove');
        audio.pause();
        audioover.play();
        gameOverFlag = true;
        updateScoreFlag = false; // Disable updating score
    } else if (offsetX < 145 && cross && updateScoreFlag) { // Check if Naruto crosses Shika
        score += 1;
        updateScore(score);
        cross = false;
        setTimeout(() => {
            cross = true;
        }, 1000);
        setTimeout(() => {
            const animationDur = parseFloat(window.getComputedStyle(shika, null).getPropertyValue('animation-duration'));
            const newDur = animationDur - 0.2;
            shika.style.animationDuration = newDur + 's';
        }, 500);
    }

    // Game over condition when Naruto crosses Shika
    const narutoWidth = parseInt(window.getComputedStyle(naruto, null).getPropertyValue('width'));
    const shikaWidth = parseInt(window.getComputedStyle(shika, null).getPropertyValue('width'));
    if (nx + narutoWidth > sx && nx < sx + shikaWidth && cross) {
        gameOver.style.visibility = 'visible';
        shika.classList.remove('shikaMove');
        audio.pause();
        audioover.play();
        gameOverFlag = true;
    }
}, 10);
