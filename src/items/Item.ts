import { BodyPart } from "./BodyPart";
import { Suffix } from "./Suffix";

export class Item {
    private name: string;
    private attack: number;
    private defense: number;
    private readonly bodyPart: BodyPart;

    constructor(name: string, bodyPart: BodyPart, attack: number, defense: number) {
        this.name = name;
        this.bodyPart = bodyPart;
        this.attack = attack;
        this.defense = defense;
    }

    getBodyPart(): BodyPart {
        return this.bodyPart;
    }

    getDefense(): number {
        return this.defense;
    }

    getAttack(): number {
        return this.attack;
    }

    getName(): string {
        return this.name;
    }

    addSuffix(suffix: Suffix): void {
        if (suffix.name().charAt(0) !== ",") {
            this.name += " " + suffix.name();
        } else {
            this.name += suffix.name();
        }

        this.attack += suffix.attack();
        this.defense += suffix.defense();

        if (this.attack < 0) {
            this.attack = 0;
        }
        if (this.defense < 0) {
            this.defense = 0;
        }
    }

    toString(): string {
        return (
            "Item '" +
            this.name +
            " (" +
            this.bodyPart +
            ")': attack: " +
            this.attack +
            ", defense: " +
            this.defense
        );
    }
}
