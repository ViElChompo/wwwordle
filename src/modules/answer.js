// Lightweight logger replacement for browser (was using Vite createLogger)
const logger = {
  info: (...args) => console.info(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
  debug: (...args) => console.debug(...args),
};

export class Answer {
  constructor(rowIndex, game) {
    this.rowIndex = rowIndex;
    this.game = game;
    this.generateForm();
  }

  generateForm() {
    const board = document.querySelector(".board");
    const form = document.createElement("form");
    form.className = "row";
    form.id = `row-${this.rowIndex}`;
    form.setAttribute("inert", "");

    for (let i = 0; i < 5; i++) {
      const input = document.createElement("input");
      input.className = "letter";
      input.type = "text";
      input.name = `letter-${i}`;
      input.id = `row-${this.rowIndex}--${i}`;
      input.maxLength = "1";

      form.append(input);
    }

    const inputHidden = document.createElement("input");
    inputHidden.type = "submit";
    inputHidden.hidden = true;
    form.append(inputHidden);

    board.append(form);
    this.setUpEventListeners();
  }

  activate() {
    const targetElement = document.getElementById(`row-${this.rowIndex}`);
    targetElement.removeAttribute("inert");
  }

  deactivate() {
    const targetElement = document.getElementById(`row-${this.rowIndex}`);
    targetElement.setAttribute("inert", "");
  }

  focusFirstInput() {
    const firstInput = document.getElementById(`row-${this.rowIndex}--0`);
    firstInput.focus();
  }

  moveToNextInput(currentInput) {
    const rowInputs =
      currentInput.parentElement.querySelectorAll("input[type='text']");
    const currentIndex = Array.from(rowInputs).indexOf(currentInput);

    if (currentIndex < rowInputs.length - 1) {
      rowInputs[currentIndex + 1].focus();
    }
  }

  moveToLastInput(currentInput) {
    const rowInputs =
      currentInput.parentElement.querySelectorAll("input[type='text']");
    const currentIndex = Array.from(rowInputs).indexOf(currentInput);

    if (currentIndex > 0) {
      rowInputs[currentIndex - 1].focus();
    }
  }

  setUpEventListeners() {
    const inputs = document.querySelectorAll(
      `#row-${this.rowIndex} input[type='text']`
    );
    const message = document.querySelector(".message");

    // ✅ Event listener sur le form pour éviter le refresh
    const form = document.getElementById(`row-${this.rowIndex}`);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
    });

    inputs.forEach((input, index) => {
      input.addEventListener("keyup", (e) => {
        // ✅ Auto-navigation OU flèche droite
        if (this.isAlphaNumericKey(e.key) || e.key === "ArrowRight") {
          if (index < 4) {
            // Pas le dernier
            this.moveToNextInput(input);
          }
        }
        // ✅ Flèche gauche
        else if (e.key === "ArrowLeft") {
          this.moveToLastInput(input);
        }
        // ✅ Enter déclenche submit du form
        else if (e.key === "Enter") {
          e.preventDefault();
          this.submitLine();
        } else if (!this.isAlphaNumericKey) {
          message.innerText = "Veuillez insérer une lettre";
        } else if (e.key === "Backspace") {
          e.preventDefault();
          this.moveToLastInput(input);
        }
      });
    });
  }

  isAlphaNumericKey(key) {
    return /^([\x30-\x39]|[\x61-\x7a])$/i.test(key);
  }

  async submitLine() {
    const form = document.getElementById(`row-${this.rowIndex}`);
    const messagePlace = document.querySelector(".message");
    if (!form) {
      console.log("ERREUR: Form non trouvé !");
      return;
    }
    const formData = new FormData(form);
    const entries = Object.fromEntries(formData);

    const word = Object.values(entries).join("").toLowerCase();

    const requestBody = {
      guess: word,
    };

    const response = await fetch(
      "https://progweb-wwwordle-api.onrender.com/guess",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const result = await response.json();
    console.log(result);

    const allCorrect = result.feedback.every(
      (letterInfo) => letterInfo.status === "correct"
    );

    if (result.status === "invalid") {
      const message = result.message;
      setTimeout(() => {
        messagePlace.innerText = "";
      }, 3000);
      messagePlace.innerText = message;
    } else if (allCorrect) {
      this.colorizeInputs(result);
      this.deactivate();
      this.game.gameWon = true;
      messagePlace.innerText = "Congratulations! You found the word!";
      setTimeout(() => {
        messagePlace.innerText = "";
      }, 3000);
    } else {
      this.colorizeInputs(result);
      this.game.goToNextAttempt();
    }
  }

  async colorizeInputs(result) {
    result.feedback.forEach((letterInfo, index) => {
      const lettre = document.getElementById(`row-${this.rowIndex}--${index}`);

      if (lettre) {
        lettre.classList.remove("absent", "present", "correct");
        lettre.classList.add(letterInfo.status);
      }
      console.log(
        `Lettre ${index}: ${letterInfo.letter} - ${letterInfo.status}`
      );
    });
  }
}
