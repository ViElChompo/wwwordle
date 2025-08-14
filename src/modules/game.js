import { Answer } from "./answer.js";

export class Game {
  constructor(nbrAttempts) {
    this.nbrAttempts = nbrAttempts;
    this.answers = [];
    this.currentAttempt = 0;

    for (let i = 0; i < this.nbrAttempts; i++) {
      this.answers.push(new Answer(i, this));
    }

    this.initializeGame();
  }

  initializeGame() {
    console.log("=== INITIALISATION GAME ===");
    console.log("Nombre de tentatives:", this.nbrAttempts);

    for (let i = 1; i < this.nbrAttempts; i++) {
      console.log("Désactivation ligne:", i);
      this.answers[i].deactivate();
    }

    console.log("Activation ligne 0");
    this.answers[0].activate();
    this.answers[0].focusFirstInput();

    console.log("Game initialisé !");
  }

  goToNextAttempt() {
    this.answers[this.currentAttempt].deactivate();

    this.currentAttempt++;

    if (this.currentAttempt < this.nbrAttempts) {
      this.answers[this.currentAttempt].activate();
      this.answers[this.currentAttempt].focusFirstInput();
    } else {
      console.log("Game Over!");
    }
  }
}
