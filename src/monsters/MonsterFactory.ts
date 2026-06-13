import { nextDouble, nextInt } from "../utils/random";
import { DarkElf } from "./DarkElf";
import { Dragon } from "./Dragon";
import { Monster } from "./Monster";
import { Troll } from "./Troll";

export class MonsterFactory {
    createTroll(groupLevel: number, groupSize: number): Troll {
        const level = nextInt(groupLevel + groupSize + 1) + 2;
        return new Troll(level);
    }

    createDragon(groupLevel: number, groupSize: number): Dragon {
        const level = nextInt(groupLevel + groupSize + 1) + 3;
        return new Dragon(level);
    }

    createBlackElf(groupLevel: number, groupSize: number): DarkElf {
        const level = nextInt(groupLevel + groupSize + 1) + 2;
        return new DarkElf(level);
    }

    createRandomMonster(groupLevel: number, groupSize: number): Monster {
        const randomNumber = nextDouble();
        if (randomNumber < 0.01) {
            return this.createDragon(groupLevel, groupSize);
        } else if (randomNumber < 0.4) {
            return this.createBlackElf(groupLevel, groupSize);
        } else {
            return this.createTroll(groupLevel, groupSize);
        }
    }
}
