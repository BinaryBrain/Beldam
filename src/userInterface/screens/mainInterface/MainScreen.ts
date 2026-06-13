import { Character } from "../../../characters/Character";
import { javaSplit } from "../../../utils/strings";
import { overlayBlock } from "../UIDrawContainer";
import { Screen } from "../Screen";
import { Screens } from "../Screens";
import { UIElement } from "../UIElement";
import { Companions } from "./Companions";
import { Inventory } from "./Inventory";
import { Messages } from "./Messages";
import { Stats } from "./Stats";

export class MainScreen implements Screen {
    private readonly panels: UIElement[] = [];
    private ascii = "";

    private readonly inventory = new Inventory(92, 0);
    private readonly stats = new Stats(92, 21);
    private readonly companions = new Companions(79, 0);
    private readonly messages = new Messages(2, 1);

    constructor() {
        this.panels.push(this.inventory);
        this.panels.push(this.stats);
        this.panels.push(this.messages);
        this.panels.push(this.companions);

        this.ascii = Screens.emptyScreen();
    }

    getStats(): Stats {
        return this.stats;
    }

    getInventory(): Inventory {
        return this.inventory;
    }

    getMessages(): Messages {
        return this.messages;
    }

    getCompanions(): Companions {
        return this.companions;
    }

    update(player: Character): void {
        this.stats.update(player);
        this.companions.update();
    }

    toASCII(): string {
        for (const panel of this.panels) {
            this.accept(panel);
        }

        return this.ascii + "\r\n";
    }

    drawOver(block: string[], posX: number, posY: number): void {
        const lines = javaSplit(this.ascii, /\r\n/);
        overlayBlock(lines, block, posX, posY);
        this.ascii = lines.join("\r\n");
    }

    accept(element: UIElement): void {
        element.visit(this);
    }

    toString(): string {
        return this.toASCII();
    }
}
