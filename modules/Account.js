
class Account {
    balance = 0;
    name = 'No name';

    constructor(accountName, balance) {
        this.name = accountName;
        this.balance = balance;
    }

    deposit(amount) {
        this.balance += parseInt(amount);
    }

    withdraw(amount) {
        this.balance -= parseInt(amount);
    }

    getBalance() {
        return this.balance;
    }
}

export { Account };