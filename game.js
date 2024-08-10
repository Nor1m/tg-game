const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton');
const startButton = document.getElementById('startButton');
const scoreElement = document.getElementById('score');
const boostsElement = document.getElementById('boosts');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const scale = Math.min(canvas.width / 800, canvas.height / 600);

let player = {
    x: 50 * scale,
    y: canvas.height - 150 * scale,
    width: 50 * scale,
    height: 50 * scale,
    dy: 0,
    gravity: 0.3 * scale,
    jumpPower: -15 * scale,
    grounded: false,
    color: 'red',
    poweredUp: false,
    powerUpEndTime: 0,
    hovering: false,
    hoverEndTime: 0
};

let obstacles = [];
let powerUps = [];
let gameSpeed = 5 * scale;
let powerUpSpeed = 4 * scale;
let baseSpawnInterval = 3000;
let minObstacleSpawnInterval = 1000;
let spawnIntervalVariance = 1000;
let powerUpInterval = Math.random() * (10000 - 5000) + 5000;
let hoveringBoostInterval = Math.random() * (30000 - 5000) + 5000;
let minObstacleDistance = player.width * 20;
let minPowerUpDistance = player.width * 30;
let lastSpawnTime = Date.now();
let lastPowerUpTime = Date.now();
let lastHoveringBoostTime = Date.now();
let score = 0;
let gamePaused = true; // Игра будет приостановлена по умолчанию

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function updatePlayer() {
    if (player.hovering && Date.now() < player.hoverEndTime) {
        player.dy = 0;
    } else {
        player.hovering = false;
        player.dy += player.gravity / 2;
        player.y += player.dy;
        if (!player.poweredUp) {
            player.color = 'red';
        }
        if (player.y + player.height < canvas.height) {
            player.dy += player.gravity;
            player.grounded = false;
        } else {
            player.y = canvas.height - player.height;
            player.dy = 0;
            player.grounded = true;
        }
    }

    if (player.poweredUp && Date.now() > player.powerUpEndTime) {
        player.poweredUp = false;
        player.color = 'red';
        player.jumpPower = -15 * scale;
    }
}

function spawnObstacle(type) {
    let height = player.height;
    let lastObstacle = obstacles[obstacles.length - 1];
    let obstacleX = lastObstacle ? lastObstacle.x + lastObstacle.width + minObstacleDistance : canvas.width + minObstacleDistance;

    let obstacle = {
        x: obstacleX,
        y: canvas.height - height,
        width: 50 * scale,
        height: height,
        speed: gameSpeed,
        type: type
    };
    obstacles.push(obstacle);
}

function spawnPowerUp(type) {
    let lastPowerUp = powerUps[powerUps.length - 1];
    let powerUpX = canvas.width + Math.random() * canvas.width;
    let powerUpY;
    switch (type) {
        case 'jump_boost':
            powerUpY = canvas.height - player.height * 3 + (Math.random() * player.height - player.height / 2);
            break;
        case 'hovering_boost':
            powerUpY = canvas.height - player.height * 5 + (Math.random() * player.height - player.height / 2);
            break;
    }

    if (lastPowerUp && Math.abs(powerUpX - lastPowerUp.x) < minPowerUpDistance) {
        powerUpX += minPowerUpDistance;
    }

    let powerUp = {
        x: powerUpX,
        y: powerUpY,
        radius: 15 * scale,
        speed: powerUpSpeed,
        type: type
    };
    powerUps.push(powerUp);
    if (type === 'jump_boost') {
        lastPowerUpTime = Date.now();
    } else if (type === 'hovering_boost') {
        lastHoveringBoostTime = Date.now();
    }
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = 'green';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.fillStyle = powerUp.type === 'jump_boost' ? 'purple' : 'orange';
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
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
    obstacles.forEach(obstacle => {
        let collisionFromSide = (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y
        );

        if (collisionFromSide) {
            gamePaused = true;
            restartButton.style.display = 'block';
        }
    });

    powerUps.forEach((powerUp, index) => {
        let distX = player.x + player.width / 2 - powerUp.x;
        let distY = player.y + player.height / 2 - powerUp.y;
        let distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < player.width / 2 + powerUp.radius) {
            if (powerUp.type === 'jump_boost') {
                player.poweredUp = true;
                player.color = 'purple';
                player.jumpPower = -18 * scale;
                player.powerUpEndTime = Math.max(player.powerUpEndTime, Date.now() + 10000);
            } else if (powerUp.type === 'hovering_boost') {
                player.hovering = true;
                player.color = 'orange';
                player.hoverEndTime = Math.max(player.hoverEndTime, Date.now() + 5000);
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
    lastHoveringBoostTime = Date.now();
    powerUpInterval = Math.random() * (10000 - 5000) + 5000;
    hoveringBoostInterval = Math.random() * (30000 - 5000) + 5000;
    gamePaused = true;
    restartButton.style.display = 'none';
    player.x = 50 * scale;
    player.y = canvas.height - 150 * scale;
    player.color = 'red';
    player.jumpPower = -15 * scale;
    player.poweredUp = false;
    player.hovering = false;
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
        let jumpTimeLeft = Math.max(0, Math.floor((player.powerUpEndTime - Date.now()) / 1000));
        boostsText += `Jump Boost: ${jumpTimeLeft}s<br>`;
    }
    if (player.hovering) {
        let hoverTimeLeft = Math.max(0, Math.floor((player.hoverEndTime - Date.now()) / 1000));
        boostsText += `Hovering Boost: ${hoverTimeLeft}s<br>`;
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

        let currentSpawnInterval = baseSpawnInterval + Math.random() * spawnIntervalVariance;
        if (Date.now() - lastSpawnTime > currentSpawnInterval) {
            spawnObstacle('green');
            lastSpawnTime = Date.now();
        }

        if (Date.now() - lastPowerUpTime > powerUpInterval) {
            spawnPowerUp('jump_boost');
            powerUpInterval = Math.random() * (10000 - 5000) + 5000;
        }

        if (Date.now() - lastHoveringBoostTime > hoveringBoostInterval) {
            spawnPowerUp('hovering_boost');
            hoveringBoostInterval = Math.random() * (30000 - 5000) + 5000;
        }

        increaseDifficulty();
        score += 0.05;
    }

    requestAnimationFrame(gameLoop);
}

function handleJump() {
    if (!gamePaused && player.grounded) {
        player.dy = player.jumpPower;
    }
}

function handleClickOrKeyPress() {
    if (player.hovering) {
        player.hoverEndTime = Date.now();
        player.hovering = false;
        player.color = 'red';
    }
}

function setSettingsForPlaying() {
    gamePaused = false;
    startButton.style.display = 'none';
    scoreElement.style.display = 'block';
}

canvas.addEventListener('click', () => {
    handleClickOrKeyPress();
    handleJump();
});

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        handleJump();
        handleClickOrKeyPress();
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

// Инициализируем начальное состояние игры
resetGame();