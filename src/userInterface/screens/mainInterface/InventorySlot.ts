import { UIDrawContainer } from "../UIDrawContainer";
import { UIElement } from "../UIElement";

export class InventorySlot extends UIElement {
    constructor(posX: number, posY: number) {
        super(posX, posY);
    }

    set(filename: string): void {
        this.fromFile("assets/inventory/" + filename);
    }

    empty(): void {
        this.fromFile("assets/inventory/empty.txt");
    }

    disable(): void {
        this.fromFile("assets/inventory/disable.txt");
    }

    override visit(inventory: UIDrawContainer): void {
        inventory.drawOver(this.toAscii(), this.posX, this.posY);
    }
}
