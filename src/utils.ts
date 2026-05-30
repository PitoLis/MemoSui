/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StoredMemory, StorageNode, NetworkStats } from "./types";

// Simulates SHA-256-like hashing returning a pristine 64-char hex string (256 bits)
export function simulateHash(text: string): string {
  let hash0 = 15335;
  let hash1 = 23901;
  let hash2 = 89045;
  let hash3 = 62111;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash0 = (hash0 * 33 + char) ^ (hash1 >> 2);
    hash1 = (hash1 * 37 + char) ^ (hash2 >> 3);
    hash2 = (hash2 * 41 + char) ^ (hash3 >> 4);
    hash3 = (hash3 * 43 + char) ^ (hash0 >> 5);
  }
  const toHex = (n: number) => {
    return Math.abs(n).toString(16).padEnd(8, "f").slice(0, 8);
  };
  
  // Make sure it has exactly 64 hex characters (plus 0x prefix)
  const basePart = toHex(hash0) + toHex(hash1) + toHex(hash2) + toHex(hash3);
  let extraPart = "";
  for (let i = 0; i < 32; i++) {
    // deterministic addition based on length + character patterns
    const val = (text.length * 7 + (text.charCodeAt(i % text.length) || i) * 11) % 16;
    extraPart += val.toString(16);
  }
  return `0x${basePart}${extraPart}`.toLowerCase().slice(0, 66);
}

// Generates a mock Walrus Blob ID
export function generateWalrusBlobId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
  let blobId = "walrus://b-";
  for (let i = 0; i < 44; i++) {
    blobId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return blobId;
}

