import { Item } from "../items/Item";
import { nextInt } from "../utils/random";
import { Monster } from "./Monster";

export class Troll extends Monster {
    constructor(level: number) {
        super(level, 7, 12);

        while (this.items.length < nextInt(2) + 1) {
            this.addItem(this.itemManager.getRandomItem());
        }
        for (const i of this.items) {
            this.hp += i.getDefense();
        }
    }
}
