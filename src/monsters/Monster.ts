import { Character } from "../characters/Character";
import { Item } from "../items/Item";
import { ItemManager } from "../items/ItemManager";

export abstract class Monster {
    protected hp: number;
    private readonly level: number;
    private readonly strength: number;
    protected items: Item[];
    protected itemManager: ItemManager;

    protected constructor(level: number, strength: number, hp: number) {
        this.hp = hp;
        this.strength = strength;
        this.level = level;
        this.itemManager = new ItemManager();
        this.items = [];
    }

    /** Equivalent to Class#getSimpleName() used for combat messages. */
    typeName(): string {
        return this.constructor.name;
    }

    getHp(): number {
        return this.hp;
    }

    takeDmg(dmg: number): void {
        let dmgTaken = dmg;

        if (dmgTaken <= 0) {
            dmgTaken = 0;
        }

        this.hp = this.hp - dmgTaken;

        if (this.hp <= 0) {
            this.hp = 0;
        }
    }

    attack(character: Character): void {
        let str = this.strength;
        for (const item of this.items) {
            str += item.getAttack();
        }
        character.takeDmg(str);
    }

    dropItems(): Item[] {
        return this.items;
    }

    isDead(): boolean {
        return this.hp === 0;
    }

    protected addItem(newItem: Item): void {
        this.items.push(newItem);
    }

    toString(): string {
        return (
            "level: " + this.level + ", life: " + this.hp + ", strength: " + this.strength + "\r\n" + this.toStringItems()
        );
    }

    protected toStringItems(): string {
        let tmp = "";
        for (const item of this.items) {
            tmp += item.toString() + "\r\n";
        }
        return tmp;
    }
}
