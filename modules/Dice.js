
class Dice {
    #sides = 6;
    #current = 1;
    #frozen = false;

    constructor(diceSides = 6) {
        this.#sides = diceSides;
        this.#current = 1;
    }

    roll() {
        if (!this.#frozen) {
            this.#current = Math.floor((Math.random() * this.#sides)) + 1;
        }
        return this.#current;
    }

    freeze() {
        this.#frozen = true;
    }

    unfreeze() {
        this.#frozen = false;
    }

    get frozen() {
        return this.#frozen;
    }

    build() {
        const diceElement = document.createElement("div");
        diceElement.classList.add("die");
        diceElement.classList.add(this.#getDiceClass());
        for (let i = 0; i < this.#current; i++) {
            const dotElement = document.createElement("div");
            diceElement.appendChild(dotElement);
        }
        return diceElement;
    }

    #getDiceClass() {
        switch (this.#current) {
            case 1: return "one";
            case 2: return "two";
            case 3: return "three";
            case 4: return "four";
            case 5: return "five";
            case 6: return "six";
        }
        return "";
    }
}


export { Dice };