import * as net from "net";

// Telnet protocol bytes we need to recognise in order to strip negotiation
// sequences out of the input stream (the original Java BufferedReader did not
// do this; stripping them keeps things robust without changing the UX).
const IAC = 255;
const SB = 250;
const SE = 240;
const WILL = 251;
const WONT = 252;
const DO = 253;
const DONT = 254;

type Resolver = (line: string | null) => void;

/**
 * Promise-based, line-oriented async wrapper around a TCP socket. This is what
 * replaces the original blocking BufferedReader/Thread-per-client model: the
 * whole game loop can now `await readLine()` while the Node event loop keeps
 * every other connection (and every fight) responsive.
 */
export class TelnetSocket {
    private readonly socket: net.Socket;

    private lineBuffer = "";
    private readonly readyLines: string[] = [];
    private readonly waiters: Resolver[] = [];
    private closed = false;

    // Serialises writes so concurrent renders never interleave on the wire.
    private writeChain: Promise<void> = Promise.resolve();

    // Telnet IAC parsing state.
    private iacMode: "text" | "iac" | "option" | "sub" = "text";
    private subSawIac = false;

    constructor(socket: net.Socket) {
        this.socket = socket;
        this.socket.setNoDelay(true);
        this.socket.on("data", (chunk: Buffer) => this.onData(chunk));
        this.socket.on("close", () => this.onClose());
        this.socket.on("error", () => this.onClose());
    }

    private onData(chunk: Buffer): void {
        let text = "";

        for (const byte of chunk) {
            switch (this.iacMode) {
                case "text":
                    if (byte === IAC) {
                        this.iacMode = "iac";
                    } else {
                        text += String.fromCharCode(byte);
                    }
                    break;
                case "iac":
                    if (byte === IAC) {
                        // Escaped 0xFF -> literal byte.
                        text += String.fromCharCode(IAC);
                        this.iacMode = "text";
                    } else if (byte === WILL || byte === WONT || byte === DO || byte === DONT) {
                        this.iacMode = "option";
                    } else if (byte === SB) {
                        this.iacMode = "sub";
                        this.subSawIac = false;
                    } else {
                        this.iacMode = "text";
                    }
                    break;
                case "option":
                    // Skip the single option byte.
                    this.iacMode = "text";
                    break;
                case "sub":
                    if (this.subSawIac) {
                        if (byte === SE) {
                            this.iacMode = "text";
                        }
                        this.subSawIac = false;
                    } else if (byte === IAC) {
                        this.subSawIac = true;
                    }
                    break;
            }
        }

        if (text.length > 0) {
            this.appendText(text);
        }
    }

    private appendText(text: string): void {
        this.lineBuffer += text;

        let idx: number;
        while ((idx = this.lineBuffer.indexOf("\n")) >= 0) {
            let line = this.lineBuffer.substring(0, idx);
            this.lineBuffer = this.lineBuffer.substring(idx + 1);
            if (line.endsWith("\r")) {
                line = line.substring(0, line.length - 1);
            }
            this.pushLine(line);
        }
    }

    private pushLine(line: string): void {
        const waiter = this.waiters.shift();
        if (waiter) {
            waiter(line);
        } else {
            this.readyLines.push(line);
        }
    }

    private onClose(): void {
        if (this.closed) {
            return;
        }
        this.closed = true;
        while (this.waiters.length > 0) {
            const waiter = this.waiters.shift() as Resolver;
            waiter(null);
        }
    }

    /** Resolves with the next line, or null once the connection is closed. */
    readLine(): Promise<string | null> {
        const ready = this.readyLines.shift();
        if (ready !== undefined) {
            return Promise.resolve(ready);
        }
        if (this.closed) {
            return Promise.resolve(null);
        }
        return new Promise<string | null>((resolve) => this.waiters.push(resolve));
    }

    write(data: string): Promise<void> {
        this.writeChain = this.writeChain.then(
            () =>
                new Promise<void>((resolve) => {
                    if (this.closed || this.socket.destroyed) {
                        resolve();
                        return;
                    }
                    this.socket.write(data, () => resolve());
                })
        );
        return this.writeChain;
    }

    close(): void {
        try {
            this.socket.end();
            this.socket.destroy();
        } catch {
            // ignore
        }
        this.onClose();
    }
}
