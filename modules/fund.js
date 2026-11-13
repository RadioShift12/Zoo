export class ValueError extends Error {
    constructor(message) {
        super(message);
        this.name = "ValueError";
    }
}

export class AnimalFund {
    #balance;
    #open;

    constructor(initialBalance = 0) {
        if (!Number.isFinite(initialBalance) || initialBalance < 0) {
            throw new ValueError("Initial balance must be zero or more.");
        }
        this.#balance = initialBalance;
        this.#open = true;
    }

    get balance() { return this.#balance; }
    get isOpen() { return this.#open; }

    open() { this.#open = true; }
    close() { this.#open = false; }

    #checkAmount(amount) {
        if (!this.#open) throw new ValueError("This fund is closed.");
        if (typeof amount !== "number" || !Number.isFinite(amount)) {
            throw new ValueError("Amount must be a number.");
        }
        if (amount <= 0) throw new ValueError("Amount must be greater than zero.");
    }

    deposit(amount) {
        this.#checkAmount(amount);
        this.#balance = Math.round((this.#balance + amount) * 100) / 100;
        return this.#balance;
    }

    withdraw(amount, isAdmin = false) {
        if (!isAdmin) throw new ValueError("Only admins can spend from a fund.");
        this.#checkAmount(amount);
        if (amount > this.#balance) throw new ValueError("Insufficient funds.");
        this.#balance = Math.round((this.#balance - amount) * 100) / 100;
        return this.#balance;
    }
}