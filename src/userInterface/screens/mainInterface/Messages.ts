import { javaSplit } from "../../../utils/strings";
import { UIDrawContainer } from "../UIDrawContainer";
import { UIElement } from "../UIElement";

export class Messages extends UIElement {
    private static readonly lineLength = 88;

    constructor(posX: number, posY: number) {
        super(posX, posY);

        for (let i = 0; i < 35; i++) {
            this.ascii.push("");
        }
    }

    private addMessageString(message: string): void {
        let line = "";

        const words = javaSplit(message, / /);

        while (words.length > 0) {
            const word = words[0];

            if (line.length + word.length < Messages.lineLength) {
                line += line.length !== 0 ? " " + word : word;
                words.shift();
            } else if (word.length > Messages.lineLength) {
                words[0] = word.substring(Messages.lineLength - line.length);

                const s = word.substring(0, Messages.lineLength - line.length);
                line += line.length !== 0 ? " " + s : s;

                this.ascii.shift();
                this.ascii.push(line);

                this.addMessageString(words.join(" "));

                return;
            } else {
                this.ascii.shift();
                this.ascii.push(line);

                this.addMessageString(words.join(" "));

                return;
            }
        }

        this.ascii.shift();
        this.ascii.push(this.addPadding(line, Messages.lineLength));
    }

    /**
     * Print a message on the main interface. Also handles line wrap and very long words.
     */
    addMessage(message: string[]): void {
        for (const line of message) {
            this.addMessageString(line);
        }
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
