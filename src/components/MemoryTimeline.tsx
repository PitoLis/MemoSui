/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { StoredMemory } from "../types";
import { Language, TRANSLATIONS } from "../locales";
import { Search, Lock, Unlock, AlignLeft, Sparkles, Network, ExternalLink, Copy, Trash2, Eye, EyeOff, AlertTriangle } from "lucide-react";

interface MemoryTimelineProps {
  memories: StoredMemory[];
  onMemoryDeleted: (id: string) => void;
  onHoverMemoryShardNodes: (nodeIds: string[]) => void;
  onLeaveMemoryShardNodes: () => void;
  onVerifyOnChain: (memory: StoredMemory) => void;
  lang: Language;
}

export default function MemoryTimeline({
  memories,
  onMemoryDeleted,
  onHoverMemoryShardNodes,
  onLeaveMemoryShardNodes,
  onVerifyOnChain,
  lang
}: MemoryTimelineProps) {
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const t = TRANSLATIONS[lang];
  
  // Managing expanded state for insights or decrypts
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDecryptedId, setShowDecryptedId] = useState<string | null>(null);
  const [decryptionKeys, setDecryptionKeys] = useState<{ [key: string]: string }>({});
  const [decryptionErrorId, setDecryptionErrorId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract all unique tags dynamically
  const allTags = Array.from(
    new Set(memories.flatMap(m => m.tags))
  );

  // Filter memories
  const filteredMemories = memories.filter(m => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.originalText.toLowerCase().includes(search.toLowerCase()) ||
      m.summary.toLowerCase().includes(search.toLowerCase());
    
    const matchesTag = selectedTag ? m.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  const handleCopyBlobId = (blobId: string, id: string) => {
    navigator.clipboard.writeText(blobId);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDecryptChallenge = (id: string, correctPassphraseValue: string) => {
    const userPass = decryptionKeys[id] || "";
    if (userPass.trim() !== "") {
      setShowDecryptedId(id);
      setDecryptionErrorId(null);
    } else {
      setDecryptionErrorId(id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).toUpperCase();
  };

  return (
    <div id="memory-timeline-section" className="space-y-4">
      
      {/* Search and Filters Header */}
      <div className="bg-[#0a0a0a] border border-[#222222] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search input field */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#555555]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-[#111111] border border-[#222222] py-2.5 pl-10 pr-4 text-xs font-mono text-white placeholder-[#555555] focus:outline-none focus:border-[#ff4d00]"
            style={{ borderRadius: "0" }}
          />
        </div>

        {/* Dynamic Tag Filter Pills */}
        <div className="flex flex-wrap gap-2 justify-start md:justify-end w-full md:flex-1 overflow-x-auto select-none no-scrollbar">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer border ${
              selectedTag === null
                ? "bg-[#ff4d00]/10 border-[#ff4d00] text-[#ff4d00] font-bold"
                : "bg-[#111111] border-[#222222] text-[#888888] hover:border-[#ff4d00]"
            }`}
            style={{ borderRadius: "0" }}
          >
            {t.allArchive}
          </button>
          
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1.5 text-[10px] font-mono transition-all uppercase tracking-widest cursor-pointer border ${
                tag === selectedTag
                  ? "bg-[#ff4d00]/10 border-[#ff4d00] text-[#ff4d00] font-bold"
                  : "bg-[#111111] border-[#222222] text-[#888888] hover:border-[#ff4d00]"
              }`}
              style={{ borderRadius: "0" }}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List of Saved Memories */}
      <div className="space-y-4">
        {filteredMemories.length === 0 ? (
          <div className="border border-dashed border-[#222222] bg-[#0d0d0d] p-12 text-center text-[#555555]">
            <AlignLeft className="w-8 h-8 mx-auto text-[#222222] mb-3 animate-pulse" />
            <p className="text-xs font-mono tracking-widest uppercase">{t.noMatches}</p>
          </div>
        ) : (
          filteredMemories.map(mem => {
            const isExpanded = expandedId === mem.id;
            const isDecrypted = !mem.isEncrypted || showDecryptedId === mem.id;

            return (
              <div
                id={`memory-card-${mem.id}`}
                key={mem.id}
                onMouseEnter={() => onHoverMemoryShardNodes(mem.shardsNodes)}
                onMouseLeave={onLeaveMemoryShardNodes}
                className={`bg-[#0d0d0d] border p-5 transition-all duration-300 ${
                  isExpanded ? "border-[#ff4d00]" : "border-[#222222] hover:border-[#ff4d00]/60"
                }`}
                style={{ borderRadius: "0" }}
              >
                {/* Header Context Metrics of Vault Block */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-[#222222]/50">
                  <div className="flex items-center space-x-2">
                    <span className="text-[9px] font-mono text-[#888888] bg-[#1a1a1a] border border-[#222222] px-2 py-0.5 uppercase tracking-wider">
                      {t.suiEpoch} {mem.epoch}
                    </span>
                    <span className="text-[9px] font-mono text-[#555555] tracking-wider uppercase">
                      {formatDate(mem.createdAt)}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-[#ff4d00] bg-[#ff4d00]/5 px-2 py-0.5 border border-[#ff4d00]/10 uppercase tracking-widest hidden sm:block">
                      {(mem.sizeBytes / 1024).toFixed(2)} KB
                    </span>
                  </div>

                  {/* Actions (Delete/Inspect) */}
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-wider border ${
                      mem.storageLayer === "walrus"
                        ? "bg-[#ff4d00]/5 border-[#ff4d00]/30 text-[#ff4d00]"
                        : "bg-[#111111] border-[#222222] text-white"
                    }`}>
                      {mem.storageLayer === "walrus" ? "WALRVS // SHARD" : "SVI // OBJ"}
                    </span>
                    <button
                      onClick={() => onMemoryDeleted(mem.id)}
                      className="text-[#555555] hover:text-[#ff4d00] p-1.5 transition-all cursor-pointer"
                      title={lang === "zh" ? "擦除存证区块" : "Erase Memory"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title & Tags */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2.5 mb-3">
                  <h4 className="text-xs font-bold font-mono tracking-wider text-white uppercase">
                    {mem.title}
                  </h4>
                  <div className="flex flex-wrap gap-1.5 select-none text-[9px] font-mono tracking-wide">
                    {mem.tags.map(t => (
                      <span key={t} className="bg-[#111111] border border-[#222222] px-2 py-0.5 text-[#888888] uppercase font-semibold">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Main Body (Plain text details inside the block) */}
                <div className="mb-4 bg-[#0a0a0a] border border-[#222222] p-4 text-xs font-mono text-[#e0e0e0] leading-relaxed max-h-56 overflow-y-auto no-scrollbar whitespace-pre-line">
                  {isDecrypted ? (
                    mem.originalText
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <Lock className="w-5 h-5 text-[#ff4d00] mb-3 animate-pulse" />
                      <p className="text-[10px] font-mono text-[#555555] mb-4 uppercase tracking-[0.2em]">
                        {t.lockChallenge}
                      </p>
                      <div className="flex flex-col sm:flex-row items-center gap-2 max-w-sm w-full">
                        <input
                          type="password"
                          value={decryptionKeys[mem.id] || ""}
                          onChange={(e) => setDecryptionKeys(prev => ({ ...prev, [mem.id]: e.target.value }))}
                          placeholder={t.passphraseSeedPrompt}
                          className="w-full bg-[#111111] border border-[#222222] p-2.5 text-[10px] font-mono text-[#ff4d00] focus:outline-none focus:border-[#ff4d00] text-center"
                          style={{ borderRadius: "0" }}
                        />
                        <button
                          onClick={() => handleDecryptChallenge(mem.id, mem.originalText)}
                          className="w-full sm:w-auto px-4 py-2.5 bg-[#ff4d00] text-black font-bold text-[10px] tracking-widest uppercase cursor-pointer hover:bg-white transition-colors"
                          style={{ borderRadius: "0" }}
                        >
                          {t.decryptBtn}
                        </button>
                      </div>
                      {decryptionErrorId === mem.id && (
                        <p className="text-[9px] font-mono text-[#ff4d00] mt-3 flex items-center tracking-widest uppercase">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                          {t.decryptError}
                        </p>
                      )}
                    </div>
                  )}

                  {/* File Upload indicator attached sub-pills */}
                  {mem.fileInfo && (
                    <div className="mt-3 pt-3 border-t border-[#222222]/50 flex items-center font-mono text-[9px] text-[#ff4d00]">
                      <span className="bg-[#ff4d00]/5 px-2.5 py-1 border border-[#ff4d00]/20 flex items-center">
                        {t.attached} {mem.fileInfo.name} // {(mem.fileInfo.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}
                </div>

                {/* Sub-Card Drawer Expansion toggling */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#222222]/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Left Panel: Gemini AI Extracted Context Metadata Takeaway */}
                    <div className="bg-[#111111]/80 border border-[#222222] p-4 flex flex-col justify-between font-mono">
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Sparkles className="w-3.5 h-3.5 text-[#ff4d00] shrink-0" />
                          <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#888888] font-bold">
                            {t.aiInsightsTitle}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#e0e0e0] leading-relaxed italic mb-4 font-serif">
                          "{mem.summary}"
                        </p>
                        
                        {mem.actionItems && mem.actionItems.length > 0 && (
                          <div className="space-y-2 mb-4">
                            <h5 className="text-[9px] text-[#555555] uppercase tracking-widest">
                              {t.coreTakeaways}
                            </h5>
                            <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#888888] leading-relaxed">
                              {mem.actionItems.map((item, idx) => (
                                <li key={idx} className="marker:text-[#ff4d00]">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-[10px] border-t border-[#222222]/50 pt-3 mt-2">
                        <span className="text-[#555555] tracking-widest uppercase">{t.weightFactor}</span>
                        <div className="flex items-center space-x-1.5">
                          {Array.from({ length: 5 }).map((_, st) => (
                            <span
                              key={st}
                              className={`w-2 h-2 ${
                                st < mem.importanceRating ? "bg-[#ff4d00]" : "bg-[#1f1f1f]"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Panel: Walrus Protocol Shard nodes detail map config */}
                    <div className="bg-[#111111]/80 border border-[#222222] p-4 flex flex-col justify-between font-mono text-[11px] leading-normal">
                      <div>
                        <div className="flex items-center space-x-2 mb-3">
                          <Network className="w-3.5 h-3.5 text-[#ff4d00] shrink-0" />
                          <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-[#888888] font-bold">
                            {t.shardsIndexConfig}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#888888] leading-relaxed mb-4">
                          {lang === "zh"
                            ? `高抗物理损坏多节点分布策略，已对当前的 ${mem.shardsCount} 个活动验证节点进行了容灾广播与默克尔安全拓扑编排。`
                            : `Redundancy active on ${mem.shardsCount} separate global validators. Decentralized Erasure parity guarantees fault tolerant persistence matrices.`
                          }
                        </p>
                        
                        <div className="space-y-2.5">
                          <h5 className="text-[9px] text-[#555555] uppercase tracking-widest">
                            {t.validatorsAssigned}
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {mem.shardsNodes.map(nd => (
                              <span key={nd} className="bg-[#0a0a0a] px-1.5 py-0.5 border border-[#222222] text-[8px] text-[#888888] uppercase">
                                {nd}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-[#222222]/50 pt-3 mt-3 flex justify-between items-center text-[9px]">
                        <span className="text-[#555555] tracking-widest uppercase">BLOB LEDG INF</span>
                        <span className="text-[#ff4d00] flex items-center font-bold tracking-widest uppercase">
                          <span className="w-1.5 h-1.5 bg-[#ff4d00] mr-1.5 animate-pulse" />
                          {t.shardsReplicated}
                        </span>
                      </div>
                    </div>

                  </div>
                )}

                {/* Quick Interactive Clipboard Button controls */}
                <div className="mt-4 pt-3.5 border-t border-[#222222]/50 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3 text-[10px] font-mono">
                  
                  {/* Walrus Pointer Link string ID */}
                  <div className="flex items-center space-x-2 text-[#555555] min-w-0 max-w-full sm:max-w-md">
                    <span>{t.pointer}</span>
                    <button
                      onClick={() => handleCopyBlobId(mem.blobId, mem.id)}
                      className="text-[#888888] hover:text-[#ff4d00] flex items-center min-w-0 max-w-full hover:underline bg-[#111111] px-2 py-1 border border-[#222222] text-left"
                      style={{ borderRadius: "0" }}
                    >
                      <Copy className="w-3 h-3 text-[#ff4d00] shrink-0 mr-1.5" />
                      <span className="truncate">{copiedId === mem.id ? t.copied : mem.blobId}</span>
                    </button>
                  </div>

                  {/* Inspector / Verification Modal togglers */}
                  <div className="flex items-center space-x-4 select-none shrink-0 justify-end">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : mem.id)}
                      className="text-[#888888] hover:text-white font-mono text-[10px] tracking-widest uppercase cursor-pointer transition-all"
                    >
                      {isExpanded ? t.hideInsightsBtn : t.aiInsightsBtn}
                    </button>
                    <button
                      onClick={() => onVerifyOnChain(mem)}
                      className="px-3.5 py-1.5 bg-[#ff4d00]/5 border border-[#ff4d00] text-[#ff4d00] font-bold hover:bg-[#ff4d00] hover:text-black hover:border-transparent transition-colors cursor-pointer flex items-center uppercase tracking-widest text-[9px]"
                      style={{ borderRadius: "0" }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1.5" />
                      {t.verifyProofBtn}
                    </button>
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
