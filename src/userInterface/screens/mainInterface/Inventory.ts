import { BodyPart } from "../../../items/BodyPart";
import { overlayBlock, UIDrawContainer } from "../UIDrawContainer";
import { UIElement } from "../UIElement";
import { InventorySlot } from "./InventorySlot";

export class Inventory extends UIElement implements UIDrawContainer {
    private readonly slot: InventorySlot[] = [];

    constructor(posX: number, posY: number) {
        super("assets/panels/inventory.txt", posX, posY);

        this.slot[0] = new InventorySlot(3, 7);
        this.slot[1] = new InventorySlot(11, 2);
        this.slot[2] = new InventorySlot(19, 7);
        this.slot[3] = new InventorySlot(11, 7);
        this.slot[4] = new InventorySlot(3, 12);
        this.slot[5] = new InventorySlot(11, 12);
        this.slot[6] = new InventorySlot(19, 12);
        this.slot[7] = new InventorySlot(11, 17);
    }

    addItem(part: BodyPart): void {
        switch (part) {
            case BodyPart.HEAD:
                this.slot[1].set("1-head.txt");
                break;
            case BodyPart.SHOULDERS:
                this.slot[0].set("2-shoulders-L.txt");
                this.slot[2].set("2-shoulders-R.txt");
                break;
            case BodyPart.TORSO:
                this.slot[3].set("3-torso.txt");
                break;
            case BodyPart.RIGHT_HAND:
                this.slot[4].set("4-right-hand.txt");
                break;
            case BodyPart.LEFT_HAND:
                this.slot[6].set("6-left-hand.txt");
                break;
            case BodyPart.BOTH_HANDS:
                this.slot[4].set("4-both-hands.txt");
                this.slot[6].disable();
                break;
            case BodyPart.LEGS:
                this.slot[5].set("5-legs.txt");
                break;
            case BodyPart.FEET:
                this.slot[7].set("7-feet.txt");
                break;
        }
    }

    removeItem(part: BodyPart): void {
        switch (part) {
            case BodyPart.HEAD:
                this.slot[1].empty();
                break;
            case BodyPart.SHOULDERS:
                this.slot[0].empty();
                this.slot[2].empty();
                break;
            case BodyPart.TORSO:
                this.slot[3].empty();
                break;
            case BodyPart.RIGHT_HAND:
                this.slot[4].empty();
                break;
            case BodyPart.LEFT_HAND:
                this.slot[6].empty();
                break;
            case BodyPart.BOTH_HANDS:
                this.slot[4].empty();
                this.slot[6].empty();
                break;
            case BodyPart.LEGS:
                this.slot[5].empty();
                break;
            case BodyPart.FEET:
                this.slot[7].empty();
                break;
        }
    }

    override visit(screen: UIDrawContainer): void {
        for (const child of this.slot) {
            this.accept(child);
        }

        screen.drawOver(this.toAscii(), this.posX, this.posY);
    }

    accept(slot: UIElement): void {
        slot.visit(this);
    }

    drawOver(block: string[], posX: number, posY: number): void {
        overlayBlock(this.ascii, block, posX, posY);
    }
}
