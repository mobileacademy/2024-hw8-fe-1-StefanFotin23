let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;
let bombProbability = 10; // Default value for bomb probability
let lives = 1; // Default value for lives

let difficultySettings = {
    easy: { size: 5 },
    medium: { size: 9 },
    expert: { size: 16 }
};

let currentSettings = { ...difficultySettings.easy }; // Default to easy

function minesweeperGameBootstrapper() {
    generateBoardWithUI(currentSettings);
}

function generateBoard(boardMetadata) {
    board = [];
    bombCount = 0;
    squaresLeft = boardMetadata.size * boardMetadata.size;
    for (let i = 0; i < boardMetadata.size; i++) {
        board[i] = new Array(boardMetadata.size);
        for (let j = 0; j < boardMetadata.size; j++) {
            board[i][j] = new BoardSquare(false, 0);
        }
    }
    placeBombs(boardMetadata);
    countBombsAround();
}

function placeBombs(boardMetadata) {
    for (let i = 0; i < boardMetadata.size; i++) {
        for (let j = 0; j < boardMetadata.size; j++) {
            if (Math.random() < bombProbability / 100) {
                board[i][j].hasBomb = true;
                bombCount++;
            }
        }
    }
}

function countBombsAround() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (!board[i][j].hasBomb) {
                let bombsAround = 0;
                for (let x = Math.max(0, i - 1); x <= Math.min(i + 1, board.length - 1); x++) {
                    for (let y = Math.max(0, j - 1); y <= Math.min(j + 1, board[i].length - 1); y++) {
                        if (board[x][y].hasBomb) bombsAround++;
                    }
                }
                board[i][j].bombsAround = bombsAround;
            }
        }
    }
}

class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb;
        this.bombsAround = bombsAround;
    }
}

function renderBoardUI(boardMetadata) {
    const gameBoardDiv = document.getElementById("game-board");
    gameBoardDiv.innerHTML = ""; // Clear previous board
    for (let i = 0; i < boardMetadata.size; i++) {
        let rowDiv = document.createElement("div");
        rowDiv.className = "row justify-content-center";
        for (let j = 0; j < boardMetadata.size; j++) {
            let tile = document.createElement("div");
            tile.className = "col-auto border tile tile-closed";
            tile.id = `tile-${i}-${j}`;
            tile.addEventListener("click", () => discoverTile(i, j));
            tile.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                flagTile(i, j);
            });
            rowDiv.appendChild(tile);
        }
        gameBoardDiv.appendChild(rowDiv);
    }
}

function generateBoardWithUI(boardMetadata) {
    generateBoard(boardMetadata);
    renderBoardUI(boardMetadata);
}

function discoverTile(x, y) {
    if (gameOver) return;

    const tile = document.getElementById(`tile-${x}-${y}`);
    if (board[x][y].hasBomb) {
        tile.className = "col-auto border tile tile-bomb";
        tile.innerHTML = "💣"; // Bomb
        gameOver = true;
        setTimeout(() => {
            alert("Game Over! You hit a bomb.");
            updateStatistics('loss');
        }, 200); // Delay to allow DOM update
    } else {
        tile.className = "col-auto border tile tile-open";
        tile.innerHTML = board[x][y].bombsAround > 0 ? board[x][y].bombsAround : "";
        openedSquares.push(`${x},${y}`);
        squaresLeft--;
        if (board[x][y].bombsAround === 0) {
            openAdjacent(x, y);
        }
        checkGameStatus();
    }
}

function flagTile(x, y) {
    if (gameOver) return;

    const tile = document.getElementById(`tile-${x}-${y}`);
    if (!flaggedSquares.includes(`${x},${y}`)) {
        flaggedSquares.push(`${x},${y}`);
        tile.className = "col-auto border tile tile-flagged";
        tile.innerHTML = "🚩"; // Flag
    } else {
        flaggedSquares = flaggedSquares.filter((pos) => pos !== `${x},${y}`);
        tile.className = "col-auto border tile tile-closed";
        tile.innerHTML = "";
    }
}

function openAdjacent(x, y) {
    for (let i = Math.max(0, x - 1); i <= Math.min(x + 1, board.length - 1); i++) {
        for (let j = Math.max(0, y - 1); j <= Math.min(y + 1, board[i].length - 1); j++) {
            if (!openedSquares.includes(`${i},${j}`)) {
                discoverTile(i, j);
            }
        }
    }
}

function checkGameStatus() {
    if (squaresLeft === bombCount) {
        gameOver = true;
        alert("You won!");
        updateStatistics('win');
    }
}

function updateStatistics(result) {
    if (result === 'win') {
        winCount++;
        document.getElementById("win-count").textContent = winCount;
    } else if (result === 'loss') {
        lossCount++;
        document.getElementById("loss-count").textContent = lossCount;
    }
}

function resetMatch() {
    document.getElementById("difficulty").value = "easy";
    document.getElementById("bombProbability").value = "10";
    document.getElementById("lives").value = "1";
    currentSettings = { ...difficultySettings.easy };
    generateBoardWithUI(currentSettings);
    winCount = 0;
    lossCount = 0;
    document.getElementById("win-count").textContent = winCount;
    document.getElementById("loss-count").textContent = lossCount;
}

let gameOver = false;
let winCount = 0;
let lossCount = 0;

document.getElementById("difficulty").addEventListener("change", (e) => {
    const difficulty = e.target.value;
    currentSettings = difficultySettings[difficulty];
    generateBoardWithUI(currentSettings);
});

document.getElementById("reset").addEventListener("click", () => {
    if (gameOver) {
        generateBoardWithUI(currentSettings);
        gameOver = false;
    } else {
        resetMatch();
    }
});

document.getElementById("bombProbability").addEventListener("change", (e) => {
    bombProbability = parseInt(e.target.value);
});

document.getElementById("lives").addEventListener("change", (e) => {
    lives = parseInt(e.target.value);
});

// Initialize game with default settings
minesweeperGameBootstrapper();
