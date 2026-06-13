# Server

Game Server for BELDAM.

Originally written in Java (2014), now ported to **TypeScript / Node.js**. The
telnet protocol, port (`23000`), assets and on-screen behaviour are unchanged,
so existing clients connect exactly as before — the port is transparent to
players.

## Running (Node.js / TypeScript)

Requires Node.js 18+.

```
npm install     # install dev dependencies (typescript, @types/node)
npm run build   # compile src/**/*.ts -> dist/
npm start       # run the server (node dist/index.js)
```

Then connect with any telnet client:

```
telnet localhost 23000
```

> The server reads the `assets/` directory using paths relative to the current
> working directory, so run the commands from the repository root.

For development you can skip the build step with `npm run dev` (uses `ts-node`).

### Notes on the port

- **Fully async.** The original spawned a blocking thread per client and read
  input synchronously, so the screen of every other player only refreshed when
  *they* pressed a key. The Node version is event-driven: the game loop
  `await`s input on a promise-based telnet reader (`TelnetSocket`), and screen
  updates are *pushed* to every affected player the moment something happens —
  a fight resolving, a companion joining/leaving, items dropping. No more
  pressing Enter to see what changed.
- The TypeScript sources live in `src/**/*.ts`, mirroring the original Java
  package layout for easy comparison. The legacy `*.java` files are kept
  alongside for reference.

## Commands

There is two sets of commands. One for the explore mode and one for the fight mode,

### Explore Mode

```
help                   # Show this help
say <message>          # Send a message to your companions
move <direction>       # Move somewhere. Directions are: "north", "south", "east", "west"
fight <id>             # Start a fight against a given monster. The monster have to be in your room.
map                    # Show the map
drop <id>              # Drop a given item on the ground
take <id>              # Take a given item from the ground
quit                   # Quit the game
```

### Fight Mode

```
help                   # Show this help
say <message>          # Send a message to your companions
attack <id>            # Attack a given monster
map                    # Show the map
quit                   # Quit the game
```

### Map Mode

```
help                   # Show this help
say <message>          # Send a message to your companions
quit                   # Quit the map
```
