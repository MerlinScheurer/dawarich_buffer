# dawarich_buffer

If your DaWarIch instance is not runing continously, this docker image can be slotted before it (on a host which is running continously) and cache all the point requests and forward them, its available again.

## Usage

This is designed to go in between [dawarich-home-assistant](https://github.com/AlbinLind/dawarich-home-assistant) and [dawarich](https://github.com/Freika/dawarich).

## Prod

[Docker](./docker-compose.yml)

## Dev

To install dependencies:

```bash
# Install packages
bun install

# Copy env
cp .env.example .env

# Start:
bun dev

# Start mock server:
bun .\tools\mockServer.ts

# Send request:
bun .\tools\sendRequestDawarich.ts

```
