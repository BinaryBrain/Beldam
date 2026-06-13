/**
 * Reproduces java.lang.String#split(regex) with the default limit of 0:
 * splits on every match and drops trailing empty strings. This matters for
 * faithful command parsing and word-wrapping (e.g. " ".split(" ") -> []).
 */
export function javaSplit(input: string, regex: RegExp): string[] {
    const parts = input.split(regex);
    let end = parts.length;
    while (end > 0 && parts[end - 1] === "") {
        end--;
    }
    return parts.slice(0, end);
}

/** True if every character is representable in US-ASCII (matches CharsetEncoder#canEncode). */
export function isAscii(text: string): boolean {
    return /^[\x00-\x7F]*$/.test(text);
}
