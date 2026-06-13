import { BodyPart } from "../items/BodyPart";
import { Item } from "../items/Item";
import { Monster } from "../monsters/Monster";

export abstract class Character {
    static readonly XPtoLevel = 100;
    private static readonly LIFE = 100;
    private static readonly STRENGTH = 10;
    private static readonly INTELLIGENCE = 10;
    private static readonly PHYSICAL_DEFENCE = 10;
    private static readonly MAGICAL_DEFENCE = 10;

    private level: number;
    private xp: number;
    private name: string;
    private symbol: string;
    protected hp: number;
    private dead: boolean;
    protected strength: number;
    protected intelligence: number;
    protected physicalDefence: number;
    protected magicalDefence: number;

    private readonly items: Item[];

    protected constructor(name: string, symbol: string) {
        this.name = name;
        this.symbol = symbol;
        this.dead = false;
        this.xp = 0;
        this.items = [];
        this.hp = Character.LIFE;
        this.strength = Character.STRENGTH;
        this.intelligence = Character.INTELLIGENCE;
        this.physicalDefence = Character.PHYSICAL_DEFENCE;
        this.magicalDefence = Character.MAGICAL_DEFENCE;
        this.level = 1;
    }

    abstract levelUp(): void;

    getXp(): number {
        return this.xp;
    }

    setXp(xp: number): void {
        this.xp = xp;
    }

    getLevel(): number {
        return this.level;
    }

    setLevel(level: number): void {
        this.level = level;
    }

    setDead(dead: boolean): void {
        this.dead = dead;
    }

    getMagicalDefence(): number {
        return this.magicalDefence;
    }

    setMagicalDefence(magicalDefence: number): void {
        this.magicalDefence = magicalDefence;
    }

    getPhysicalDefence(): number {
        return this.physicalDefence;
    }

    setPhysicalDefence(physicalDefence: number): void {
        this.physicalDefence = physicalDefence;
    }

    getHp(): number {
        return this.hp;
    }

    setHp(hp: number): void {
        this.hp = hp;
    }

    getName(): string {
        return this.name;
    }

    setName(name: string): void {
        this.name = name;
    }

    getAvatar(): string {
        return this.symbol;
    }

    getStrength(): number {
        let str = this.strength;
        for (const i of this.items) {
            str += i.getAttack();
        }
        return str;
    }

    setStrength(strength: number): void {
        this.strength = strength;
    }

    getSymbol(): string {
        return this.symbol;
    }

    setSymbol(symbol: string): void {
        this.symbol = symbol;
    }

    getIntelligence(): number {
        return this.intelligence;
    }

    setIntelligence(intelligence: number): void {
        this.intelligence = intelligence;
    }

    addItem(newItem: Item): void {
        const newPart = newItem.getBodyPart();

        // Check if the slot is empty so the character can carry the new item
        for (const item of this.items) {
            const usedPart = item.getBodyPart();
            if (
                newPart === usedPart ||
                ((newPart === BodyPart.RIGHT_HAND || newPart === BodyPart.LEFT_HAND) &&
                    usedPart === BodyPart.BOTH_HANDS) ||
                ((usedPart === BodyPart.RIGHT_HAND || usedPart === BodyPart.LEFT_HAND) &&
                    newPart === BodyPart.BOTH_HANDS)
            ) {
                // TODO Send error to the player (Slot already used)
                console.log("Slot '" + newPart + "' already used by " + item.toString());
            }
        }

        this.items.push(newItem);
        this.hp += newItem.getDefense();
    }

    getItems(): Item[] {
        return this.items;
    }

    takeDmg(dmg: number): void {
        this.hp -= dmg;

        if (this.hp <= 0) {
            this.hp = 0;
        }

        if (this.hp === 0) {
            this.dead = true;
        }
    }

    attack(monster: Monster): void {
        if (!this.isDead()) {
            if (!monster.isDead()) {
                monster.takeDmg(this.getStrength());
                if (monster.isDead()) {
                    this.setXp(5);
                }
            } else {
                console.log("Your Ennemi is dead");
            }
        } else {
            console.log("you are dead");
        }
    }

    magicAttack(character: Monster): void {
        if (!this.isDead()) {
            if (!character.isDead()) {
                // character.takeMagicDmg(getStrength());
                if (character.isDead()) {
                    console.log("setXP");
                }
            } else {
                console.log("Your Ennemi is dead");
            }
        } else {
            console.log("you are dead");
        }
    }

    hasItem(part: BodyPart): boolean {
        for (const item of this.items) {
            if (item.getBodyPart() === part) {
                return true;
            }
        }
        return false;
    }

    toString(): string {
        return (
            this.name + ": hp[" + this.hp + "], Strength[" + this.strength + "], Symbol[" + this.symbol + "]"
        );
    }

    isDead(): boolean {
        return this.dead;
    }
}
