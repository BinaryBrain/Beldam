import { Character } from "../characters/Character";
import { Monster } from "../monsters/Monster";
import { MonsterFactory } from "../monsters/MonsterFactory";
import { GameManager } from "../server/GameManager";
import { PlayerState } from "../server/types";
import { Room } from "../userInterface/screens/map/Room";
import { nextInt } from "../utils/random";
import { IllegalTargetException } from "../utils/errors";
import { CharacterAction } from "./CharacterAction";

export class FightManager {
    private players: Character[] = [];
    private monsters: Monster[] = [];
    private readonly actions = new Map<Character, CharacterAction>();
    private readonly focuses = new Map<Character, Monster>();
    private readonly room: Room;

    // Every character that ever joined; used to push live re-renders to all of
    // them when the fight resolves (the async playability improvement).
    private readonly participants = new Set<Character>();

    constructor(room: Room) {
        this.room = room;
        this.createMonsters();
    }

    private createMonsters(): void {
        const factory = new MonsterFactory();

        const numberOfMonsters = nextInt(3) + 1;

        for (let i = 0; i < numberOfMonsters; i++) {
            this.monsters.push(
                factory.createRandomMonster(
                    GameManager.getInstance().getPartyLevel(),
                    GameManager.getInstance().getPartySize()
                )
            );
        }
    }

    attackMonster(player: Character, monsterId: number): void {
        if (monsterId > 0 && monsterId <= this.monsters.length) {
            this.focuses.set(player, this.monsters[monsterId - 1]);
        } else {
            throw new IllegalTargetException();
        }

        if (this.actions.has(player)) {
            this.actions.set(player, CharacterAction.ATTACK);
        }

        if (this.areAllCharactersReady()) {
            this.fight();
        }
    }

    joinFight(player: Character): void {
        this.players.push(player);
        this.participants.add(player);
        this.actions.set(player, CharacterAction.UNDEFINED);

        GameManager.getInstance().getConnectionForPlayer(player)?.printMessage(this.monstersToString());
    }

    private fight(): void {
        this.playersTurn();
        this.monstersTurn();

        this.broadcastMessage(this.monstersToString());

        if (this.isOver()) {
            this.endFight();
        }

        this.redrawParticipants();
    }

    private isOver(): boolean {
        return this.monsters.length === 0 || this.players.length === 0;
    }

    private areAllCharactersReady(): boolean {
        return !this.players.some((character) => this.actions.get(character) === CharacterAction.UNDEFINED);
    }

    private resetActions(): void {
        for (const player of this.players) {
            if (this.actions.has(player)) {
                this.actions.set(player, CharacterAction.UNDEFINED);
            }
        }
    }

    private endFight(): void {
        for (const player of this.players) {
            GameManager.getInstance().getConnectionForPlayer(player)?.setState(PlayerState.MAIN);
        }

        GameManager.getInstance().removeFight(this.room);
    }

    private playersTurn(): void {
        for (const player of this.players) {
            const target = this.focuses.get(player);

            if (target != null) {
                player.attack(target);
            }
        }

        const aliveMonsters: Monster[] = [];

        for (const monster of this.monsters) {
            if (monster.isDead()) {
                this.room.addItems(monster.dropItems());
                this.broadcastMessage("The " + monster.typeName() + " is dead.");
                this.printItems();
            } else {
                aliveMonsters.push(monster);
            }
        }

        this.monsters = aliveMonsters;

        this.resetActions();
    }

    private monstersTurn(): void {
        for (let i = 0; i < this.monsters.length; i++) {
            const target = this.players[nextInt(this.players.length)];
            this.broadcastMessage(
                "Monster #" + (i + 1) + "(" + this.monsters[i].typeName() + ") attacks " + target.getName() + "!"
            );
            this.monsters[i].attack(target);
        }

        const alivePlayers: Character[] = [];

        for (const player of this.players) {
            if (player.isDead()) {
                this.room.addItems(player.getItems());
                this.broadcastMessage(player.getName() + " is dead! ='(");
                this.printItems();
            } else {
                alivePlayers.push(player);
            }
        }

        this.players = alivePlayers;
    }

    private monstersToString(): string {
        let str = "";

        for (let i = 0; i < this.monsters.length; i++) {
            str += i + 1 + ") " + this.monsters[i].typeName() + "\r\n";
        }

        return str;
    }

    private printItems(): void {
        if (this.room.getItems().length !== 0) {
            let str = "There is some items on the floor:\r\n";

            for (let i = 0; i < this.room.getItems().length; i++) {
                str += i + 1 + ") " + this.room.getItems()[i] + "\r\n";
            }

            this.broadcastMessage(str);
        }
    }

    broadcastMessage(message: string): void {
        for (const player of this.players) {
            const connection = GameManager.getInstance().getConnectionForPlayer(player);
            connection?.printMessage(message + "\r\n ");
        }
    }

    private redrawParticipants(): void {
        for (const player of this.participants) {
            GameManager.getInstance().getConnectionForPlayer(player)?.requestRedraw();
        }
    }
}
