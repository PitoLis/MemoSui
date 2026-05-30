/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { StoredMemory } from "../types";
import { Language, TRANSLATIONS } from "../locales";
import { simulateHash } from "../utils";
import { ShieldCheck, Cpu, Binary, Search, HelpCircle, CheckCircle, Flame, Layers, AlertTriangle } from "lucide-react";

interface VerificationTabProps {
  memories: StoredMemory[];
  onVerifyOnChain: (memory: StoredMemory) => void;
  lang: Language;
}

export default function VerificationTab({ memories, onVerifyOnChain, lang }: VerificationTabProps) {
  const [selectedMemoryId, setSelectedMemoryId] = useState<string>("");
  const [customText, setCustomText] = useState("");
  const [customHash, setCustomHash] = useState("");
  
  // Checking actions
  const [isValidating, setIsValidating] = useState(false);
  const [validationRun, setValidationRun] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isMatched, setIsMatched] = useState<boolean | null>(null);
  
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (memories.length > 0 && !selectedMemoryId) {
      // pre-select first saved block if present to make it user friendly
      setSelectedMemoryId(memories[0].id);
    }
  }, [memories]);

  // Handle Saved block selection check trigger
  const handleVerifySavedBlock = (id: string) => {
    const memory = memories.find(m => m.id === id);
    if (memory) {
      onVerifyOnChain(memory);
    }
  };

  // Run real cryptographical custom checker
  const handleCustomValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;

    setIsValidating(true);
    setValidationRun(true);
    setActiveStep(0);
    setIsMatched(null);

    const stepsTimer = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= 3) {
          clearInterval(stepsTimer);
          setIsValidating(false);
          // Compare generated real simulateHash against the user entered string
          const calculated = simulateHash(customText);
          const userEntered = customHash.trim().toLowerCase();
          setIsMatched(calculated === userEntered);
          return 4;
        }
        return prev + 1;
      });
    }, 450);
  };

  const selectedMemory = memories.find(m => m.id === selectedMemoryId);

  return (
    <div id="verification-hub" className="space-y-6">
      
      {/* Intro section */}
      <div className="bg-[#0c0c0c] border border-[#222222] p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#ff4d00]/40" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#ff4d00]/40" />
        
        <h3 className="text-xs font-bold font-mono tracking-[0.2em] text-[#ffffff] uppercase flex items-center mb-1">
          <ShieldCheck className="w-4 h-4 text-[#ff4d00] mr-2" />
          {lang === "zh" ? "去中心化记忆真伪核验中心" : "IMMUTABILITY VERIFICATION & AUDIT PORTAL"}
        </h3>
        <p className="text-[10px] text-[#888888] leading-relaxed max-w-3xl">
          {lang === "zh" 
            ? "MemoSui 存储的每一条记录都由 AI 提炼概要与 SHA-256 哈希值锁定。你可以在下方对链上的每一个存储区块进行客户端即时计算比对；或者输入任意文本，验证内容指纹的一致性，核准是否发生损坏或遭到第三方未授权篡改。"
            : "Every memory secured via MemoSui is locked by an AI summary and highly safe custom SHA-256 hex hashes. Below, you can audit individual saved blocks inside the SUI ledger or input arbitrary values to check for byte alignment & tampering."
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Interactive Check Box 1: Saved On-chain Block Checker */}
        <div className="bg-[#0c0c0c] border border-[#222222] p-5 space-y-4">
          <div className="pb-3 border-b border-[#222222] flex items-center justify-between">
            <h4 className="text-[10px] font-bold font-mono text-white tracking-widest uppercase flex items-center">
              <span className="w-1.5 h-1.5 bg-[#ff4d00] mr-2 animate-pulse" />
              {lang === "zh" ? "01. 安全校验已有存证区块" : "01. AUDIT REGISTERED SUI BLOCKS"}
            </h4>
            <span className="text-[8px] font-mono text-[#ff4d00] bg-[#ff4d00]/5 px-2.5 py-1 border border-[#ff4d00]/10 uppercase tracking-widest">
              {lang === "zh" ? "链上数据库" : "ON-CHAIN POINTER"}
            </span>
          </div>

          {memories.length === 0 ? (
            <p className="text-[10px] text-[#555555] py-4 text-center font-mono uppercase">
              {lang === "zh" ? "暂无存储记录，请在时间线页新增首个记忆存证！" : "No saved records found. Add a block in the timeline first!"}
            </p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5 font-mono text-[10px]">
                <label className="text-[#888888] font-bold uppercase tracking-wider block">
                  {lang === "zh" ? "选择目标记忆区块进行检索:" : "SELECT STORAGE REFERENCE BLOCK:"}
                </label>
                <select
                  value={selectedMemoryId}
                  onChange={(e) => setSelectedMemoryId(e.target.value)}
                  className="w-full bg-[#111111] border border-[#222222] text-[#e0e0e0] font-mono p-3 focus:outline-none focus:border-[#ff4d00] outline-none text-xs cursor-pointer"
                  style={{ borderRadius: "0" }}
                >
                  {memories.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.id.toUpperCase()}] {m.title} (Epoch {m.epoch})
                    </option>
                  ))}
                </select>
              </div>

              {selectedMemory && (
                <div className="space-y-3.5 bg-[#111111]/60 border border-[#222222] p-4 text-[11px] font-mono select-text">
                  <div className="space-y-1">
                    <span className="text-[8px] text-[#555555] uppercase tracking-wider">{lang === "zh" ? "原始摘要提炼:" : "RAW EXTRACTED SUMMARY:"}</span>
                    <p className="text-white font-sans text-xs italic bg-[#0a0a0a] p-2.5 border-l border-[#ff4d00]/60">
                      &ldquo;{selectedMemory.summary}&rdquo;
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-[10px]">
                    <div>
                      <span className="text-[8px] text-[#555555] uppercase tracking-wider block">{lang === "zh" ? "链上预登记 SHA-256" : "SUI REGISTERED HASH"}</span>
                      <p className="font-mono text-white break-all mt-1 pr-1 bg-[#0a0a0a] p-2 leading-tight">
                        {selectedMemory.txHash}
                      </p>
                    </div>
                    <div>
                      <span className="text-[8px] text-[#555555] uppercase tracking-wider block">{lang === "zh" ? "Walrus 指体指针 ID" : "WALRUS BLOB ID"}</span>
                      <p className="font-mono text-[#ff4d00] break-all mt-1 bg-[#0a0a0a] p-2 leading-tight">
                        {selectedMemory.blobId}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[8px] text-[#555555] uppercase tracking-wider block">{lang === "zh" ? "纠删容灾冗余网络分派" : "ERASURE MESH DISPATCH COORDINATE"}</span>
                    <p className="text-white text-[9px] font-mono bg-[#0a0a0a] p-2 flex flex-wrap gap-1 leading-normal uppercase">
                      {selectedMemory.shardsNodes.map(s => (
                        <span key={s} className="bg-[#111111] border border-[#222222] px-1 text-[#888888]">
                          {s}
                        </span>
                      ))}
                    </p>
                  </div>

                  <button
                    onClick={() => handleVerifySavedBlock(selectedMemoryId)}
                    className="w-full bg-[#ff4d00] hover:bg-white text-black font-bold uppercase tracking-widest text-xs py-2.5 mt-2 transition-all cursor-pointer"
                    style={{ borderRadius: "0" }}
                  >
                    {lang === "zh" ? "立即运行链上多节点比对" : "EXECUTE NETWORK INTEGRITY CHECK"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interactive Check Box 2: Manual SHA-256 Validator Playground */}
        <div className="bg-[#0c0c0c] border border-[#222222] p-5 space-y-4">
          <div className="pb-3 border-b border-[#222222] flex items-center justify-between">
            <h4 className="text-[10px] font-bold font-mono text-white tracking-widest uppercase flex items-center">
              <span className="w-1.5 h-1.5 bg-[#ff4d00] mr-2" />
              {lang === "zh" ? "02. 手动或第三方记录核真检验" : "02. CUSTOM PAYLOAD PLAYGROUND"}
            </h4>
            <span className="text-[8px] font-mono text-[#ff4d00] bg-[#ff4d00]/5 px-2.5 py-1 border border-[#ff4d00]/10 uppercase tracking-widest">
              {lang === "zh" ? "单机对比沙箱" : "LOCAL SANDBOX"}
            </span>
          </div>

          <form onSubmit={handleCustomValidation} className="space-y-3 font-mono text-[10px]">
            
            <div className="space-y-1">
              <label className="text-[#888888] font-bold uppercase tracking-wider block">
                {lang === "zh" ? "拼写需要验证的源记忆语句 (Text Payload):" : "RAW TEXT MEMORY STATEMENT TO TEST:"}
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder={lang === "zh" ? "在这里拼写你想要校验的文本原文片段..." : "Pasted memory string raw bytes..."}
                className="w-full h-16 bg-[#111111] border border-[#222222] p-2.5 text-xs text-[#e0e0e0] placeholder-[#444444] focus:outline-none focus:border-[#ff4d00] resize-none"
                style={{ borderRadius: "0" }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#888888] font-bold uppercase tracking-wider block flex items-center justify-between">
                <span>{lang === "zh" ? "第三方提供的防篡改哈希 (SHA-256 Digest):" : "TEST DIGEST SHA-256 SIGNATURE TO COMPARE:"}</span>
                {customText.trim() && (
                  <button
                    type="button"
                    onClick={() => setCustomHash(simulateHash(customText))}
                    className="text-[#ff4d00] underline text-[9px] lowercase"
                  >
                    {lang === "zh" ? "[自动生成一致哈希进行模拟验证]" : "[autogen matched hash]"}
                  </button>
                )}
              </label>
              <input
                type="text"
                value={customHash}
                onChange={(e) => setCustomHash(e.target.value)}
                placeholder="e.g. 0xec8095f2e8a1f592789fbc892def1a12bcde38ef9012a67bc89d23fe45ab89d31"
                className="w-full bg-[#111111] border border-[#222222] p-2.5 text-xs font-mono text-white focus:outline-none focus:border-[#ff4d00]"
                style={{ borderRadius: "0" }}
              />
            </div>

            <button
              type="submit"
              disabled={isValidating || !customText.trim()}
              className={`w-full font-bold uppercase tracking-widest text-xs py-2.5 mt-1 cursor-pointer transition-all ${
                isValidating || !customText.trim()
                  ? "bg-[#111111] text-[#444444] border border-[#222222] cursor-not-allowed"
                  : "bg-white text-black hover:bg-[#ff4d00] hover:text-black duration-150"
              }`}
              style={{ borderRadius: "0" }}
            >
              {isValidating ? (lang === "zh" ? "🔍 客户端 SHA-256 比对中..." : "🔍 COMPUTING CRYTOGRAPHY SHARDS...") : (lang === "zh" ? "⚡ 执行离线完整层级校验" : "⚡ RUN INTEGRITY COMPARISON")}
            </button>

          </form>

          {/* Verification execution visual logger */}
          {validationRun && (
            <div className="bg-[#111111] border border-[#222222] p-4 space-y-3 font-mono text-[10px]">
              <div className="text-[8px] text-[#ff4d00] uppercase font-bold tracking-widest flex items-center justify-between pb-1.5 border-b border-[#222222]/50">
                <span>{lang === "zh" ? "离线沙箱对比监控进程" : "INTEGRITY PROGRESS CONSOLE"}</span>
                <span className="animate-pulse">{isValidating ? "COMPUTING" : "COMPLETE"}</span>
              </div>

              <div className="space-y-1.5">
                <div className={`flex items-center space-x-2 ${activeStep >= 1 ? "text-[#4d8a5f]" : "text-white font-bold"}`}>
                  <span>{activeStep > 1 ? "✔" : "●"}</span>
                  <span>{lang === "zh" ? "1. 拆包载荷字节流, 开始生成客户端即时数字证书指纹" : "1. Parsing original input string, initialized local signature digest"}</span>
                </div>
                <div className={`flex items-center space-x-2 ${activeStep >= 2 ? "text-[#4d8a5f]" : activeStep === 1 ? "text-white font-bold animate-pulse" : "text-[#333333]"}`}>
                  <span>{activeStep > 2 ? "✔" : "●"}</span>
                  <span>{lang === "zh" ? "2. 结合 SHA-256 算法对比, 算得: " + simulateHash(customText).slice(0, 16) + "..." : "2. Executed SHA-256 logic, computed: " + simulateHash(customText).slice(0, 16) + "..."}</span>
                </div>
                <div className={`flex items-center space-x-2 ${activeStep >= 3 ? "text-[#4d8a5f]" : activeStep === 2 ? "text-white font-bold animate-pulse" : "text-[#333333]"}`}>
                  <span>{activeStep > 3 ? "✔" : "●"}</span>
                  <span>{lang === "zh" ? "3. 输入哈希参数校验对齐 ..." : "3. Fetching targeted check parameters ..."}</span>
                </div>
                <div className={`flex items-center space-x-2 ${activeStep >= 4 ? "text-[#4d8a5f]" : activeStep === 3 ? "text-white font-bold animate-pulse" : "text-[#333333]"}`}>
                  <span>{activeStep >= 4 ? "✔" : "●"}</span>
                  <span>{lang === "zh" ? "4. 最终双向比对并输出完备性报告" : "4. Finalizing dual alignments and issuing results"}</span>
                </div>
              </div>

              {!isValidating && isMatched !== null && (
                <div className={`p-3 border text-center font-bold tracking-wider space-y-1 transition-all ${
                  isMatched 
                    ? "bg-[#1c3a27]/30 border-[#2a6a3b] text-[#4ade80]" 
                    : "bg-[#451414]/30 border-[#8a2020] text-[#f87171]"
                }`}>
                  <p className="text-xs uppercase font-extrabold">
                    {isMatched 
                      ? (lang === "zh" ? "🟢 校验高度匹配 (100% SECURE)" : "🟢 INTEGRITY CERTIFIED (100% TAMPER-PROOF)") 
                      : (lang === "zh" ? "🔴 完整性检验未通过 (COMPROMISED)" : "🔴 MISMATCH IDENTIFIED (DATA COMPROMISED)")
                    }
                  </p>
                  <p className="text-[9px] text-[#888888] font-normal lowercase leading-relaxed">
                    {isMatched 
                      ? (lang === "zh" ? "输入字符串生成的 SHA-256 内容哈希与提供的指纹完全吻合。这证明当前文本是存证之初注册的绝无任何损坏的原始内容。" : "The SHA-256 digest calculated strictly matches your target fingerprint. This proves the memory content is identical to its birth state and tamper-free.")
                      : (lang === "zh" ? "比对哈希不吻合。计算出的真实哈希为 " + simulateHash(customText) + "，差异说明内容已经被恶意修改或存在传输损坏。" : "The calculated digest values did not match. Calculated: " + simulateHash(customText) + ". Meaning the compared string has been manually altered or corrupted.")
                    }
                  </p>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
