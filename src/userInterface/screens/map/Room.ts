import { Character } from "../../../characters/Character";
import { Item } from "../../../items/Item";
import { Direction } from "../../../server/types";
import { IllegalMoveException } from "../../../utils/errors";
import { UIDrawContainer } from "../UIDrawContainer";
import { UIElement } from "../UIElement";

export class Room extends UIElement {
    static readonly NORTH = 1;
    static readonly SOUTH = 2;
    static readonly EAST = 3;
    static readonly WEST = 4;

    private north: Room | null = null;
    private south: Room | null = null;
    private west: Room | null = null;
    private east: Room | null = null;

    private readonly players: Character[];
    private readonly items: Item[];

    private representation: string[] = [
        "+-------+  ",
        "|       |  ",
        "|       |  ",
        "|       |  ",
        "+-------+  ",
        "           ",
    ];

    constructor(posX: number, posY: number) {
        super(posX, posY);
        this.players = [];
        this.items = [];
    }

    toASCII(): string[] {
        return this.representation;
    }

    makeLink(r: Room | null, position: number): void {
        if (r != null) {
            switch (position) {
                case Room.NORTH:
                    this.north = r;
                    r.south = this;
                    break;
                case Room.SOUTH:
                    this.south = r;
                    r.north = this;
                    break;
                case Room.EAST:
                    this.east = r;
                    r.west = this;
                    break;
                case Room.WEST:
                    this.west = r;
                    r.east = this;
                    break;
            }
            r.updateRepresentation();
            this.updateRepresentation();
        }
    }

    addPlayer(player: Character): void {
        this.players.push(player);
        this.updateRepresentation();
    }

    removePlayer(player: Character): void {
        const idx = this.players.indexOf(player);
        if (idx !== -1) {
            this.players.splice(idx, 1);
        }
        this.updateRepresentation();
    }

    getItems(): Item[] {
        return this.items;
    }

    addItems(items: Item[]): void {
        for (const item of items) {
            this.items.push(item);
        }
    }

    move(player: Character, direction: Direction): void {
        switch (direction) {
            case Direction.NORTH:
                if (this.north == null) {
                    throw new IllegalMoveException("can't go north");
                }
                this.north.addPlayer(player);
                this.north.updateRepresentation();
                break;
            case Direction.SOUTH:
                if (this.south == null) {
                    throw new IllegalMoveException("can't go south");
                }
                this.south.addPlayer(player);
                this.south.updateRepresentation();
                break;
            case Direction.EAST:
                if (this.east == null) {
                    throw new IllegalMoveException("can't go east");
                }
                this.east.addPlayer(player);
                this.east.updateRepresentation();
                break;
            case Direction.WEST:
                if (this.west == null) {
                    throw new IllegalMoveException("can't go west");
                }
                this.west.addPlayer(player);
                this.west.updateRepresentation();
        }
        const idx = this.players.indexOf(player);
        if (idx !== -1) {
            this.players.splice(idx, 1);
        }
        this.updateRepresentation();
    }

    getRoom(direction: Direction): Room | null {
        switch (direction) {
            case Direction.NORTH:
                return this.north;
            case Direction.SOUTH:
                return this.south;
            case Direction.EAST:
                return this.east;
            case Direction.WEST:
                return this.west;
        }
        return null;
    }

    override toString(): string {
        return this.representation.join("\r\n");
    }

    private updateRepresentation(): void {
        if (this.north != null) {
            this.representation[0] = "+--   --+  ";
        }
        if (this.south != null) {
            this.representation[4] = "+--   --+  ";
            this.representation[5] = "   | |     ";
        }
        if (this.east != null) {
            this.representation[2] =
                this.representation[2].substring(0, this.representation[2].length - 3) + "   ";
            this.representation[1] =
                this.representation[1].substring(0, this.representation[2].length - 2) + "__";
            this.representation[3] =
                this.representation[3].substring(0, this.representation[3].length - 2) + "--";
        }
        if (this.west != null) {
            this.representation[2] = " " + this.representation[2].substring(1, this.representation[2].length);
        }

        let character: string;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.players.length < i * 3 + j + 1) {
                    character = " ";
                } else {
                    character = this.players[j + 3 * i].getAvatar();
                }
                this.representation[i + 1] =
                    this.representation[i + 1].substring(0, (j + 1) * 2) +
                    character +
                    this.representation[i + 1].substring((j + 1) * 2 + 1);
            }
        }
    }

    override visit(drawable: UIDrawContainer): void {
        drawable.drawOver(this.representation, this.posX, this.posY);
    }

    playerCount(): number {
        return this.players.length;
    }
}
