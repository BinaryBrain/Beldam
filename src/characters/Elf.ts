import { Character } from "./Character";

export class Elf extends Character {
    constructor(name: string, symbol: string) {
        super(name, symbol);
        this.setHp(this.getHp() - 20);
        this.setIntelligence(this.getIntelligence() + 40);
    }

    levelUp(): void {
        this.hp += 15;
        this.intelligence += 10;
    }
}
