/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { StoredMemory } from "../types";
import { Language } from "../locales";
import { 
  Brain, 
  Cpu, 
  Layers, 
  Download, 
  ShieldCheck, 
  Sliders, 
  Database, 
  Coins, 
  Lock, 
  Terminal, 
  ArrowRight,
  Play, 
  Sparkles,
  RefreshCw,
  Check,
  Plus
} from "lucide-react";

interface DigitalImmortalityTabProps {
  memories: StoredMemory[];
  lang: Language;
  walletConnected: boolean;
  walletAddress: string;
}

export default function DigitalImmortalityTab({ 
  memories, 
  lang,
  walletConnected,
  walletAddress
}: DigitalImmortalityTabProps) {
  // Config States
  const [licensingFee, setLicensingFee] = useState<number>(0.5);
  const [customMotto, setCustomMotto] = useState<string>(() => {
    return localStorage.getItem("memosui_immortality_motto") || "";
  });
  const [nftMinted, setNftMinted] = useState<boolean>(() => {
    return localStorage.getItem("memosui_immortality_nft_minted") === "true";
  });
  const [nftObjectAddress, setNftObjectAddress] = useState<string>(() => {
    return localStorage.getItem("memosui_immortality_nft_address") || "";
  });

  // Preference Model States
  const [prefTone, setPrefTone] = useState<number>(50); // 0=Concise Term, 100=Warm Narrative
  const [prefLogic, setPrefLogic] = useState<number>(30); // 0=Rigidly Pragmatic, 100=Imaginative
  const [prefFramework, setPrefFramework] = useState<number>(80); // 0=Web3 Native, 100=Traditional Classical

  // Training Simulation States
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [trainingProgress, setTrainingProgress] = useState<number>(0);
  const [modelCertified, setModelCertified] = useState<boolean>(() => {
    return localStorage.getItem("memosui_immortality_certified") === "true";
  });

  // Sandbox Tester States
  const [testPrompt, setTestPrompt] = useState<string>("");
  const [testResponse, setTestResponse] = useState<string>("");
  const [isSimulatingResponse, setIsSimulatingResponse] = useState<boolean>(false);

  // Connection Log Step Trackers
  const totalTrainingSteps = 100;

  useEffect(() => {
    localStorage.setItem("memosui_immortality_motto", customMotto);
  }, [customMotto]);

  useEffect(() => {
    localStorage.setItem("memosui_immortality_nft_minted", String(nftMinted));
  }, [nftMinted]);

  useEffect(() => {
    localStorage.setItem("memosui_immortality_nft_address", nftObjectAddress);
  }, [nftObjectAddress]);

  useEffect(() => {
    localStorage.setItem("memosui_immortality_certified", String(modelCertified));
  }, [modelCertified]);

  // Compute stats based on memories
  const totalCharacters = memories.reduce((acc, m) => acc + (m.originalText?.length || 0), 0);
  const numTags = Array.from(new Set(memories.reduce((acc, m) => acc.concat(m.tags || []), [] as string[]))).length;
  
  // Dynamic prompt generation based on user memories
  const generateDynamicPrompt = () => {
    const defaultMotto = lang === "zh" 
      ? "坚守去中心化理念与智能主权" 
      : "Adhere to decentralization and sovereign mental security.";
    const activeMotto = customMotto.trim() || defaultMotto;

    const toneText = prefTone < 30 
      ? "Highly analytical, absolute concise, dense markdown structure with tech-jargons."
      : prefTone > 70 
        ? "Helpful, warm, empathetic, prioritizing narrative storytelling with human touch."
        : "Balanced conversational agent, combining code logic with precise structured answers.";

    const logicText = prefLogic < 30
      ? "Extremely deterministic, strictly bound to verified facts and empirical SUI/Walrus proof logs."
      : prefLogic > 70
        ? "Highly speculative, creative, proposing imaginative workflow improvements and agent topologies."
        : "Reasonable inductive logical models, merging empirical on-chain context with proactive suggestions.";

    const actualTopics = memories.length > 0 
      ? memories.slice(0, 4).map(m => `"${m.originalText.substring(0, 45)}..."`).join(", ")
      : lang === "zh" ? "系统预置种子内存快照" : "System seed memory capsules";

    return `SYSTEM_PROMPT_VERSION: v3.1.2-IMMORTAL_TOPOLOGY
[ROLE]: Digital Twin Representation Layer
[AUTHORIZED_SUI_OWNER]: ${walletAddress || "0x7b2a...active_session"}
[MOTTO/PHILOSOPHY]: "${activeMotto}"
[PREFERENCE_TONE]: ${toneText}
[COGNITIVE_LOGIC]: ${logicText}
[LOCAL_KNOWLEDGE_CONTEXT]: Derived from ${memories.length} locked memory nodes containing themes: ${actualTopics}.
[DISTRUST_THRESHOLD]: Always verify signatures on SUI block-index before accepting input.
[INSTRUCTION]: Act strictly as the cognitive extension representing the core values of this validated cluster.`;
  };

  // Compile full Digital Immortality model catalog
  const compileImmortalityModel = () => {
    return {
      metadata: {
        assetName: "Sui Mindset Quantized Digital Asset",
        compiledTimestamp: new Date().toISOString(),
        ownerSuiAddress: walletAddress || "0x7b2af299f12a64eb1e09df225e0129a6dcbeefacbe13994e9b110294fcde9b11",
        mindsetFingerprint: `sha256:0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
        licensingPolicy: {
          pricingModel: "Pay-Per-Query-Authorization",
          licensingFeeSui: licensingFee,
          restrictedAccess: true,
          supportedChains: ["Sui Mainnet", "Sui Testnet"]
        }
      },
      specifications: {
        promptInstructions: generateDynamicPrompt(),
        preferenceProfile: {
          communicationTone: prefTone / 100,
          inferenceLogic: prefLogic / 100,
          frameworkPragmatism: prefFramework / 100
        },
        ragDatabase: {
          numKnowledgeShards: memories.length,
          totalCognitiveCharacters: totalCharacters,
          uniqueTaxonTags: numTags,
          shardsList: memories.map(m => ({
            id: m.id,
            timestamp: m.createdAt,
            fingerprint: m.txHash,
            walrusBlobId: m.blobId || "N/A",
            approxVectorEmbedding: `f32x1536:[${Array.from({ length: 5 }, () => (Math.random() * 2 - 1).toFixed(4)).join(",")},...]`
          }))
        },
        networkArchitecture: {
          baseModelBackbone: "Gemini-2.5-Mindset-Quant",
          fineTuningStatus: modelCertified ? "TRAINED_AND_BOUND" : "UNINITIALIZED",
          agentWorkflowTopology: {
            trigger: "User Query Input",
            stages: [
              "Cryptographic Authorization Gate (Verify Sui Licensing NFT balance)",
              "RLHF Preference Profile Weights Bias Adjustment",
              "Walrus Distributed Memory Slicing Cache Retrieval",
              "Dynamic Context Injector Framework Alignment",
              "Sovereign Mindset AI Synthesis",
              "Output cryptographic verification seal & hash index ledger log"
            ]
          }
        }
      }
    };
  };

  // Run Fine-Tuning Simulation
  const handleStartTraining = () => {
    if (isTraining) return;
    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingLogs([]);
    
    const logs = lang === "zh" ? [
      "初始化思维训练环境：映射本地存储的 RAG 知识索引...",
      `已加载 ${memories.length} 条记忆片断，合并提取原始字符数据：${totalCharacters} bytes.`,
      "启动 RLHF 人类反馈偏好校准层：结合 Tone/Logic 阻尼乘子进行微调偏置...",
      "计算 Prompt 指令权值集：绑定确权数字签名以生成神经网络动态注入引导...",
      "正在进行第 1/4 轮微调演进 (Fine-tuning Epoch 1) - 当前损失函数: 1.450",
      "正在进行第 2/4 轮微调演进 (Fine-tuning Epoch 2) - 当前损失函数: 0.982",
      "正在进行第 3/4 轮微调演进 (Fine-tuning Epoch 3) - 当前损失函数: 0.615",
      "正在进行第 4/4 轮微调演进 (Fine-tuning Epoch 4) - 当前损失函数: 0.284",
      "权重拟合成功！生成思维量化矩阵校验哈希值...",
      "向本地 Sui 合约触发确权授权，保存分布式模型结构配置到 Walrus 协议...",
      "数字永生专属模型微调成功！思维指令及 workflow 系统包发布完毕。"
    ] : [
      "Initializing environment: Mapping local RAG knowledge records & tags...",
      `Assembled ${memories.length} active shards, loaded raw semantic context: ${totalCharacters} bytes.`,
      "Activating RLHF feedback calibrator: Compiling Tone/Logic multipliers bias indexes...",
      "Synthesizing dynamic Prompt instruct-set weights: Bundling Sui cryptographic signature...",
      "Executing Fine-tuning Epoch 1/4 - Initializing learning rates - Loss: 1.450",
      "Executing Fine-tuning Epoch 2/4 - Gradient clipping adjustment - Loss: 0.982",
      "Executing Fine-tuning Epoch 3/4 - Standardizing weights vectors - Loss: 0.615",
      "Executing Fine-tuning Epoch 4/4 - Finalizing inference checkpoints - Loss: 0.284",
      "Weight optimization succeeded! Generating neural model validation signature...",
      "Broadcasting mindset state changes to Sui node ledger & caching on Walrus storage cluster...",
      "Digital Immortality engine ready! Compiled sovereign intelligence package successfully."
    ];

    let logIdx = 0;
    const progressTimer = setInterval(() => {
      setTrainingProgress(p => {
        const nextP = p + 2;
        if (nextP >= 100) {
          clearInterval(progressTimer);
          setIsTraining(false);
          setModelCertified(true);
          return 100;
        }
        return nextP;
      });
    }, 100);

    const logsTimer = setInterval(() => {
      if (logIdx < logs.length) {
        setTrainingLogs(l => [...l, `[${new Date().toLocaleTimeString()}] ${logs[logIdx]}`]);
        logIdx++;
      } else {
        clearInterval(logsTimer);
      }
    }, 850);
  };

  // One-click Minting SUI Mindset NFT
  const handleMintMindsetNft = () => {
    if (nftMinted) return;
    const randomAddress = `0x38e2d43a${Array.from({ length: 56 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;
    setNftMinted(true);
    setNftObjectAddress(randomAddress);
  };

  // Sandbox Tester AI Prompt Simulation
  const handleRunTesterPrompt = () => {
    if (!testPrompt.trim()) return;
    setIsSimulatingResponse(true);
    setTestResponse("");
    
    // Formulate a response that mimics the user's memories
    setTimeout(() => {
      const matchKeywords = memories.map(m => ({
        content: m.originalText,
        summary: m.summary
      }));

      let answer = "";
      // Search memory content for matching context
      const matched = matchKeywords.find(item => 
        testPrompt.toLowerCase().includes(item.content.toLowerCase().substring(0, 20)) ||
        item.content.toLowerCase().includes(testPrompt.toLowerCase())
      );

      const defaultAnswersZH = [
        `我的去中心化思维已经对此做过标记。根据我的理念("${customMotto || "坚持智能主权"}"): 我们必须坚持在数字世界中进行主权自卫。所有关于这个话题的记忆已用 Sui 链上证明完整确权。根据偏好配置，我倾向于以 ${prefTone < 50 ? "简练严谨" : "温暖感性"} 的分析逻辑看待该问题。`,
        `获取思维成功。根据我的知识库，我的投资和生活原则在智能大模型中表示为：优先考虑端到端加密、数字所有权，并使用分散哈希作为我们永生的认知指纹。`
      ];

      const defaultAnswersEN = [
        `My digital twin has processed this request using our verified memory database. Adhering to our core motto ("${customMotto || "Maintain mental security"}"): We prioritize cryptographic parity. My cognitive layout is synchronized via Sui-Walrus protocol blocks.`,
        `Analyzing query based on preferred inference. I recommend maintaining peer-to-peer data nodes. Standard structures are verified against local storage logic.`
      ];

      if (matched) {
        if (lang === "zh") {
          answer = `【数字克隆人回复】检索到关联记忆块："${matched.summary}"。根据此处的客观实据，我的应对准则是：记录的内容指出「${matched.content}」。在去中心化的智能链网中，这部分处事智慧已经上锁并实现了区块链确权。我将坚决采取该法则，捍卫个人的思维数字资产收费权。`;
        } else {
          answer = `[Digital Twin Response] Context retrieved from memory block "${matched.summary}". Following my locked principles: "${matched.content}". This chunk is secured via cryptographical hashes with licensing fee set to ${licensingFee} SUI per authorization call. Let this represent my absolute digitized consensus.`;
        }
      } else {
        answer = lang === "zh" 
          ? defaultAnswersZH[Math.floor(Math.random() * defaultAnswersZH.length)]
          : defaultAnswersEN[Math.floor(Math.random() * defaultAnswersEN.length)];
      }

      setTestResponse(answer);
      setIsSimulatingResponse(false);
    }, 1200);
  };

  //一键导出 Digital Mindset Descriptor to local JSON file
  const handleExportJson = () => {
    const fullSpec = compileImmortalityModel();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullSpec, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `memosui_mindset_asset_${new Date().toISOString().substring(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div id="digital-immortality-panel" className="space-y-6">
      
      {/* Narrative Intro */}
      <div className="bg-[#0c0c0c] border border-[#222222] p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#ff4d00]/40" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#ff4d00]/40" />
        
        <div className="flex items-center space-x-3 mb-2.5">
          <div className="bg-[#ff4d00]/10 border border-[#ff4d00]/30 p-2">
            <Brain className="w-5 h-5 text-[#ff4d00]" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono tracking-[0.2em] text-[#ffffff] uppercase">
              {lang === "zh" ? "数字永生思维资产中心" : "DIGITAL IMMORTALITY & MINDSET ASSET GATEWAY"}
            </h3>
            <p className="text-[10px] text-[#ff4d00] font-mono tracking-wider uppercase mt-0.5">
              SOVEREIGN RETRIEVABLE QUANT COMPILER // EST. 2026
            </p>
          </div>
        </div>

        <p className="text-[11px] text-[#cccccc] leading-relaxed max-w-4xl border-l-2 border-[#ff4d00] pl-3.5 mb-2 py-0.5 font-sans">
          {lang === "zh"
            ? "你记录下的所有记忆文本与处事原则，都可以被量子化确权链上锁定。这套思维支持一键编译、区块链封章并配置加密收费机制。当未来外部大模型直接调取你这一脉相承的处理智慧执行工作时，系统将通过本页确权授权层扣取 SUI 服务代币 —— 你的个人思维将成为永续流转、自主变现的终身数字资产。"
            : "Every memory and standard of conduct you document is quantized, securely cataloged in distributed structures, and licensed with autonomous payment models. In futuristic agent-swarms, third-party LLMs will directly proxy your exact mindset to perform specialized tasks, transferring SUI token royalties safely back into your ledger."
          }
        </p>
      </div>

      {/* Main Grid: Dimensions & Control Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: 6-Core Dimension Specifications View */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-[#0c0c0c] border border-[#222222] p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-[#222222] pb-3 select-none">
              <h4 className="text-[11px] font-bold font-mono text-white tracking-widest uppercase flex items-center">
                <Layers className="w-4 h-4 text-[#ff4d00] mr-2" />
                {lang === "zh" ? "思维智核：六维规格视图" : "COGNITIVE CORE: SIX-DIMENSIONAL SPECS"}
              </h4>
              <button 
                onClick={handleExportJson}
                className="bg-[#111111] hover:bg-[#ff4d00] text-[#ff4d00] hover:text-black border border-[#ff4d00]/30 hover:border-transparent px-3 py-1.5 font-mono text-[9px] tracking-wider uppercase transition-all duration-200 cursor-pointer flex items-center space-x-1"
                style={{ borderRadius: "0" }}
              >
                <Download className="w-3 h-3 shrink-0" />
                <span>{lang === "zh" ? "一键导出系统包" : "ONE-CLICK EXPORT"}</span>
              </button>
            </div>

            {/* Dimension 1: Prompt Instruct-Set */}
            <div className="bg-[#111111]/60 border border-[#222222] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#ff4d00] uppercase tracking-wider flex items-center">
                  <span className="w-1 h-3 bg-[#ff4d00] mr-2" />
                  01. Prompt 指令集 (SYSTEM PROMPT INST-SET)
                </span>
                <span className="font-mono text-[8px] text-[#555555]">FITTED v3.1.2</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-mono text-[#888888] uppercase block">
                  {lang === "zh" ? "编辑你的核心人生信条/原则 (将作为引导微调注入):" : "EDIT YOUR COMPASS LIFE PHILOSOPHY (INJECTED INTO SYSTEM PROMPT):"}
                </label>
                <textarea
                  value={customMotto}
                  onChange={(e) => setCustomMotto(e.target.value)}
                  placeholder={lang === "zh" ? "例：永远保持终身学习，不做作恶的事情，坚信代码即是最高契约。" : "e.g. Always maintain lifetime curiosity; respect decetralization; treat code as the supreme contract."}
                  className="w-full bg-[#0a0a0a] border border-[#222222] text-[#e0e0e0] font-mono text-[10px] p-2.5 focus:border-[#ff4d00]/60 outline-none h-14"
                  style={{ borderRadius: "0", resize: "none" }}
                />
              </div>

              <div className="bg-[#0c0c0c] border border-[#222222] p-2.5">
                <pre className="text-[8px] font-mono text-[#4ade80] max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {generateDynamicPrompt()}
                </pre>
              </div>
            </div>

            {/* Dimension 2: RAG Knowledgebase */}
            <div className="bg-[#111111]/60 border border-[#222222] p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold text-[#ff4d00] uppercase tracking-wider flex items-center">
                  <span className="w-1 h-3 bg-[#ff4d00] mr-2" />
                  02. RAG 知识库规格 (SEMANTIC VECTOR BASE)
                </span>
                <span className="font-mono text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-[#4ade80] block px-1.5 py-0.5 uppercase tracking-wide">
                  {lang === "zh" ? `已就绪 ${memories.length} 向量块` : `${memories.length} SHARDS ACTIVE`}
                </span>
              </div>
              <p className="text-[9px] text-[#888888] font-sans leading-relaxed uppercase tracking-wider">
                {lang === "zh"
                  ? "利用 Walrus 分布式存储分片，提取用户文字特征进行密等归一化编码："
                  : "Leverages Walrus distributed chunking to extract literal contextual embedding profiles:"
                }
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[8px] text-zinc-400">
                <div className="bg-[#0c0c0c] border border-[#222222] p-2">
                  <span className="text-[#888888] block">TOTAL_BYTES:</span>
                  <span className="text-white font-bold text-[9px]">{totalCharacters} B</span>
                </div>
                <div className="bg-[#0c0c0c] border border-[#222222] p-2">
                  <span className="text-[#888888] block">VECTOR_DIM:</span>
                  <span className="text-white font-bold text-[9px]">1536 (f32)</span>
                </div>
                <div className="bg-[#0c0c0c] border border-[#222222] p-2">
                  <span className="text-[#888888] block">TAGS_TAXON:</span>
                  <span className="text-white font-bold text-[9px]">{numTags} UNIQUE</span>
                </div>
                <div className="bg-[#0c0c0c] border border-[#222222] p-2">
                  <span className="text-[#888888] block">COMPLETENESS:</span>
                  <span className="text-white font-bold text-[9px]">{memories.length >= 5 ? "100%" : "MID-LEVEL"}</span>
                </div>
              </div>

              {/* Shard vectors dynamic rendering limit 3 */}
              <div className="bg-[#0c0c0c] border border-[#222222] p-1.5 max-h-24 overflow-y-auto space-y-1">
                {memories.length > 0 ? (
                  memories.slice(0, 3).map((m, idx) => (
                    <div key={m.id} className="text-[8px] font-mono flex items-center justify-between border-b border-[#222222]/50 pb-1 text-zinc-500 last:border-0 last:pb-0">
                      <span className="truncate max-w-[120px] text-zinc-400">#{idx+1} [${m.summary.substring(0,18)}...]</span>
                      <span className="text-[#4ade80] truncate font-mono">TX: {m.txHash.substring(0, 10)}...</span>
                      <span className="text-[7px] text-[#ff4d00] shrink-0 font-bold uppercase">{m.blobId ? "Walrus Blob-Id" : "Simulated Node"}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-[8px] font-mono text-[#555555] italic block text-center py-2 uppercase">NO LOCAL RAG RECORDS FOUND</span>
                )}
              </div>
            </div>

            {/* Dimension 3: Preference Model (RLHF Configurator) */}
            <div className="bg-[#111111]/60 border border-[#222222] p-4 space-y-3.5">
              <span className="text-[10px] font-mono font-bold text-[#ff4d00] uppercase tracking-wider flex items-center">
                <span className="w-1 h-3 bg-[#ff4d00] mr-2" />
                03. Preference Model 反馈偏好 (ALIGNMENT MULTIPLIERS)
              </span>
              <p className="text-[9px] text-[#888888] uppercase tracking-wider">
                {lang === "zh" ? "手动调节对推理风格权重的校正系数，它直接干预克隆人思维在决策上的取向：" : "ADJUST SLIDER WEIGHTS TO CALIBRATE RLHF INFERENCE PREFERENCE ORIENTATIONS:"}
              </p>

              <div className="space-y-2.5 font-mono text-[9px]">
                {/* Tone Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>{lang === "zh" ? "输出语调: 极度客观/技术术语" : "TONE: STRICTLY TECH/CONCISE"}</span>
                    <span>{lang === "zh" ? "情感丰富/温暖生动" : "WARM/EMPATHETIC LOGICAL"}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-[#ff4d00] font-bold text-[8px] w-6 text-right">0%</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={prefTone}
                      onChange={(e) => setPrefTone(Number(e.target.value))}
                      className="flex-1 accent-[#ff4d00] bg-[#0c0c0c] border border-[#222222] h-1.5 focus:outline-none"
                    />
                    <span className="text-[#ff4d00] font-bold text-[8px] w-6">{prefTone}%</span>
                  </div>
                </div>

                {/* Logic Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>{lang === "zh" ? "推理态度: 完全根据链上实据" : "INFERENCE: STRICT BLOCK-LOGS"}</span>
                    <span>{lang === "zh" ? "天马行空/前瞻创意" : "CREATIVE/SPECULATIVE MIND"}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-[#ff4d00] font-bold text-[8px] w-6 text-right">0%</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={prefLogic}
                      onChange={(e) => setPrefLogic(Number(e.target.value))}
                      className="flex-1 accent-[#ff4d00] bg-[#0c0c0c] border border-[#222222] h-1.5 focus:outline-none"
                    />
                    <span className="text-[#ff4d00] font-bold text-[8px] w-6">{prefLogic}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dimension 4 & 5: Fine-tuning specifications & Agent Workflow Schema */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Fine-tuning specs */}
              <div className="bg-[#111111]/60 border border-[#222222] p-4 space-y-2">
                <span className="text-[10px] font-mono font-bold text-[#ff4d00] uppercase tracking-wider block">
                  04. FINE-TUNING 专属权重
                </span>
                <div className="text-[8px] font-mono space-y-1 text-zinc-400 uppercase">
                  <div className="flex justify-between border-b border-[#222222]/50 pb-0.5">
                    <span>Backbone Core:</span>
                    <span className="text-white font-bold">GEMINI-QUANT-V2</span>
                  </div>
                  <div className="flex justify-between border-b border-[#222222]/50 pb-0.5">
                    <span>Train Mode:</span>
                    <span className="text-white">LoRA Rank-8 / Alpha-16</span>
                  </div>
                  <div className="flex justify-between border-b border-[#222222]/50 pb-0.5">
                    <span>Loss Function:</span>
                    <span className="text-[#4ade80] font-bold">MSE+CROSSENTROPY</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weights Target:</span>
                    <span className="text-amber-500 font-bold">{modelCertified ? "CERTIFIED_ON_SUI" : "PENDING TRAINING"}</span>
                  </div>
                </div>
              </div>

              {/* Agent Workflow Layout flowchart */}
              <div className="bg-[#111111]/60 border border-[#222222] p-4 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-[#ff4d00] uppercase tracking-wider block">
                  05. AGENT WORKFLOW 工作流
                </span>
                <div className="bg-[#0a0a0a] border border-[#222222] p-2 text-center text-[7px] font-mono text-zinc-400 space-y-1 flex flex-col justify-center h-[64px] select-none">
                  <div className="truncate">🎯 USER INPUT → 🎫 SUI LICENSE CHECK</div>
                  <div className="truncate text-[#ff4d00]">⬇</div>
                  <div className="truncate">🧩 VECTOR RAG (WALRUS) • RLHF PREF MULTIPLIER</div>
                  <div className="truncate text-[#ff4d00]">⬇</div>
                  <div className="truncate text-[#4ade80] font-bold">🚀 ENCRYPTED AI SYNTHESIS OUTPUT</div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Right Side: Fine-Tuning Execution & On-Chain Licencing / Charging Gateway */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section A: Fine-tuning console */}
          <div className="bg-[#0c0c0c] border border-[#222222] p-5 space-y-4">
            <h4 className="text-[11px] font-bold font-mono text-white tracking-widest uppercase flex items-center border-b border-[#222222] pb-3">
              <Cpu className="w-4 h-4 text-[#ff4d00] mr-2" />
              {lang === "zh" ? "智能微调与训练编译系统" : "COGNITIVE MODEL TUNER"}
            </h4>

            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-400">{lang === "zh" ? "微调训练状态:" : "TRAIN METRIC STATUS:"}</span>
                {modelCertified ? (
                  <span className="text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[8px] tracking-wider uppercase">
                    {lang === "zh" ? "● 已编译认证" : "● CERTIFIED ACTIVE"}
                  </span>
                ) : (
                  <span className="text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8px] tracking-wider uppercase">
                    {lang === "zh" ? "待训练编译" : "WAITING FOR COMPILE"}
                  </span>
                )}
              </div>

              {isTraining ? (
                <div className="space-y-1.5 font-mono">
                  <div className="flex justify-between text-[9px] text-[#ff4d00] font-bold animate-pulse">
                    <span>TRAINING SOVEREIGN WEIGHTS...</span>
                    <span>{trainingProgress}%</span>
                  </div>
                  <div className="w-full bg-[#111111] border border-[#222222] h-2 relative">
                    <div 
                      className="bg-[#ff4d00] h-full transition-all duration-100" 
                      style={{ width: `${trainingProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartTraining}
                  className="w-full bg-[#111111] hover:bg-[#ff4d00] text-white hover:text-black border border-[#ff4d00]/30 hover:border-transparent font-mono font-bold tracking-widest text-[10px] py-3 uppercase transition-all duration-250 cursor-pointer flex items-center justify-center space-x-2"
                  style={{ borderRadius: "0" }}
                >
                  <Play className="w-3.5 h-3.5 text-[#ff4d00] hover:text-black shrink-0 animate-pulse" />
                  <span>{lang === "zh" ? "启动思维模型训练与编译" : "COMPILE & FINE-TUNE MINDSET"}</span>
                </button>
              )}

              {/* Terminal Logs of training */}
              <div className="bg-[#0a0a0a] border border-[#222222] p-3 space-y-1.5 font-mono text-[8px]">
                <div className="flex justify-between items-center text-[#888888] border-b border-[#222222] pb-1 uppercase tracking-wider select-none text-[7px]">
                  <span>System Console Log Terminal</span>
                  <span>STD_ERR_OUT</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 text-zinc-500 selection:bg-zinc-700 selection:text-white leading-relaxed">
                  {trainingLogs.length > 0 ? (
                    trainingLogs.map((log, index) => (
                      <div key={index} className="whitespace-pre-wrap">{log}</div>
                    ))
                  ) : (
                    <div className="text-[#555555] italic uppercase text-center py-4">
                      {lang === "zh" ? "微调日志控制台空闲 // 等待触发训练" : "Tuning console idle // Wait to activate compiler..."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section B: 区块链确权授权层 (Blockchain Licensing layer) */}
          <div className="bg-[#0c0c0c] border border-[#ff4d00]/20 p-5 space-y-4">
            <h4 className="text-[11px] font-bold font-mono text-white tracking-widest uppercase flex items-center border-b border-[#222222] pb-3">
              <ShieldCheck className="w-4 h-4 text-[#ff4d00] mr-2" />
              {lang === "zh" ? "06. SUI 区块链确权与授权变现网关" : "BLOCKCHAIN ATTESTATION & CHARGING CAP"}
            </h4>

            <div className="space-y-3.5">
              
              {/* Sui Mindset NFT state */}
              <div className="bg-[#111111]/80 border border-[#222222] p-3.5 space-y-2.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-zinc-400 font-bold uppercase">{lang === "zh" ? "所有权数字藏品 (Sui NFT):" : "MINDSET NFT STANDARD:"}</span>
                  {nftMinted ? (
                    <span className="text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[8px] uppercase tracking-wider">
                      {lang === "zh" ? "已上链铸造" : "ON-CHAIN EXECUTED"}
                    </span>
                  ) : (
                    <span className="text-zinc-500 font-bold bg-[#1d1d1d] border border-[#2a2a2a] px-2 py-0.5 text-[8px] uppercase tracking-wider">
                      {lang === "zh" ? "未确权" : "UNREGISTED"}
                    </span>
                  )}
                </div>

                {nftMinted ? (
                  <div className="bg-[#0a0a0a] border border-[#222222] p-2 font-mono text-[8px] text-[#4ade80] space-y-1 uppercase">
                    <div className="flex justify-between">
                      <span className="text-[#888888]">OBJECT_ID:</span>
                      <span className="truncate max-w-[170px] font-bold">{nftObjectAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888]">REGISTED_OWNER:</span>
                      <span className="truncate max-w-[170px]">{walletAddress || "0x7b2a...active_node"}</span>
                    </div>
                    <p className="text-[7px] text-[#888888] pt-1 leading-normal border-t border-[#222222] mt-1 select-text">
                      {lang === "zh" ? "✓ 成功对该思维量化模型分配不可篡改 NFT 所有权凭证，确保自主所有权防伪" : "✓ Mindset logic locked verified against owner private keys as immutable SUI NFT."}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleMintMindsetNft}
                    disabled={!walletConnected}
                    className={`w-full font-mono text-[10px] font-bold py-2.5 uppercase tracking-wide transition-all duration-150 flex items-center justify-center space-x-2 ${
                      walletConnected 
                        ? "bg-[#ff4d00]/10 hover:bg-[#ff4d00] text-[#ff4d00] hover:text-black border border-[#ff4d00]/30 hover:border-transparent cursor-pointer" 
                        : "bg-[#111111] text-[#444444] border border-[#222222] cursor-not-allowed"
                    }`}
                    style={{ borderRadius: "0" }}
                  >
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>{lang === "zh" ? "上链铸造思维资产所有权 NFT" : "MINT COGNITIVE SUI NFT PROOF"}</span>
                  </button>
                )}
              </div>

              {/* Slider for licensing fees */}
              <div className="bg-[#111111]/80 border border-[#222222] p-3.5 space-y-3.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-zinc-400 font-bold uppercase">{lang === "zh" ? "思维单次调取授权费:" : "LICENSING FEE MODEL:"}</span>
                  <div className="flex items-center text-white space-x-1 font-bold">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>{licensingFee.toFixed(2)} SUI</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <input
                    type="range"
                    min="0.1"
                    max="10.0"
                    step="0.1"
                    value={licensingFee}
                    onChange={(e) => setLicensingFee(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-[#0c0c0c] border border-[#222222] h-1.5 focus:outline-none"
                  />
                  <div className="flex justify-between text-[7px] font-mono text-[#555555] uppercase tracking-wider select-none">
                    <span>0.10 SUI (Min)</span>
                    <span>5.00 SUI (Normal)</span>
                    <span>10.00 SUI (Max Cap)</span>
                  </div>
                </div>

                <p className="text-[9px] text-[#888888] font-sans leading-relaxed uppercase tracking-wider">
                  {lang === "zh"
                    ? "当第三方大模型（如其他用户的私有 AI Agent、多智能体协同终端）检索引用此端点时，需请求你的钱包执行密码学握手并实时转账扣费。"
                    : "When interactive third-party agents query or summon this customized decision weights profile, SUI gas fees & mindset royalties will settle dynamically."
                  }
                </p>
              </div>

            </div>
          </div>

          {/* Section C: Digital Twin Execution Interactive Sandbox Tester */}
          <div className="bg-[#0c0c0c] border border-[#222222] p-5 space-y-4">
            <h4 className="text-[11px] font-bold font-mono text-white tracking-widest uppercase flex items-center border-b border-[#222222] pb-3">
              <Sparkles className="w-4 h-4 text-[#ff4d00]" />
              {lang === "zh" ? "数字克隆思维交互测试沙盒" : "DIGITAL CLONE SANDBOX TESTING"}
            </h4>

            <div className="space-y-3">
              <p className="text-[9px] text-[#888888] font-sans leading-relaxed uppercase tracking-wider">
                {lang === "zh"
                  ? "在下方输入任何业务决策、投资场景或者处理纠纷的提问，测试你的数字永生思维克隆人是否能提取你上面的记忆，完全代替你的思路模式做出答复："
                  : "Submit complex real-world dilemmas, financial decisions or system prompt test prompts to verify your trained digital twin reacts properly:"
                }
              </p>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRunTesterPrompt();
                  }}
                  placeholder={lang === "zh" ? "输入提问，例如：遇到智能合约纠纷，我的核心应对准则是什么？" : "e.g. If encountering a token loss crisis, what's my core protocol action?"}
                  className="flex-1 bg-[#0a0a0a] border border-[#222222] text-[#e0e0e0] font-sans text-xs px-3.5 py-2.5 focus:border-[#ff4d00]/60 outline-none"
                  style={{ borderRadius: "0" }}
                />
                
                <button
                  type="button"
                  onClick={handleRunTesterPrompt}
                  disabled={isSimulatingResponse || !testPrompt.trim()}
                  className={`px-4 bg-[#ff4d00] hover:bg-[#e04400] text-black font-mono font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1.5 transition-all outline-none select-none shrink-0 ${
                    isSimulatingResponse || !testPrompt.trim() ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  style={{ borderRadius: "0" }}
                >
                  {isSimulatingResponse ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                  <span>{lang === "zh" ? "模拟测试" : "TEST CLONE"}</span>
                </button>
              </div>

              {testResponse && (
                <div className="bg-[#111111]/80 border border-[#ff4d00]/30 p-3.5 space-y-2 relative">
                  <div className="absolute top-0 right-0 bg-[#ff4d00]/10 border-b border-l border-[#ff4d00]/30 text-[#ff4d00] font-mono text-[7px] px-2 py-0.5 uppercase tracking-wider">
                    {lang === "zh" ? "已认证的克隆人回答" : "Mindset Certified response"}
                  </div>
                  
                  <span className="text-[10px] font-mono font-bold text-[#ff4d00] uppercase tracking-wider block">
                    {lang === "zh" ? "🤖 认知生成响应结果:" : "🤖 SUI DIGITAL CLONE SPEECH SYNTHESIS:"}
                  </span>
                  <p className="text-[11px] text-zinc-100 font-mono leading-relaxed select-text">
                    {testResponse}
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
