import { Character } from "../../../characters/Character";
import { UIDrawContainer } from "../UIDrawContainer";
import { UIElement } from "../UIElement";

export class Stats extends UIElement {
    constructor(posX: number, posY: number) {
        super(posX, posY);
    }

    update(player: Character): void {
        this.ascii = [];

        this.ascii.push("+-------------------------+");
        this.ascii.push("|       Statistics        |");
        this.ascii.push("+-------------------------+");

        this.ascii.push("|                         ");
        this.ascii.push("| " + this.addPadding("Health Points: " + player.getHp(), 23));
        this.ascii.push("| " + this.addPadding("Level: " + player.getLevel(), 23));
        this.ascii.push("| " + this.addPadding("Experience: " + player.getXp(), 23));
        this.ascii.push("| " + this.addPadding("Strength: " + player.getStrength(), 23));
        this.ascii.push("| " + this.addPadding("Intelligence: " + player.getIntelligence(), 23));
        this.ascii.push("| " + this.addPadding("Defence: " + player.getPhysicalDefence(), 23));
        this.ascii.push("|                         ");
        this.ascii.push("|                         ");
        this.ascii.push("|                         ");
        this.ascii.push("|                         ");
        this.ascii.push("|                         ");
        this.ascii.push("+-------------------------+");
    }

    private addPadding(str: string, length: number): string {
        let padding = "";
        for (let i = str.length; i < length; i++) {
            padding += " ";
        }
        return str + padding;
    }

    override visit(screen: UIDrawContainer): void {
        screen.drawOver(this.toAscii(), this.posX, this.posY);
    }
}
