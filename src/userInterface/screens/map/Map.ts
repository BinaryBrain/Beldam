import { Character } from "../../../characters/Character";
import { Direction } from "../../../server/types";
import { readLines } from "../../../utils/assets";
import { javaSplit } from "../../../utils/strings";
import { Screen } from "../Screen";
import { Screens } from "../Screens";
import { UIElement } from "../UIElement";
import { Room } from "./Room";

export class Map implements Screen {
    private static readonly NUMBER_OF_ROOMS_X = 10;
    private static readonly NUMBER_OF_ROOMS_Y = 6;

    private readonly rooms: (Room | null)[][];
    private readonly startingRoom: Room;

    private representation: string[];

    constructor(name: string) {
        this.rooms = [];
        for (let x = 0; x < Map.NUMBER_OF_ROOMS_X; x++) {
            this.rooms[x] = new Array<Room | null>(Map.NUMBER_OF_ROOMS_Y).fill(null);
        }

        this.representation = javaSplit(Screens.mapScreen(), /\r\n/);
        for (let i = 0; i < this.representation.length; i++) {
            if (i < name.length) {
                this.representation[i + 1] =
                    this.representation[i + 1].substring(0, 115) +
                    name.charAt(i) +
                    this.representation[i + 1].substring(116);
            } else if (i === name.length) {
                this.representation[i + 1] = this.representation[i + 1].substring(0, 113) + "-----|";
            }
        }

        for (const line of readLines("assets/coordinates.csv")) {
            const tokens = line.split(";");

            const x = parseInt(tokens[0], 10);
            const y = parseInt(tokens[1], 10);
            const room = new Room(x, y);
            this.rooms[x][y] = room;

            for (let i = 2; i < tokens.length; i++) {
                switch (tokens[i]) {
                    case "N":
                        room.makeLink(this.rooms[x][y - 1], Room.NORTH);
                        break;
                    case "S":
                        room.makeLink(this.rooms[x][y + 1], Room.SOUTH);
                        break;
                    case "W":
                        room.makeLink(this.rooms[x - 1][y], Room.WEST);
                        break;
                    case "E":
                        room.makeLink(this.rooms[x + 1][y], Room.EAST);
                        break;
                }
            }
        }
        this.startingRoom = this.rooms[0][0] as Room;
    }

    addPlayer(player: Character): void {
        this.startingRoom.addPlayer(player);
        this.updateRepresentation();
    }

    getStartingRoom(): Room {
        return this.startingRoom;
    }

    toASCII(): string {
        return this.representation.join("\r\n") + "\r\n";
    }

    toString(): string {
        this.updateRepresentation();
        return this.representation.join("\r\n") + "\r\n";
    }

    private updateRepresentation(): void {
        for (let i = 0; i < Map.NUMBER_OF_ROOMS_X; i++) {
            for (let j = 0; j < Map.NUMBER_OF_ROOMS_Y; j++) {
                if (this.rooms[i][j] != null) {
                    this.accept(this.rooms[i][j] as Room);
                }
            }
        }
    }

    move(player: Character, room: Room, direction: Direction): void {
        room.move(player, direction);
        this.updateRepresentation();
    }

    accept(element: UIElement): void {
        element.visit(this);
    }

    drawOver(block: string[], posX: number, posY: number): void {
        let firstPart: string;
        let lastPart: string;
        for (let i = 0; i < block.length; i++) {
            if (posX === Map.NUMBER_OF_ROOMS_X - 1) {
                block[i] = block[i].substring(0, block[i].length - 1) + "|";
            }
            if (posY === Map.NUMBER_OF_ROOMS_Y - 1 && i === block.length - 1) {
                block[i] = block[i].split(" ").join("-");
            }

            const row = i + posY * block.length + 1;
            firstPart = this.representation[row].substring(0, posX * block[0].length + 2);
            lastPart = this.representation[row].substring(2 + (posX + 1) * block[0].length);
            this.representation[row] = firstPart + block[i] + lastPart;
        }
    }
}
