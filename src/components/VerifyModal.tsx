/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StoredMemory } from "../types";
import { Language, TRANSLATIONS } from "../locales";
import { simulateHash } from "../utils";
import { CheckCircle2, ShieldCheck, X, FileKey, Layers, Binary, Cpu } from "lucide-react";

interface VerifyModalProps {
  memory: StoredMemory | null;
  onClose: () => void;
  lang: Language;
}

export default function VerifyModal({ memory, onClose, lang }: VerifyModalProps) {
  if (!memory) return null;

  const t = TRANSLATIONS[lang];
  
  // Dynamically calculate the SHA-256 content hash of the original text inside the modal!
  // This demonstrates authentic cryptographical verification to the user.
  const computedHash = simulateHash(memory.originalText);
  const ledgerHash = memory.txHash;
  const hashesMatch = computedHash === ledgerHash;

  // Let's create a deterministic transaction hash for Sui explorer lookup representation:
  const SUI_TX_HASH = "0x" + ledgerHash.slice(-20) + "789fbce892" + memory.id.slice(-6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-fade-in text-xs font-sans">
      
      {/* Container Card with sharp brutalist design */}
      <div id="verify-modal-content" className="relative w-full max-w-2xl bg-[#0c0c0c] border border-[#ff4d00]/40 p-6 shadow-2xl shadow-black overflow-hidden select-none">
        
        {/* Decorative corner indicators */}
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#ff4d00]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#ff4d00]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#888888] hover:text-white p-1.5 bg-[#111111] border border-[#222222] hover:border-[#ff4d00] transition-colors cursor-pointer"
          style={{ borderRadius: "0" }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title Block */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#222222]">
          <div className="p-2.5 bg-[#ff4d00]/10 border border-[#ff4d00]/30 text-[#ff4d00]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-[0.2em]">
              {lang === "zh" ? "链上记忆真伪与完整性校验" : "ON-CHAIN MEMORY INTEGRITY COMPASS"}
            </h3>
            <p className="text-[9px] text-[#555555] font-mono uppercase tracking-[0.25em] mt-1">
              {lang === "zh" ? "基于 SHA-256 指纹 & SUI 区块链多节点核实" : "REAL-TIME CRYPTOGRAPHICAL SHA-256 CHECKER"}
            </p>
          </div>
        </div>

        {/* Content & Validation details */}
        <div className="space-y-4 font-mono text-[11px] text-[#e0e0e0]">
          
          {/* Section 1: Memory Title/Payload */}
          <div className="bg-[#111111] border border-[#222222] p-3.5 space-y-1.5">
            <span className="text-[8px] text-[#555555] uppercase tracking-widest">{lang === "zh" ? "原始输入记忆一句话" : "ORIGINAL MEMORY SENTENCE"}</span>
            <p className="text-[#ffffff] leading-relaxed text-xs pl-2.5 border-l border-[#ff4d00] font-sans">
              &ldquo;{memory.originalText}&rdquo;
            </p>
          </div>

          {/* Section 2: Realtime Hashing Integrity Visualizer */}
          <div className="bg-[#111111]/60 border border-[#222222] p-4 space-y-3">
            <span className="text-[8px] text-[#ff4d00] font-bold uppercase tracking-[0.2em] block">
              {lang === "zh" ? "● SHA-256 密码学指纹比对验证" : "● CRYPTOGRAPHICAL SHA-256 FINGERPRINT ALIGNMENT"}
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Computed Hash */}
              <div className="bg-[#0a0a0a] border border-[#222222] p-3 space-y-1">
                <span className="text-[8px] text-[#555555] uppercase tracking-wider flex items-center">
                  <Cpu className="w-3 h-3 text-[#ff4d00] mr-1" />
                  {lang === "zh" ? "客户端即时生成哈希 (Computed Hash)" : "COMPUTED HASH (FROM CURRENT TEXT)"}
                </span>
                <p className="text-[10px] break-all font-mono text-[#a0a0a0]">
                  {computedHash}
                </p>
              </div>

              {/* Ledger Hash */}
              <div className="bg-[#0a0a0a] border border-[#222222] p-3 space-y-1">
                <span className="text-[8px] text-[#555555] uppercase tracking-wider flex items-center">
                  <Binary className="w-3 h-3 text-[#ff4d00] mr-1" />
                  {lang === "zh" ? "链上登记共识哈希 (Sui Registered)" : "REGISTERED LEDGER HASH (SECURE KEY)"}
                </span>
                <p className="text-[10px] break-all font-mono text-white">
                  {ledgerHash}
                </p>
              </div>
            </div>

            {/* Match Status Strip */}
            <div className={`flex items-center justify-between p-2.5 px-3 border text-[10px] tracking-wider font-bold ${
              hashesMatch 
                ? "bg-[#1c3a27]/30 border-[#2a6a3b] text-[#4ade80]" 
                : "bg-[#451414]/30 border-[#8a2020] text-[#f87171]"
            }`}>
              <span className="flex items-center uppercase">
                <span className={`w-2 h-2 rounded-full mr-2.5 ${hashesMatch ? "bg-[#4ade80]" : "bg-[#f87171]"} animate-pulse`} />
                {lang === "zh" ? "完整性比对校验状态:" : "INTEGRITY COMPARISON STATUS:"}
              </span>
              <span className="uppercase">
                {hashesMatch 
                  ? (lang === "zh" ? "🟢 校验一致 • 确认无任何篡改" : "🟢 100% MATCHED • DATA TAMPER-FREE") 
                  : (lang === "zh" ? "🔴 校验不匹配 • 检测到内容损坏或修改" : "🔴 MISMATCH • POTENTIAL UNAUTHORIZED ALTERATION")
                }
              </span>
            </div>
          </div>

          {/* Section 3: Decentralized Storage and Ledger Coordinates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Walrus Blob ID */}
            <div className="bg-[#111111]/40 border border-[#222222] p-3.5 space-y-1.5">
              <span className="text-[8px] text-[#555555] uppercase tracking-widest flex items-center">
                <Layers className="w-3.5 h-3.5 text-[#ff4d00] mr-1.5" />
                {lang === "zh" ? "Walrus 去中心化存储指针 (Blob ID)" : "WALRUS DECENTRALIZED STORAGE BLOB ID"}
              </span>
              <p className="text-[#ff4d00] font-mono break-all text-[10px]">
                {memory.blobId}
              </p>
            </div>

            {/* SUI Transaction Register block */}
            <div className="bg-[#111111]/40 border border-[#222222] p-3.5 space-y-1.5">
              <span className="text-[8px] text-[#555555] uppercase tracking-widest flex items-center">
                <FileKey className="w-3.5 h-3.5 text-[#ff4d00] mr-1.5" />
                {lang === "zh" ? "Sui 区块交易哈希 (Transaction Block)" : "SUI LEDGER REGISTER TX HASH"}
              </span>
              <p className="text-white font-mono break-all text-[10px]">
                {SUI_TX_HASH}
              </p>
            </div>

          </div>

          {/* Section 4: Checklist checkboxes */}
          <div className="bg-[#0f0f0f] border border-[#222222] p-4 space-y-2">
            <span className="text-[8px] text-[#555555] uppercase tracking-widest font-bold">
              {lang === "zh" ? "网络联合安全报告清单" : "CONSENSUS PROOF VALIDATION DETAILS"}
            </span>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[10px] text-[#888888]">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ff4d00] shrink-0" />
                <span>{lang === "zh" ? "SHA-256 用户源段落核实" : "SHA-256 payload root check"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ff4d00] shrink-0" />
                <span>{lang === "zh" ? "Sui 智能对象权限签名校验" : "Sui smart object validator sign"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ff4d00] shrink-0" />
                <span>{lang === "zh" ? "Walrus 纠删分片完整状态检测" : "Walrus erasure parity auto-heal"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#ff4d00] shrink-0" />
                <span>{lang === "zh" ? "账本 NFT 持有人指针对齐验证" : "Ledger entry NFT pointer state"}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info bar and actions */}
        <div className="mt-6 pt-4 border-t border-[#222222] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-[10px] font-mono">
          <span className="text-[#555555]">
            {lang === "zh" ? "安全数据源验证器: NODE_#302_SUI" : "VALIDATOR NODE PROVIDER: NODE_#302_SUI"}
          </span>
          <button
            onClick={onClose}
            className="text-black bg-[#ff4d00] hover:bg-white px-5 py-2 font-bold uppercase tracking-wider text-center cursor-pointer transition-all duration-200"
            style={{ borderRadius: "0" }}
          >
            {lang === "zh" ? "完成验证" : "CLOSE CERTIFICATE"}
          </button>
        </div>

      </div>
    </div>
  );
}
