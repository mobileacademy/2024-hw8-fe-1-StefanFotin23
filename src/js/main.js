import { MatchConfig } from './MatchConfig.js';
import { Match } from './Match.js';

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
