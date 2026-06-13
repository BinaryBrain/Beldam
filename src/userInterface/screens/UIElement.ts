import { readLines } from "../../utils/assets";
import { UIDrawContainer } from "./UIDrawContainer";

export abstract class UIElement {
    protected posX = 0;
    protected posY = 0;
    protected ascii: string[] = [];

    constructor(posX: number, posY: number);
    constructor(filename: string, posX: number, posY: number);
    constructor(a: number | string, b: number, c?: number) {
        if (typeof a === "string") {
            this.posX = b;
            this.posY = c as number;
            this.fromFile(a);
        } else {
            this.posX = a;
            this.posY = b;
        }
    }

    toAscii(): string[] {
        return this.ascii.slice();
    }

    abstract visit(drawable: UIDrawContainer): void;

    fromFile(filename: string): void {
        this.ascii = readLines(filename);
    }
}
