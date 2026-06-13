// Small helpers mirroring java.util.Random semantics used by the game.

/** Equivalent to java.util.Random#nextInt(bound): returns 0..bound-1. */
export function nextInt(bound: number): number {
    return Math.floor(Math.random() * bound);
}

/** Equivalent to java.util.Random#nextDouble(): returns a value in [0, 1). */
export function nextDouble(): number {
    return Math.random();
}
