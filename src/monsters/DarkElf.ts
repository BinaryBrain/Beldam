import { nextInt } from "../utils/random";
import { Monster } from "./Monster";

export class DarkElf extends Monster {
    constructor(level: number) {
        super(level, 5, 7);

        while (this.items.length < nextInt(2) + 2) {
            this.addItem(this.itemManager.getRandomItem());
        }
        for (const i of this.items) {
            this.hp += i.getDefense();
        }
    }
}
