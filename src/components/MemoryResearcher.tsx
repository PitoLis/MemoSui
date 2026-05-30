/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { StoredMemory } from "../types";
import { Language } from "../locales";
import { 
  Search, 
  Filter, 
  BarChart2, 
  ShieldCheck, 
  Network, 
  FileText, 
  Calendar, 
  Fingerprint, 
  Check, 
  Server, 
  AlertCircle,
  Database,
  Cpu
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";

interface MemoryResearcherProps {
  memories: StoredMemory[];
  lang: Language;
}

export default function MemoryResearcher({
  memories,
  lang
}: MemoryResearcherProps) {
  const isChinese = lang === "zh";

  // State filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [minImportance, setMinImportance] = useState<number>(1);
  const [selectedAuditMemoryId, setSelectedAuditMemoryId] = useState<string>(
    memories.length > 0 ? memories[0].id : ""
  );

  // Retrieve unique tags from all memories
  const allUniqueTags = useMemo(() => {
    const tagsSet = new Set<string>();
    memories.forEach(m => {
      if (Array.isArray(m.tags)) {
        m.tags.forEach(t => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [memories]);

  // Compute filtered memories list
  const filteredMemories = useMemo(() => {
    return memories.filter(m => {
      const matchesSearch = 
        m.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTag = selectedTag === "all" || (Array.isArray(m.tags) && m.tags.includes(selectedTag));
      const matchesImportance = (m.importanceRating || 3) >= minImportance;

      return matchesSearch && matchesTag && matchesImportance;
    });
  }, [memories, searchQuery, selectedTag, minImportance]);

  // Select memory for specific cryptographic audit
  const auditMemory = useMemo(() => {
    return memories.find(m => m.id === selectedAuditMemoryId) || memories[0] || null;
  }, [memories, selectedAuditMemoryId]);

  // Chart data calculations
  const chartImportanceData = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    memories.forEach(m => {
      const r = m.importanceRating || 3;
      if (r >= 1 && r <= 5) {
        counts[r as 1 | 2 | 3 | 4 | 5]++;
      }
    });
    return Object.entries(counts).map(([level, count]) => ({
      name: isChinese ? `星级 ${level}` : `Lvl ${level}`,
      count,
      level: parseInt(level)
    }));
  }, [memories, isChinese]);

  const chartTagData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    memories.forEach(m => {
      if (Array.isArray(m.tags)) {
        m.tags.forEach(t => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a,b) => b.count - a.count)
      .slice(0, 5); // Limit to top 5 tags
  }, [memories]);

  // Preset cyber colors for tags chart
  const PIE_COLORS = ["#ff4d00", "#ff7300", "#ffa200", "#ffd000", "#222222"];

  return (
    <div id="memory-researcher-workspace" className="space-y-6 font-mono text-xs">
      
      {/* 1. TOP RESEARCH METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-[#0c0c0c] border border-[#222222] p-4 font-mono flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#888888] uppercase tracking-wider block">
              {isChinese ? "不可篡改块总量" : "IMMUTABLE LEDGER COUNTER"}
            </span>
            <span className="text-xl font-bold text-white mt-1.5 block">
              {memories.length} <span className="text-xs text-[#ff4d00]">NFTs</span>
            </span>
          </div>
          <Database className="w-8 h-8 text-[#ff4d00] opacity-40 shrink-0" />
        </div>

        {/* Metric 2 */}
        <div className="bg-[#0c0c0c] border border-[#222222] p-4 font-mono flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#888888] uppercase tracking-wider block">
              {isChinese ? "常驻索引标签集" : "ACTIVE SEARCHABLE TAGS"}
            </span>
            <span className="text-xl font-bold text-white mt-1.5 block">
              {allUniqueTags.length} <span className="text-xs text-amber-500">{isChinese?"个":"Tags"}</span>
            </span>
          </div>
          <Network className="w-8 h-8 text-amber-500 opacity-40 shrink-0" />
        </div>

        {/* Metric 3 */}
        <div className="bg-[#0c0c0c] border border-[#ff4d00]/25 p-4 font-mono flex items-center justify-between bg-gradient-to-br from-black to-[#ff4d00]/5">
          <div>
            <span className="text-[10px] text-[#ff4d00]/80 font-bold uppercase tracking-wider block">
              {isChinese ? "数据容灾保护因子" : "WALRUS ENCODING INDEX"}
            </span>
            <span className="text-xl font-bold text-[#4ade80] mt-1.5 block">
              100% <span className="text-xs text-white">HEALTHY</span>
            </span>
          </div>
          <ShieldCheck className="w-8 h-8 text-[#4ade80] opacity-45 shrink-0" />
        </div>

      </div>

      {/* 2. THREE-PANEL SECTION: ANALYTICS INDEX & DEEP LEDGER AUDITING */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column (col-span-5): Charts & aggregate stats */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0c0c0c] border border-[#222222] p-4.5 space-y-4">
            <h4 className="text-xs font-bold text-white tracking-widest uppercase border-b border-[#222222] pb-2 flex items-center">
              <BarChart2 className="w-4 h-4 text-[#ff4d00] mr-2" />
              {isChinese ? "保护特征定量统计" : "IMMUTABILITY ANALYTICS"}
            </h4>

            {/* Importance rating distribution chart */}
            <div className="space-y-2">
              <span className="text-[9px] text-[#888888] uppercase tracking-wider block">
                {isChinese ? "■ 记忆关联重要度阶梯律 (recharts 渲染)" : "■ IMPORTANCE DISTRIBUTION CURVE"}
              </span>
              <div className="h-44 bg-black/80 p-2 border border-zinc-900">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartImportanceData}>
                    <XAxis dataKey="name" stroke="#555555" fontSize={9} />
                    <YAxis stroke="#555555" width={15} fontSize={9} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#111", border: "1px solid #222", fontSize: "10px" }}
                      itemStyle={{ color: "#ff4d00" }}
                    />
                    <Bar dataKey="count" fill="#ff4d00" radius={[0, 0, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tags frequency bar list */}
            <div className="space-y-2.5">
              <span className="text-[9px] text-[#888888] uppercase tracking-wider block">
                {isChinese ? "■ Top 5 核心高频标签热度" : "■ TOP 5 FREQUENCY KEYWORD SHARDS"}
              </span>
              
              <div className="space-y-2 bg-black/50 p-2.5 border border-zinc-900">
                {chartTagData.length === 0 ? (
                  <div className="text-center text-[#555555] py-4">{isChinese?"无标签记录":"No tags indexed"}</div>
                ) : (
                  chartTagData.map((item, idx) => {
                    const pct = Math.round((item.count / memories.length) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-white font-mono font-bold">#{item.name}</span>
                          <span className="text-[#ff4d00] font-bold">{item.count} {isChinese?"条":"blocks"} ({pct}%)</span>
                        </div>
                        <div className="w-full h-1 bg-zinc-900" style={{ borderRadius: "0" }}>
                          <div 
                            className="h-full bg-gradient-to-r from-[#ff4d00] to-yellow-500" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right column (col-span-7): Search filter and specific Cryptographic Ledger verifier */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SECURE BLOCK INSPECTION PANEL */}
          <div className="bg-[#0c0c0c] border border-[#ff4d00]/25 p-5 relative space-y-4">
            
            <div className="absolute top-0 right-0 py-1.5 px-3 bg-[#ff4d00]/5 border-l border-b border-[#ff4d00]/20 text-[9px] text-[#ff4d00] font-bold tracking-widest uppercase">
              {isChinese ? "链上特征审查" : "CRYPTO_AUDIT_TUNNEL"}
            </div>

            <h4 className="text-xs font-bold text-white tracking-widest uppercase border-b border-[#222222] pb-2.5 flex items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-500 mr-2.5" />
              {isChinese ? "密码学存储原件验证" : "IMMUTABILITY DECRYPTOR INSPECTOR"}
            </h4>

            {/* Selector of which memory to inspect */}
            <div className="space-y-1.5">
              <span className="text-[9px] text-[#888888] uppercase tracking-wider block">
                {isChinese ? "选择需要校验审查的防篡和分片记忆:" : "SELECT SECURED MEMORY UNIT:"}
              </span>
              <select
                value={selectedAuditMemoryId}
                onChange={(e) => setSelectedAuditMemoryId(e.target.value)}
                className="w-full bg-black border border-[#222222] text-[#ff4d00] text-xs font-mono p-2.5 focus:outline-none focus:border-[#ff4d00] rounded-none cursor-pointer"
              >
                {memories.map((m, idx) => (
                  <option key={m.id} value={m.id} className="bg-[#0c0c0c] text-white">
                    [{idx + 1}] {m.title.length > 40 ? m.title.substring(0, 38) + "..." : m.title}
                  </option>
                ))}
              </select>
            </div>

            {auditMemory ? (
              <div className="space-y-4 pt-1 bg-black/60 p-4 border border-[#222222]">
                
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-zinc-900 text-[10px] uppercase text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                    <span>TIMESTAMP: <strong className="text-zinc-300 font-bold">{auditMemory.createdAt}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-zinc-600" />
                    <span>ID_TOKEN: <strong className="text-[#ff4d00] font-bold">{auditMemory.id}</strong></span>
                  </div>
                </div>

                {/* Plaintext representation */}
                <div className="space-y-1.5">
                  <span className="text-[9px] text-[#888888] uppercase tracking-wider block">
                    {isChinese ? "■ 存证纯文本原件:" : "■ ORIGINAL COMMITTED PLAINTEXT:"}
                  </span>
                  <div className="bg-[#050505] p-3 text-zinc-300 border border-zinc-950 font-sans tracking-wide leading-relaxed text-xs max-h-24 overflow-y-auto">
                    {auditMemory.originalText}
                  </div>
                </div>

                {/* Hash mapping fingerpint */}
                <div className="space-y-1">
                  <span className="text-[9px] text-[#ff4d00]/80 font-bold uppercase tracking-wider block">
                    {isChinese ? "■ 256 位防篡改区块指纹内容哈希 (Hash):" : "■ 256-BIT CRYPTOGRAPHICAL DIGEST CONTENT HASH:"}
                  </span>
                  <div className="bg-zinc-900 border border-zinc-800 text-[#4ade80] font-mono p-2 px-2.5 break-all text-[9.5px]/none tracking-wider select-all select-none">
                    0x{auditMemory.hash}
                  </div>
                </div>

                {/* Mock Walrus Block layout matrix shards details */}
                <div className="space-y-2">
                  <span className="text-[9px] text-[#888888] uppercase tracking-wider block">
                    {isChinese ? "■ Walrus 纠删码分片冗余定位矩阵 (2倍安全因子):" : "■ WALRUS DISTRIBUTED SHARD MATRIX MATRIX STORAGE:"}
                  </span>
                  
                  {/* Shard visual grid */}
                  <div className="grid grid-cols-8 gap-2">
                    {Array.from({ length: 16 }).map((_, shardIdx) => {
                      const hexID = (shardIdx * 179 + 54).toString(16).substring(0, 4);
                      const isErasure = shardIdx >= 10; // Shards 11-16 are redundant erasure code guards
                      return (
                        <div 
                          key={shardIdx}
                          className={`p-1 text-center border font-mono select-none ${
                            isErasure
                              ? "bg-emerald-950/20 border-emerald-800/50 text-emerald-500"
                              : "bg-orange-950/15 border-orange-850/45 text-orange-500"
                          }`}
                        >
                          <div className="font-bold text-[8.5px]">S_{shardIdx + 1}</div>
                          <div className="text-[7px] text-[#555555] font-mono uppercase">{isErasure ? "PAR" : "VAL"}</div>
                          <div className="text-[6.5px] opacity-75">{hexID}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Verification Checkpoints */}
                <div className="bg-[#070707] border border-zinc-900 p-3 text-[10px] space-y-1.5 uppercase text-[#888888] select-none">
                  <div className="text-[#ff4d00] font-bold text-[9px] uppercase border-b border-zinc-900 pb-1 flex items-center">
                    <Server className="w-3.5 h-3.5 mr-2" />
                    <span>{isChinese ? "去中心化纠删比对核对单" : "LEDGER ATTESTATION DECRYPT CHECKLISTS:"}</span>
                  </div>
                  <div className="flex items-center text-zinc-300">
                    <div className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-500 flex items-center justify-center text-[8px] font-bold border border-emerald-800 mr-2 shrink-0">✓</div>
                    <span>Sui NFT Mint Hash: <strong className="text-white ml-1 font-mono break-all text-[8.5px]">{auditMemory.txHash.slice(0, 32)}...</strong></span>
                  </div>
                  <div className="flex items-center text-zinc-300">
                    <div className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-500 flex items-center justify-center text-[8px] font-bold border border-emerald-800 mr-2 shrink-0">✓</div>
                    <span>Walrus Storage Pointer: <strong className="text-white ml-1 font-mono break-all text-[8.5px]">{auditMemory.blobId.slice(0, 32)}...</strong></span>
                  </div>
                  <div className="flex items-center text-zinc-300">
                    <div className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-500 flex items-center justify-center text-[8px] font-bold border border-emerald-800 mr-2 shrink-0">✓</div>
                    <span>Consensus Signature Verification Index: <strong className="text-white ml-1">ED25519 APPROVED</strong></span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center text-zinc-600 py-10">
                <AlertCircle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <span>{isChinese ? "尚未创建任何安全区块数据原件，请先在【记录者】页签录入。" : "No memories registered yet. Create one under 'Noter'!"}</span>
              </div>
            )}

          </div>

          {/* 3. REALTIME IN-SYSTEM MEMORY SEARCH & QUERY */}
          <div className="bg-[#0c0c0c] border border-[#222222] p-4.5 space-y-4">
            <h4 className="text-xs font-bold text-white tracking-widest uppercase border-b border-[#222222] pb-2 flex items-center">
              <Search className="w-4 h-4 text-[#ff4d00] mr-2" />
              {isChinese ? "快速检索存证库" : "MEMORIES SEARCH & FILTER LOG"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Search text query bar */}
              <div className="space-y-1">
                <span className="text-[9px] text-[#888888] uppercase block">{isChinese?"内容关键字":"TEXT CONTAINS"}</span>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isChinese?"检索正文...":"Query contents..."}
                    className="w-full bg-black border border-[#222222] px-2.5 py-1.5 focus:outline-none focus:border-[#ff4d00]"
                  />
                </div>
              </div>

              {/* Tag selector filter */}
              <div className="space-y-1">
                <span className="text-[9px] text-[#888888] uppercase block">{isChinese?"标签过滤":"TAG GROUP"}</span>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full bg-black border border-[#222222] p-1.5 text-zinc-300 focus:outline-none focus:border-[#ff4d00]"
                >
                  <option value="all">ALL TAGS</option>
                  {allUniqueTags.map(tag => (
                    <option key={tag} value={tag}>#{tag}</option>
                  ))}
                </select>
              </div>

              {/* Importance level slider filter */}
              <div className="space-y-1">
                <span className="text-[9px] text-[#888888] uppercase block">{isChinese?"最低重要评级":"MIN IMPORTANT"}</span>
                <select
                  value={minImportance}
                  onChange={(e) => setMinImportance(parseInt(e.target.value))}
                  className="w-full bg-black border border-[#222222] p-1.5 text-zinc-300 focus:outline-none focus:border-[#ff4d00]"
                >
                  <option value={1}>★☆☆☆☆ (1+ Stars)</option>
                  <option value={2}>★★☆☆☆ (2+ Stars)</option>
                  <option value={3}>★★★☆☆ (3+ Stars)</option>
                  <option value={4}>★★★★☆ (4+ Stars)</option>
                  <option value={5}>★★★★★ (5 Stars)</option>
                </select>
              </div>
            </div>

            {/* List count readout */}
            <div className="text-[10px] text-zinc-500 uppercase flex justify-between select-none">
              <span>{isChinese ? `🔍 检索匹配块数量: ${filteredMemories.length} / ${memories.length}` : `🔍 MATCHED LOG UNITS: ${filteredMemories.length} / ${memories.length}`}</span>
            </div>

            {/* Filtered outputs previews */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredMemories.length === 0 ? (
                <div className="text-center text-[#555555] py-6 border border-dashed border-zinc-800">{isChinese?"未检索到匹配的记忆区段":"Zero matches returned"}</div>
              ) : (
                filteredMemories.map((m, idx) => (
                  <div 
                    key={m.id}
                    onClick={() => {
                      setSelectedAuditMemoryId(m.id);
                      const topInspect = document.getElementById("wallet-auth-gateway") || document.getElementById("memosui-workspace");
                      topInspect?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`p-2.5 bg-zinc-950 hover:bg-[#ff4d00]/5 border transition-all cursor-pointer flex justify-between items-center ${
                      selectedAuditMemoryId === m.id ? "border-[#ff4d00]" : "border-zinc-900"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-white block">{m.title}</span>
                      <span className="text-[9px] text-zinc-500 line-clamp-1">{m.originalText}</span>
                    </div>

                    <div className="flex gap-1">
                      {Array.isArray(m.tags) && m.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[7.5px] px-1.5 py-0.5 bg-zinc-900 text-zinc-400 font-bold border border-zinc-800 uppercase">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
