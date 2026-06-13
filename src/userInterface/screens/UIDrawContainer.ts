import { UIElement } from "./UIElement";

export interface UIDrawContainer {
    accept(element: UIElement): void;

    /**
     * Modify the current displayed screen, inserting a block of text over it.
     * @param block New block of text
     * @param posX  Position x from left border
     * @param posY  Position y from top border
     */
    drawOver(block: string[], posX: number, posY: number): void;
}

/**
 * Overlays a single block line onto a target line at the given column,
 * mirroring the char-array splicing of the original Java screens.
 */
export function overlayLine(line: string, block: string, posX: number): string {
    const chars = line.split("");
    // Pad if the target line is shorter than the write region (the original
    // layouts always fit, so this only guards against malformed assets).
    while (chars.length < posX + block.length) {
        chars.push(" ");
    }
    for (let j = 0; j < block.length; j++) {
        chars[posX + j] = block.charAt(j);
    }
    return chars.join("");
}

/** Overlays a block of lines onto a target array of lines, in place. */
export function overlayBlock(lines: string[], block: string[], posX: number, posY: number): void {
    for (let i = 0; i < block.length; i++) {
        lines[i + posY] = overlayLine(lines[i + posY], block[i], posX);
    }
}
