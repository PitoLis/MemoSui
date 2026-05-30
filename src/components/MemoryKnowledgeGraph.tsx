/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from "react";
import { StoredMemory } from "../types";
import { Language } from "../locales";
import { Network, Zap, Eye, RotateCcw, HelpCircle, Activity } from "lucide-react";
import { simulateHash } from "../utils";

interface MemoryKnowledgeGraphProps {
  memories: StoredMemory[];
  onSelectMemory: (memory: StoredMemory) => void;
  lang: Language;
}

interface GraphNode {
  id: string;
  label: string;
  type: "root" | "memory" | "tag";
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  textColor: string;
  referenceId?: string; // matches StoredMemory id
}

interface GraphLink {
  source: string;
  target: string;
}

export default function MemoryKnowledgeGraph({
  memories,
  onSelectMemory,
  lang
}: MemoryKnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Graph state references to maintain continuity on render
  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<GraphLink[]>([]);
  const draggedNodeRef = useRef<GraphNode | null>(null);
  const hoveredNodeRef = useRef<GraphNode | null>(null);

  // Stats / UI State
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [hoverDetail, setHoverDetail] = useState<string | null>(null);
  const [physicsActive, setPhysicsActive] = useState(true);

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

  // Re-synchronize physics graph nodes and links on memory additions
  useEffect(() => {
    const width = dimensions.width;
    const height = dimensions.height;
    const spawnX = width / 2;
    const spawnY = height / 2;

    // Existing coordinates map to prevent visual jumping
    const existingCoords = new Map<string, { x: number; y: number; vx: number; vy: number }>();
    nodesRef.current.forEach(node => {
      existingCoords.set(node.id, { x: node.x, y: node.y, vx: node.vx, vy: node.vy });
    });

    const newNodes: GraphNode[] = [];
    const newLinks: GraphLink[] = [];

    // 1. Core central anchor node
    const rootId = "core-root";
    const rootCoords = existingCoords.get(rootId) || { x: spawnX, y: spawnY, vx: 0, vy: 0 };
    newNodes.push({
      id: rootId,
      label: lang === "zh" ? "我的 Sui 记忆保险库" : "SUI SECURED VAULT",
      type: "root",
      x: rootCoords.x,
      y: rootCoords.y,
      vx: rootCoords.vx,
      vy: rootCoords.vy,
      radius: 20,
      color: "#ff4d00",
      textColor: "#ffffff"
    });

    // 2. Map of tag nodes
    const tagSet = new Set<string>();
    memories.forEach(m => {
      m.tags.forEach(tag => tagSet.add(tag));
    });

    // Spawn Tag nodes
    tagSet.forEach(tag => {
      const tagNodeId = `tag-${tag}`;
      const tagCoords = existingCoords.get(tagNodeId) || {
        x: spawnX + (Math.random() - 0.5) * 160,
        y: spawnY + (Math.random() - 0.5) * 160,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      };

      newNodes.push({
        id: tagNodeId,
        label: `#${tag}`,
        type: "tag",
        x: tagCoords.x,
        y: tagCoords.y,
        vx: tagCoords.vx,
        vy: tagCoords.vy,
        radius: 10,
        color: "#ffffff",
        textColor: "#888888"
      });

      // Link tag node back to the Root hub to form groups
      newLinks.push({
        source: rootId,
        target: tagNodeId
      });
    });

    // 3. Spawn Memory nodes
    memories.forEach(m => {
      const memNodeId = `mem-${m.id}`;
      const coords = existingCoords.get(memNodeId) || {
        x: spawnX + (Math.random() - 0.5) * 240,
        y: spawnY + (Math.random() - 0.5) * 240,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4
      };

      newNodes.push({
        id: memNodeId,
        label: m.title,
        type: "memory",
        x: coords.x,
        y: coords.y,
        vx: coords.vx,
        vy: coords.vy,
        radius: 14,
        color: "#151515",
        textColor: "#e0e0e0",
        referenceId: m.id
      });

      // Link memory to each of its associated tags! This generates a beautiful clustered net!
      m.tags.forEach(tag => {
        newLinks.push({
          source: memNodeId,
          target: `tag-${tag}`
        });
      });
    });

    nodesRef.current = newNodes;
    linksRef.current = newLinks;
  }, [memories, dimensions, lang]);

  // Adjust canvas resolution dynamically on container sizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        let { width, height } = entry.contentRect;
        // set sizing threshold
        width = width > 0 ? width : 600;
        height = height > 0 ? height : 440;
        setDimensions({ width, height: 440 });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Central Physics engine animation thread Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let requestId: number;

    const frame = () => {
      const nodes = nodesRef.current;
      const links = linksRef.current;
      const { width, height } = dimensions;
      const centerX = width / 2;
      const centerY = height / 2;
      const isLight = document.body.classList.contains("light-theme");

      // 1. RUN PHYSICS MATHEMATICAL STEPS if active
      if (physicsActive) {
        // Force Strength Multipliers
        const repulsionStrength = 1800;
        const attractionStrength = 0.04;
        const centerGravity = 0.012;
        const linkRestLength = 80;
        const dragDamping = 0.82; // resistance

        // A. Repulsion loop (Coulomb's Law: push nodes apart)
        for (let i = 0; i < nodes.length; i++) {
          const nodeA = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const nodeB = nodes[j];
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;

            if (dist < 260) {
              const force = repulsionStrength / (dist * dist);
              const fx = (force * dx) / dist;
              const fy = (force * dy) / dist;

              nodeA.vx -= fx;
              nodeA.vy -= fy;
              nodeB.vx += fx;
              nodeB.vy += fy;
            }
          }
        }

        // B. Attraction Loop (Hooke's Spring Law: pull linked nodes closer)
        links.forEach(link => {
          const nodeA = nodes.find(n => n.id === link.source);
          const nodeB = nodes.find(n => n.id === link.target);
          if (nodeA && nodeB) {
            const dx = nodeB.x - nodeA.x;
            const dy = nodeB.y - nodeA.y;
            const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;
            const springForce = (dist - linkRestLength) * attractionStrength;
            const fx = (springForce * dx) / dist;
            const fy = (springForce * dy) / dist;

            nodeA.vx += fx;
            nodeA.vy += fy;
            nodeB.vx -= fx;
            nodeB.vy -= fy;
          }
        });

        // C. Center Gravity Loop & Position Updates
        nodes.forEach(node => {
          // Slight center pull to map beautifully
          const dx = centerX - node.x;
          const dy = centerY - node.y;
          node.vx += dx * centerGravity;
          node.vy += dy * centerGravity;

          // Damping Friction Apply
          node.vx *= dragDamping;
          node.vy *= dragDamping;

          // Advance node position if not actively dragged
          if (draggedNodeRef.current?.id !== node.id) {
            node.x += node.vx;
            node.y += node.vy;
          }

          // Elastic Boundaries containment
          const margin = 24;
          if (node.x < margin) { node.x = margin; node.vx *= -0.5; }
          if (node.x > width - margin) { node.x = width - margin; node.vx *= -0.5; }
          if (node.y < margin) { node.y = margin; node.vy *= -0.5; }
          if (node.y > height - margin) { node.y = height - margin; node.vy *= -0.5; }
        });
      }

      // 2. DRAW GRAPH VISUALS ON CANVAS
      const currentDpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      ctx.save();
      ctx.clearRect(0, 0, width * currentDpr, height * currentDpr);
      ctx.scale(currentDpr, currentDpr);

      // Draw faint dot-matrix background behind the graph internally
      ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.035)" : "rgba(255, 77, 0, 0.02)";
      ctx.lineWidth = 1;
      const dotSpacing = 20;
      for (let x = 0; x < width; x += dotSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += dotSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Links/Spring Lines
      ctx.lineWidth = 0.85;
      links.forEach(link => {
        const nodeA = nodes.find(n => n.id === link.source);
        const nodeB = nodes.find(n => n.id === link.target);
        if (nodeA && nodeB) {
          // Highlight connection if hovering source or target
          const isHighlighted = hoveredNodeRef.current?.id === nodeA.id || hoveredNodeRef.current?.id === nodeB.id;
          
          if (isHighlighted) {
            ctx.strokeStyle = "rgba(255, 77, 0, 0.55)";
            ctx.lineWidth = 1.6;
          } else {
            ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.18)" : "rgba(224, 224, 224, 0.065)";
            ctx.lineWidth = 0.9;
          }
          ctx.beginPath();
          ctx.moveTo(nodeA.x, nodeA.y);
          ctx.lineTo(nodeB.x, nodeB.y);
          ctx.stroke();
        }
      });

      // Draw Nodes
      nodes.forEach(node => {
        const isHovered = hoveredNodeRef.current?.id === node.id;
        const isDragged = draggedNodeRef.current?.id === node.id;

        // Node Glow outer ring
        if (isHovered || isDragged) {
          ctx.shadowBlur = 12;
          ctx.shadowColor = node.type === "root" 
            ? "rgba(255, 77, 0, 0.5)" 
            : (isLight ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.25)");
        } else {
          ctx.shadowBlur = 0;
        }

        // Drawer
        if (node.type === "root") {
          // Central Root custom core (glowing geometric diamond inside square)
          ctx.fillStyle = "rgba(255, 77, 0, 0.15)";
          ctx.strokeStyle = "#ff4d00";
          ctx.lineWidth = 1.5;
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#ff4d00";
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius - 8, 0, Math.PI * 2);
          ctx.fill();

        } else if (node.type === "tag") {
          // Tag nodes are clean hollow or visual indicators
          ctx.fillStyle = isHovered 
            ? (isLight ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.2)") 
            : (isLight ? "#000000" : "rgba(12, 12, 12, 0.9)");
          ctx.strokeStyle = isHovered ? "#ff4d00" : (isLight ? "#000000" : "rgba(100, 100, 100, 0.4)");
          ctx.lineWidth = isHovered ? 1.5 : 1;
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

        } else {
          // Memory nodes - Glow orange border if active
          ctx.fillStyle = isHovered 
            ? (isLight ? "rgba(255, 77, 0, 0.1)" : "rgba(255, 77, 0, 0.08)") 
            : (isLight ? "#000000" : "#111111");
          ctx.strokeStyle = isHovered ? "#ff4d00" : (isLight ? "#000000" : "rgba(224, 224, 224, 0.15)");
          ctx.lineWidth = isHovered ? 1.8 : 1.2;

          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Small secondary inside dot representing on chain index
          ctx.fillStyle = isHovered ? "#ff4d00" : (isLight ? "#ffffff" : "rgba(255, 77, 0, 0.6)");
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Restore shadows
        ctx.shadowBlur = 0;

        // Label typography
        ctx.fillStyle = isHovered 
          ? "#ff4d00" 
          : (isLight ? "#000000" : "#888888");
        ctx.font = node.type === "root" 
          ? "bold 9px 'JetBrains Mono', monospace" 
          : "8px 'Inter', sans-serif";
        ctx.textAlign = "center";
        
        // Offset label placement dynamically relative to node size
        const labelOffset = node.radius + (node.type === "root" ? 14 : 10);
        ctx.fillText(node.label, node.x, node.y + labelOffset);
      });

      ctx.restore();

      requestId = requestAnimationFrame(frame);
    };

    requestId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(requestId);
    };
  }, [dimensions, physicsActive]);

  // Handle Dragging / Clicking Mouse Trigger Methods
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const nodes = nodesRef.current;
    
    // Find closest node clicked
    let clickedNode: GraphNode | null = null;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const dx = pos.x - node.x;
      const dy = pos.y - node.y;
      const clickedDistance = Math.sqrt(dx * dx + dy * dy);
      
      if (clickedDistance < node.radius + 12) {
        clickedNode = node;
        break;
      }
    }

    if (clickedNode) {
      draggedNodeRef.current = clickedNode;
      // Kick off extra energy into physics engine
      clickedNode.vx = 0;
      clickedNode.vy = 0;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const nodes = nodesRef.current;

    // 1. If dragging an existing node
    if (draggedNodeRef.current) {
      const node = draggedNodeRef.current;
      node.x = pos.x;
      node.y = pos.y;
      node.vx = 0;
      node.vy = 0;
      return;
    }

    // 2. Otherwise update Hover node states
    let curHover: GraphNode | null = null;
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const dx = pos.x - node.x;
      const dy = pos.y - node.y;
      if (Math.sqrt(dx * dx + dy * dy) < node.radius + 12) {
        curHover = node;
        break;
      }
    }

    hoveredNodeRef.current = curHover;
    
    // Trigger tooltip details
    if (curHover) {
      if (curHover.type === "memory" && curHover.referenceId) {
        const memory = memories.find(m => m.id === curHover!.referenceId);
        if (memory) {
          setHoverDetail(
            lang === "zh"
              ? `[记忆块: ${memory.title}] — ${memory.summary}`
              : `[BLOCK: ${memory.title.toUpperCase()}] — ${memory.summary}`
          );
        }
      } else if (curHover.type === "tag") {
        setHoverDetail(
          lang === "zh"
            ? `[群落话题: ${curHover.label}] — 含有此标签的链上数据记录`
            : `[TOPIC CLUSTER: ${curHover.label}] — Shared data nodes connected via tag`
        );
      } else {
        setHoverDetail(
          lang === "zh"
            ? `[主节点中心] — Sui-Move 代指与 Walrus 物理归档集群的映射网`
            : `[LEDGER ROOT MODULE] — Base validation metadata ledger indexer`
        );
      }
    } else {
      setHoverDetail(null);
    }
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    const nodes = nodesRef.current;

    // Trigger verification action if a memory node is clicked!
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const dx = pos.x - node.x;
      const dy = pos.y - node.y;
      if (Math.sqrt(dx * dx + dy * dy) < node.radius + 12) {
        if (node.type === "memory" && node.referenceId) {
          const m = memories.find(mem => mem.id === node.referenceId);
          if (m) {
            onSelectMemory(m);
          }
        }
        break;
      }
    }
  };

  return (
    <div 
      id="custom-knowledge-graph-container" 
      className="bg-[#0c0c0c] border border-[#222222] p-5 relative overflow-hidden"
    >
      
      {/* Visual cyber design borders */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#ff4d00]/30" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#ff4d00]/30" />

      {/* Header telemetry and indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#222222]/80 mb-4">
        <div>
          <h4 className="text-xs font-bold font-mono tracking-[0.2em] text-[#ffffff] uppercase flex items-center">
            <Network className="w-4 h-4 text-[#ff4d00] mr-2 animate-pulse" />
            {lang === "zh" ? "链上智能知识谱系网络" : "SECURED MEMORY KNOWLEDGE COGNIZANCE MESH"}
          </h4>
          <p className="text-[9px] text-[#555555] font-mono uppercase tracking-wider mt-0.5">
            {lang === "zh" ? "结合 Sui-NFT 链上索引与 Walrus 节点数据形成的关联谱系" : "REAL-TIME SEMANTIC ASSOCIATION BLOCKS IN METADATA COSMSO"}
          </p>
        </div>

        {/* Console control options */}
        <div className="flex items-center space-x-2.5 font-mono text-[9px]">
          <button
            onClick={() => setPhysicsActive(!physicsActive)}
            className={`px-2.5 py-1 uppercase tracking-wider border cursor-pointer ${
              physicsActive 
                ? "bg-[#ff4d00]/5 border-[#ff4d00]/40 text-[#ff4d00]" 
                : "bg-[#111111] border-[#222222] text-[#555555] hover:text-white"
            }`}
            style={{ borderRadius: "0" }}
          >
            {physicsActive ? (lang === "zh" ? "● 动力自适应" : "● Physics Active") : (lang === "zh" ? "○ 静止布局" : "○ Physics Frozen")}
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Viewer Area */}
      <div 
        ref={containerRef} 
        className="relative bg-[#060606] border border-[#1a1a1a] h-[440px] flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width * dpr}
          height={dimensions.height * dpr}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
          className="absolute inset-0 block w-full h-full"
        />

        {/* Tech guidelines label */}
        <div className="absolute left-3.5 bottom-3.5 pointer-events-none font-mono text-[8px] text-[#444444] space-y-0.5 uppercase tracking-widest bg-black/60 p-2 border border-[#222222]/20">
          <div>[DRAG DOTS TO ROTATE]</div>
          <div>[CLICK MEM NODES TO RUN VERIFIER]</div>
        </div>

        {/* Cluster count indicators */}
        <div className="absolute right-3.5 bottom-3.5 pointer-events-none font-mono text-[8px] text-[#555555] uppercase tracking-widest space-y-0.5 bg-black/60 p-2 border border-[#222222]/20">
          <div className="flex justify-between gap-4">
            <span>MEM_CLUSTERS:</span>
            <span className="text-white font-bold">{memories.length}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>COGNITIVE_LINKS:</span>
            <span className="text-[#ff4d00] font-bold">
              {memories.reduce((acc, current) => acc + current.tags.length, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Live Telemetry HUD Bar */}
      <div className="mt-3.5 bg-[#111111] border border-[#222222] h-10 px-3.5 flex items-center justify-between font-mono text-[9px] select-text">
        <div className="flex items-center space-x-2 text-[#555555] overflow-hidden truncate max-w-full">
          <Zap className="w-3.5 h-3.5 text-[#ff4d00] shrink-0" />
          <span className="text-[10px] uppercase font-bold text-white shrink-0">
            {lang === "zh" ? "谱系实时探测器:" : "REAL-TIME RADAR:"}
          </span>
          <span className="text-white font-sans truncate">
            {hoverDetail || (
              lang === "zh" 
                ? "光标悬停节点以感知相关的 SHA-256 结构化概要..." 
                : "Hover on clusters to project details... Click any memory dot to trigger cryptography audit report."
            )}
          </span>
        </div>
        
        {!hoverDetail && (
          <div className="hidden md:flex items-center text-[8px] text-[#444444] tracking-widest shrink-0 uppercase">
            <span>STABLE_STATE // GRID_ALIGN</span>
          </div>
        )}
      </div>

    </div>
  );
}
