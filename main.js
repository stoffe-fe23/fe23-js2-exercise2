
import { Dice } from './modules/Dice.js';
import { Account } from './modules/Account.js';
import { Members, Member } from './modules/Members.js';
import * as StoffeUtils from './modules/stoffe-utilities.js';

const myAccount = new Account('spara', 3000);
const memberList = new Members("Medlemmar");


StoffeUtils.setEventListener('#roll-dice', 'click', (event) => {
    const outputBox = document.querySelector("#output-dice");
    const myDice = new Dice(20);
    outputBox.innerHTML += `<br>Dice value is: ${myDice.roll()}`;
});

StoffeUtils.setEventListener('#account-form', 'submit', (event) => {
    event.preventDefault();
    const outputBox = document.querySelector("#output-account");
    const inputBox = document.querySelector("#account-diff");

    if (event.submitter.id == "account-deposit") {
        myAccount.deposit(inputBox.value.trim());
    }
    else if (event.submitter.id == "account-withdraw") {
        myAccount.withdraw(inputBox.value.trim());
    }

    outputBox.innerHTML += `<br>Dice value is: ${myAccount.getBalance()}`;
});

StoffeUtils.setEventListener('#members-form', 'submit', (event) => {
    event.preventDefault();
    const outputBox = document.querySelector("#output-members");
    const inputName = document.querySelector("#member-name");
    const inputRole = document.querySelector("#member-role");

    memberList.addMember(new Member(inputName.value.trim(), inputRole.value.trim()));

    outputBox.innerHTML = "";
    memberList.showMembers(outputBox);
});


/* DICE */
createDice("#container-dice-2");
createDice("#container-dice-2");
createDice("#container-dice-2");

function createDice(parentContainerSelector) {
    const diceObj = new Dice();
    const targetContainer = document.querySelector(parentContainerSelector);
    const diceWrapper = document.createElement("div");
    const diceContainer = document.createElement("div");
    const freezeButton = document.createElement("button");
    let diceElement = diceObj.render();

    diceWrapper.classList.add("dice-wrapper");
    diceContainer.classList.add("no-dice");

    freezeButton.innerText = "Freeze";
    diceContainer.append(diceElement);
    diceWrapper.append(diceContainer, freezeButton);
    targetContainer.appendChild(diceWrapper);
    freezeButton.addEventListener("click", (event) => {
        if (diceObj.frozen) {
            diceObj.unfreeze();
            freezeButton.innerText = "Freeze";
        }
        else {
            diceObj.freeze();
            freezeButton.innerText = "Unreeze";
        }
    });
    diceContainer.addEventListener("click", (event) => {
        console.log("ROLL!");
        diceObj.roll();
        diceElement.remove();
        diceElement = diceObj.render();
        diceContainer.prepend(diceElement);
    });
}
