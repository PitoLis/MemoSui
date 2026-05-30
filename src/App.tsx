/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { StoredMemory, StorageNode, NetworkStats } from "./types";
import { Language, TRANSLATIONS } from "./locales";
import { DEFAULT_STORAGE_NODES, INITIAL_MEMORIES, calculateNetworkStats } from "./utils";
import NetworkHeader from "./components/NetworkHeader";
import StorageNodeMap from "./components/StorageNodeMap";
import CreateMemoryForm from "./components/CreateMemoryForm";
import MemoryTimeline from "./components/MemoryTimeline";
import VerifyModal from "./components/VerifyModal";
import VerificationTab from "./components/VerificationTab";
import SettingsTab from "./components/SettingsTab";
import MemoryKnowledgeGraph from "./components/MemoryKnowledgeGraph";
import WalletLoginGateway from "./components/WalletLoginGateway";
import MemoryChatBot from "./components/MemoryChatBot";
import MemoryResearcher from "./components/MemoryResearcher";
import DigitalImmortalityTab from "./components/DigitalImmortalityTab";
import { 
  Shield, 
  Brain, 
  Cpu, 
  Database, 
  Layers, 
  LayoutDashboard, 
  History, 
  ShieldCheck, 
  Sliders, 
  Activity, 
  Radio,
  PenTool
} from "lucide-react";

type TabID = "dashboard" | "timeline" | "verification" | "settings" | "immortality";

