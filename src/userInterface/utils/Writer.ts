import { javaSplit } from "../../utils/strings";
import { Screens } from "../screens/Screens";

export class Writer {
    static readonly CENTER = 1;

    static writeLine(text: string, position: number): string {
        const lines = javaSplit(Screens.emptyScreen(), /\r\n/);

        switch (position) {
            case Writer.CENTER: {
                const begin = Math.floor((lines[18].length - text.length) / 2.0);
                const end = lines[18].length - Math.ceil((lines[18].length - text.length) / 2.0);
                let newLine = lines[18].substring(0, begin);
                newLine += text;
                newLine += lines[18].substring(end);
                lines[18] = newLine;
                break;
            }
        }
        return lines.join("\r\n");
    }

    static write(text: string[], position: number): string {
        const baseLines = javaSplit(Screens.emptyScreen(), /\r\n/);

        switch (position) {
            case Writer.CENTER: {
                const height = Math.floor((baseLines.length - text.length) / 2);
                for (let i = 0; i < text.length; i++) {
                    const begin = Math.floor((baseLines[height + i].length - text[i].length) / 2.0);
                    const end =
                        baseLines[height + i].length - Math.ceil((baseLines[height + i].length - text[i].length) / 2.0);
                    let newLine = baseLines[height + i].substring(0, begin);
                    newLine += text[i];
                    newLine += baseLines[height + i].substring(end);
                    baseLines[height + i] = newLine;
                }
                break;
            }
        }
        return baseLines.join("\r\n") + "\r\n";
    }
}
