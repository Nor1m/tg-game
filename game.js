const playerImage = new Image();
const obstacleImage = new Image();
const playerImageJump = new Image();
const playerImageFly = new Image();

const playerImageRun1 = new Image();
const playerImageRun2 = new Image();
const playerImageRun3 = new Image();
const playerImageRun4 = new Image();

const jumpBoostImage = new Image();
const flyingBoostImage = new Image();

jumpBoostImage.src = 'images/jump-boost.png';
flyingBoostImage.src = 'images/flying-boost.png';

playerImageFly.src = 'images/player-fly.png';
playerImageJump.src = 'images/player-jump.png';
playerImage.src = 'images/player.png';

playerImageRun1.src = 'images/player-run-1.png';
playerImageRun2.src = 'images/player-run-2.png';
playerImageRun3.src = 'images/player-run-3.png';
playerImageRun4.src = 'images/player-run-4.png';

const obstacleImage1 = new Image();
const obstacleImage2 = new Image();
const obstacleImage3 = new Image();
const obstacleImage4 = new Image();

obstacleImage1.src = 'images/obstacle-1.png';
obstacleImage2.src = 'images/obstacle-2.png';
obstacleImage3.src = 'images/obstacle-3.png';
obstacleImage4.src = 'images/obstacle-4.png';

const obstacleImageHit1 = new Image();
obstacleImageHit1.src = 'images/obstacle-hit-1.png';

const obstacleImages = [
    obstacleImage1, obstacleImage2, obstacleImage3, obstacleImage4
];

let imagesLoaded = false;
playerImage.onload = () => {
    if (playerImage.complete) {
        imagesLoaded = true;
    }
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');
const boostsElement = document.getElementById('boosts');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const scale = Math.min(canvas.width / 800, canvas.height / 600);
const groundLevel = canvas.height - 20 * scale;

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
    if (imagesLoaded) {
        let imageToDraw;

        if (player.flying) {
            imageToDraw = playerImageFly;
        } else if (player.grounded) {
            if (Date.now() - lastAnimationFrameTime > animationInterval) {
                animationFrame = (animationFrame + 1) % 4;
                lastAnimationFrameTime = Date.now();
            }

            switch (animationFrame) {
                case 0:
                    imageToDraw = playerImageRun1;
                    break;
                case 1:
                    imageToDraw = playerImageRun2;
                    break;
                case 2:
                    imageToDraw = playerImageRun3;
                    break;
                case 3:
                    imageToDraw = playerImageRun4;
                    break;
            }
        } else {
            imageToDraw = playerImageJump;
        }

        ctx.drawImage(imageToDraw, player.x, player.y, player.width, player.height);
    }
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
            imageToDraw = jumpBoostImage;
        } else if (powerUp.type === 'Flying_boost') {
            imageToDraw = flyingBoostImage;
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
                player.poweredUp = true;
                player.color = 'purple';
                player.jumpPower = -18 * scale;
                player.powerUpEndTime = Math.max(player.powerUpEndTime, Date.now() + 10000);
            } else if (powerUp.type === 'Flying_boost') {
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
    gameSpeed += 0.0001 * scale;
    baseSpawnInterval = Math.max(
        3000 - Math.floor(score * 10),
        minObstacleSpawnInterval
    );
}

function updateScore() {
    scoreElement.textContent = `Score: ${Math.floor(score)}`;
}

function updateBoosts() {
    let boostsText = '';
    if (player.poweredUp) {
        const jumpTimeLeft = Math.max(0, Math.floor((player.powerUpEndTime - Date.now()) / 1000));
        boostsText += `Jump Boost: ${jumpTimeLeft}s<br>`;
    }
    if (player.flying) {
        const hoverTimeLeft = Math.max(0, Math.floor((player.hoverEndTime - Date.now()) / 1000));
        boostsText += `Flying Boost: ${hoverTimeLeft}s<br>`;
    }
    boostsElement.innerHTML = boostsText;
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

canvas.addEventListener('click', handleInput);
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

resetGame();