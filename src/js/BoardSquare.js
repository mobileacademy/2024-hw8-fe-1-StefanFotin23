export class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb; // True if this square contains a bomb
        this.bombsAround = bombsAround; // Number of bombs around this square
    }
}