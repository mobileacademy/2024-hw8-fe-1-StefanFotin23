class MatchConfig {
    constructor(difficulty, bombProbability, lives) {
        this.difficulty = difficulty;
        this.bombProbability = bombProbability;
        this.lives = lives;
    }
}

class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb; // True if this square contains a bomb
        this.bombsAround = bombsAround; // Number of bombs around this square
    }
}

class Game {
    constructor(config, difficultySettings) {
        this.board = [];
        this.bombCount = 0;
        this.squaresLeft = 0;
        this.openedSquares = [];
        this.flaggedSquares = [];
        this.bombProbability = config.bombProbability;
        this.lives = config.lives;
        this.currentLives = config.lives;
        this.size = difficultySettings[config.difficulty].size;
        this.gameOver = false;

        this.generateBoard();
    }

    generateBoard() {
        this.board = [];
        this.bombCount = 0;
        this.squaresLeft = this.size * this.size;
        for (let i = 0; i < this.size; i++) {
            this.board[i] = new Array(this.size);
            for (let j = 0; j < this.size; j++) {
                this.board[i][j] = new BoardSquare(false, 0);
            }
        }
        this.placeBombs();
        this.countBombsAround();
    }

    placeBombs() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (Math.random() < this.bombProbability / 100) {
                    this.board[i][j].hasBomb = true;
                    this.bombCount++;
                }
            }
        }
    }

    countBombsAround() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (!this.board[i][j].hasBomb) {
                    let bombsAround = 0;
                    for (let x = Math.max(0, i - 1); x <= Math.min(i + 1, this.size - 1); x++) {
                        for (let y = Math.max(0, j - 1); y <= Math.min(j + 1, this.size - 1); y++) {
                            if (this.board[x][y].hasBomb) bombsAround++;
                        }
                    }
                    this.board[i][j].bombsAround = bombsAround;
                }
            }
        }
    }

    discoverTile(x, y) {
        if (this.gameOver) return;

        const tile = document.getElementById(`tile-${x}-${y}`);
        if (this.board[x][y].hasBomb) {
            tile.className = "col-auto border tile tile-bomb";
            tile.innerHTML = "💣"; // Bomb
            this.currentLives--;

            console.log(this.currentLives);

            if (this.currentLives > 0) {
                this.updateLivesDisplay();
            } else {
                this.gameOver = true;
                this.updateLivesDisplay();
                alert("Game Over! You ran out of lives.");
                return "loss";
            }
        } else {
            tile.className = "col-auto border tile tile-open";
            tile.innerHTML = this.board[x][y].bombsAround > 0 ? this.board[x][y].bombsAround : "";
            this.openedSquares.push(`${x},${y}`);
            this.squaresLeft--;

            if (this.board[x][y].bombsAround === 0) {
                this.openAdjacent(x, y);
            }
            if (this.squaresLeft === this.bombCount) {
                this.gameOver = true;
                alert("You won!");
                return "win";
            }
        }
    }

    flagTile(x, y) {
        if (this.gameOver) return;

        const tile = document.getElementById(`tile-${x}-${y}`);
        if (!this.flaggedSquares.includes(`${x},${y}`)) {
            this.flaggedSquares.push(`${x},${y}`);
            tile.className = "col-auto border tile tile-flagged";
            tile.innerHTML = "🚩"; // Flag
        } else {
            this.flaggedSquares = this.flaggedSquares.filter((pos) => pos !== `${x},${y}`);
            tile.className = "col-auto border tile tile-closed";
            tile.innerHTML = "";
        }
    }

    openAdjacent(x, y) {
        for (let i = Math.max(0, x - 1); i <= Math.min(x + 1, this.size - 1); i++) {
            for (let j = Math.max(0, y - 1); j <= Math.min(j + 1, this.size - 1); j++) {
                if (!this.openedSquares.includes(`${i},${j}`)) {
                    this.discoverTile(i, j);
                }
            }
        }
    }

    updateLivesDisplay() {
        const livesImageDiv = document.getElementById("livesImage");
        livesImageDiv.innerHTML = ""; // Clear previous lives display
        const hearts = "❤️".repeat(this.currentLives);
        livesImageDiv.textContent = hearts; // Display hearts based on currentLives
        livesImageDiv.classList.add("big-hearts"); // Add class for styling
    }
}

class Match {
    constructor(config, difficultySettings) {
        this.config = config;
        this.difficultySettings = difficultySettings;
        this.currentGame = null;
        this.winCount = 0;
        this.lossCount = 0;
    }

    startNewGame() {
        if (this.winCount + this.lossCount > 0) {
            alert("New Game Started! Good Luck!");
        }

        this.currentGame = new Game(this.config, this.difficultySettings);
        this.renderBoardUI();
        document.getElementById("new-game").style.display = "block"; // Show New Game button
    }

    renderBoardUI() {
        const gameBoardDiv = document.getElementById("game-board");
        gameBoardDiv.innerHTML = ""; // Clear previous board

        for (let i = 0; i < this.currentGame.size; i++) {
            let rowDiv = document.createElement("div");
            rowDiv.className = "row justify-content-center";
            for (let j = 0; j < this.currentGame.size; j++) {
                let tile = document.createElement("div");
                tile.className = "col-auto border tile tile-closed";
                tile.id = `tile-${i}-${j}`;
                tile.addEventListener("click", () => this.discoverTile(i, j));
                tile.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    this.flagTile(i, j);
                });
                rowDiv.appendChild(tile);
            }
            gameBoardDiv.appendChild(rowDiv);
        }
        this.currentGame.updateLivesDisplay(); // Initial update of lives display
    }

    discoverTile(x, y) {
        const result = this.currentGame.discoverTile(x, y);
        if (result === "win") {
            this.winCount++;
            document.getElementById("win-count").textContent = this.winCount;
        } else if (result === "loss") {
            this.lossCount++;
            document.getElementById("loss-count").textContent = this.lossCount;
        }
    }

    flagTile(x, y) {
        this.currentGame.flagTile(x, y);
    }
}

// Main game logic
const difficultySettings = {
    easy: { size: 5 },
    medium: { size: 9 },
    expert: { size: 16 }
};

let match = null;

function startMatch() {
    alert("New Match Started! Let's See Who Wins!");
    const difficulty = document.getElementById("difficulty").value;
    const bombProbability = parseInt(document.getElementById("bombProbability").value);
    const lives = parseInt(document.getElementById("lives").value);

    const config = new MatchConfig(difficulty, bombProbability, lives);
    match = new Match(config, difficultySettings);

    document.getElementById("new-match").textContent = "Start New Match";
    match.startNewGame();
}

function resetMatch() {
    match = null;
    document.getElementById("new-game").style.display = "none"; // Hide New Game button
    document.getElementById("new-match").textContent = "Start New Match";
    document.getElementById("win-count").textContent = "0";
    document.getElementById("loss-count").textContent = "0";
    document.getElementById("game-board").innerHTML = "";
    document.getElementById("livesImage").innerHTML = ""; // Clear lives display
}

document.getElementById("new-game").style.display = "none"; // Hide New Game button initially

document.getElementById("new-match").addEventListener("click", startMatch);
document.getElementById("new-game").addEventListener("click", () => {
    if (match !== null) {
        match.startNewGame();
    }
});

// Initialize game
document.getElementById("win-count").textContent = "0";
document.getElementById("loss-count").textContent = "0";
