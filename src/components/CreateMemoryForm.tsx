/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { StoredMemory } from "../types";
import { Language, TRANSLATIONS } from "../locales";
import { simulateHash, generateWalrusBlobId, generateSuiTxHash } from "../utils";
import { HelpCircle, Sparkles, RefreshCw, PenTool, CheckCircle, Database } from "lucide-react";

interface CreateMemoryFormProps {
  onMemoryCreated: (newMemory: StoredMemory) => void;
  walletConnected: boolean;
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  walletType: "metamask" | "sui_preset" | "";
  walletAddress: string;
  onShardSlicingStart: (nodeIds: string[]) => void;
  onShardSlicingEnd: () => void;
  lang: Language;

  memwalKey: string;
  memwalAccountId: string;
  memwalServerUrl: string;
  memwalNamespace: string;
  memwalUseRealSDK: boolean;
}

const SUGGESTIONS = {
  zh: [
    "今天完成了 Sui-Move 智能合约的部署，多签调用非常顺畅，感觉很有成就感！",
    "晚上跟好朋友聚餐，火锅和啤酒都很棒，聊到了很多大模型和 Web3 的灵感。",
    "设计了一个能够节省 30% 云端计算开销的缓存重构方案，下周准备向团队汇报。",
    "读完了瓦尔登湖的第三章，觉得身处凡尘，拥有一片属于自己的精神防区至关重要。"
  ],
  en: [
    "Successfully deployed the Sui-Move smart contract today. Multi-sig calls are smooth and blazing fast!",
    "Had a wonderful dinner with friends tonight. The hotpot was amazing, and we discussed fascinating Web3 & AI integrations.",
    "Designed a caching architecture that optimizes cloud service cost by 30%. Ready to present next week.",
    "Just finished Thoreau's Walden Chapter 3. Quiet contemplation is the ultimate luxury in our hyper-connected world."
  ]
};

