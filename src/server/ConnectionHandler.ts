import * as net from "net";

import { Character } from "../characters/Character";
import { CharacterFactory } from "../characters/CharacterFactory";
import { BodyPart } from "../items/BodyPart";
import { Item } from "../items/Item";
import { Map as GameMap } from "../userInterface/screens/map/Map";
import { Room } from "../userInterface/screens/map/Room";
import { MainScreen } from "../userInterface/screens/mainInterface/MainScreen";
import { Screens } from "../userInterface/screens/Screens";
import { Writer } from "../userInterface/utils/Writer";
import { readText } from "../utils/assets";
import {
    IllegalArgumentException,
    IllegalMoveException,
    IllegalTargetException,
} from "../utils/errors";
import { isAscii, javaSplit } from "../utils/strings";
import { GameManager } from "./GameManager";
import { TelnetSocket } from "./TelnetSocket";
import { Command, commandFromString, Direction, directionFromString, PlayerState } from "./types";

// Erase the whole display AND move the cursor home, so every frame is redrawn
// from the top-left and overwrites the previous one in place. The cursor-home
// is essential: without it frames were drawn from wherever the cursor sat (the
// bottom), scrolling the old frame up into the terminal scrollback.
const CLEAR_SCREEN = "\x1b[2J\x1b[H";

export class ConnectionHandler {
    private readonly socket: TelnetSocket;

    private player!: Character;
    private currentMap!: GameMap;
    private currentRoom!: Room;
    private mainScreen!: MainScreen;

    private state: PlayerState = PlayerState.MAIN;
    private previousState: PlayerState = PlayerState.MAIN;

    private readonly helpMessages = new Map<PlayerState, string>();

    private running = false;

    constructor(socket: net.Socket) {
        this.state = PlayerState.MAIN;

        this.initHelps(PlayerState.MAIN, "assets/text/help-main.txt");
        this.initHelps(PlayerState.FIGHT, "assets/text/help-fight.txt");

        this.socket = new TelnetSocket(socket);
        this.running = true;
    }

    async run(): Promise<void> {
        try {
            await this.clearScreen();
            await this.socket.write(Screens.titleScreen());
            await this.socket.readLine();
            await this.createCharacter();

            GameManager.getInstance().registerConnection(this, this.player);

            this.currentMap = GameManager.getInstance().getWorldMap();
            this.mainScreen = new MainScreen();
            this.mainScreen.update(this.player);

            await this.clearScreen();
            await this.socket.write(this.mainScreen.toString());

            this.currentRoom = this.currentMap.getStartingRoom();

            await this.mainLoop();
        } catch (ex) {
            console.error("Connection error:", ex);
        } finally {
            try {
                await this.clearScreen();
            } catch {
                // ignore
            }
            this.socket.close();

            if (this.player) {
                GameManager.getInstance().disconnect(this, this.player);
            }
            if (this.currentRoom && this.player) {
                this.currentRoom.removePlayer(this.player);
            }
        }
    }

    private async createCharacter(): Promise<void> {
        let nameAvatar: string[];
        do {
            await this.clearScreen();
            await this.socket.write(Screens.characterCreationScreen());

            const line = await this.socket.readLine();
            if (line === null) {
                this.running = false;
                throw new Error("Disconnected during character creation");
            }
            nameAvatar = line.split(" ");
        } while (
            nameAvatar.length !== 2 ||
            nameAvatar[0].length < 2 ||
            nameAvatar[1].length !== 1 ||
            !isAscii(nameAvatar[0]) ||
            !isAscii(nameAvatar[1])
        );

        const message = ["Choose your race", "", "ELF - HUMAN - ORC"];
        do {
            await this.clearScreen();
            await this.socket.write(Writer.write(message, Writer.CENTER));

            const race = await this.socket.readLine();
            if (race === null) {
                this.running = false;
                throw new Error("Disconnected during character creation");
            }

            const factory = new CharacterFactory();
            const created = factory.createCharacter(nameAvatar[0], nameAvatar[1].charAt(0), race);
            if (created != null) {
                this.player = created;
                GameManager.getInstance().registerNewPlayer(this.player);
            }
        } while (this.player == null);
    }

