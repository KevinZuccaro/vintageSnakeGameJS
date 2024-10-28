// Constants
const CANVAS_ID = 'gameCanvas';
const SCORE_FOOTER_ID = 'scoreFooter';
const GAME_OVER_MESSAGE_ID = 'gameOverMessage';
const BOX_SIZE = 20;
const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;
const INITIAL_SNAKE_POSITION = { x: 9 * BOX_SIZE, y: 10 * BOX_SIZE };
const GAME_SPEED = 100;
const HIGH_SCORES_KEY = 'highScores';
const MAX_HIGH_SCORES = 5;

// DOM Elements
const canvas = document.getElementById(CANVAS_ID);
const ctx = canvas.getContext('2d');
const scoreFooter = document.getElementById(SCORE_FOOTER_ID);
const gameOverMessage = document.getElementById(GAME_OVER_MESSAGE_ID);
const resetButton = document.getElementById('resetButton');
const gamerNameInput = document.getElementById('gamerName');

// Game Variables
let snake = [INITIAL_SNAKE_POSITION];
let food = generateFoodPosition();
let direction;
let score = 0;
let recordScore = localStorage.getItem('recordScore') || 0;
let gameOver = false;
let game;

// Event Listeners
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keydown', restartGameOnGameOver);
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('touchend', handleTouchEnd, false);
resetButton.addEventListener('click', resetHighScores);

// Touch Variables
let xDown = null;
let yDown = null;

function handleKeyDown(event) {
    const key = event.keyCode;
    if (key === LEFT_KEY && direction !== 'RIGHT') direction = 'LEFT';
    else if (key === UP_KEY && direction !== 'DOWN') direction = 'UP';
    else if (key === RIGHT_KEY && direction !== 'LEFT') direction = 'RIGHT';
    else if (key === DOWN_KEY && direction !== 'UP') direction = 'DOWN';
}

function handleTouchStart(evt) {
    const firstTouch = evt.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    const xUp = evt.touches[0].clientX;
    const yUp = evt.touches[0].clientY;

    const xDiff = xDown - xUp;
    const yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0 && direction !== 'RIGHT') {
            direction = 'LEFT';
        } else if (xDiff < 0 && direction !== 'LEFT') {
            direction = 'RIGHT';
        }
    } else {
        if (yDiff > 0 && direction !== 'DOWN') {
            direction = 'UP';
        } else if (yDiff < 0 && direction !== 'UP') {
            direction = 'DOWN';
        }
    }

    xDown = null;
    yDown = null;
}

function handleTouchEnd(evt) {
    xDown = null;
    yDown = null;
}

function restartGameOnGameOver(event) {
    if (gameOver) resetGame();
}

function generateFoodPosition() {
    return {
        x: Math.floor(Math.random() * 19 + 1) * BOX_SIZE,
        y: Math.floor(Math.random() * 19 + 1) * BOX_SIZE
    };
}

function collision(head, array) {
    return array.some(segment => head.x === segment.x && head.y === segment.y);
}

function draw() {
    if (gameOver) return;

    ctx.fillStyle = '#3b3b3b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#8fbc8f' : '#556b2f';
        ctx.strokeStyle = '#4b4b4b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(segment.x, segment.y, BOX_SIZE, BOX_SIZE, 5);
        ctx.fill();
        ctx.stroke();
    });

    ctx.fillStyle = '#8fbc8f';
    ctx.beginPath();
    ctx.roundRect(food.x, food.y, BOX_SIZE, BOX_SIZE, 5);
    ctx.fill();

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === 'LEFT') snakeX -= BOX_SIZE;
    if (direction === 'UP') snakeY -= BOX_SIZE;
    if (direction === 'RIGHT') snakeX += BOX_SIZE;
    if (direction === 'DOWN') snakeY += BOX_SIZE;

    if (snakeX === food.x && snakeY === food.y) {
        score++;
        food = generateFoodPosition();
        if (score > recordScore) {
            recordScore = score;
            localStorage.setItem('recordScore', recordScore);
        }
    } else {
        snake.pop();
    }

    const newHead = { x: snakeX, y: snakeY };

    if (snakeX < 0 || snakeY < 0 || snakeX >= canvas.width || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        gameOverMessage.style.display = 'block';
        gameOver = true;
        saveHighScore(score);
        updateHighScoresList();
        return;
    }

    snake.unshift(newHead);
    scoreFooter.textContent = `Score: ${score} | Record: ${recordScore}`;
}

function resetGame() {
    snake = [INITIAL_SNAKE_POSITION];
    direction = null;
    score = 0;
    food = generateFoodPosition();
    gameOverMessage.style.display = 'none';
    gameOver = false;
    game = setInterval(draw, GAME_SPEED);
    updateHighScoresList();
}

function getHighScores() {
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORES_KEY)) || [];
    return highScores;
}

function saveHighScore(score) {
    const highScores = getHighScores();
    const gamerName = gamerNameInput.value || 'Anonymous';
    const newScore = { score, name: gamerName, date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString() };

    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(MAX_HIGH_SCORES);

    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(highScores));
}

function updateHighScoresList() {
    const highScores = getHighScores();
    const highScoresList = document.getElementById('highScoresList');
    const resetButton = document.getElementById('resetButton');

    if (highScores.length === 0) {
        highScoresList.innerHTML = '<li>Leaderboard is empty</li>';
        resetButton.style.display = 'none';
    } else {
        highScoresList.innerHTML = highScores
            .map(score => `<li>${score.name}: ${score.score} - ${score.date} ${score.time}</li>`)
            .join('');
        resetButton.style.display = 'block';
    }
}

function resetHighScores() {
    localStorage.removeItem(HIGH_SCORES_KEY);
    updateHighScoresList();
}

// Start the game
game = setInterval(draw, GAME_SPEED);
updateHighScoresList();