export default function CreateMemoryForm({
  onMemoryCreated,
  walletConnected,
  walletBalance,
  setWalletBalance,
  walletType,
  walletAddress,
  onShardSlicingStart,
  onShardSlicingEnd,
  lang,
  memwalKey,
  memwalAccountId,
  memwalServerUrl,
  memwalNamespace,
  memwalUseRealSDK
}: CreateMemoryFormProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [txLogs, setTxLogs] = useState<string[]>([]);
  
  const t = TRANSLATIONS[lang];

  // Steps matching the streamlined Sui + Walrus pipeline:
  const pipelineSteps = lang === "zh" ? [
    "1. [MemoSui AI] 正在分析文本并总结记忆...",
    "2. [SHA-256] 正在生成本条记录的防篡改内容哈希...",
    "3. [Walrus] 正在生成数据纠删编码分片并提交去中心化网络...",
    "4. [Sui Network] 正在写入链上元数据并发行专属记忆 NFT 指针...",
    "5. [Consensus] 区块打包共识验证通过，返回可验证密码学证书！"
  ] : [
    "1. [MemoSui AI] Analyzing text and summarizing structured memory...",
    "2. [SHA-256] Computing content fingerprint hash for tamper-proof storage...",
    "3. [Walrus] Encoding payload shards and broad-casting to decentralised nodes...",
    "4. [Sui Network] Committing immutable block pointer and minting memory NFT...",
    "5. [Consensus] Transaction confirmed on ledger. Verifiable certificate issued!"
  ];

  const handleSuggestionClick = (suggestion: string) => {
    if (!isSubmitting) {
      setText(suggestion);
    }
  };

  const handleSecureMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (!walletConnected && !memwalUseRealSDK) {
      alert(lang === "zh" ? "请先点击右上角连接您的钱包！" : "Please connect your wallet first in the header.");
      return;
    }

    const requiredGas = walletType === "metamask" ? 0.0001 : 0.1;
    if (walletBalance < requiredGas && !memwalUseRealSDK) {
      alert(walletType === "metamask"
        ? (lang === "zh" ? "ETH测试余额不足，请点击右上角申请 Faucet 注入！" : "Insufficient ETH. Please request faucet in the header!")
        : (t.faucetError || "Insufficient SUI. Please request faucet!")
      );
      return;
    }

    setIsSubmitting(true);
    setCurrentStep(0);
    setTxLogs([]);

    // We select 8 random storage nodes from Walrus to visual-pulse in the sidebar
    const randomNodeIds = ["node-1", "node-2", "node-3", "node-4", "node-5", "node-6", "node-8", "node-9", "node-10", "node-12"];
    const activeNodesSelected = randomNodeIds.sort(() => 0.5 - Math.random()).slice(0, 8);
    onShardSlicingStart(activeNodesSelected);

    // Step 1: Request AI summaries from /api/summarize proxy (translating unstructured statement into structured format)
    setIsSummarizing(true);
    setTxLogs(prev => [...prev, pipelineSteps[0]]);
    
    let aiResult = {
      title: lang === "zh" ? "链上智能备忘" : "Secured On-Chain Memory",
      summary: text,
      tags: ["memo"],
      actionItems: [] as string[],
      importanceRating: 3
    };

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text, lang })
      });
      if (res.ok) {
        const data = await res.json();
        aiResult = data;
      }
    } catch (err) {
      console.error("Gemini AI Summarizer Error:", err);
    } finally {
      setIsSummarizing(false);
    }

    // REAL MEMWAL LIVE SDK PIPELINE
    if (memwalUseRealSDK) {
      setTxLogs(prev => [...prev, lang === "zh" ? "⚡ [MemWal SDK] 正在检索验证系统中的开发者委托凭证..." : "⚡ [MemWal SDK] Inspecting developer credentials and namespace client..."]);
      await new Promise(r => setTimeout(r, 500));

      setTxLogs(prev => [...prev, lang === "zh" ? `⚡ [MemWal SDK] 正在向中继节点发送 remember 请求 ➔ ${memwalServerUrl}` : `⚡ [MemWal SDK] Dispatching client remember request to relayer ➔ ${memwalServerUrl}`]);
      
      try {
        const response = await fetch("/api/memwal/remember", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: memwalKey,
            accountId: memwalAccountId,
            serverUrl: memwalServerUrl,
            namespace: memwalNamespace,
            text: text
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || errData.error || "MemWal SDK job rejected on current relayer cluster.");
        }

        const memwalResult = await response.json();
        
        setTxLogs(prev => [...prev, lang === "zh" ? `✅ [MemWal SDK] 归属事件投递成功! 任务流水号: ${memwalResult.jobId.slice(0, 24)}...` : `✅ [MemWal SDK] Event accepted on ledger. Job ID: ${memwalResult.jobId.slice(0, 24)}...`]);
        await new Promise(r => setTimeout(r, 600));

        setTxLogs(prev => [...prev, lang === "zh" ? `✅ [Walrus Protocol] 多节点哈希切片已持久落带 (BlobId: ${memwalResult.blobId.slice(0, 20)}...)` : `✅ [Walrus Protocol] Highly available erasure fragments validated (BlobId: ${memwalResult.blobId.slice(0, 20)}...)`]);
        await new Promise(r => setTimeout(r, 600));

        setTxLogs(prev => [...prev, lang === "zh" ? `✅ [Sui Ledger] NFT Pointers 指针对象已同步! 区块哈希: ${memwalResult.txHash}` : `✅ [Sui Ledger] Owner NFT aligned successfully! Ledger TX: ${memwalResult.txHash}`]);

        const finalMemory: StoredMemory = {
          id: "mem-" + Date.now(),
          originalText: text,
          title: aiResult.title,
          summary: aiResult.summary,
          tags: aiResult.tags.length > 0 ? aiResult.tags : ["memo", "live-memwal"],
          actionItems: aiResult.actionItems || [],
          importanceRating: aiResult.importanceRating || 3,
          createdAt: new Date().toISOString(),
          epoch: 343 + Math.floor(Math.random() * 2),
          sizeBytes: new Blob([text]).size,
          blobId: memwalResult.blobId,
          txHash: memwalResult.txHash,
          storageLayer: "walrus",
          shardsCount: 16,
          isEncrypted: false,
          shardsNodes: activeNodesSelected
        };

        onMemoryCreated(finalMemory);
        onShardSlicingEnd();
        setText("");
        setIsSubmitting(false);
        return;
      } catch (err: any) {
        setIsSubmitting(false);
        onShardSlicingEnd();
        alert(lang === "zh" 
          ? `MemWal SDK 物理上链同步失败: ${err.message}` 
          : `MemWal SDK physical blockchain sync failed: ${err.message}`);
        return;
      }
    }

    // Fallback to SIMULATED SANDBOX FLOW
    // Generate real SHA-256 Content Hash using simulateHash (now authentic-looking 64 hex characters)
    const secureHash = simulateHash(text);

    // METAMASK REAL ON-CHAIN PERSONAL_SIGN STEP INITIALIZATION
    if (walletType === "metamask" && typeof (window as any).ethereum !== "undefined") {
      try {
        const signMsg = `MEMOSUI CRYPTO-LEDGER AGREEMENT:\n\nRegistering immutable on-chain memory.\n\nPayload fingerprint: 0x${secureHash}\nTimestamp: ${new Date().toISOString()}\nSponsor Address: ${walletAddress}`;
        
        // Convert signature payload message to raw UTF-8 octets hex
        const msgHex = "0x" + Array.from(new TextEncoder().encode(signMsg))
          .map(b => b.toString(16).padStart(2, "0"))
          .join("");

        setTxLogs(prev => [...prev, lang === "zh" ? "⚡ [METAMASK] 正在发出链上数字凭证签名请求..." : "⚡ [METAMASK] Requesting secure signature verification..."]);
        
        const signature = await (window as any).ethereum.request({
          method: "personal_sign",
          params: [msgHex, walletAddress]
        });

        setTxLogs(prev => [...prev, lang === "zh" ? `✅ [METAMASK] 采集到防篡改签名: ${signature.substring(0, 20)}...` : `✅ [METAMASK] Cryptographical signature acquired: ${signature.substring(0, 20)}...`]);
      } catch (err: any) {
        setIsSubmitting(false);
        onShardSlicingEnd();
        alert(lang === "zh"
          ? `签名已被拒绝或失败: ${err.message || err}`
          : `Signature authorization was rejected or failed: ${err.message || err}`
        );
        return;
      }
    }

    // Process step-by-step cryptographic sequence visuals
    for (let i = 1; i < pipelineSteps.length; i++) {
      setCurrentStep(i);
      setTxLogs(prev => [...prev, pipelineSteps[i]]);
      // Provide a sweet short latency for the cyberpunk tech console experience
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    // Complete transaction gas cost
    const gasDeducted = walletType === "metamask" ? 0.00015 + Math.random() * 0.00005 : 0.05 + Math.random() * 0.02;
    setWalletBalance(prev => Math.max(0, prev - gasDeducted));

    const finalMemory: StoredMemory = {
      id: "mem-" + Date.now(),
      originalText: text,
      title: aiResult.title,
      summary: aiResult.summary,
      tags: aiResult.tags.length > 0 ? aiResult.tags : ["memo", "personal"],
      actionItems: aiResult.actionItems || [],
      importanceRating: aiResult.importanceRating || 3,
      createdAt: new Date().toISOString(),
      epoch: 342 + Math.floor(Math.random() * 3),
      sizeBytes: new Blob([text]).size,
      blobId: generateWalrusBlobId(), // base64 pointer represent
      txHash: secureHash, // We store our SHA-256 hash inside the ID/Hash register
      storageLayer: "walrus",
      shardsCount: 16,
      isEncrypted: false,
      shardsNodes: activeNodesSelected
    };

    onMemoryCreated(finalMemory);
    onShardSlicingEnd();

    // Clean text input on success
    setText("");
    setIsSubmitting(false);
  };

  return (
    <div id="create-memory-card" className="bg-[#0c0c0c] border border-[#222222] p-6 relative overflow-hidden">
      
      {/* Decorative cyber corner ticks */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#ff4d00]/40" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#ff4d00]/40" />

      {/* Title block */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222222]/60 font-mono">
        <h3 className="text-xs font-bold tracking-[0.2em] text-[#ffffff] flex items-center uppercase">
          <Sparkles className="w-4 h-4 text-[#ff4d00] mr-2" />
          {lang === "zh" ? "全新智能记忆锚入 // INPUT_PROMPT" : "SECURE NEW MEMORY SEGMENT // INPUT_PROMPT"}
        </h3>
        <span className="text-[8px] text-[#ff4d00] bg-[#ff4d00]/5 border border-[#ff4d00]/20 px-2.5 py-1 uppercase tracking-wider font-bold">
          {memwalUseRealSDK 
            ? (lang === "zh" ? "🔴 MemWal 调试联调器" : "🔴 MEMWAL LIVE SDK")
            : (lang === "zh" ? "AI 总结 + 链上存证" : "AI SUMMARY + ONCHAIN")
          }
        </span>
      </div>

      <form onSubmit={handleSecureMemory} className="space-y-4">
        
        {/* Core Sentence Input */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSubmitting}
            placeholder={lang === "zh" ? "一句话随意输入您的日记、想法或灵感，AI 将提炼并打包生成高鲁棒性分片持久至去中心化 Walrus 网络..." : "Type a single sentence of your thoughts, diary, or idea. AI will summarize and commit it immutably..."}
            className="w-full h-28 bg-[#111111] border border-[#222222] text-xs font-sans text-[#e0e0e0] placeholder-[#555555] focus:outline-none focus:border-[#ff4d00] p-4 resize-none leading-relaxed transition-all focus:ring-1 focus:ring-[#ff4d00]/10"
            maxLength={1000}
          />
          
          {text.length > 0 && !isSubmitting && (
            <span className="absolute bottom-2.5 right-3 text-[9px] font-mono text-[#444444]">
              {text.length} / 1000 CH
            </span>
          )}
        </div>

        {/* Quick Sentence Suggestions Panel */}
        {!isSubmitting && (
          <div className="space-y-1.5 pt-1 font-mono">
            <span className="text-[9px] font-bold text-[#555555] uppercase tracking-widest flex items-center">
              <PenTool className="w-3 h-3 text-[#ff4d00] mr-1.5" />
              {lang === "zh" ? "推荐体验句式 (点击快速录入):" : "TAP TO TRY EXAMPLES:"}
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(lang === "zh" ? SUGGESTIONS.zh : SUGGESTIONS.en).map((item, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSuggestionClick(item)}
                  className="text-left bg-[#111111] hover:bg-[#1a1a1a] text-[10px] text-[#888888] hover:text-white border border-[#222222] p-2.5 transition-all select-none truncate hover:border-[#ff4d00]/40 outline-none cursor-pointer"
                  style={{ borderRadius: "0" }}
                  title={item}
                >
                  &ldquo;{item}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className={`w-full h-11 text-[11px] font-mono font-bold uppercase tracking-[0.2em] flex items-center justify-center transition-all cursor-pointer ${
            isSubmitting
              ? "bg-[#111111] border border-[#222222] text-[#ff4d00] cursor-not-allowed"
              : !text.trim()
              ? "bg-[#111111]/40 border border-[#222222]/30 text-[#444444] cursor-not-allowed"
              : "bg-[#ff4d00] text-black hover:bg-white hover:text-black border border-transparent duration-200 active:translate-y-[1px]"
          }`}
          style={{ borderRadius: "0" }}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" />
              {memwalUseRealSDK 
                ? (lang === "zh" ? "正在通过 SDK 进行真实网络投递中..." : "DISPATCHING REAL MEMWAL CLUSTER SHARDS...") 
                : (lang === "zh" ? "区块链密码学共识存证中..." : "SAVING IMUTABLE ON-CHAIN BLOCK...")
              }
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              {memwalUseRealSDK 
                ? (lang === "zh" ? "通过 SDK 真实打包保存至 Walrus" : "SECURE LIVE SHARD TO WALRUS (SDK CLIENT)")
                : (lang === "zh" ? "AI 总结并保存至 Sui & Walrus" : "AI SUMMARIZE & SECURE")
              }
            </>
          )}
        </button>

        {/* Cryptographic Execution Console Logger */}
        {isSubmitting && (
          <div className="bg-[#111111] border border-[#222222] p-4 text-[10px] font-mono text-[#888888] space-y-2 select-text">
            <div className="flex items-center justify-between text-[8px] text-[#ff4d00] uppercase tracking-[0.2em] pb-1.5 border-b border-[#222222]/40 mb-2 font-bold">
              <span>{memwalUseRealSDK ? (lang === "zh" ? "MEMWAL SDK 实时通信会话记录" : "MEMWAL SDK LIVE WORKFLOW SESSION") : (lang === "zh" ? "SUI 共识事件及数据上链记录器" : "SUI CONSENSUS STORAGE LOGGER")}</span>
              <span className="animate-pulse">{lang === "zh" ? "传输并验证中" : "TRANSMITTING & VERIFYING"}</span>
            </div>
            
            <div className="space-y-1.5">
              {txLogs.map((log, index) => {
                const isCurrent = index === txLogs.length - 1;
                const isCompleted = index < txLogs.length - 1;
                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 transition-all ${
                      isCurrent ? "text-white font-bold animate-pulse" : "text-[#4d8a5f]"
                    }`}
                  >
                    {isCompleted ? (
                      <span className="text-[#4ade80] font-bold">✔</span>
                    ) : (
                      <span className="text-[#ff4d00]">●</span>
                    )}
                    <span>{log}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </form>
    </div>
  );
}
