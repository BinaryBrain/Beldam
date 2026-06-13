import * as fs from "fs";

/**
 * Reads a text file into its individual lines, mirroring repeated
 * BufferedReader#readLine() calls: line terminators are stripped and a
 * trailing newline does not produce an extra empty line.
 */
export function readLines(filename: string): string[] {
    const content = fs.readFileSync(filename, "utf8");
    const lines = content.split(/\r?\n/);
    if (lines.length > 0 && lines[lines.length - 1] === "") {
        lines.pop();
    }
    return lines;
}

/**
 * Reads a file and re-joins it the way the original screens were assembled:
 * every line followed by a CRLF (including the last one).
 */
export function readScreen(filename: string): string {
    return readLines(filename)
        .map((line) => line + "\r\n")
        .join("");
}

/** Reads the entire file as a UTF-8 string, as-is (matches Files.readAllBytes + new String). */
export function readText(filename: string): string {
    return fs.readFileSync(filename, "utf8");
}

const csvCache = new Map<string, string[][]>();

/**
 * Minimal RFC 4180 CSV parser (matches the commons-csv usage of the original):
 * comma separated fields, optional double-quoted fields, and "" as an escaped
 * quote inside a quoted field. Results are cached per filename.
 */
export function parseCsv(filename: string): string[][] {
    const cached = csvCache.get(filename);
    if (cached) {
        return cached;
    }

    const content = fs.readFileSync(filename, "utf8");
    const records: string[][] = [];
    let record: string[] = [];
    let field = "";
    let inQuotes = false;
    let dirty = false; // current record/field has seen content or a delimiter

    const endField = () => {
        record.push(field);
        field = "";
    };
    const endRecord = () => {
        endField();
        records.push(record);
        record = [];
        dirty = false;
    };

    for (let i = 0; i < content.length; i++) {
        const c = content[i];

        if (inQuotes) {
            if (c === '"') {
                if (content[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                field += c;
            }
            continue;
        }

        if (c === '"') {
            inQuotes = true;
            dirty = true;
        } else if (c === ",") {
            endField();
            dirty = true;
        } else if (c === "\r") {
            // ignore; handled with the following \n
        } else if (c === "\n") {
            if (dirty || field.length > 0 || record.length > 0) {
                endRecord();
            }
        } else {
            field += c;
            dirty = true;
        }
    }

    if (dirty || field.length > 0 || record.length > 0) {
        endRecord();
    }

    csvCache.set(filename, records);
    return records;
}
