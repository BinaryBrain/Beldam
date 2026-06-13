import { GameManager } from "../../../server/GameManager";
import { UIDrawContainer } from "../UIDrawContainer";
import { UIElement } from "../UIElement";

export class Companions extends UIElement {
    constructor(posX: number, posY: number) {
        super(posX, posY);
        this.update();
    }

    update(): void {
        this.ascii = [];

        this.ascii.push("+------------+");
        this.ascii.push("| Companions |");
        this.ascii.push("+------------+");

        for (const c of GameManager.getInstance().getPlayers()) {
            let name = c.getName();
            const nameLength = 8;

            if (name.length > nameLength) {
                name = name.substring(0, nameLength);
            } else {
                while (name.length !== nameLength) {
                    name += " ";
                }
            }

            this.ascii.push("| " + name + " " + c.getSymbol() + " |");
        }

        this.ascii.push("+------------+");
    }

    override visit(screen: UIDrawContainer): void {
        screen.drawOver(this.toAscii(), this.posX, this.posY);
    }
}