    private async mainLoop(): Promise<void> {
        while (this.running) {
            const input = await this.socket.readLine();
            if (input === null) {
                this.running = false;
                break;
            }

            if (input === "") {
                await this.printScreen();
                continue;
            }

            this.printMessage("");
            this.printMessage("> " + input);

            const command = javaSplit(input, / /);

            try {
                if (this.state === PlayerState.MAIN) {
                    switch (commandFromString(this.cmd(command).toUpperCase())) {
                        case Command.MOVE: {
                            const direction = directionFromString(this.arg(command, 1).toUpperCase());
                            this.currentMap.move(this.player, this.currentRoom, direction);
                            this.currentRoom = this.currentRoom.getRoom(direction) as Room;
                            this.move();
                            break;
                        }
                        case Command.MAP:
                            this.previousState = this.state;
                            this.state = PlayerState.MAP;
                            break;
                        case Command.TAKE:
                            this.takeItem(this.arg(command, 1));
                            break;
                        case Command.DROP:
                            this.dropItem(this.arg(command, 1));
                            break;
                        case Command.QUIT:
                            this.running = false;
                            break;
                        case Command.HELP:
                            this.printMessage(this.helpMessages.get(this.state) ?? "");
                            break;
                        default:
                            throw new IllegalArgumentException();
                    }
                } else if (this.state === PlayerState.MAP) {
                    switch (this.cmd(command).toUpperCase()) {
                        case "MOVE": {
                            // TODO not allow during fights
                            const direction = directionFromString(this.arg(command, 1).toUpperCase());
                            this.currentMap.move(this.player, this.currentRoom, direction);
                            this.currentRoom = this.currentRoom.getRoom(direction) as Room;
                            this.move();
                            break;
                        }
                        default:
                            this.state = this.previousState;
                            break;
                    }
                } else if (this.state === PlayerState.FIGHT) {
                    switch (commandFromString(this.cmd(command).toUpperCase())) {
                        case Command.ATTACK: {
                            const id = this.parseIntStrict(this.arg(command, 1));
                            try {
                                GameManager.getInstance()
                                    .getFight(this.currentRoom)!
                                    .attackMonster(this.player, id);
                            } catch (e) {
                                if (e instanceof IllegalTargetException) {
                                    this.printMessage("Monster #" + id + " doesn't exist.");
                                } else {
                                    throw e;
                                }
                            }
                            break;
                        }
                        case Command.MAP:
                            this.previousState = this.state;
                            this.state = PlayerState.MAP;
                            break;
                        case Command.QUIT:
                            this.running = false;
                            break;
                        case Command.HELP:
                            this.printMessage(this.helpMessages.get(this.state) ?? "");
                            break;
                        case Command.TAKE:
                        case Command.DROP:
                        case Command.MOVE:
                            this.printMessage("You can't do that during a fight!");
                            break;
                        default:
                            throw new IllegalArgumentException();
                    }
                }
            } catch (e) {
                if (e instanceof IllegalMoveException) {
                    this.printMessage("You can't go in this direction!");
                } else if (e instanceof IllegalTargetException) {
                    this.printMessage("There is no item #" + command[1]);
                    this.printMessage(this.itemsToString(this.currentRoom.getItems()));
                } else if (e instanceof IllegalArgumentException) {
                    this.printMessage("Invalid command " + command[0]);
                } else {
                    throw e;
                }
            } finally {
                await this.printScreen();
            }
        }
    }

    private move(): void {
        if (GameManager.getInstance().roomHasAFight(this.currentRoom)) {
            this.printMessage("You joined a fight!");
            GameManager.getInstance().getFight(this.currentRoom)!.joinFight(this.player);
            this.state = PlayerState.FIGHT;
        } else if (
            Math.random() < 0.5 &&
            this.currentRoom !== this.currentMap.getStartingRoom() &&
            this.currentRoom.playerCount() === 1
        ) {
            this.printMessage("You encountered some ennemies!");
            GameManager.getInstance().startAFight(this.currentRoom);
            GameManager.getInstance().getFight(this.currentRoom)!.joinFight(this.player);
            this.state = PlayerState.FIGHT;
        }
    }

    refreshMainScreen(): void {
        if (this.mainScreen && this.player) {
            this.mainScreen.update(this.player);
        }
        this.requestRedraw();
    }

    private initHelps(state: PlayerState, filename: string): void {
        try {
            this.helpMessages.set(state, readText(filename));
        } catch (ex) {
            console.error("Failed to load help file:", filename, ex);
        }
    }

    private takeItem(itemId: string): void {
        try {
            const id = this.parseIntStrict(itemId);

            if (id > 0 && id <= this.currentRoom.getItems().length) {
                const item = this.currentRoom.getItems()[id - 1];
                if (!this.player.hasItem(item.getBodyPart())) {
                    this.player.addItem(item);
                    this.mainScreen.getInventory().addItem(item.getBodyPart());
                    this.currentRoom.getItems().splice(id - 1, 1);
                } else {
                    this.printMessage("You cannot take this item, because you already have one.");
                }
            } else {
                throw new IllegalTargetException();
            }
        } catch (e) {
            if (e instanceof IllegalArgumentException) {
                throw new IllegalTargetException();
            }
            throw e;
        }
    }

