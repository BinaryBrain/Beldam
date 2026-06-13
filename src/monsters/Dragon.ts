import { nextInt } from "../utils/random";
import { Monster } from "./Monster";

export class Dragon extends Monster {
    constructor(level: number) {
        super(level, 50, 100);

        while (this.items.length < nextInt(3) + 3) {
            this.addItem(this.itemManager.getRandomItem());
        }
        for (const i of this.items) {
            this.hp += i.getDefense();
        }
    }
}
