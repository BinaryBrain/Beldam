// Typed errors mirroring the checked exceptions of the original Java code,
// so the command dispatch logic can branch on them exactly as before.

/** Thrown when a player tries to move in a direction with no adjacent room. */
export class IllegalMoveException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "IllegalMoveException";
    }
}

/** Thrown when a command targets an item or monster id that does not exist. */
export class IllegalTargetException extends Error {
    constructor(message = "") {
        super(message);
        this.name = "IllegalTargetException";
    }
}

/** Mirrors java.lang.IllegalArgumentException (e.g. unknown command / enum value). */
export class IllegalArgumentException extends Error {
    constructor(message = "") {
        super(message);
        this.name = "IllegalArgumentException";
    }
}