// Generate a random Sui TX hash
export function generateSuiTxHash(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let tx = "0x";
  for (let i = 0; i < 32; i++) {
    tx += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return tx.toLowerCase();
}

// Pre-seeded Walrus Nodes
export const DEFAULT_STORAGE_NODES: StorageNode[] = [
  { id: "node-1", name: "Walrus-Alpha (US-West)", status: "active", capacityUsed: "124 GB", capacityTotal: "1024 GB", region: "Oregon, USA", shardsCount: 154, intensity: 1 },
  { id: "node-2", name: "Walrus-Beta (US-East)", status: "active", capacityUsed: "412 GB", capacityTotal: "1024 GB", region: "Virginia, USA", shardsCount: 224, intensity: 1.2 },
  { id: "node-3", name: "Walrus-Gamma (EU-Central)", status: "active", capacityUsed: "870 GB", capacityTotal: "2048 GB", region: "Frankfurt, DE", shardsCount: 310, intensity: 1.5 },
  { id: "node-4", name: "Walrus-Delta (EU-West)", status: "active", capacityUsed: "54 GB", capacityTotal: "1024 GB", region: "Dublin, IE", shardsCount: 92, intensity: 1 },
  { id: "node-5", name: "Walrus-Epsilon (AP-East)", status: "active", capacityUsed: "320 GB", capacityTotal: "1024 GB", region: "Hong Kong", shardsCount: 180, intensity: 1 },
  { id: "node-6", name: "Walrus-Zeta (AP-South)", status: "active", capacityUsed: "189 GB", capacityTotal: "512 GB", region: "Singapore", shardsCount: 121, intensity: 1.1 },
  { id: "node-7", name: "Walrus-Eta (SA-East)", status: "warning", capacityUsed: "480 GB", capacityTotal: "512 GB", region: "São Paulo, BR", shardsCount: 230, intensity: 0.8 },
  { id: "node-8", name: "Walrus-Theta (EU-North)", status: "active", capacityUsed: "210 GB", capacityTotal: "1024 GB", region: "Stockholm, SE", shardsCount: 140, intensity: 1.0 },
  { id: "node-9", name: "Walrus-Iota (US-South)", status: "active", capacityUsed: "612 GB", capacityTotal: "1024 GB", region: "Texas, USA", shardsCount: 290, intensity: 1.3 },
  { id: "node-10", name: "Walrus-Kappa (AP-Southeast)", status: "active", capacityUsed: "95 GB", capacityTotal: "512 GB", region: "Sydney, AU", shardsCount: 65, intensity: 1.1 },
  { id: "node-11", name: "Walrus-Lambda (ME-Central)", status: "offline", capacityUsed: "0 GB", capacityTotal: "1024 GB", region: "Dubai, UAE", shardsCount: 0, intensity: 0 },
  { id: "node-12", name: "Walrus-Mu (AF-South)", status: "active", capacityUsed: "45 GB", capacityTotal: "512 GB", region: "Cape Town, ZA", shardsCount: 32, intensity: 1 }
];

// Seed Memories
export const INITIAL_MEMORIES: StoredMemory[] = [
  {
    id: "mem-0",
    originalText: "今天终于部署了我们组在 Sui 链上的首个 Move 智能对象合约，多签调用零阻塞，感觉极有成就感！",
    title: "Sui Contract Success Deploy",
    summary: "Successfully finalized and registered the design architecture pointers of our SUI multi-asset on-chain memory vault, optimizing pipeline consensus health.",
    tags: ["sui-move", "smart-contract", "development"],
    actionItems: [
      "Review gas-price updates across SUI Testnet nodes.",
      "Consolidate Merkle Root pointer checks with Walrus explorers."
    ],
    importanceRating: 5,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4h ago
    epoch: 342,
    sizeBytes: 154,
    blobId: "walrus://b-qG7b1y9Yf7s9Gg6yH3kLmOpQrStUvWxYzAbCdEfGhIjK",
    txHash: "0xec8095f2e8a1f592789fbc892def1a12bcde38ef9012a67bc89d23fe45ab89d31",
    storageLayer: "walrus",
    shardsCount: 16,
    isEncrypted: false,
    shardsNodes: ["node-1", "node-3", "node-5", "node-2", "node-6", "node-8", "node-9", "node-10"]
  },
  {
    id: "mem-1",
    originalText: "晚上和核心开发团队聚火锅，畅快地聊了三小时关于大语言模型 (LLM) 与去中心化存储 (DePIN) 深入咬合的灵感架构。",
    title: "DePIN & AI Strategic Dinner",
    summary: "Gathered with the AGV Core developers to outline high-performance metadata routing architectures with Walrus decentralized storage blocks.",
    tags: ["depin-networks", "ai-indexing", "ideas"],
    actionItems: [
      "Draft modular context templates for unstructured prompt input summaries.",
      "Examine Walrus Erasure coding packet thresholds."
    ],
    importanceRating: 4,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    epoch: 341,
    sizeBytes: 210,
    blobId: "walrus://b-mK8s0g1Yf8r2Gf5yJ1lOpNqRsTuVwXyZaBcDeFgHiJk",
    txHash: "0x89ab72bcdaef38de123fa45b78cd89ee45feefee31e4abef90df874be2acdef3",
    storageLayer: "walrus",
    shardsCount: 16,
    isEncrypted: false,
    shardsNodes: ["node-2", "node-3", "node-4", "node-6", "node-8", "node-10", "node-12"]
  },
  {
    id: "mem-2",
    originalText: "给管理团队草拟了把云服务器计算开支降低 30% 的架构重构方案，今天下午已经顺利获批了！",
    title: "30% Cloud Cost Savings Approval",
    summary: "Refined a cloud infrastructure framework proposal which achieves 30% operational server budget cuts; proposal officially authorized by executive stakeholders.",
    tags: ["savings", "cloud-computing", "milestone"],
    actionItems: [
      "Initiate first testing stage of the high-concurrency client node caches."
    ],
    importanceRating: 3,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    epoch: 339,
    sizeBytes: 130,
    blobId: "walrus://b-vR5f2e9Yf3s7Dg2yH0kLmOpQrStUvWxYzAbCdEfGhIjK",
    txHash: "0xf74be2acdef39de901abc45bc56fe78ba23ef98ff021cabef913ca0a0a0af1f9",
    storageLayer: "walrus",
    shardsCount: 16,
    isEncrypted: false,
    shardsNodes: ["node-1", "node-2", "node-3", "node-4"]
  }
];

// Dynamic mock update function
export function calculateNetworkStats(memories: StoredMemory[]): NetworkStats {
  const sumBytes = memories.reduce((acc, curr) => acc + curr.sizeBytes, 0);
  const totalGbRemaining = (250 * 1024 * 1024 * 1024 - sumBytes) / (1024 * 1024 * 1024);
  
  return {
    totalSecuredMemories: memories.length,
    walrusStorageRemaining: `${totalGbRemaining.toFixed(2)} GB`,
    suiNetworkStatus: "Connected · Testnet Node #023",
    epochsElapsed: 342,
    suiGasPrice: "0.00012 SUI/TX",
    consensusHealth: 99.98
  };
}
