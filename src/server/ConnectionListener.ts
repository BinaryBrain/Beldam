import * as net from "net";
import { ConnectionHandler } from "./ConnectionHandler";

export class ConnectionListener {
    readonly TELNET_PORT = 23000;

    private readonly server: net.Server;

    constructor() {
        this.server = net.createServer((socket: net.Socket) => {
            const handler = new ConnectionHandler(socket);
            handler.run().catch((ex) => console.error("Handler crashed:", ex));
        });
    }

    start(): void {
        this.server.on("error", (ex) => console.error("Server error:", ex));
        this.server.listen(this.TELNET_PORT, () => {
            console.log("BELDAM server listening on telnet port " + this.TELNET_PORT);
        });
    }

    stop(): void {
        this.server.close();
    }
}
