import { IllegalArgumentException } from "../utils/errors";

export enum BodyPart {
    HEAD = "HEAD",
    TORSO = "TORSO",
    SHOULDERS = "SHOULDERS",
    LEGS = "LEGS",
    FEET = "FEET",
    RIGHT_HAND = "RIGHT_HAND",
    LEFT_HAND = "LEFT_HAND",
    BOTH_HANDS = "BOTH_HANDS",
}

/** Mirrors BodyPart.valueOf(String): throws on an unknown name. */
export function bodyPartFromString(name: string): BodyPart {
    if (Object.prototype.hasOwnProperty.call(BodyPart, name)) {
        return (BodyPart as Record<string, BodyPart>)[name];
    }
    throw new IllegalArgumentException("No enum constant BodyPart." + name);
}