export default function App() {
  // Theme State ("dark" | "light")
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("memosui_theme") as "dark" | "light") || "dark";
  });

  // Lang State
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem("memosui_lang") as Language) || "en";
  });

  // Load initial memories from localStorage if present, otherwise default seeds
  const [memories, setMemories] = useState<StoredMemory[]>(() => {
    const saved = localStorage.getItem("memosui_memories_v2");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Failed to parse memo index:", err);
      }
    }
    return INITIAL_MEMORIES;
  });

  const [walletConnected, setWalletConnected] = useState<boolean>(() => {
    return localStorage.getItem("memosui_wallet_connected") === "true";
  });
  const [walletAddress, setWalletAddress] = useState<string>(() => {
    return localStorage.getItem("memosui_wallet_address") || "";
  });
  const [walletType, setWalletType] = useState<"metamask" | "sui_preset" | "">(() => {
    return (localStorage.getItem("memosui_wallet_type") as any) || "";
  });
  const [walletBalance, setWalletBalance] = useState<number>(() => {
    const saved = localStorage.getItem("memosui_wallet_balance");
    return saved ? parseFloat(saved) : 142.8;
  });

  // Real MemWal parameters and SDK configuration state
  const [memwalKey, setMemwalKey] = useState<string>(() => {
    return localStorage.getItem("memosui_memwal_key") || "memkey1ph2a0f824e8bcdef1ab9ef784bc225ade8bdf21b194fbcde91aa309bf1f2";
  });
  const [memwalAccountId, setMemwalAccountId] = useState<string>(() => {
    return localStorage.getItem("memosui_memwal_account_id") || "0x7b2af299f02a64eb1e09df225e0129a6dcbeefacbe13994e9b110294fcde9b11";
  });
  const [memwalServerUrl, setMemwalServerUrl] = useState<string>(() => {
    return localStorage.getItem("memosui_memwal_server_url") || "https://relayer.staging.memwal.ai";
  });
  const [memwalNamespace, setMemwalNamespace] = useState<string>(() => {
    return localStorage.getItem("memosui_memwal_namespace") || "my-app";
  });
  const [memwalUseRealSDK, setMemwalUseRealSDK] = useState<boolean>(() => {
    return localStorage.getItem("memosui_memwal_use_real_sdk") === "true";
  });
  
  // Custom states for simulated parameters
  const [consensusHealth, setConsensusHealth] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<TabID>("timeline"); // Timeline is the core input mechanism, starting here keeps user busy
  const [timelineSubTab, setTimelineSubTab] = useState<"noter" | "chatbot" | "researcher">("noter");

  // Interactive node mapping state
  const [activeShardNodes, setActiveShardNodes] = useState<string[]>([]);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  // Validation inspector modal trigger state
  const [selectedVerifyMemory, setSelectedVerifyMemory] = useState<StoredMemory | null>(null);

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem("memosui_memories_v2", JSON.stringify(memories));
  }, [memories]);

  // Sync lang change to localStorage
  useEffect(() => {
    localStorage.setItem("memosui_lang", lang);
  }, [lang]);

  // Sync theme change to localStorage & DOM classes
  useEffect(() => {
    localStorage.setItem("memosui_theme", theme);
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light-theme");
      document.body.classList.add("light-theme");
    } else {
      root.classList.remove("light-theme");
      document.body.classList.remove("light-theme");
    }
  }, [theme]);

  // Sync MemWal configuration settings to localStorage
  useEffect(() => {
    localStorage.setItem("memosui_memwal_key", memwalKey);
  }, [memwalKey]);

  useEffect(() => {
    localStorage.setItem("memosui_memwal_account_id", memwalAccountId);
  }, [memwalAccountId]);

  useEffect(() => {
    localStorage.setItem("memosui_memwal_server_url", memwalServerUrl);
  }, [memwalServerUrl]);

  useEffect(() => {
    localStorage.setItem("memosui_memwal_namespace", memwalNamespace);
  }, [memwalNamespace]);

  useEffect(() => {
    localStorage.setItem("memosui_memwal_use_real_sdk", String(memwalUseRealSDK));
  }, [memwalUseRealSDK]);

  // Sync general login status & wallet credentials to localStorage
  useEffect(() => {
    localStorage.setItem("memosui_wallet_connected", String(walletConnected));
  }, [walletConnected]);

  useEffect(() => {
    localStorage.setItem("memosui_wallet_address", walletAddress);
  }, [walletAddress]);

  useEffect(() => {
    localStorage.setItem("memosui_wallet_type", walletType);
  }, [walletType]);

  useEffect(() => {
    localStorage.setItem("memosui_wallet_balance", String(walletBalance));
  }, [walletBalance]);

  // Auto-verify and connect MetaMask on load if previously connected & authorized
  useEffect(() => {
    if (walletConnected && walletType === "metamask") {
      const ethereum = (window as any).ethereum;
      if (typeof ethereum !== "undefined") {
        const checkConnection = async () => {
          try {
            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts && accounts.length > 0) {
              setWalletAddress(accounts[0]);
              // Fetch latest balance from MetaMask
              const rawBalanceHex = await ethereum.request({
                method: "eth_getBalance",
                params: [accounts[0], "latest"]
              });
              const balanceWei = BigInt(rawBalanceHex);
              const balanceEth = parseFloat(balanceWei.toString()) / 1e18;
              setWalletBalance(balanceEth);
            }
          } catch (err) {
            console.warn("MetaMask persistent lookup failed", err);
          }
        };
        checkConnection();

        const handleAccountsChanged = (accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          } else {
            setWalletConnected(false);
            setWalletAddress("");
            setWalletType("");
          }
        };

        ethereum.on("accountsChanged", handleAccountsChanged);
        return () => {
          if (ethereum.removeListener) {
            ethereum.removeListener("accountsChanged", handleAccountsChanged);
          }
        };
      }
    }
  }, [walletConnected, walletType]);

  // Auto-verify and connect OKX / Sui wallet on load if previously connected & authorized
  useEffect(() => {
    if (walletConnected && walletType === "sui_preset") {
      const suiProvider = (window as any).okxwallet?.sui || (window as any).sui || (window as any).suiWallet;
      if (suiProvider && typeof suiProvider.getAccounts === "function") {
        const updateSuiAccounts = async () => {
          try {
            const accounts = await suiProvider.getAccounts();
            if (accounts && accounts.length > 0) {
              let activeAddress = "";
              if (typeof accounts[0] === "string") {
                activeAddress = accounts[0];
              } else if (accounts[0] && typeof accounts[0].address === "string") {
                activeAddress = accounts[0].address;
              }
              if (activeAddress && activeAddress.startsWith("0x")) {
                setWalletAddress(activeAddress);
              }
            }
          } catch (err) {
            console.warn("Sui/OKX automatic account sync failed", err);
          }
        };
        updateSuiAccounts();
        
        // Listen to accounts changed for SUI wallet standard if available
        if (typeof suiProvider.on === "function") {
          const handleSuiAccountsChanged = (accounts: any) => {
            if (accounts && accounts.length > 0) {
              let activeAddress = "";
              if (typeof accounts[0] === "string") {
                activeAddress = accounts[0];
              } else if (accounts[0] && typeof accounts[0].address === "string") {
                activeAddress = accounts[0].address;
              }
              if (activeAddress) {
                setWalletAddress(activeAddress);
              }
            } else {
              setWalletConnected(false);
              setWalletAddress("");
              setWalletType("");
            }
          };
          try {
            suiProvider.on("accountsChanged", handleSuiAccountsChanged);
            return () => {
              if (typeof suiProvider.off === "function") {
                suiProvider.off("accountsChanged", handleSuiAccountsChanged);
              }
            };
          } catch (e) {
            console.log("Listen accountsChanged failed on SUI provider", e);
          }
        }
      }
    }
  }, [walletConnected, walletType]);

  // Dynamically fetch and synchronize real SUI wallet balance with Sui JSON-RPC fullnodes.
  useEffect(() => {
    let activeAddress = "";
    if (memwalUseRealSDK) {
      activeAddress = memwalAccountId;
    } else if (walletConnected && walletType === "sui_preset") {
      activeAddress = walletAddress;
    }

    if (!activeAddress || !activeAddress.startsWith("0x")) {
      return;
    }

    const isStaging = memwalServerUrl.includes("staging") || memwalServerUrl.includes("testnet");
    const rpcUrl = isStaging 
      ? "https://fullnode.testnet.sui.io:443" 
      : "https://fullnode.mainnet.sui.io:443";

    let active = true;

    const querySuiBalance = async () => {
      try {
        const response = await fetch(rpcUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "suix_getBalance",
            params: [activeAddress, "0x2::sui::SUI"]
          })
        });

        if (response.ok && active) {
          const data = await response.json();
          if (data && data.result && data.result.totalBalance !== undefined) {
            const totalMist = BigInt(data.result.totalBalance);
            const suiBalance = Number(totalMist) / 1e9;
            setWalletBalance(suiBalance);
          }
        }
      } catch (err) {
        console.warn("Unable to query live SUI balance from Sui fullnode API", err);
      }
    };

    querySuiBalance();
    const balanceInterval = setInterval(querySuiBalance, 8000);

    return () => {
      active = false;
      clearInterval(balanceInterval);
    };
  }, [memwalUseRealSDK, memwalAccountId, walletConnected, walletAddress, walletType, memwalServerUrl]);

  // Derived stats calculation (injected with consensusHealth from settings)
  const currentNetworkStats = {
    ...calculateNetworkStats(memories),
    consensusHealth
  };
  
  const t = TRANSLATIONS[lang];

  const handleCreateMemory = (newMemory: StoredMemory) => {
    setMemories(prev => [newMemory, ...prev]);
  };

  const handleDeleteMemory = (id: string) => {
    setMemories(prev => prev.filter(m => m.id !== id));
  };

  // Node triggering states for shard hover
  const handleHoverMemoryShardNodes = (nodeIds: string[]) => {
    setActiveShardNodes(nodeIds);
  };

  const handleLeaveMemoryShardNodes = () => {
    setActiveShardNodes([]);
  };

  const handleVerifyOnChain = (memory: StoredMemory) => {
    setSelectedVerifyMemory(memory);
  };

  const handleWipeData = () => {
    localStorage.removeItem("memosui_memories_v2");
    setMemories(INITIAL_MEMORIES);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans text-[#e0e0e0] antialiased overflow-x-hidden pb-16 relative border-8 border-[#1a1a1a]">
      
      {/* Absolute Dot Matrix Background Grid */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none select-none z-0" 
        style={{ 
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", 
          backgroundSize: "32px 32px" 
        }} 
      />

      {/* Network Header with dynamic stats overview */}
      <NetworkHeader
        stats={currentNetworkStats}
        walletBalance={walletBalance}
        setWalletBalance={setWalletBalance}
        walletConnected={walletConnected}
        setWalletConnected={setWalletConnected}
        walletAddress={memwalUseRealSDK ? memwalAccountId : walletAddress}
        setWalletAddress={setWalletAddress}
        walletType={memwalUseRealSDK ? "sui_preset" : walletType}
        setWalletType={setWalletType}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 relative z-10">
        
        {!walletConnected ? (
          <WalletLoginGateway
            onConnect={(address, balance, type) => {
              setWalletAddress(address);
              setWalletBalance(balance);
              setWalletType(type);
              setWalletConnected(true);
            }}
            lang={lang}
            setLang={setLang}
            setWalletBalance={setWalletBalance}
          />
        ) : (
          /* Workspace responsive architecture with Left Sidebar navigation */
          <div id="memosui-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SIDEBAR NAVIGATION COLUMN (Widescreen left column, Mobile horizontal ribbon) */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Sidebar Branding / Status Pill */}
            <div className="bg-[#0c0c0c]/90 border border-[#222222] p-4 font-mono select-none hidden lg:block">
              <div className="flex items-center space-x-2 text-[10px] text-[#ff4d00] font-bold uppercase tracking-widest mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ff4d00] animate-ping" />
                <span>TERMINAL_STATUS // ONLINE</span>
              </div>
              <p className="text-[9px] text-[#555555] uppercase leading-tight">
                {lang === "zh" ? "系统控制台已安全接入 MemWal 测试集群" : "CONSOLE SUCCESSFULLY BOUND TO MEMWAL CLUSTER"}
              </p>
            </div>

            {/* Sidebar Navigation Buttons */}
            <div className="bg-[#0c0c0c] border border-[#ff4d00]/20 p-2 lg:p-3 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible">
              
              {/* Timeline (Primary user memory recorder) */}
              <button
                onClick={() => setActiveTab("timeline")}
                className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start space-x-2.5 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.15em] font-bold border cursor-pointer select-none transition-all duration-200 outline-none whitespace-nowrap ${
                  activeTab === "timeline"
                    ? "bg-[#ff4d00] text-black border-transparent"
                    : "bg-[#111111]/60 text-[#888888] border-[#222222] hover:text-white hover:border-[#ff4d00]/40"
                }`}
                style={{ borderRadius: "0" }}
              >
                <History className="w-4 h-4 shrink-0" />
                <span>{lang === "zh" ? "时间存证" : "Timeline logs"}</span>
              </button>

              {/* Dashboard */}
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start space-x-2.5 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.15em] font-bold border cursor-pointer select-none transition-all duration-200 outline-none whitespace-nowrap ${
                  activeTab === "dashboard"
                    ? "bg-[#ff4d00] text-black border-transparent"
                    : "bg-[#111111]/60 text-[#888888] border-[#222222] hover:text-white hover:border-[#ff4d00]/40"
                }`}
                style={{ borderRadius: "0" }}
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>{lang === "zh" ? "节点大屏" : "Dashboard Map"}</span>
              </button>

              {/* Verification Audit portal */}
              <button
                onClick={() => setActiveTab("verification")}
                className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start space-x-2.5 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.15em] font-bold border cursor-pointer select-none transition-all duration-200 outline-none whitespace-nowrap ${
                  activeTab === "verification"
                    ? "bg-[#ff4d00] text-black border-transparent"
                    : "bg-[#111111]/60 text-[#888888] border-[#222222] hover:text-white hover:border-[#ff4d00]/40"
                }`}
                style={{ borderRadius: "0" }}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{lang === "zh" ? "完整核真" : "Verification Tool"}</span>
              </button>

              {/* Digital Immortality */}
              <button
                onClick={() => setActiveTab("immortality")}
                className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start space-x-2.5 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.15em] font-bold border cursor-pointer select-none transition-all duration-200 outline-none whitespace-nowrap ${
                  activeTab === "immortality"
                    ? "bg-[#ff4d00] text-black border-transparent"
                    : "bg-[#111111]/60 text-[#888888] border-[#222222] hover:text-white hover:border-[#ff4d00]/40"
                }`}
                style={{ borderRadius: "0" }}
              >
                <Brain className="w-4 h-4 shrink-0" />
                <span>{lang === "zh" ? "数字永生" : "Digital Asset"}</span>
              </button>

              {/* Simulation Settings */}
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex-1 lg:flex-initial flex items-center justify-center lg:justify-start space-x-2.5 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.15em] font-bold border cursor-pointer select-none transition-all duration-200 outline-none whitespace-nowrap ${
                  activeTab === "settings"
                    ? "bg-[#ff4d00] text-black border-transparent"
                    : "bg-[#111111]/60 text-[#888888] border-[#222222] hover:text-white hover:border-[#ff4d00]/40"
                }`}
                style={{ borderRadius: "0" }}
              >
                <Sliders className="w-4 h-4 shrink-0" />
                <span>{lang === "zh" ? "辅助调试" : "Settings Panel"}</span>
              </button>

            </div>

            {/* Sidebar Node Summary (Extra gorgeous gadget) */}
            <div className="bg-[#0c0c0c]/60 border border-[#222222] p-4 font-mono text-[9px] text-[#555555] space-y-2 hidden lg:block">
              <span className="text-[10px] font-bold text-[#888888] uppercase tracking-wider block">
                {lang === "zh" ? "系统硬件及分片负载指标" : "SYSTEM MESH TELEMETRY"}
              </span>
              
              <div className="flex justify-between border-b border-[#222222]/50 pb-1">
                <span>MEM_COUNT:</span>
                <span className="text-white font-bold">{memories.length}</span>
              </div>
              <div className="flex justify-between border-b border-[#222222]/50 pb-1">
                <span>EST_EPOCH:</span>
                <span className="text-white font-bold">#342</span>
              </div>
              <div className="flex justify-between border-b border-[#222222]/50 pb-1">
                <span>NET_STATUS:</span>
                <span className="text-[#4ade80] font-bold uppercase">{consensusHealth >= 90 ? "OK" : "WARNING"}</span>
              </div>
              <div className="flex justify-between">
                <span>CONSENSUS:</span>
                <span className="text-[#ff4d00] font-bold">{consensusHealth}%</span>
              </div>
            </div>

          </div>

          {/* RIGHT VIEW COLUMN - Displays current active tab dynamically */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* VIEW TAB 1: TIMELINE (Recording form + Timeline logs list, now with three sub-tabs) */}
            {activeTab === "timeline" && (
              <div className="space-y-6 animate-fade-in">
                
                {/* 3 SUB-TABS SELECTOR PANEL */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* SUB-TAB 1: NOTER */}
                  <button
                    onClick={() => setTimelineSubTab("noter")}
                    className={`p-4 border font-mono flex flex-col justify-between transition-all duration-250 text-left select-none ring-0 outline-none relative cursor-pointer ${
                      timelineSubTab === "noter"
                        ? "bg-[#ff4d00]/5 border-[#ff4d00] text-white shadow-[0_0_20px_-3px_rgba(255,77,0,0.25)]"
                        : "bg-[#0c0c0c]/90 border-[#222222] text-zinc-400 hover:text-white hover:border-[#ff4d00]/50"
                    }`}
                    style={{ borderRadius: "0" }}
                  >
                    <div className="w-full flex items-center justify-between text-[11px] font-bold tracking-wide uppercase">
                      <span className="flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-[#ff4d00]" />
                        Noter
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">↗ ↑</span>
                    </div>
                    <div className="w-full flex items-center justify-between mt-3.5">
                      <span className="text-[15px] font-sans font-extrabold tracking-wider">{lang === "zh" ? "记录者" : "Recorder"}</span>
                      {timelineSubTab === "noter" && (
                        <div className="w-2 h-2 bg-[#ff4d00] animate-pulse" />
                      )}
                    </div>
                  </button>

                  {/* SUB-TAB 2: CHATBOT */}
                  <button
                    onClick={() => setTimelineSubTab("chatbot")}
                    className={`p-4 border font-mono flex flex-col justify-between transition-all duration-250 text-left select-none ring-0 outline-none relative cursor-pointer ${
                      timelineSubTab === "chatbot"
                        ? "bg-[#ff4d00]/5 border-[#ff4d00] text-white shadow-[0_0_20px_-3px_rgba(255,77,0,0.25)]"
                        : "bg-[#0c0c0c]/90 border-[#222222] text-zinc-400 hover:text-white hover:border-[#ff4d00]/50"
                    }`}
                    style={{ borderRadius: "0" }}
                  >
                    <div className="w-full flex items-center justify-between text-[11px] font-bold tracking-wide uppercase">
                      <span className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-[#ff4d00]" />
                        ChatBot
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">↗</span>
                    </div>
                    <div className="w-full flex items-center justify-between mt-3.5">
                      <span className="text-[15px] font-sans font-extrabold tracking-wider">{lang === "zh" ? "聊天机器人" : "AI Assistant"}</span>
                      {timelineSubTab === "chatbot" && (
                        <div className="w-2 h-2 bg-[#ff4d00] animate-pulse" />
                      )}
                    </div>
                  </button>

                  {/* SUB-TAB 3: RESEARCHER */}
                  <button
                    onClick={() => setTimelineSubTab("researcher")}
                    className={`p-4 border font-mono flex flex-col justify-between transition-all duration-250 text-left select-none ring-0 outline-none relative cursor-pointer ${
                      timelineSubTab === "researcher"
                        ? "bg-[#ff4d00]/5 border-[#ff4d00] text-white shadow-[0_0_20px_-3px_rgba(255,77,0,0.25)]"
                        : "bg-[#0c0c0c]/90 border-[#222222] text-zinc-400 hover:text-white hover:border-[#ff4d00]/50"
                    }`}
                    style={{ borderRadius: "0" }}
                  >
                    <div className="w-full flex items-center justify-between text-[11px] font-bold tracking-wide uppercase">
                      <span className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-[#ff4d00]" />
                        Researcher
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">↗</span>
                    </div>
                    <div className="w-full flex items-center justify-between mt-3.5">
                      <span className="text-[15px] font-sans font-extrabold tracking-wider">{lang === "zh" ? "研究人员" : "Auditor"}</span>
                      {timelineSubTab === "researcher" && (
                        <div className="w-2 h-2 bg-[#ff4d00] animate-pulse" />
                      )}
                    </div>
                  </button>

                </div>

                {/* CONDITIONALLY RENDER SUB-TAB CHOSEN */}
                {timelineSubTab === "noter" && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Create memory helper */}
                    <CreateMemoryForm
                      onMemoryCreated={handleCreateMemory}
                      walletConnected={walletConnected}
                      walletBalance={walletBalance}
                      setWalletBalance={setWalletBalance}
                      walletType={memwalUseRealSDK ? "sui_preset" : walletType}
                      walletAddress={memwalUseRealSDK ? memwalAccountId : walletAddress}
                      onShardSlicingStart={handleHoverMemoryShardNodes}
                      onShardSlicingEnd={handleLeaveMemoryShardNodes}
                      lang={lang}
                      memwalKey={memwalKey}
                      memwalAccountId={memwalAccountId}
                      memwalServerUrl={memwalServerUrl}
                      memwalNamespace={memwalNamespace}
                      memwalUseRealSDK={memwalUseRealSDK}
                    />

                    {/* Secure storage feed registry */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#222222] pb-3">
                        <h3 className="text-xs font-mono font-bold tracking-[0.25em] text-[#555555] uppercase flex items-center">
                          <Database className="w-4 h-4 text-[#ff4d00] mr-2.5" />
                          {t.timelineTitle}
                        </h3>
                        <span className="text-[9px] font-mono text-[#ff4d00] font-bold bg-[#ff4d00]/5 border border-[#ff4d00]/20 px-2.5 py-1 uppercase tracking-widest">
                          {memories.length} {t.blocksProtected}
                        </span>
                      </div>

                      <MemoryTimeline
                        memories={memories}
                        onMemoryDeleted={handleDeleteMemory}
                        onHoverMemoryShardNodes={handleHoverMemoryShardNodes}
                        onLeaveMemoryShardNodes={handleLeaveMemoryShardNodes}
                        onVerifyOnChain={handleVerifyOnChain}
                        lang={lang}
                      />
                    </div>
                  </div>
                )}

                {timelineSubTab === "chatbot" && (
                  <div className="animate-fade-in">
                    <MemoryChatBot
                      memories={memories}
                      lang={lang}
                      walletConnected={walletConnected}
                      walletAddress={memwalUseRealSDK ? memwalAccountId : walletAddress}
                    />
                  </div>
                )}

                {timelineSubTab === "researcher" && (
                  <div className="animate-fade-in">
                    <MemoryResearcher
                      memories={memories}
                      lang={lang}
                    />
                  </div>
                )}

              </div>
            )}

            {/* VIEW TAB 2: DASHBOARD (Secured Memory Intelligence Knowledge Cognizance Mesh & Node Map) */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Full-width premium Interactive Knowledge Graph Spectrum */}
                <MemoryKnowledgeGraph
                  memories={memories}
                  onSelectMemory={handleVerifyOnChain}
                  lang={lang}
                />

                {/* Grid for Distributed Storage Node Mesh and Protocol logic */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                  
                  {/* Left side node map visualizer */}
                  <div className="xl:col-span-7">
                    <StorageNodeMap
                      nodes={DEFAULT_STORAGE_NODES}
                      activeShardNodes={activeShardNodes}
                      hoveredNodeId={hoveredNodeId}
                      setHoveredNodeId={setHoveredNodeId}
                      lang={lang}
                    />
                  </div>

                  {/* Right side bento flow visualizer */}
                  <div className="xl:col-span-5">
                    <div className="bg-[#0a0a0a] border border-[#222222] p-5 space-y-5 kinetic-dot-grid" style={{ borderRadius: '0' }}>
                      <h4 className="text-xs font-mono font-bold tracking-[0.2em] text-white uppercase flex items-center border-b border-[#222222] pb-3">
                        <Brain className="w-4 h-4 text-[#ff4d00] mr-2.5 animate-pulse" />
                        {t.howItSecures}
                      </h4>

                      {/* Bento Grid Cells */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-[#111111] border border-[#222222] p-3 text-center transition-all hover:border-[#ff4d00]/50" style={{ borderRadius: '0' }}>
                          <Cpu className="w-5 h-5 text-[#ff4d00] mx-auto mb-1.5" />
                          <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">{t.moveObjectTitle}</h5>
                          <p className="text-[8px] text-[#555555] font-mono mt-1 leading-snug uppercase tracking-wide">{t.moveObjectDesc}</p>
                        </div>
                        
                        <div className="bg-[#111111] border border-[#222222] p-3 text-center transition-all hover:border-[#ff4d00]/30" style={{ borderRadius: '0' }}>
                          <Layers className="w-5 h-5 text-[#ff4d00] mx-auto mb-1.5" />
                          <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">{t.erasureShardsTitle}</h5>
                          <p className="text-[8px] text-[#555555] font-mono mt-1 leading-snug uppercase tracking-wide">{t.erasureShardsDesc}</p>
                        </div>

                        <div className="bg-[#111111] border border-[#222222] p-3 text-center transition-all hover:border-[#ff4d00]/30" style={{ borderRadius: '0' }}>
                          <Shield className="w-5 h-5 text-[#ff4d00] mx-auto mb-1.5" />
                          <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">{t.clientCryptTitle}</h5>
                          <p className="text-[8px] text-[#555555] font-mono mt-1 leading-snug uppercase tracking-wide">{t.clientCryptDesc}</p>
                        </div>
                      </div>

                      {/* Step layout */}
                      <div className="text-[10px] font-mono leading-relaxed text-[#888888] space-y-3.5 select-text uppercase tracking-wider">
                        <p>
                          01. <strong className="text-white">{t.step1Title}</strong>: {t.step1Desc}
                        </p>
                        <p>
                          02. <strong className="text-white">{t.step2Title}</strong>: {t.step2Desc}
                        </p>
                        <p>
                          03. <strong className="text-white">{t.step3Title}</strong>: {t.step3Desc}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#222222] flex items-center justify-between text-[9px] font-mono text-[#555555] select-none">
                        <span>{t.phaseLabel}</span>
                        <span>EST. MMXXIV</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* VIEW TAB 3: VERIFICATION (Multi-verification checking tool and playground) */}
            {activeTab === "verification" && (
              <div className="animate-fade-in">
                <VerificationTab
                  memories={memories}
                  onVerifyOnChain={handleVerifyOnChain}
                  lang={lang}
                />
              </div>
            )}

            {/* VIEW TAB 5: IMMORTALITY (Sovereign Digital Mindset asset & licensing gateway) */}
            {activeTab === "immortality" && (
              <div className="animate-fade-in">
                <DigitalImmortalityTab
                  memories={memories}
                  lang={lang}
                  walletConnected={walletConnected}
                  walletAddress={memwalUseRealSDK ? memwalAccountId : walletAddress}
                />
              </div>
            )}

            {/* VIEW TAB 4: SETTINGS (Node configurations and wallet key simulator) */}
            {activeTab === "settings" && (
              <div className="animate-fade-in">
                <SettingsTab
                  walletBalance={walletBalance}
                  setWalletBalance={setWalletBalance}
                  walletConnected={walletConnected}
                  setWalletConnected={setWalletConnected}
                  lang={lang}
                  setLang={setLang}
                  onWipeData={handleWipeData}
                  consensusHealth={consensusHealth}
                  setConsensusHealth={setConsensusHealth}
                  memwalKey={memwalKey}
                  setMemwalKey={setMemwalKey}
                  memwalAccountId={memwalAccountId}
                  setMemwalAccountId={setMemwalAccountId}
                  memwalServerUrl={memwalServerUrl}
                  setMemwalServerUrl={setMemwalServerUrl}
                  memwalNamespace={memwalNamespace}
                  setMemwalNamespace={setMemwalNamespace}
                  memwalUseRealSDK={memwalUseRealSDK}
                  setMemwalUseRealSDK={setMemwalUseRealSDK}
                />
              </div>
            )}

          </div>
        </div>
      )}

      </main>

      {/* SUI Verification key proof modal popup */}
      <VerifyModal
        memory={selectedVerifyMemory}
        onClose={() => setSelectedVerifyMemory(null)}
        lang={lang}
      />

    </div>
  );
}

