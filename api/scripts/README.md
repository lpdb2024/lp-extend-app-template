# API Scripts

Utility scripts for the Control Tower API.

## kill-port.js

Automatically kills any process running on port 8080 (or the configured PORT) before starting the dev server.

### Purpose

Prevents `EADDRINUSE: address already in use` errors when:
- Multiple dev servers are accidentally started
- Previous dev server processes weren't properly terminated
- Port is in use by another application

### Usage

The script runs automatically before `npm run start:dev` via the `prestart:dev` npm script hook.

Manual usage:
```bash
node scripts/kill-port.js
```

### Configuration

The port can be configured via the `PORT` environment variable:
```bash
PORT=3000 node scripts/kill-port.js
```

### Platform Support

- **Windows**: Uses `netstat` and `taskkill`
- **Linux/macOS**: Uses `lsof` and `kill`

### How It Works

1. Detects the operating system platform
2. Finds all processes using the specified port
3. Kills each process gracefully
4. Continues execution even if no processes are found (non-blocking)

This ensures the dev server can always start cleanly without manual intervention.
