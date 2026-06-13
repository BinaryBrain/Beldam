export class Suffix {
    private readonly _name: string;
    private readonly _attack: number;
    private readonly _defense: number;

    constructor(name: string, attack: number, defense: number) {
        this._name = name;
        this._attack = attack;
        this._defense = defense;
    }

    name(): string {
        return this._name;
    }

    attack(): number {
        return this._attack;
    }

    defense(): number {
        return this._defense;
    }
}
