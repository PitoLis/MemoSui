/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AISummary {
  title: string;
  summary: string;
  tags: string[];
  actionItems: string[];
  importanceRating: number;
}

export interface FileData {
  name: string;
  size: number;
  type: string;
  content?: string;
}

export interface StoredMemory {
  id: string;
  originalText: string;
  title: string;
  summary: string;
  tags: string[];
  actionItems: string[];
  importanceRating: number;
  createdAt: string;
  epoch: number;
  sizeBytes: number;
  blobId: string;
  txHash: string;
  storageLayer: 'walrus' | 'sui_object';
  shardsCount: number;
  isEncrypted: boolean;
  shardsNodes: string[]; // List of storage node IDs hosting the shards
  fileInfo?: FileData;
}

export interface StorageNode {
  id: string;
  name: string;
  status: 'active' | 'offline' | 'warning';
  capacityUsed: string;
  capacityTotal: string;
  region: string;
  shardsCount: number;
  intensity: number; // for visual pulses
}

export interface NetworkStats {
  totalSecuredMemories: number;
  walrusStorageRemaining: string;
  suiNetworkStatus: string;
  epochsElapsed: number;
  suiGasPrice: string;
  consensusHealth: number;
}
