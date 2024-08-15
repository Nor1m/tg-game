const playerImage = new Image();
const playerImageJump = new Image();
const playerImageFly = new Image();

const playerImageRun1 = new Image();
const playerImageRun2 = new Image();
const playerImageRun3 = new Image();
const playerImageRun4 = new Image();

const jumpBoostImage = new Image();
const flyingBoostImage = new Image();

const obstacleImage1 = new Image();
const obstacleImage2 = new Image();
const obstacleImage3 = new Image();
const obstacleImage4 = new Image();
const obstacleImageHit1 = new Image();

const imageSources = {
    player: 'images/player.png',
    playerJump: 'images/player-jump.png',
    playerFly: 'images/player-fly.png',
    playerRun1: 'images/player-run-1.png',
    playerRun2: 'images/player-run-2.png',
    playerRun3: 'images/player-run-3.png',
    playerRun4: 'images/player-run-4.png',
    jumpBoost: 'images/jump-boost.png',
    flyingBoost: 'images/flying-boost.png',
    obstacle1: 'images/obstacle-1.png',
    obstacle2: 'images/obstacle-2.png',
    obstacle3: 'images/obstacle-3.png',
    obstacle4: 'images/obstacle-4.png',
    obstacleHit1: 'images/obstacle-hit-1.png',
};

jumpBoostImage.src = imageSources.jumpBoost;
flyingBoostImage.src = imageSources.flyingBoost;

playerImageFly.src = imageSources.playerFly;
playerImageJump.src = imageSources.playerJump;
playerImage.src = imageSources.player;

playerImageRun1.src = imageSources.playerRun1;
playerImageRun2.src = imageSources.playerRun2;
playerImageRun3.src = imageSources.playerRun3;
playerImageRun4.src = imageSources.playerRun4;

obstacleImage1.src = imageSources.obstacle1;
obstacleImage2.src = imageSources.obstacle2;
obstacleImage3.src = imageSources.obstacle3;
obstacleImage4.src = imageSources.obstacle4;

obstacleImageHit1.src = imageSources.obstacleHit1;

const obstacleImages = [
    obstacleImage1, obstacleImage2, obstacleImage3, obstacleImage4
];

let loadedImages = {};

