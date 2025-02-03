const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('scoreValue');
    const livesDisplay = document.getElementById('livesValue');
    const levelDisplay = document.getElementById('levelValue');
    const gameOverScreen = document.getElementById('gameOver');
    const restartButton = document.getElementById('restartButton');
    const pauseMenu = document.getElementById('pauseMenu');
    const resumeButton = document.getElementById('resumeButton');
    const upgradeSpeedButton = document.getElementById('upgradeSpeed');
    const upgradeBulletSpeedButton = document.getElementById('upgradeBulletSpeed');
    const addLifeButton = document.getElementById('addLife');
    const levelCompleteScreen = document.getElementById('levelComplete');

    let score = 0;
    let lives = 3;
    let level = 1;
    let gameRunning = true;
    let gamePaused = false;
    let invaderScore = 10;

    const player = {
      x: canvas.width / 2 - 20,
      y: canvas.height - 40,
      width: 40,
      height: 20,
      speed: 5,
      color: 'green',
      isMovingLeft: false,
      isMovingRight: false,
    };

    let invaders = [];
    let invaderRows = 4;
    let invaderCols = 10;
    let invaderWidth = 30;
    let invaderHeight = 20;
    let invaderPadding = 10;
    let invaderOffsetTop = 30;
    let invaderOffsetLeft = 30;
    let invaderSpeed = 1;
    let invaderDirection = 1;

    function createInvaders() {
      invaders = [];
      for (let row = 0; row < invaderRows; row++) {
        for (let col = 0; col < invaderCols; col++) {
          invaders.push({
            x: col * (invaderWidth + invaderPadding) + invaderOffsetLeft,
            y: row * (invaderHeight + invaderPadding) + invaderOffsetTop,
            width: invaderWidth,
            height: invaderHeight,
            color: 'red',
            alive: true,
          });
        }
      }
    }

    function setupLevel() {
      levelDisplay.textContent = level;
      if (level === 1) {
        invaderRows = 4;
        invaderCols = 10;
        invaderSpeed = 1;
        invaderScore = 10;
      } else if (level === 2) {
        invaderRows = 3;
        invaderCols = 8;
        invaderSpeed = 0.8;
        invaderScore = 20;
      } else if (level === 3) {
        invaderRows = 6;
        invaderCols = 14;
        invaderSpeed = 2;
        invaderScore = 30;
      }
      createInvaders();
    }

    setupLevel();

    const bullets = [];
    let bulletSpeed = 7;
    const bulletWidth = 5;
    const bulletHeight = 10;
    const bulletColor = 'white';

    function drawPlayer() {
      ctx.fillStyle = player.color;
      ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    function drawInvaders() {
      invaders.forEach((invader) => {
        if (invader.alive) {
          ctx.fillStyle = invader.color;
          ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
        }
      });
    }

    function drawBullets() {
      bullets.forEach((bullet) => {
        ctx.fillStyle = bulletColor;
        ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
      });
    }

    function movePlayer() {
      if (player.isMovingLeft && player.x > 0) {
        player.x -= player.speed;
      }
      if (player.isMovingRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
      }
    }

    function moveInvaders() {
      let moveDown = false;
      invaders.forEach((invader) => {
        if (invader.alive) {
          invader.x += invaderSpeed * invaderDirection;
          if (invader.x + invader.width >= canvas.width || invader.x <= 0) {
            moveDown = true;
          }
        }
      });

      if (moveDown) {
        invaderDirection *= -1;
        invaders.forEach((invader) => {
          if (invader.alive) {
            invader.y += invaderHeight;
          }
        });
      }
    }

    function moveBullets() {
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bulletSpeed;
        if (bullets[i].y < 0) {
          bullets.splice(i, 1);
        }
      }
    }

    function checkCollisions() {
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        for (let j = 0; j < invaders.length; j++) {
          const invader = invaders[j];
          if (invader.alive &&
              bullet.x < invader.x + invader.width &&
              bullet.x + bulletWidth > invader.x &&
              bullet.y < invader.y + invader.height &&
              bullet.y + bulletHeight > invader.y) {
            invader.alive = false;
            bullets.splice(i, 1);
            score += invaderScore;
            scoreDisplay.textContent = score;
            break;
          }
        }
      }

      for (let i = 0; i < invaders.length; i++) {
        const invader = invaders[i];
        if (invader.alive &&
            invader.y + invader.height >= player.y) {
          lives--;
          livesDisplay.textContent = lives;
          if (lives <= 0) {
            gameRunning = false;
            gameOverScreen.classList.remove('hidden');
          }
          break;
        }
      }
    }

    function checkLevelComplete() {
      if (invaders.every(invader => !invader.alive)) {
        gamePaused = true;
        levelCompleteScreen.classList.remove('hidden');
        setTimeout(() => {
          levelCompleteScreen.classList.add('hidden');
          level++;
          if (level > 3) {
            gameRunning = false;
            gameOverScreen.classList.remove('hidden');
          } else {
            setupLevel();
            gamePaused = false;
            gameLoop();
          }
        }, 3000);
      }
    }

    function gameLoop() {
      if (!gameRunning || gamePaused) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      movePlayer();
      moveInvaders();
      moveBullets();
      checkCollisions();
      drawPlayer();
      drawInvaders();
      drawBullets();
      checkLevelComplete();
      requestAnimationFrame(gameLoop);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        player.isMovingLeft = true;
      } else if (e.key === 'ArrowRight') {
        player.isMovingRight = true;
      } else if (e.key === ' ') {
        bullets.push({
          x: player.x + player.width / 2 - bulletWidth / 2,
          y: player.y - bulletHeight,
        });
      } else if (e.key === 'l' || e.key === 'L') {
        togglePauseMenu();
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft') {
        player.isMovingLeft = false;
      } else if (e.key === 'ArrowRight') {
        player.isMovingRight = false;
      }
    });

    restartButton.addEventListener('click', () => {
      score = 0;
      lives = 3;
      level = 1;
      scoreDisplay.textContent = score;
      livesDisplay.textContent = lives;
      levelDisplay.textContent = level;
      setupLevel();
      gameOverScreen.classList.add('hidden');
      gameRunning = true;
      gameLoop();
    });

    resumeButton.addEventListener('click', () => {
      togglePauseMenu();
    });

    function togglePauseMenu() {
      gamePaused = !gamePaused;
      if (gamePaused) {
        pauseMenu.classList.remove('hidden');
      } else {
        pauseMenu.classList.add('hidden');
        gameLoop();
      }
    }

    upgradeSpeedButton.addEventListener('click', () => {
      if (score >= 50) {
        score -= 50;
        player.speed += 1;
        scoreDisplay.textContent = score;
      }
    });

    upgradeBulletSpeedButton.addEventListener('click', () => {
      if (score >= 75) {
        score -= 75;
        bulletSpeed += 1;
        scoreDisplay.textContent = score;
      }
    });

    addLifeButton.addEventListener('click', () => {
      if (score >= 100) {
        score -= 100;
        lives++;
        livesDisplay.textContent = lives;
        scoreDisplay.textContent = score;
      }
    });

    gameLoop();
