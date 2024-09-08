(() => {
    const playerImage = new Image();
    const playerImageDead = new Image();
    const playerImageJump = new Image();
    const playerImageFly = new Image();

    const playerImageRun1 = new Image();
    const playerImageRun2 = new Image();
    const playerImageRun3 = new Image();
    const playerImageRun4 = new Image();

    const jumpBoostImage = new Image();
    const flyingBoostImage = new Image();
    const shieldBoostImage = new Image();
    const fireBoostImage = new Image();

    const obstacleImage1 = new Image();
    const obstacleImage2 = new Image();
    const obstacleImage3 = new Image();
    const obstacleImage4 = new Image();
    const obstacleImageHit1 = new Image();

    const playerImageFire1 = new Image();
    const playerImageFire2 = new Image();
    const fireBulletImage = new Image();

    const imageSources = {
        player: 'images/player.png',
        playerDead: 'images/player-dead.png',
        playerJump: 'images/player-jump.png',
        playerFly: 'images/player-fly.png',
        playerRun1: 'images/player-run-1.png',
        playerRun2: 'images/player-run-2.png',
        playerRun3: 'images/player-run-3.png',
        playerRun4: 'images/player-run-4.png',
        playerFire1: 'images/player-fire-1.png',
        playerFire2: 'images/player-fire-2.png',
        fireBullet: 'images/fire.png',

        jumpBoost: 'images/jump-boost.png',
        flyingBoost: 'images/flying-boost.png',
        shieldBoost: 'images/shield-boost.png',
        fireBoost: 'images/fire-boost.png',
        obstacle1: 'images/obstacle-1.png',
        obstacle2: 'images/obstacle-2.png',
        obstacle3: 'images/obstacle-3.png',
        obstacle4: 'images/obstacle-4.png',
        obstacleHit1: 'images/obstacle-hit-1.png',
    };

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
        playerImageDead.src = loadedImages.playerDead.src;
        playerImageFly.src = loadedImages.playerFly.src;
        playerImageRun1.src = loadedImages.playerRun1.src;
        playerImageRun2.src = loadedImages.playerRun2.src;
        playerImageRun3.src = loadedImages.playerRun3.src;
        playerImageRun4.src = loadedImages.playerRun4.src;
        playerImageFire1.src = loadedImages.playerFire1.src;
        playerImageFire2.src = loadedImages.playerFire2.src;
        fireBulletImage.src = loadedImages.fireBullet.src;

        jumpBoostImage.src = loadedImages.jumpBoost.src;
        flyingBoostImage.src = loadedImages.flyingBoost.src;
        shieldBoostImage.src = imageSources.shieldBoost;
        fireBoostImage.src = imageSources.fireBoost;
        obstacleImage1.src = loadedImages.obstacle1.src;
        obstacleImage2.src = loadedImages.obstacle2.src;
        obstacleImage3.src = loadedImages.obstacle3.src;
        obstacleImage4.src = loadedImages.obstacle4.src;
        obstacleImageHit1.src = loadedImages.obstacleHit1.src;

        startButton.style.display = 'block';
        console.log('loaded');

    }).catch(error => {
        console.error('Error loading images:', error);
    });

    let fireBoostActive = false;
    let fireBoostEndTime = 0;
    let fireInterval;
    let bullets = [];

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const restartButton = document.getElementById('restartButton');
    const startButton = document.getElementById('startButton');
    const scoreElement = document.getElementById('score');
    const jumpingBoostsElement = document.getElementById('jumping-boosts');
    const flyingBoostsElement = document.getElementById('flying-boosts');
    const shieldBoostsElement = document.getElementById('shield-boosts');
    const fireBoostsElement = document.getElementById('fire-boosts');
    const boostsElements = document.getElementsByClassName('boosts');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const scale = Math.min(canvas.width / 800, canvas.height / 600);
    const groundLevel = canvas.height - 20 * scale;

    const sounds = {
        background: 'sounds/background.ogg',
        boom: 'sounds/boom.mp3',
        boost: 'sounds/boost.mp3',
        flying: 'sounds/flying.mp3',
        fire: 'sounds/fire.mp3'
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

    function playBackgroundSound() {
        if (loadedSounds.background) {
            loadedSounds.background.volume = 0.3;
            loadedSounds.background.loop = true;
            loadedSounds.background.play();
        }
    }

    function stopBackgroundSound() {
        if (loadedSounds.background) {
            loadedSounds.background.pause();
            loadedSounds.background.currentTime = 0;
        }
    }

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

    function stopFlyingSound() {
        if (loadedSounds.flying) {
            loadedSounds.flying.pause();
            loadedSounds.flying.currentTime = 0;
        }
    }

    function stopFireSound() {
        if (loadedSounds.fire) {
            loadedSounds.fire.pause();
            loadedSounds.fire.currentTime = 0;
        }
    }

    function playFireSound() {
        if (loadedSounds.fire) {
            loadedSounds.fire.play();
        }
    }

    const player_default = {
        x: 50 * scale,
        y: groundLevel - 150 * scale,
        width: 100 * scale,
        height: 100 * scale,
        dy: 0,
        gravity: 0.35 * scale,
        jumpPower: -15 * scale,
        grounded: false,
        poweredUp: false,
        powerUpEndTime: 0,
        flying: false,
        hoverEndTime: 0,
        dead: false
    };

    let player = player_default;

    let obstacles = [];
    let powerUps = [];
    let gameSpeed = 5 * scale;
    let powerUpSpeed = 4 * scale;
    let baseSpawnInterval = 3000;
    const minObstacleSpawnInterval = 1000;
    const spawnIntervalVariance = 1000;

    let powerUpInterval = Math.random() * 30000;
    let flyingBoostInterval = Math.random() * 30000;
    let shieldBoostInterval = Math.random() * 30000;
    let fireBoostInterval = Math.random() * 50000;

    const powerUpIntervalDefault = powerUpInterval;
    const flyingBoostIntervalDefault = flyingBoostInterval;
    const shieldBoostIntervalDefault = shieldBoostInterval;
    const fireBoostIntervalDefault = fireBoostInterval;

    const minObstacleDistance = player.width * 20;
    const minPowerUpDistance = player.width * 30;
    let lastSpawnTime = Date.now();
    let lastPowerUpTime = Date.now();
    let lastFlyingBoostTime = Date.now();
    let lastShieldBoostTime = Date.now();
    let lastFireBoostTime = Date.now();
    let score = 0;
    let gamePaused = true;
    let shieldBoostEndTime = 0;

    let animationFrame = 0;
    let animationInterval = 100; // Интервал переключения кадров (в миллисекундах)
    let lastAnimationFrameTime = Date.now();

    const flightAmplitude = 10 * scale; // амплитуда, 10 пикселей
    const flightFrequency = 0.005; // частота, чем меньше значение, тем медленнее колебание
    let flightStartTime = 0; // Время начала полета
    let flightBaseHeight = 0; // Базовая высота полета


    function drawPlayer() {
        let imageToDraw;

        if (Date.now() - lastAnimationFrameTime > animationInterval) {
            animationFrame = (animationFrame + 1) % 4;
            lastAnimationFrameTime = Date.now();
        }

        if (player.dead) {
            imageToDraw = loadedImages.playerDead;
        } else if (fireBoostActive && Date.now() < fireBoostEndTime) {
            switch (animationFrame) {
                default:
                case 0:
                    imageToDraw = loadedImages.playerFire1;
                    break;
                case 1:
                    imageToDraw = loadedImages.playerFire2;
                    break;
            }

        } else if (player.flying) {
            imageToDraw = loadedImages.playerFly;
        } else if (player.grounded) {
            switch (animationFrame) {
                default:
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

    function shootBullet() {
        if (fireBoostActive && Date.now() < fireBoostEndTime) {
            let player_center = player.y + player.height / 2;
            bullets.push({
                x: player.x + player.width,
                y: player_center - (player_center / 43.3),
                width: 20 * scale,
                height: 10 * scale,
                speed: 7 * scale,
                distanceTraveled: 0,
                maxDistance: canvas.width / 1.6
            });
        }
    }

    function drawBullets() {
        bullets.forEach(bullet => {
            playFireSound();
            ctx.drawImage(fireBulletImage, bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }

    function updateBullets() {
        bullets.forEach(bullet => {
            bullet.x += bullet.speed;
            bullet.distanceTraveled += bullet.speed;

            // Проверка на столкновение с препятствиями
            obstacles.forEach((obstacle, index) => {
                if (bullet.x < obstacle.x + obstacle.width &&
                    bullet.x + bullet.width > obstacle.x &&
                    bullet.y < obstacle.y + obstacle.height &&
                    bullet.y + bullet.height > obstacle.y) {

                    obstacle.image = obstacleImageHit1;

                    playBoomSound();

                    bullets.splice(bullets.indexOf(bullet), 1);

                    setTimeout(() => {
                        obstacles.splice(index, 1);
                    }, 100);
                }
            });

            if (bullet.distanceTraveled > bullet.maxDistance) {
                bullets.splice(bullets.indexOf(bullet), 1);
            }
        });
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
            case 'flying_boost':
                powerUpY = groundLevel - player.height * 5 + (Math.random() * player.height - player.height / 2);
                break;
            case 'shield_boost':
                powerUpY = groundLevel - player.height * 4 + (Math.random() * player.height - player.height / 2);
                break;
            case 'fire_boost':
                powerUpY = groundLevel - player.height * 2 + (Math.random() * player.height - player.height / 2);
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
        } else if (type === 'flying_boost') {
            lastFlyingBoostTime = Date.now();
        } else if (type === 'shield_boost') {
            lastShieldBoostTime = Date.now();
        } else if (type === 'fire_boost') {
            lastFireBoostTime = Date.now();
        }
    }

    function drawObstacles() {
        const timeElapsed = Date.now(); // Текущее время
        obstacles.forEach(obstacle => {
            // Амплитуда и частота колебаний для препятствий
            const amplitude = 2 * scale;
            const frequency = 0.01;

            // Рассчитываем вертикальный сдвиг для левитации
            const verticalOffset = amplitude * Math.sin(frequency * timeElapsed);

            const imageToDraw = obstacle.hitState === 'hit' && obstacle.hitImage ? obstacle.hitImage : obstacle.image;
            ctx.drawImage(imageToDraw, obstacle.x, obstacle.y + verticalOffset, obstacle.width, obstacle.height);
        });
    }


    function drawPowerUps() {
        powerUps.forEach(powerUp => {
            let imageToDraw;

            if (powerUp.type === 'jump_boost') {
                imageToDraw = loadedImages.jumpBoost;
            } else if (powerUp.type === 'flying_boost') {
                imageToDraw = loadedImages.flyingBoost;
            } else if (powerUp.type === 'shield_boost') {
                imageToDraw = loadedImages.shieldBoost;
            } else if (powerUp.type === 'fire_boost') {
                imageToDraw = loadedImages.fireBoost;
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

    function onFail() {
        Array.from(boostsElements).forEach(element => {
            element.innerHTML = '';
        });
        player.dead = true;
        gamePaused = true;
        fireBoostActive = false;
        stopBackgroundSound();
        stopFireSound();
        stopFlyingSound();
        playBoomSound();
        submitScore(score);
        restartButton.style.display = 'block';
        player.powerUpEndTime = 0;
        player.hoverEndTime = 0;
    }

    function detectCollision() {
        const collisionThreshold = 0.4; // Коэффициент, определяющий уровень соприкосновения


        // Проверяем столкновение игрока с препятствиями
        obstacles.forEach((obstacle, obstacleIndex) => {
            const horizontalOverlap = Math.max(0, Math.min(player.x + player.width, obstacle.x + obstacle.width) - Math.max(player.x, obstacle.x));
            const verticalOverlap = Math.max(0, Math.min(player.y + player.height, obstacle.y + obstacle.height) - Math.max(player.y, obstacle.y));

            if (shieldBoostEndTime <= Date.now()) {

                if (horizontalOverlap > 0 && verticalOverlap > 0) {
                    // Определяем процент перекрытия или используем другие критерии
                    const obstacleArea = obstacle.width * obstacle.height;
                    const overlapArea = horizontalOverlap * verticalOverlap;
                    const overlapPercentage = overlapArea / obstacleArea;

                    if (overlapPercentage >= collisionThreshold) {
                        if (shieldBoostEndTime <= Date.now()) {
                            // Если щит не активен
                            if (obstacle.hitState === 'normal') {
                                obstacle.hitImage = obstacleImageHit1;
                                obstacle.hitState = 'hit';
                            }
                            onFail();
                            return true;
                        }
                    }
                }
            }

            // Проверка столкновения с пулями
            bullets.forEach((bullet, bulletIndex) => {
                const bulletOverlapX = bullet.x + bullet.width > obstacle.x && bullet.x < obstacle.x + obstacle.width;
                const bulletOverlapY = bullet.y + bullet.height > obstacle.y && bullet.y < obstacle.y + obstacle.height;

                if (bulletOverlapX && bulletOverlapY) {
                    playBoomSound();
                    obstacles.splice(obstacleIndex, 1);
                    bullets.splice(bulletIndex, 1);
                }
            });

            return false;
        });

        // Проверка столкновений с бонусами
        powerUps.forEach((powerUp, index) => {
            const distX = player.x + player.width / 2 - powerUp.x;
            const distY = player.y + player.height / 2 - powerUp.y;
            const distance = Math.sqrt(distX * distX + distY * distY);

            if (distance < player.width / 2 + powerUp.radius) {
                if (powerUp.type === 'jump_boost') {
                    playBoostSound();
                    player.poweredUp = true;
                    player.jumpPower = -18 * scale;
                    player.powerUpEndTime = Math.max(player.powerUpEndTime, Date.now() + 10000);
                } else if (powerUp.type === 'flying_boost') {
                    playBoostSound();
                    fireBoostActive = false;
                    player.poweredUp = false;
                    playFlyingSound();
                    player.flying = true;
                    player.hoverEndTime = Math.max(player.hoverEndTime, Date.now() + 5000);
                    flightBaseHeight = player.y;
                } else if (powerUp.type === 'shield_boost') {
                    playBoostSound();
                    fireBoostActive = false;
                    player.poweredUp = false;
                    shieldBoostEndTime = Date.now() + 10000;
                } else if (powerUp.type === 'fire_boost') {
                    playBoostSound();
                    activateFireBoost();
                }
                powerUps.splice(index, 1);
            }
        });
    }

    function activateFireBoost() {
        fireBoostActive = true;
        fireBoostEndTime = Date.now() + 7000; // Активируем бонус на 5 секунд

        fireInterval = setInterval(() => {
            if (Date.now() < fireBoostEndTime) {
                shootBullet();
            } else {
                clearInterval(fireInterval); // Останавливаем стрельбу, когда время действия бонуса истекло
                fireBoostActive = false;
            }
        }, 200); // интервал стрельбы
    }

    function drawShield() {
        if (shieldBoostEndTime > Date.now()) {
            // Определение центра и радиуса щита
            const centerX = player.x + player.width / 2;
            const centerY = player.y + player.height / 2;
            const radius = player.width;

            // Создание градиентного контура для щита
            const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.1, centerX, centerY, radius);
            gradient.addColorStop(0, 'rgba(0,255,234,0.05)'); // Центральный цвет щита
            gradient.addColorStop(1, 'rgba(0,255,247,0.12)'); // Внешний цвет щита

            // Рисование щита с градиентом
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Добавление анимации переливания (заливаем градиентом)
            const time = Date.now() * 0.005; // Уменьшаем скорость анимации
            const offsetX = Math.sin(time) * 5;
            const offsetY = Math.cos(time) * 5;

            ctx.beginPath();
            ctx.arc(centerX + offsetX, centerY + offsetY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0,255,247,0.13)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    function resetGame() {
        obstacles = [];
        powerUps = [];
        gameSpeed = 5 * scale;
        score = 0;

        Array.from(boostsElements).forEach(element => {
            element.innerHTML = '';
        });

        fireBoostActive = false;
        fireBoostEndTime = 0;
        clearInterval(fireInterval);
        bullets = [];

        lastSpawnTime = Date.now();
        lastPowerUpTime = Date.now();
        lastFlyingBoostTime = Date.now();
        lastShieldBoostTime = Date.now();
        lastFireBoostTime = Date.now();

        powerUpInterval = powerUpIntervalDefault;
        flyingBoostInterval = flyingBoostIntervalDefault;
        shieldBoostInterval = shieldBoostIntervalDefault;
        fireBoostInterval = fireBoostIntervalDefault;

        gamePaused = true;
        restartButton.style.display = 'none';
        player = player_default;
        player.dead = false;
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
            const jumpTimeLeft = Math.max(1, Math.ceil((player.powerUpEndTime - Date.now()) / 1000));
            jumpingBoostsElement.innerHTML = `Jumping Boost: ${jumpTimeLeft}s<br>`;
        } else {
            jumpingBoostsElement.innerHTML = '';
        }

        if (player.flying) {
            const hoverTimeLeft = Math.max(1, Math.ceil((player.hoverEndTime - Date.now()) / 1000));
            flyingBoostsElement.innerHTML = `Flying Boost: ${hoverTimeLeft}s<br>`;
        } else {
            flyingBoostsElement.innerHTML = '';
        }

        if (shieldBoostEndTime > Date.now()) {
            const shieldTimeLeft = Math.max(1, Math.ceil((shieldBoostEndTime - Date.now()) / 1000));
            shieldBoostsElement.innerHTML = `Shield Boost: ${shieldTimeLeft}s<br>`;
        } else {
            shieldBoostsElement.innerHTML = '';
        }

        if (fireBoostActive && fireBoostEndTime > Date.now()) {
            const fireTimeLeft = Math.max(1, Math.ceil((fireBoostEndTime - Date.now()) / 1000));
            fireBoostsElement.innerHTML = `Fire Boost: ${fireTimeLeft}s<br>`;
        } else {
            fireBoostsElement.innerHTML = '';
            fireBoostActive = false;
        }
    }

    function gameLoop() {
        if (!gamePaused) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            updatePlayer();
            updateObstacles();
            updatePowerUps();
            updateBullets(); // обновляем снаряды

            detectCollision();

            drawObstacles();
            drawPowerUps();
            drawPlayer();
            drawShield();
            drawBullets();

            updateScore();
            updateBoosts();

            const currentSpawnInterval = baseSpawnInterval + Math.random() * spawnIntervalVariance;
            if (Date.now() - lastSpawnTime > currentSpawnInterval) {
                spawnObstacle();
                lastSpawnTime = Date.now();
            }

            if (Date.now() - lastFireBoostTime > fireBoostInterval) {
                spawnPowerUp('fire_boost');
                fireBoostInterval = Math.random() * 80000;
            }

            if (Date.now() - lastPowerUpTime > powerUpInterval) {
                spawnPowerUp('jump_boost');
                powerUpInterval = Math.random() * 10000;
            }

            if (Date.now() - lastFlyingBoostTime > flyingBoostInterval) {
                spawnPowerUp('flying_boost');
                flyingBoostInterval = Math.random() * 30000;
            }

            if (Date.now() - lastShieldBoostTime > shieldBoostInterval) {
                spawnPowerUp('shield_boost');
                shieldBoostInterval = Math.random() * 55000;
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
            stopFlyingSound();
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
        restartGame();
    });

    startButton.addEventListener('click', () => {
        startGame();
    });

    function restartGame() {
        playBackgroundSound();
        resetGame();
        setSettingsForPlaying();
    }

    function startGame() {
        playBackgroundSound();
        setSettingsForPlaying();
        gameLoop();
    }

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
});