    private dropItem(itemId: string): void {
        try {
            const id = this.parseIntStrict(itemId);

            if (id > 0 && id <= 7) {
                let part = BodyPart.RIGHT_HAND;

                switch (id) {
                    case 1:
                        part = BodyPart.HEAD;
                        break;
                    case 2:
                        part = BodyPart.SHOULDERS;
                        break;
                    case 3:
                        part = BodyPart.TORSO;
                        break;
                    case 4:
                        if (this.player.hasItem(BodyPart.BOTH_HANDS)) {
                            part = BodyPart.BOTH_HANDS;
                        } else {
                            part = BodyPart.RIGHT_HAND;
                        }
                        break;
                    case 5:
                        part = BodyPart.LEGS;
                        break;
                    case 6:
                        part = BodyPart.LEFT_HAND;
                        break;
                    case 7:
                        part = BodyPart.FEET;
                        break;
                }

                let item: Item | null = null;

                if (this.player.hasItem(part)) {
                    for (let i = 0; i < this.player.getItems().length; i++) {
                        if (this.player.getItems()[i].getBodyPart() === part) {
                            item = this.player.getItems()[i];
                        }
                    }

                    console.log("part: " + part);
                    console.log("item: " + item);

                    if (item != null) {
                        this.currentRoom.getItems().push(item);
                        const idx = this.player.getItems().indexOf(item);
                        if (idx !== -1) {
                            this.player.getItems().splice(idx, 1);
                        }
                    }
                    this.mainScreen.getInventory().removeItem(part);
                } else {
                    this.printMessage(
                        "You don't carry any item on this part of your body. Please refer to the little grid in your inventory."
                    );
                }
            } else {
                throw new IllegalTargetException();
            }
        } catch (e) {
            if (e instanceof IllegalArgumentException) {
                throw new IllegalTargetException();
            }
            throw e;
        }
    }

    private async printScreen(): Promise<void> {
        await this.render();
    }

    /** Renders the active screen for this player and pushes it to the socket. */
    private async render(): Promise<void> {
        if (!this.mainScreen) {
            return;
        }

        this.mainScreen.update(this.player);

        let currentScreen: { toString(): string } = this.mainScreen;

        switch (this.state) {
            case PlayerState.MAIN:
            case PlayerState.FIGHT:
                currentScreen = this.mainScreen;
                break;
            case PlayerState.MAP:
                currentScreen = this.currentMap;
                break;
        }

        // Emit the clear+home and the frame as a SINGLE write. Concurrent renders
        // (e.g. a fight resolving via redrawParticipants() plus this loop's own
        // printScreen()) are serialised on the socket's write queue; if the clear
        // and the frame were separate writes they could interleave as
        // [clear, clear, frameA, frameB] and stack the two frames on screen.
        await this.socket.write(CLEAR_SCREEN + currentScreen.toString());
    }

    /**
     * Fire-and-forget re-render, used to push live updates to a player whose
     * own input loop is currently idle (e.g. when another player's action
     * resolves a fight they are part of, or the companion roster changes).
     */
    requestRedraw(): void {
        this.render().catch(() => {
            // socket may be closing; ignore
        });
    }

    printMessage(msg: string): void {
        this.mainScreen.getMessages().addMessage(javaSplit(msg, /\r?\n/));
    }

    setState(s: PlayerState): void {
        this.state = s;
    }

    private async clearScreen(): Promise<void> {
        await this.socket.write(CLEAR_SCREEN);
    }

    private cmd(command: string[]): string {
        return command.length > 0 ? command[0] : "";
    }

    private arg(command: string[], index: number): string {
        if (index >= command.length) {
            // The original threw ArrayIndexOutOfBounds here (crashing the client);
            // surfacing it as an invalid command is friendlier and equivalent UX.
            throw new IllegalArgumentException("missing argument");
        }
        return command[index];
    }

    private parseIntStrict(value: string): number {
        if (!/^[+-]?\d+$/.test(value)) {
            throw new IllegalArgumentException("not an integer: " + value);
        }
        return parseInt(value, 10);
    }

    private itemsToString(items: Item[]): string {
        return "[" + items.map((i) => i.toString()).join(", ") + "]";
    }
}