loadAllImages().then(images => {
    images.forEach(({key, img}) => {
        loadedImages[key] = img;
    });

    // Обновите ссылки на изображения, чтобы использовать загруженные изображения
    playerImage.src = loadedImages.player.src;
    playerImageJump.src = loadedImages.playerJump.src;
    playerImageFly.src = loadedImages.playerFly.src;
    playerImageRun1.src = loadedImages.playerRun1.src;
    playerImageRun2.src = loadedImages.playerRun2.src;
    playerImageRun3.src = loadedImages.playerRun3.src;
    playerImageRun4.src = loadedImages.playerRun4.src;
    jumpBoostImage.src = loadedImages.jumpBoost.src;
    flyingBoostImage.src = loadedImages.flyingBoost.src;
    obstacleImage1.src = loadedImages.obstacle1.src;
    obstacleImage2.src = loadedImages.obstacle2.src;
    obstacleImage3.src = loadedImages.obstacle3.src;
    obstacleImage4.src = loadedImages.obstacle4.src;
    obstacleImageHit1.src = loadedImages.obstacleHit1.src;

}).catch(error => {
    console.error('Error loading images:', error);
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');
const jumpingBoostsElement = document.getElementById('jumping-boosts');
const flyingBoostsElement = document.getElementById('flying-boosts');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const scale = Math.min(canvas.width / 800, canvas.height / 600);
const groundLevel = canvas.height - 20 * scale;

const sounds = {
    boom: 'sounds/boom.mp3',
    boost: 'sounds/boost.mp3',
    flying: 'sounds/flying.mp3'
};

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image at ${src}`));
        img.src = src;
    });
}

function loadAllImages() {
    const imagePromises = Object.entries(imageSources).map(([key, src]) => {
        return loadImage(src).then(img => ({key, img}));
    });
    return Promise.all(imagePromises);
}

const loadSound = (src) => {
    return new Promise((resolve, reject) => {
        const audio = new Audio(src);
        audio.addEventListener('canplaythrough', () => resolve(audio), {once: true});
        audio.addEventListener('error', reject, {once: true});
    });
};

const loadAllSounds = () => {
    const soundPromises = Object.entries(sounds).map(([key, src]) => {
        return loadSound(src).then(sound => ({key, sound}));
    });
    return Promise.all(soundPromises);
};

let loadedSounds = {};

loadAllSounds().then(soundList => {
    soundList.forEach(({key, sound}) => {
        loadedSounds[key] = sound;
    });
}).catch(error => {
    console.error('Error loading sounds:', error);
});

function playBoomSound() {
    if (loadedSounds.boom) {
        loadedSounds.boom.play();
    }
}

function playBoostSound() {
    if (loadedSounds.boost) {
        loadedSounds.boost.play();
    }
}

function playFlyingSound() {
    if (loadedSounds.flying) {
        loadedSounds.flying.play();
    }
}

let player = {
    x: 50 * scale,
    y: groundLevel - 150 * scale,
    width: 100 * scale,
    height: 100 * scale,
    dy: 0,
    gravity: 0.35 * scale,
    jumpPower: -15 * scale,
    grounded: false,
    color: 'red',
    poweredUp: false,
    powerUpEndTime: 0,
    flying: false,
    hoverEndTime: 0
};

let obstacles = [];
let powerUps = [];
let gameSpeed = 5 * scale;
let powerUpSpeed = 4 * scale;
let baseSpawnInterval = 3000;
const minObstacleSpawnInterval = 1000;
const spawnIntervalVariance = 1000;
let powerUpInterval = Math.random() * (10000 - 5000) + 5000;
let FlyingBoostInterval = Math.random() * (30000 - 5000) + 5000;
const minObstacleDistance = player.width * 20;
const minPowerUpDistance = player.width * 30;
let lastSpawnTime = Date.now();
let lastPowerUpTime = Date.now();
let lastFlyingBoostTime = Date.now();
let score = 0;
let gamePaused = true;

let animationFrame = 0;
let animationInterval = 100; // Интервал переключения кадров (в миллисекундах)
let lastAnimationFrameTime = Date.now();

const flightAmplitude = 10 * scale; // амплитуда, 10 пикселей
const flightFrequency = 0.005; // частота, чем меньше значение, тем медленнее колебание
let flightStartTime = 0; // Время начала полета
let flightBaseHeight = 0; // Базовая высота полета


function drawPlayer() {
    let imageToDraw;

    if (player.flying) {
        imageToDraw = loadedImages.playerFly;
    } else if (player.grounded) {
        if (Date.now() - lastAnimationFrameTime > animationInterval) {
            animationFrame = (animationFrame + 1) % 4;
            lastAnimationFrameTime = Date.now();
        }

        switch (animationFrame) {
            case 0:
                imageToDraw = loadedImages.playerRun1;
                break;
            case 1:
                imageToDraw = loadedImages.playerRun2;
                break;
            case 2:
                imageToDraw = loadedImages.playerRun3;
                break;
            case 3:
                imageToDraw = loadedImages.playerRun4;
                break;
        }
    } else {
        imageToDraw = loadedImages.playerJump;
    }

    ctx.drawImage(imageToDraw, player.x, player.y, player.width, player.height);
}

function updatePlayer() {
    if (player.flying && Date.now() < player.hoverEndTime) {
        player.dy = 0;

        const timeElapsed = Date.now() - flightStartTime;
        player.y = flightBaseHeight + flightAmplitude * Math.sin(flightFrequency * timeElapsed);
    } else {
        player.flying = false;
        player.dy += player.gravity;
        player.y += player.dy;

        if (player.y + player.height >= groundLevel) {
            player.y = groundLevel - player.height;
            player.dy = 0;
            player.grounded = true;
        } else {
            player.grounded = false;
        }

        if (player.poweredUp && Date.now() > player.powerUpEndTime) {
            player.poweredUp = false;
            player.color = 'red';
            player.jumpPower = -15 * scale;
        }
    }
}

function spawnObstacle() {
    const lastObstacle = obstacles[obstacles.length - 1];
    const obstacleX = lastObstacle ? lastObstacle.x + lastObstacle.width + minObstacleDistance : canvas.width + minObstacleDistance;

    const randomImageIndex = Math.floor(Math.random() * obstacleImages.length);
    const chosenImage = obstacleImages[randomImageIndex];

    obstacles.push({
        x: obstacleX,
        y: groundLevel - 100 * scale,
        width: 100 * scale,
        height: 100 * scale,
        speed: gameSpeed,
        image: chosenImage,
        hitState: 'normal',
        hitImage: null
    });
}

function spawnPowerUp(type) {
    const lastPowerUp = powerUps[powerUps.length - 1];
    let powerUpX = canvas.width + Math.random() * canvas.width;
    let powerUpY;

    switch (type) {
        case 'jump_boost':
            powerUpY = groundLevel - player.height * 3 + (Math.random() * player.height - player.height / 2);
            break;
        case 'Flying_boost':
            powerUpY = groundLevel - player.height * 5 + (Math.random() * player.height - player.height / 2);
            break;
    }

    if (lastPowerUp && Math.abs(powerUpX - lastPowerUp.x) < minPowerUpDistance) {
        powerUpX += minPowerUpDistance;
    }

    powerUps.push({
        x: powerUpX,
        y: powerUpY,
        radius: 15 * scale,
        speed: powerUpSpeed,
        type: type
    });

    if (type === 'jump_boost') {
        lastPowerUpTime = Date.now();
    } else if (type === 'Flying_boost') {
        lastFlyingBoostTime = Date.now();
    }
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        const imageToDraw = obstacle.hitState === 'hit' && obstacle.hitImage ? obstacle.hitImage : obstacle.image;
        ctx.drawImage(imageToDraw, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        let imageToDraw;

        if (powerUp.type === 'jump_boost') {
            imageToDraw = loadedImages.jumpBoost;
        } else if (powerUp.type === 'Flying_boost') {
            imageToDraw = loadedImages.flyingBoost;
        }

        if (imageToDraw) {
            ctx.drawImage(imageToDraw, powerUp.x - powerUp.radius, powerUp.y - powerUp.radius, powerUp.radius * 2, powerUp.radius * 2);
        }
    });
}

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= obstacle.speed;
    });

    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}

function updatePowerUps() {
    powerUps.forEach(powerUp => {
        powerUp.x -= powerUp.speed;
    });

    powerUps = powerUps.filter(powerUp => powerUp.x + powerUp.radius > 0);
}

function detectCollision() {
    const collisionThreshold = 0.5; // Коэффициент, определяющий уровень соприкосновения

    obstacles.some(obstacle => {
        const horizontalOverlap = Math.max(0, Math.min(player.x + player.width, obstacle.x + obstacle.width) - Math.max(player.x, obstacle.x));
        const verticalOverlap = Math.max(0, Math.min(player.y + player.height, obstacle.y + obstacle.height) - Math.max(player.y, obstacle.y));

        if (horizontalOverlap > 0 && verticalOverlap > 0) {
            // Определяем процент перекрытия или используем другие критерии
            const obstacleArea = obstacle.width * obstacle.height;
            const overlapArea = horizontalOverlap * verticalOverlap;
            const overlapPercentage = overlapArea / obstacleArea;

            if (overlapPercentage >= collisionThreshold) {
                if (obstacle.hitState === 'normal') {
                    obstacle.hitImage = obstacleImageHit1;
                    obstacle.hitState = 'hit';
                }
                playBoomSound();
                submitScore(score);
                gamePaused = true;
                restartButton.style.display = 'block';
                return true;
            }
        }
        return false;
    });


    powerUps.forEach((powerUp, index) => {
        const distX = player.x + player.width / 2 - powerUp.x;
        const distY = player.y + player.height / 2 - powerUp.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < player.width / 2 + powerUp.radius) {
            if (powerUp.type === 'jump_boost') {
                playBoostSound();
                player.poweredUp = true;
                player.color = 'purple';
                player.jumpPower = -18 * scale;
                player.powerUpEndTime = Math.max(player.powerUpEndTime, Date.now() + 10000);
            } else if (powerUp.type === 'Flying_boost') {
                playBoostSound();
                playFlyingSound();
                player.flying = true;
                player.color = 'orange';
                player.hoverEndTime = Math.max(player.hoverEndTime, Date.now() + 5000);
                flightBaseHeight = player.y;
            }
            powerUps.splice(index, 1);
        }
    });
}

function resetGame() {
    obstacles = [];
    powerUps = [];
    gameSpeed = 5 * scale;
    score = 0;
    lastSpawnTime = Date.now();
    lastPowerUpTime = Date.now();
    lastFlyingBoostTime = Date.now();
    powerUpInterval = Math.random() * (10000 - 5000) + 5000;
    FlyingBoostInterval = Math.random() * (30000 - 5000) + 5000;
    gamePaused = true;
    restartButton.style.display = 'none';
    player = {
        ...player,
        x: 50 * scale,
        y: canvas.height - 150 * scale,
        color: 'red',
        jumpPower: -15 * scale,
        poweredUp: false,
        flying: false
    };
}

function increaseDifficulty() {
    gameSpeed += 0.0007 * scale;
    baseSpawnInterval = Math.max(
        3000 - Math.floor(score * 10),
        minObstacleSpawnInterval
    );
}

function updateScore() {
    scoreElement.textContent = `Score: ${Math.floor(score)}`;
}

function updateBoosts() {
    if (player.poweredUp) {
        const jumpTimeLeft = Math.max(0, Math.floor((player.powerUpEndTime - Date.now()) / 1000));
        jumpingBoostsElement.innerHTML = `Jumping Boost: ${jumpTimeLeft}s<br>`;
    } else {
        jumpingBoostsElement.innerHTML = '';
    }

    if (player.flying) {
        const hoverTimeLeft = Math.max(0, Math.floor((player.hoverEndTime - Date.now()) / 1000));
        flyingBoostsElement.innerHTML = `Flying Boost: ${hoverTimeLeft}s<br>`;
    } else {
        flyingBoostsElement.innerHTML = '';
    }
}

function gameLoop() {
    if (!gamePaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        updatePlayer();
        updateObstacles();
        updatePowerUps();
        detectCollision();

        drawPlayer();
        drawObstacles();
        drawPowerUps();
        updateScore();
        updateBoosts();

        const currentSpawnInterval = baseSpawnInterval + Math.random() * spawnIntervalVariance;
        if (Date.now() - lastSpawnTime > currentSpawnInterval) {
            spawnObstacle();
            lastSpawnTime = Date.now();
        }

        if (Date.now() - lastPowerUpTime > powerUpInterval) {
            spawnPowerUp('jump_boost');
            powerUpInterval = Math.random() * (10000 - 5000) + 5000;
        }

        if (Date.now() - lastFlyingBoostTime > FlyingBoostInterval) {
            spawnPowerUp('Flying_boost');
            FlyingBoostInterval = Math.random() * (30000 - 5000) + 5000;
        }

        increaseDifficulty();
        score += 0.05;
    }

    requestAnimationFrame(gameLoop);
}

function handleInput() {
    if (player.flying) {
        player.hoverEndTime = Date.now();
        player.flying = false;
        player.color = 'red';
    }
    if (player.grounded) {
        player.dy = player.jumpPower;
    }
}

function setSettingsForPlaying() {
    gamePaused = false;
    startButton.style.display = 'none';
    scoreElement.style.display = 'block';
}

canvas.addEventListener('touchstart', handleInput);
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        handleInput();
    }
});

restartButton.addEventListener('click', () => {
    resetGame();
    setSettingsForPlaying();
});

startButton.addEventListener('click', () => {
    setSettingsForPlaying();
    gameLoop();
});

function submitScore(score) {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const messageId = urlParams.get('messageId');
    const inlineMessageId = urlParams.get('inlineMessageId');

    if (!userId) {
        console.error('User ID not found in URL parameters.');
        return;
    }

    score = Math.floor(score);

    const queryString = new URLSearchParams({
        userId,
        score,
        messageId,
        inlineMessageId,
    }).toString();

    fetch(`/submit-score?${queryString}`).then(response => {
        if (response.ok) {
            console.log('Score submitted successfully');
        } else {
            console.error('Failed to submit score');
        }
    }).catch(error => {
        console.error('Error submitting score:', error);
    });
}

resetGame();