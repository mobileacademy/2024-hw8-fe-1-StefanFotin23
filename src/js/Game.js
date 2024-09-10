import { BoardSquare } from './BoardSquare.js';

export class Game {
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
        this.maxFlagsAllowed = this.size;
        this.totalFlags = 0;
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
                if (Math.random() * 100 < this.bombProbability) {
                    this.board[i][j].hasBomb = true;
                    this.bombCount++;
                    console.log("M[" + i + "][" + j + "] has bomb, total bombs = " + this.bombCount);
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
        if (this.totalFlags >= this.maxFlagsAllowed || this.gameOver) {
            return;
        }

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