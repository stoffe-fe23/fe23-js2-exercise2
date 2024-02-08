
class Account {
    #balance = 0;
    #name = 'No name';
    //     somethingPublic = "This is a public property";

    constructor(accountName, balance) {
        this.#name = accountName;
        this.#balance = balance;
        if (new.target === Account) {
            console.log("Parent Seal!", this.#name);
            Object.seal(this);
        }
    }

    deposit(amount) {
        this.#balance += parseInt(amount);
    }

    withdraw(amount) {
        this.#balance -= parseInt(amount);
    }

    getBalance() {
        return this.#balance;
    }

    get accountname() {
        return this.#name;
    }

    clone(testParam) {
        let clone = new Account(this.#name, this.#balance);
        clone.#name = "TESTAR " + this.#name;
        console.log("CLONE ACCOUNT", testParam);
        return clone;
    }
}

class PrivateAccount extends Account {
    #holderName;

    constructor(accountName, balance, holderName) {
        super(accountName, balance);
        this.#holderName = holderName;

        if (new.target === PrivateAccount) {
            console.log("Child Seal!", this.accountname);
            Object.seal(this);
        }
    }

    get holder() {
        return this.#holderName;
    }

    set holder(name) {
        this.#holderName = name;
    }

    clone(testParam) {
        let clone = new PrivateAccount(this.accountname, this.getBalance(), this.#holderName);
        clone.#holderName = "TEST " + this.#holderName;
        console.log("CLONE PERSONALACCOUNT", testParam);
        return clone;
    }
}


export { Account, PrivateAccount };