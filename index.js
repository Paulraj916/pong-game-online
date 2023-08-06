const socket = io();
const startPage = document.getElementById('startPage');
const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const joinForm = document.getElementById('joinForm');
const roomNumberInput = document.getElementById('roomNumber');
const joinSubmitBtn = document.getElementById('joinSubmitBtn');
const gameContainer = document.getElementById('gameContainer');
const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const resetBtn = document.querySelector("#resetBtn");
const gameWidth = 16 * 100;   // Width for 16:9 aspect ratio
const gameHeight = 9 * 100;   // Height for 16:9 aspect ratio
const boardBackground = "forestgreen";
const paddle1Color = "lightblue";
const paddle2Color = "red";
const paddleBorder = "black";
const ballColor = "yellow";
const ballBorderColor = "black";
const ballRadius = 10;      // Adjusted for 9:16 aspect ratio
const paddleSpeed = 5;      // Adjusted for smoother movement
let intervalID;
let ballSpeed;
let ballX = gameWidth / 2;
let ballY = gameHeight / 2;
let ballXDirection = 0;
let ballYDirection = 0;
let player1Score = 0;
let player2Score = 0;
let paddle1 = {
    width: 25,                  // Adjusted for 9:16 aspect ratio
    height: 120,                // Adjusted for 9:16 aspect ratio
    x: 0,
    y: 0
};
let paddle2 = {
    width: 25,                  // Adjusted for 9:16 aspect ratio
    height: 120,                // Adjusted for 9:16 aspect ratio
    x: gameWidth - 25,
    y: gameHeight - 120
};
const keys = {};
const keys2 = {};
let gameRoom = null; // Add this variable

createBtn.addEventListener('click', () => {
    // Generate a random room number (6-digit)
    gameRoom = Math.floor(100000 + Math.random() * 900000);

    // Display the room number on the start page
    startPage.innerHTML = `<h1>Ping Pong Game</h1><p>Room Number: ${gameRoom}</p>`;
    
    // Hide the buttons and join form
    createBtn.style.display = 'none';
    joinBtn.style.display = 'none';
    joinForm.style.display = 'none';

    // Show the game container
    gameContainer.style.display = 'block';

    // Emit the room number to the server
    socket.emit('createRoom', { room: gameRoom });

    // Call your gameStart() function here to start the game
    gameStart();
});

joinBtn.addEventListener('click', () => {
    // Show the join form
    joinForm.style.display = 'block';
});

joinSubmitBtn.addEventListener('click', () => {
    const enteredRoomNumber = parseInt(roomNumberInput.value);
    if (enteredRoomNumber === gameRoom) {
        // Hide the start page and show the game container
        startPage.style.display = 'none';
        gameContainer.style.display = 'block';

        // Emit the join request to the server
        socket.emit('joinRoom', { room: gameRoom });

        // Call your gameStart() function here to start the game
        gameStart();
    } else {
        alert('Invalid room number. Please enter the correct room number.');
    }
});

// Add event listeners to track keydown and keyup events
window.addEventListener("keydown", (event) => {
    keys[event.keyCode] = true;
});

window.addEventListener("keyup", (event) => {
    delete keys[event.keyCode];
});

window.addEventListener("keydown", (event) => {
    keys2[event.keyCode] = true;
});

window.addEventListener("keyup", (event) => {
    delete keys2[event.keyCode];
});

resetBtn.addEventListener("click", resetGame);

gameStart();

function gameStart() {
    gameBoard.width = gameWidth;
    gameBoard.height = gameHeight;
    createBall();
    nextTick();
}

function movePaddles() {
    if (keys[87] && paddle1.y > 0) {
        paddle1.y -= paddleSpeed;
        socket.emit('movePaddle', { player: 1, y: paddle1.y });
    }
    if (keys[83] && paddle1.y < gameHeight - paddle1.height) {
        paddle1.y += paddleSpeed;
        socket.emit('movePaddle', { player: 1, y: paddle1.y });
    }
}

socket.on('paddleMoved', (data) => {
    if (data.player === 2) {
        paddle2.y = data.y;
    }
});

function nextTick() {
    intervalID = setTimeout(() => {
        clearBoard();
        movePaddles(); // Call the function to move the paddles
        drawPaddles();
        moveBall();
        drawBall(ballX, ballY);
        checkCollision();
        nextTick();
    }, 10);
}

function clearBoard() {
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameWidth, gameHeight);
}

function drawPaddles() {
    ctx.strokeStyle = paddleBorder;

    ctx.fillStyle = paddle1Color;
    ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    ctx.strokeRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);

    ctx.fillStyle = paddle2Color;
    ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
    ctx.strokeRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
}

function createBall() {
    ballSpeed = 1;
    if (Math.round(Math.random()) == 1) {
        ballXDirection = 1;
    } else {
        ballXDirection = -1;
    }
    if (Math.round(Math.random()) == 1) {
        ballYDirection = Math.random() * 1;
    } else {
        ballYDirection = Math.random() * -1;
    }
    ballX = gameWidth / 2;
    ballY = gameHeight / 2;
    drawBall(ballX, ballY);
}

function moveBall() {
    ballX += ballSpeed * ballXDirection;
    ballY += ballSpeed * ballYDirection;
}

function drawBall(ballX, ballY) {
    ctx.fillStyle = ballColor;
    ctx.strokeStyle = ballBorderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
}

function checkCollision() {
    if (ballY <= 0 + ballRadius) {
        ballYDirection *= -1;
    }
    if (ballY >= gameHeight - ballRadius) {
        ballYDirection *= -1;
    }
    if (ballX <= 0) {
        player2Score += 1;
        updateScore();
        createBall();
        return;
    }
    if (ballX >= gameWidth) {
        player1Score += 1;
        updateScore();
        createBall();
        return;
    }
    if (ballX <= paddle1.x + paddle1.width + ballRadius) {
        if (ballY > paddle1.y && ballY < paddle1.y + paddle1.height) {
            ballX = paddle1.x + paddle1.width + ballRadius;
            ballXDirection *= -1;
            ballSpeed += 1;
        }
    }
    if (ballX >= paddle2.x - ballRadius) {
        if (ballY > paddle2.y && ballY < paddle2.y + paddle2.height) {
            ballX = paddle2.x - ballRadius;
            ballXDirection *= -1;
            ballSpeed += 1;
        }
    }
}

function updateScore() {
    scoreText.textContent = `${player1Score} : ${player2Score}`;
}

function resetGame() {
    player1Score = 0;
    player2Score = 0;
    paddle1 = {
        width: 25,
        height: 120,
        x: 0,
        y: 0
    };
    paddle2 = {
        width: 25,
        height: 120,
        x: gameWidth - 25,
        y: gameHeight - 120
    };
    ballSpeed = 1;
    ballX = 0;
    ballY = 0;
    ballXDirection = 0;
    ballYDirection = 0;
    updateScore();
    clearInterval(intervalID);
    gameStart();
}
