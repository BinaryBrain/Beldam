import { Character } from "./Character";
import { Elf } from "./Elf";
import { Human } from "./Human";
import { Orc } from "./Orc";

export class CharacterFactory {
    createCharacter(name: string, avatar: string, race: string): Character | null {
        let character: Character | null = null;
        switch (race.toLowerCase()) {
            case "elf":
                character = new Elf(name, avatar);
                break;
            case "human":
                character = new Human(name, avatar);
                break;
            case "orc":
                character = new Orc(name, avatar);
                break;
        }
        return character;
    }
}
