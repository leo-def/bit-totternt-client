# BitTorrent CLI Client

A lightweight and efficient Command Line Interface (CLI) BitTorrent client built with Node.js and TypeScript. 

Currently, the project supports peer discovery via HTTP/UDP trackers (handling compact peer lists), peer-wire protocol handshakes, basic piece downloading, and final file assembly with rigorous SHA1 piece hash validation.

## Features

- **Multi-protocol Tracker Announcing**: Full support for both UDP and HTTP/HTTPS trackers.
- **Bencode Parsing & Serialization**: Fast and type-safe encoder and decoder for Bencode files (torrents).
- **Compact Peer Representation parsing**: Parses binary IP/Port structures returned by trackers.
- **Peer-Wire Protocol Handshake**: TCP-based handshaking with active peers.
- **Basic Piece Downloading**: Downloads piece data directly from available peers.
- **File Reconstruction & Verification**: Assembles single-file and multi-file torrents and performs integrity verification against SHA1 piece hashes.
- **Configurability**: Accepts commands via CLI flags or default settings using `.env` environment files (Node.js 20+ built-in support).

## Prerequisites

- **Node.js**: version `v20.0.0` or higher is recommended (supporting `--env-file`).
- **NPM**: version `v9.0.0` or higher.

## Installation

Install the project dependencies locally:

```bash
npm install
```

Alternatively, you can use the provided `Makefile`:

```bash
make install
```

## Running the Application

### Configuration via Environment Variables

You can configure execution defaults using environment variables. Copy the provided `.env.example` file to `.env`:

```bash
cp .env.example .env
```

The application respects the following configuration variables:
- `TORRENT_PATH`: Default path to the `.torrent` file (fallback: `./sample.torrent`).
- `OUTPUT_DIR`: Default directory where downloaded torrent files/pieces are stored (fallback: `./downloads`).

### 1. Development Mode

To run in development mode with live reloading and hot compilation:

```bash
make dev
```

Or directly using ts-node:

```bash
npx ts-node src/index.ts
```

### 2. Production Mode

Build and run the compiled production bundle with defaults:

```bash
make run
```

Run with environment variables read from the `.env` file (Node.js 20+):

```bash
make run-env
```

Or manually:

```bash
npm run build
node ./build/index.js --torrent ./sample.torrent --output ./downloads
```

### 3. CLI Options Help

To view all available command line arguments:

```bash
node ./build/index.js --help
```

Output:
```text
Usage: node ./build/index.js [options]

Options:
  --help       Show this help message
  --torrent    Path to .torrent file (defaults to ./sample.torrent)
  --output     Directory where downloaded files will be written (defaults to ./downloads)

Examples:
  node ./build/index.js --torrent ./examples/torrent/sample.torrent --output ./downloads
```

## Testing

Run the comprehensive unit test suite to verify module correctness (UDP announcements, compact parsing, peer-wire handshakes, file assembly, etc.):

```bash
make test
```

Or:

```bash
npm test
```

## Known Limitations

- **Peer-Wire Logic**: Implementing full choke/unchoke state machines, bitfield/have exchanges, and advanced peer selection policies is currently in progress.
- **Request Pipelining**: The client downloads pieces sequentially rather than chunking them into standard parallel 16 KiB requests.
- **Resumable Downloads**: Partial download state caching and resuming is not yet implemented.
