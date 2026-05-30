# MemoSui

<p align="center">
  <img src="LOGO.png" width="200" alt="MemoSui Logo" />
</p>

Decentralized AI Memory Vault — a personal knowledge ledger powered by **Google Gemini AI**, secured on the **Sui blockchain** and **Walrus Protocol**.

Write your thoughts, memories, or technical logs. MemoSui's AI summarizes and indexes each entry, then commits an immutable fingerprint to the Sui network while sharding the encrypted payload across Walrus decentralized storage nodes.

## Features

- **AI-Powered Memory Indexing** — Gemini Flash summarizes raw text into structured entries with tags, action items, and importance ratings
- **On-Chain Fingerprints** — Each memory gets a SHA-256 content hash committed as a verifiable Sui transaction
- **Walrus Storage Shards** — Payloads are erasure-encoded and distributed across decentralized storage nodes (real SDK or simulated sandbox)
- **Conversational Memory ChatBot** — RAG-powered chat that queries your personal memory vault
- **Memory Knowledge Graph** — Visualize connections and patterns across your memory blocks
- **Timeline & Verification** — Browse your memory history and verify cryptographic integrity proofs on-chain
- **Digital Immortality** — Sovereign digital asset licensing and legacy planning
- **Bilingual UI** — Full Chinese (zh) and English (en) interface with runtime language switching
- **Wallet Integration** — MetaMask and Sui (OKX/Preset) wallet support with real-time balance sync

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Recharts, Motion |
| Backend | Express (Node.js), tsx dev server |
| AI | Google Gemini 3.5 Flash (`@google/genai`) |
| Blockchain | Sui Network — Move smart contracts, Sui JSON-RPC |
| Storage | Walrus Protocol via MemWal SDK (`@mysten-incubation/memwal`) |
| Icons | Lucide React |

## Project Structure

```
src/
├── App.tsx                          # Root component, routing, state orchestration
├── main.tsx                         # React entry point
├── types.ts                         # TypeScript type definitions
├── utils.ts                         # Hash simulation, blob ID generation, helpers
├── locales.ts                       # Chinese/English translations
├── index.css                        # Global styles (Tailwind + custom)
└── components/
    ├── NetworkHeader.tsx            # Top bar: network stats, wallet, lang/theme toggles
    ├── WalletLoginGateway.tsx       # Wallet connection screen (MetaMask / Sui)
    ├── CreateMemoryForm.tsx         # Memory input form with AI summarization pipeline
    ├── MemoryTimeline.tsx           # Scrollable memory feed with verify/delete
    ├── MemoryChatBot.tsx            # RAG chat agent over user's memory vault
    ├── MemoryResearcher.tsx         # Deep pattern analysis across stored memories
    ├── MemoryKnowledgeGraph.tsx     # Interactive knowledge visualization (Recharts)
    ├── StorageNodeMap.tsx           # Walrus storage node topology visualizer
    ├── VerificationTab.tsx          # Multi-mode hash verification tool
    ├── VerifyModal.tsx              # Per-memory cryptographic proof inspector
    ├── DigitalImmortalityTab.tsx    # Digital legacy and asset licensing
    ├── SettingsTab.tsx              # Wallet config, MemWal SDK params, data wipe
    └── MemoSuiLogo.tsx              # Logo component
server.ts                            # Express server with /api/summarize, /api/chat, /api/memwal
```

## Getting Started

**Prerequisites:** Node.js 18+

```bash
npm install
```

Create a `.env` file based on `.env.example`:

```env
GEMINI_API_KEY="your-gemini-api-key"
```

Then start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm start
```

## How It Works

1. **Input** — Write a memory entry (text, idea, diary, tech log) in the Noter
2. **AI Indexing** — Gemini Flash extracts a title, summary, tags, action items, and importance rating
3. **Hash & Sign** — A SHA-256 fingerprint is generated; optionally signed via MetaMask `personal_sign`
4. **Walrus Storage** — The payload is erasure-encoded into 16 shards and distributed across decentralized storage nodes
5. **Sui Commitment** — Metadata and blob pointer are committed to the Sui ledger as an immutable block
6. **Verify** — Any entry can be verified on-chain via its cryptographic proof

## MemWal SDK Integration

MemoSui integrates with the real MemWal SDK (`@mysten-incubation/memwal`) for live Walrus storage. Toggle between simulated sandbox mode and real SDK mode in the Settings panel. Real SDK mode requires:

- A valid MemWal delegate key and account ID
- Relayer URL (default: `https://relayer.staging.memwal.ai`)
- Sui testnet/mainnet balance for gas

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/summarize` | AI-powered memory analysis and indexing |
| `POST /api/chat` | RAG chat agent over user's memory vault |
| `POST /api/memwal/remember` | Real Walrus storage via MemWal SDK |

## License

Apache-2.0
