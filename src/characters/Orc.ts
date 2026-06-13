import { Character } from "./Character";

export class Orc extends Character {
    constructor(name: string, symbol: string) {
        super(name, symbol);
        this.strength += 30;
    }

    levelUp(): void {
        this.strength += 20;
        this.hp += 10;
        this.physicalDefence += 20;
    }
}
