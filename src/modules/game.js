import { Answer } from "./answer.js";

export class Game {
  constructor(nbrAttempts) {
    this.nbrAttempts = nbrAttempts;
    this.answers = [];
    this.currentAttempt = 0;
    this.gameWon = false;

    for (let i = 0; i < this.nbrAttempts; i++) {
      this.answers.push(new Answer(i, this));
    }

    this.initializeGame();
  }

  initializeGame() {
    for (let i = 1; i < this.nbrAttempts; i++) {
      console.log("Désactivation ligne:", i);
      this.answers[i].deactivate();
    }

    console.log("Activation ligne 0");
    this.answers[0].activate();
    this.answers[0].focusFirstInput();
  }

  goToNextAttempt() {
    const messagePlace = document.querySelector(".message");
    this.answers[this.currentAttempt].deactivate();

    this.currentAttempt++;

    if (this.currentAttempt < this.nbrAttempts) {
      this.answers[this.currentAttempt].activate();
      this.answers[this.currentAttempt].focusFirstInput();
    } else if (this.gameWon) {
      this.answers[this.currentAttempt].deactivate();
      this.currentAttempt++;
    } else if (this.currentAttempt >= this.nbrAttempts) {
      messagePlace.innerText = "Game Over!";
      setTimeout(() => {
        messagePlace.innerText = "";
      }, 3000);
    }
  }
}
