import { parseCsv } from "../utils/assets";
import { nextDouble, nextInt } from "../utils/random";
import { bodyPartFromString, BodyPart } from "./BodyPart";
import { Item } from "./Item";
import { SuffixManager } from "./SuffixManager";

export class ItemManager {
    private items: Item[] = [];

    constructor() {
        this.loadItemsFromFile();
    }

    getRandomItem(): Item {
        // Intentionally returns the shared template instance (not a copy): suffixes
        // accumulate on it across spawns over time, which is funnier — items end up
        // with several stacked suffixes. This matches the original Java behaviour.
        const item = this.items[nextInt(this.items.length)];

        const suffixManager = new SuffixManager();

        const chances = nextDouble();
        let nbSuffices = 0;

        if (chances < 0.01) {
            nbSuffices = 3;
        } else if (chances < 0.1) {
            nbSuffices = 2;
        } else if (chances < 0.2) {
            nbSuffices = 1;
        }

        for (let i = 0; i < nbSuffices; i++) {
            suffixManager.addRandomSuffix(item);
        }

        return item;
    }

    private loadItemsFromFile(): void {
        for (const record of parseCsv("assets/items.csv")) {
            let bodyPart: BodyPart;

            try {
                bodyPart = bodyPartFromString(record[1]);
            } catch (e) {
                bodyPart = BodyPart.TORSO;
            }

            this.items.push(
                new Item(record[0], bodyPart, parseInt(record[2], 10), parseInt(record[3], 10))
            );
        }
    }
}
