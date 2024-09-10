import { Game } from './Game.js';

export class Match {
    constructor(config, difficultySettings) {
        this.config = config;
        this.difficultySettings = difficultySettings;
        this.currentGame = null;
        this.winCount = 0;
        this.lossCount = 0;
    }

    startNewGame() {
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