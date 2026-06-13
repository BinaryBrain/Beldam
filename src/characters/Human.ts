import { Character } from "./Character";

export class Human extends Character {
    constructor(name: string, symbol: string) {
        super(name, symbol);
        this.hp += 40;
    }

    levelUp(): void {
        this.hp += 20;
    }
}
