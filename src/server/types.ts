import { IllegalArgumentException } from "../utils/errors";

export enum Command {
    HELP = "HELP",
    MOVE = "MOVE",
    QUIT = "QUIT",
    TAKE = "TAKE",
    DROP = "DROP",
    ATTACK = "ATTACK",
    MAP = "MAP",
}

/** Mirrors Command.valueOf(String): throws IllegalArgumentException when unknown. */
export function commandFromString(name: string): Command {
    if (Object.prototype.hasOwnProperty.call(Command, name)) {
        return (Command as Record<string, Command>)[name];
    }
    throw new IllegalArgumentException("No enum constant Command." + name);
}

export enum PlayerState {
    MAIN = "MAIN",
    MAP = "MAP",
    FIGHT = "FIGHT",
}

export enum Direction {
    EAST = "EAST",
    WEST = "WEST",
    NORTH = "NORTH",
    SOUTH = "SOUTH",
}

/** Mirrors Direction.valueOf(String): throws IllegalArgumentException when unknown. */
export function directionFromString(name: string): Direction {
    if (Object.prototype.hasOwnProperty.call(Direction, name)) {
        return (Direction as Record<string, Direction>)[name];
    }
    throw new IllegalArgumentException("No enum constant Direction." + name);
}
