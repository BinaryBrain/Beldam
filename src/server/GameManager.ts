import type { Character } from "../characters/Character";
import { FightManager } from "../fight/FightManager";
import { Map as GameMap } from "../userInterface/screens/map/Map";
import { Room } from "../userInterface/screens/map/Room";
import type { ConnectionHandler } from "./ConnectionHandler";

export class GameManager {
    private players: Character[] = [];
    private connections: ConnectionHandler[] = [];
    private readonly playerConnections = new Map<Character, ConnectionHandler>();
    private readonly fights = new Map<Room, FightManager>();

    private readonly worldMap: GameMap;

    private static instance: GameManager | null = null;

    private constructor() {
        this.worldMap = new GameMap("OVERWORLD");
    }

    static getInstance(): GameManager {
        if (this.instance === null) {
            this.instance = new GameManager();
        }
        return this.instance;
    }

    getWorldMap(): GameMap {
        return this.worldMap;
    }

    registerNewPlayer(player: Character): void {
        this.players.push(player);
        this.worldMap.addPlayer(player);
    }

    registerConnection(connection: ConnectionHandler, player: Character): void {
        this.connections.forEach((c) => c.refreshMainScreen());
        this.connections.push(connection);
        this.playerConnections.set(player, connection);
    }

    disconnect(connection: ConnectionHandler, player: Character): void {
        const pIdx = this.players.indexOf(player);
        if (pIdx !== -1) {
            this.players.splice(pIdx, 1);
        }
        const cIdx = this.connections.indexOf(connection);
        if (cIdx !== -1) {
            this.connections.splice(cIdx, 1);
        }
        this.playerConnections.delete(player);
        this.connections.forEach((c) => c.refreshMainScreen());
    }

    getConnectionForPlayer(player: Character): ConnectionHandler | undefined {
        return this.playerConnections.get(player);
    }

    getPlayers(): Character[] {
        return this.players;
    }

    getPartyLevel(): number {
        let level = 0;
        for (const c of this.players) {
            level += c.getLevel();
        }
        return level;
    }

    getPartySize(): number {
        return this.players.length;
    }

    roomHasAFight(room: Room): boolean {
        return this.fights.has(room);
    }

    startAFight(room: Room): void {
        this.fights.set(room, new FightManager(room));
    }

    getFight(room: Room): FightManager | undefined {
        return this.fights.get(room);
    }

    removeFight(room: Room): void {
        this.fights.delete(room);
    }
}
