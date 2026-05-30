/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { StorageNode } from "../types";
import { Language, TRANSLATIONS } from "../locales";
import { Cpu, Server, Shield, Globe, Radio } from "lucide-react";

interface StorageNodeMapProps {
  nodes: StorageNode[];
  activeShardNodes: string[]; // Node IDs that currently hold shards of the hovering/selected memory
  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  lang: Language;
}

export default function StorageNodeMap({
  nodes,
  activeShardNodes,
  hoveredNodeId,
  setHoveredNodeId,
  lang
}: StorageNodeMapProps) {
  const [selectedNode, setSelectedNode] = useState<StorageNode>(nodes[0]);
  const [pulsing, setPulsing] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    // Pulse on memory interaction
    if (activeShardNodes.length > 0) {
      setPulsing(true);
      const timer = setTimeout(() => setPulsing(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [activeShardNodes]);

  const handleNodeClick = (node: StorageNode) => {
    setSelectedNode(node);
  };

  return (
    <div id="storage-node-mesh" className="bg-[#0a0a0a] border border-[#222222] p-6 relative overflow-hidden kinetic-dot-grid">
      
      {/* Decorative Rotating Diamond Motif from STVDIO.KINETIC */}
      <div className="absolute -bottom-16 -right-16 w-44 h-44 border border-[#ff4d00]/10 rotate-45 flex items-center justify-center pointer-events-none select-none">
        <div className="w-32 h-32 border border-[#ff4d00]/5" />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 relative z-10">
        
        {/* Node Active Mesh Graph (Left Column) */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-[0.2em] text-[#ffffff] flex items-center">
                <Globe className="w-4 h-4 text-[#ff4d00] mr-2" />
                {t.mapTitle}
              </h3>
              <p className="text-[10px] text-[#555555] font-mono tracking-wider uppercase mt-0.5">
                {t.mapSubtitle}
              </p>
            </div>
            
            <div className="flex items-center space-x-3 text-[9px] font-mono tracking-widest uppercase">
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 bg-[#ff4d00] mr-1.5" />
                {t.selectedBadge}
              </span>
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 border border-[#ff4d00] bg-[#151515] text-[#ff4d00] mr-1.5 animate-pulse" />
                {t.shardHostsBadge}
              </span>
            </div>
          </div>

          {/* Interactive Web UI Node Ring - Restlyed to square/minimalist look */}
          <div className="relative h-[260px] border border-[#222222] bg-[#0c0c0c] flex items-center justify-center p-4">
            
            {/* Center Core technical representation */}
            <div className="absolute flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center w-24 h-24 rounded-none border border-[#222222] bg-[#111111]">
                {/* Custom rotate frames */}
                <div className="absolute inset-0 border border-[#ff4d00]/20 rotate-45 pointer-events-none" />
                <div className={`absolute inset-0 border border-[#ff4d00]/40 transition-all duration-700 ${pulsing ? "scale-125 opacity-100" : "scale-100 opacity-20"}`} />
                <div className="absolute inset-2 bg-[#151515] border border-[#222222] flex items-center justify-center">
                  <Radio className={`w-6 h-6 ${activeShardNodes.length > 0 ? "text-[#ff4d00]" : "text-white"} transition-colors`} />
                </div>
              </div>
              <span className="text-[8px] font-mono text-[#555555] mt-3.5 tracking-[0.3em] uppercase">
                {t.consensusCore}
              </span>
            </div>

            {/* Nodes Layout Ring but in sharp square layouts */}
            {nodes.map((node, index) => {
              const angle = (index * 360) / nodes.length;
              const radius = 105; // radius of layout ring in px
              const x = radius * Math.cos((angle * Math.PI) / 180);
              const y = radius * Math.sin((angle * Math.PI) / 180);

              const isSelected = selectedNode.id === node.id;
              const isShardHost = activeShardNodes.includes(node.id);
              const isOffline = node.status === "offline";
              const isWarning = node.status === "warning";

              let dotClass = "";
              if (isOffline) {
                dotClass = "bg-[#111111] border-[#3a1a1a] text-[#ff4d00]/20";
              } else if (isSelected) {
                dotClass = "bg-[#ff4d00] border-[#ff4d00] text-black font-bold scale-110";
              } else if (isShardHost) {
                dotClass = "bg-[#151515] border-[#ff4d00] text-[#ff4d00] scale-105 animate-pulse shadow-lg shadow-[#ff4d00]/10";
              } else if (isWarning) {
                dotClass = "bg-[#1c120a] border-[#8a4d1a] text-[#ff4d00]/60";
              } else {
                dotClass = "bg-[#111111] border-[#222222] text-[#888888] hover:border-[#ff4d00] hover:text-white";
              }

              return (
                <button
                  id={`node-btn-${node.id}`}
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className={`absolute w-7 h-7 rounded-none border text-[9px] font-mono flex items-center justify-center transition-all duration-200 cursor-pointer ${dotClass}`}
                  style={{
                    transform: `translate(${x}px, ${y}px)`
                  }}
                  title={node.name}
                >
                  {(index + 1).toString().padStart(2, "0")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Node Inspector Detailed Specs (Right Column) */}
        <div className="w-full lg:w-64 bg-[#151515]/90 border border-[#222222] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[#222222] pb-3">
              <span className="text-[9px] font-mono tracking-[0.2em] text-[#555555] uppercase">
                Active Node Metrics
              </span>
              <span className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest ${
                selectedNode.status === "active"
                  ? "bg-[#152a1a]/40 border border-[#2a6a3a]/40 text-[#4ade80]"
                  : selectedNode.status === "warning"
                  ? "bg-[#2d1f0f]/40 border border-[#7f4a15]/40 text-[#fbbf24]"
                  : "bg-[#2d0f0f]/40 border border-[#7f1515]/40 text-[#ef4444]"
              }`}>
                {selectedNode.status}
              </span>
            </div>

            <h4 className="text-xs font-bold font-mono tracking-wider text-white flex items-center mb-4 uppercase">
              <Server className="w-3.5 h-3.5 text-[#ff4d00] mr-2" />
              {selectedNode.name}
            </h4>

            <div className="space-y-4 text-[10px] font-mono tracking-wider">
              <div className="flex justify-between items-center border-b border-[#222222]/30 pb-1.5">
                <span className="text-[#555555] uppercase">{t.location}</span>
                <span className="text-[#e0e0e0] uppercase font-light">{selectedNode.region}</span>
              </div>
              
              <div className="flex justify-between items-center border-b border-[#222222]/30 pb-1.5">
                <span className="text-[#555555] uppercase">{t.activeShards}</span>
                <span className="text-[#ff4d00] font-bold">{selectedNode.shardsCount} fragments</span>
              </div>

              <div className="flex justify-between items-start border-b border-[#222222]/30 pb-1.5">
                <div className="text-[#555555] uppercase mt-0.5">{t.capacity}</div>
                <div className="text-right">
                  <span className="text-[#e0e0e0] font-medium">
                    {selectedNode.capacityUsed} / {selectedNode.capacityTotal}
                  </span>
                  {selectedNode.status !== "offline" && (
                    <div className="w-24 bg-[#0a0a0a] border border-[#222222] h-1.5 mt-1.5 overflow-hidden">
                      <div
                        className="bg-[#ff4d00] h-full"
                        style={{
                          width: `${(parseFloat(selectedNode.capacityUsed) / parseFloat(selectedNode.capacityTotal)) * 100}%`
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#555555] uppercase">{t.bandwidth}</span>
                <span className="text-white">
                  {selectedNode.status === "active" ? `${(selectedNode.intensity * 120).toFixed(1)} MB/s` : "0.0 MB/s"}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-[#222222] text-[9px] text-[#888888] font-mono flex items-start leading-relaxed">
            <Shield className="w-3.5 h-3.5 text-[#ff4d00] shrink-0 mr-2 mt-0.5" />
            <span>{t.erasureSecvp}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
