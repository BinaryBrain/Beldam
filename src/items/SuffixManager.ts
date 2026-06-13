import { parseCsv } from "../utils/assets";
import { nextInt } from "../utils/random";
import { Item } from "./Item";
import { Suffix } from "./Suffix";

export class SuffixManager {
    private suffices: Suffix[] = [];

    constructor() {
        this.loadSufficesFromFile();
    }

    addRandomSuffix(item: Item): void {
        const suffix = this.getRandomSuffix();
        item.addSuffix(suffix);
    }

    private getRandomSuffix(): Suffix {
        return this.suffices[nextInt(this.suffices.length)];
    }

    private loadSufficesFromFile(): void {
        for (const record of parseCsv("assets/suffices.csv")) {
            this.suffices.push(
                new Suffix(record[0], parseInt(record[1], 10), parseInt(record[2], 10))
            );
        }
    }
}
