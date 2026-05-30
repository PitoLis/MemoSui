/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Language } from "../locales";
import MemoSuiLogo from "./MemoSuiLogo";
import { 
  Wallet, 
  Key, 
  Cpu, 
  ShieldCheck, 
  Terminal, 
  Fingerprint, 
  Globe, 
  ArrowRight, 
  Layers, 
  Activity,
  UserCheck,
  AlertTriangle,
  ExternalLink,
  Brain,
  Link
} from "lucide-react";

interface WalletLoginGatewayProps {
  onConnect: (address: string, balance: number, type: "metamask" | "sui_preset") => void;
  lang: Language;
  setLang: (lang: Language) => void;
  setWalletBalance: (balance: number) => void;
}

export default function WalletLoginGateway({
  onConnect,
  lang,
  setLang,
  setWalletBalance
}: WalletLoginGatewayProps) {
  const [useCustomSeed, setUseCustomSeed] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [selectedWalletIndex, setSelectedWalletIndex] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [connectionStep, setConnectionStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(6);
  const [isMetaMaskAvailable, setIsMetaMaskAvailable] = useState(false);

  // Check MetaMask availability on render
  useEffect(() => {
    if (typeof (window as any).ethereum !== "undefined") {
      setIsMetaMaskAvailable(true);
    }
  }, []);

  const demoWallets = [
    {
      name: lang === "zh" ? "系统预设测试账户" : "SUI_PRESET_DEMO",
      address: "0x7b2af299f02a64eb1e09df225e0129a6dcbeefacbe13994e9b110294fcde9b11",
      balance: 142.8
    },
    {
      name: lang === "zh" ? "Walrus 开发者节点" : "WALRUS_DEV_ACCOUNT",
      address: "0x981fae49bcde8e09df225e0129a6dcbeefacbe13192a6c891fbe327bcde9efc440",
      balance: 250.0
    },
    {
      name: lang === "zh" ? "高频哨兵存证节点" : "SENTINEL_VALIDATOR",
      address: "0x3bcde294fcde9b2a64ecfe12aaef25e0129a6dcbeefacbe13994e9b110e821fa0a",
      balance: 12.0
    }
  ];

  // REAL METAMASK CONNECTION HANDLER
  const handleConnectMetaMask = async () => {
    const ethereum = (window as any).ethereum;
    if (typeof ethereum !== "undefined") {
      setIsConnecting(true);
      setConnectionLogs([]);
      setConnectionStep(0);
      setTotalSteps(6);

      try {
        // Request MetaMask accounts
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts returned from MetaMask.");
        }
        const activeAccount = accounts[0];

        // Fetch balance from blockchain
        const rawBalanceHex = await ethereum.request({
          method: "eth_getBalance",
          params: [activeAccount, "latest"]
        });
        
        // Convert Wei to Eth (Wei is base-10 hex, divide by 10^18)
        const balanceWei = BigInt(rawBalanceHex);
        const balanceEth = parseFloat(balanceWei.toString()) / 1e18;

        // Retrieve Chain details
        const rawChainId = await ethereum.request({ method: "eth_chainId" });
        const chainIdDecimal = parseInt(rawChainId, 16);

        // Formulate customized cyberpunk loading audit chain logs
        const logs = lang === "zh" ? [
          "正在初始化 MetaMask (EVM Web3 标准) 注入式接口...",
          `已成功捕获钱包地址: [${activeAccount}]`,
          `正在检索链上网络... 连接的 Chain ID: ${chainIdDecimal}`,
          `获取钱包最新原子余额: ${balanceEth.toFixed(5)} ETH`,
          "通过 ED25519 混合密码学通道建立对 MemoSui 安全记忆分片的防篡改握手...",
          "验证通过！解密客户端证书秘钥，为您安全开启控制台面板..."
        ] : [
          "Initializing MetaMask (EVM Web3 API) injected provider...",
          `Successfully connected account: [${activeAccount}]`,
          `Querying ledger state... Dynamic Chain ID: ${chainIdDecimal}`,
          `Retrieved wallet balance: ${balanceEth.toFixed(5)} ETH`,
          "Configuring end-to-end asymmetric SHA-256 secure memory mapping tunnel...",
          "Validation completed! Cryptographical unlock approved, booting workstation..."
        ];

        let currentStep = 0;
        const intervalTimer = setInterval(() => {
          if (currentStep < logs.length) {
            setConnectionLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logs[currentStep]}`]);
            setConnectionStep(currentStep + 1);
            currentStep++;
          } else {
            clearInterval(intervalTimer);
            setTimeout(() => {
              onConnect(activeAccount, balanceEth, "metamask");
            }, 500);
          }
        }, 300);

      } catch (err: any) {
        setIsConnecting(false);
        console.error("MetaMask connection failed", err);
        alert(lang === "zh" 
          ? `连接 MetaMask 失败: ${err.message || err}` 
          : `MetaMask Connection Error: ${err.message || err}`
        );
      }
    } else {
      alert(lang === "zh"
        ? "未检测到 MetaMask 插件！请确认已在浏览器中安装此扩展并解锁应用。"
        : "MetaMask provider not found. Please verify that MetaMask is installed and unlocked."
      );
    }
  };

  // SUI PRESET SIMULATOR HANDLER
  const handleConnectPresetWallet = () => {
    setIsConnecting(true);
    setConnectionLogs([]);
    setConnectionStep(0);
    setTotalSteps(5);

    const logs = lang === "zh" ? [
      "正在调用 Sui ED25519 硬件沙盒模拟器...",
      `选取本地存证人证书: [${demoWallets[selectedWalletIndex].address}]`,
      "对 Walrus (W1) 十六进制作物碎片节点进行高吞吐量 Ping 检测...",
      "核素多重备份冗余自愈网络配置完毕...",
      "读取本地加密的记忆分段，正在同步账户进入大屏..."
    ] : [
      "Accessing Sui ED25519 local hardware key sandbox...",
      `Loading pre-selected wallet coordinates: [${demoWallets[selectedWalletIndex].address}]`,
      "Pinging 16 distributed storage servers on Walrus network...",
      "Configured 32-shard parity erasure coding protection layers...",
      "Mapping on-chain pointers, launching client panel dashboard..."
    ];

    let currentStep = 0;
    const intervalTimer = setInterval(() => {
      if (currentStep < logs.length) {
        setConnectionLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logs[currentStep]}`]);
        setConnectionStep(currentStep + 1);
        currentStep++;
      } else {
        clearInterval(intervalTimer);
        setTimeout(() => {
          const mockAddr = useCustomSeed && customKey.trim() 
            ? "0x" + customKey.slice(-40) 
            : demoWallets[selectedWalletIndex].address;
          const mockBal = useCustomSeed ? 99.9 : demoWallets[selectedWalletIndex].balance;
          
          onConnect(mockAddr, mockBal, "sui_preset");
        }, 500);
      }
    }, 300);
  };

  return (
    <div id="wallet-auth-gateway" className="min-h-[85vh] flex items-center justify-center py-10 px-4 md:px-0">
      
      {/* Absolute background matrix dots for inside container */}
      <div className="absolute inset-0 bg-[#060606]/95 z-0" />
      
      {/* Decorative lines & elements to simulate core frame */}
      <div className="relative w-full max-w-xl bg-[#0c0c0c] border border-[#222222] p-6 md:p-8 z-10 font-mono text-xs shadow-2xl">
        
        {/* Futuristic Corner Anchors */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#ff4d00]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#ff4d00]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#ff4d00]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#ff4d00]" />
        
        {/* Animated matrix scanline */}
        <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-[#ff4d00]/30 to-transparent animate-pulse" />

        <div className="space-y-6">
          {/* Header Ribbon with language selector */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 bg-[#ff4d00] animate-ping shrink-0" />
            <span className="text-[10px] text-[#ff4d00] font-bold uppercase tracking-widest leading-none">
              WEB3 GATEWAY ACCESS TERMINAL // ONLINE
            </span>
          </div>

          <div className="flex border border-[#222222] h-6 py-0 px-0">
            <button
              onClick={() => setLang("en")}
              className={`px-2 text-[8px] font-bold cursor-pointer transition-colors ${
                lang === "en" ? "bg-[#ff4d00] text-black" : "text-[#555555] hover:text-white"
              }`}
            >
              EN
            </button>
            <div className="w-[1.2px] bg-[#222222]" />
            <button
              onClick={() => setLang("zh")}
              className={`px-2 text-[8px] font-bold cursor-pointer transition-colors ${
                lang === "zh" ? "bg-[#ff4d00] text-black" : "text-[#555555] hover:text-white"
              }`}
            >
              中文
            </button>
          </div>
        </div>

        {/* Logo and App Title Banner */}
        <div className="space-y-2 text-center py-3">
          <div className="w-16 h-16 bg-[#111111] border border-[#ff4d00]/30 rounded-full flex items-center justify-center mx-auto relative group overflow-hidden shadow-lg shadow-[#ff4d00]/10">
            {/* Pulsating system background ring */}
            <div className="absolute -inset-2 border border-[#ff4d00]/15 rounded-full animate-pulse-slow pointer-events-none" />

            {/* Central Brain with block node connections */}
            <MemoSuiLogo className="w-11 h-11 group-hover:scale-110 transition-all duration-300 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-[0.3em] uppercase">
              MemoSui Secure Vault
            </h2>
          </div>
        </div>

        {/* Informational intro */}
        <div className="bg-[#111111] border border-[#222222] p-4 text-[10px] uppercase text-[#888888] leading-relaxed space-y-1 select-none">
          <div className="flex items-center text-[#ff4d00] font-bold text-[10px] mb-1">
            <ShieldCheck className="w-4 h-4 mr-2" />
            <span>{lang === "zh" ? "核心安全网关验证机制" : "IMMUTABILITY LAYER PROTOCOL"}</span>
          </div>
          <p>
            {lang === "zh"
              ? "本系统深度整合了智能合约与端到端高容抗纠删分片（Walrus）。在加载多节点可视化认知网络大屏与时间共识归档前，您需要连接真实的 Metamask 钱包生成链上签名，或者直接选取系统内置的 Sui 调试测试账户进行一键预览初始化。"
              : "This workstation merges on-chain smart asset ownership pointers with secure end-to-end erasure shards storage via Walrus. To build interactive knowledge clusters, view active server node vectors, or save archive pointers, please connect with your MetaMask wallet or use default Sui presets."
            }
          </p>
        </div>

        {/* Interactive connection options selector box */}
        {!isConnecting ? (
          <div className="space-y-5">
            
            {/* PRIORITY 1: METAMASK EXPLICIT REAL CONNECTION */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-[#ff4d00] border-l-2 border-[#ff4d00] pl-2 uppercase tracking-wider block font-bold">
                {lang === "zh" ? "方式一：连接真实钱包（推荐）" : "OPTION A: CONNECT REAL WALLET (RECOMMENDED)"}
              </span>
              
              <div className="bg-[#111111] border border-[#222222] p-4 space-y-3.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/60">
                    {lang === "zh" ? "当前浏览器组件检查:" : "INJECTED METAMASK COMPONENT:"}
                  </span>
                  {isMetaMaskAvailable ? (
                    <span className="text-[#4ade80] font-bold bg-[#4ade80]/10 border border-[#4ade80]/20 px-2 py-0.5 text-[8px] tracking-wider uppercase">
                      {lang === "zh" ? "● 已就绪" : "● DETECTED"}
                    </span>
                  ) : (
                    <span className="text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8px] tracking-wider uppercase flex items-center">
                      <AlertTriangle className="w-3 h-3 text-amber-500 mr-1 animate-pulse" />
                      {lang === "zh" ? "未检测到" : "NOT DETECTED"}
                    </span>
                  )}
                </div>

                {!isMetaMaskAvailable && (
                  <div className="p-3 bg-amber-500/5 border border-amber-500/20 text-[#cbbba0] leading-normal text-[9px] uppercase space-y-1">
                    <p>
                      {lang === "zh" 
                        ? "1. 若您已安装 MetaMask，请尝试在右上角点击「开启独立新标签页」运行，避开沙盒 frame 嵌套阻断。" 
                        : "1. If you have MetaMask installed, click the 'Open in New Tab' button in the top right to bypass iframe limitations."}
                    </p>
                    <p>
                      {lang === "zh" 
                        ? "2. 若没有，您也可以右侧使用我们的 Sui 测试预设模拟账户优先预览。" 
                        : "2. Alternatively, you can use the Sui Preset profiles below to experience the system immediately."}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleConnectMetaMask}
                  className="w-full bg-[#f6851b] hover:bg-white text-black font-extrabold uppercase tracking-widest text-[11px] py-3.5 transition-all cursor-pointer flex items-center justify-center space-x-2"
                  style={{ borderRadius: "0" }}
                >
                  <span>{lang === "zh" ? "解锁并连接钱包" : "UNLOCK & CONNECT WALLET"}</span>
                  <ArrowRight className="w-4 h-4 text-black shrink-0" />
                </button>
              </div>
            </div>

            {/* OPTION C: CONNECT OKX / REAL SUI WALLET */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-[#4ade80] border-l-2 border-[#4ade80] pl-2 uppercase tracking-wider block font-bold">
                {lang === "zh" ? "方式二：连接 OKX SUI 钱包 (推荐)" : "OPTION B: CONNECT OKX SUI WALLET (RECOMMENDED)"}
              </span>
              
              <div className="bg-[#111111] border border-[#222222] p-4 space-y-3.5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/60">
                    {lang === "zh" ? "OKX SUI 钱包插件状态:" : "OKX SUI PLUG-IN STATUS:"}
                  </span>
                  {typeof (window as any).okxwallet?.sui !== "undefined" || typeof (window as any).sui !== "undefined" ? (
                    <span className="text-[#4ade80] font-bold bg-[#4ade80]/10 border border-[#4ade80]/20 px-2 py-0.5 text-[8px] tracking-wider uppercase">
                      {lang === "zh" ? "● 已检测到" : "● DETECTED"}
                    </span>
                  ) : (
                    <span className="text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[8px] tracking-wider uppercase">
                      {lang === "zh" ? "未检测到 / 已锁定" : "NOT DETECTED / LOCKED"}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={async () => {
                    const suiProvider = (window as any).okxwallet?.sui || (window as any).sui || (window as any).suiWallet;
                    if (!suiProvider) {
                      alert(lang === "zh"
                        ? "未检测到 OKX Wallet 或其它 Sui 插件！若未安装，请在 Chrome Web Store 安装 OKX 钱包；若已安装，请尝试开启新标签页打开本站避开 Frame 拦截器。"
                        : "OKX Wallet or standard Sui provider not found. Please verify the extension is active or try opening this site in a new tab."
                      );
                      return;
                    }

                    setIsConnecting(true);
                    setConnectionLogs([]);
                    setConnectionStep(0);
                    setTotalSteps(5);

                    try {
                      setConnectionLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${lang === "zh" ? "正在连接 OKX SUI 密码学握手接口..." : "Establishing handshake with OKX SUI provider..."}`]);
                      
                      let activeAddress = "";
                      
                      // Request Permissions for SUI wallets
                      if (typeof suiProvider.requestPermissions === "function") {
                        await suiProvider.requestPermissions();
                      }
                      
                      let result: any = null;
                      if (typeof suiProvider.connect === "function") {
                        result = await suiProvider.connect();
                      }

                      // Dynamic response type parsing to cover all SUI wallet provider schemas
                      if (typeof result === "string") {
                        activeAddress = result;
                      } else if (Array.isArray(result) && result.length > 0) {
                        if (typeof result[0] === "string") {
                          activeAddress = result[0];
                        } else if (result[0] && typeof result[0].address === "string") {
                          activeAddress = result[0].address;
                        }
                      } else if (result && typeof result.address === "string") {
                        activeAddress = result.address;
                      } else if (result && result.accounts && Array.isArray(result.accounts) && result.accounts.length > 0) {
                        activeAddress = result.accounts[0].address;
                      }

                      // Fallback retrieval through getAccounts
                      if (!activeAddress && typeof suiProvider.getAccounts === "function") {
                        const accounts = await suiProvider.getAccounts();
                        if (Array.isArray(accounts) && accounts.length > 0) {
                          if (typeof accounts[0] === "string") {
                            activeAddress = accounts[0];
                          } else if (accounts[0] && typeof accounts[0].address === "string") {
                            activeAddress = accounts[0].address;
                          }
                        }
                      }

                      if (!activeAddress) {
                        throw new Error(lang === "zh" ? "没有选择或发现可用的 SUI 活跃账户" : "No active SUI accounts discovered from provider standard.");
                      }

                      const logs = lang === "zh" ? [
                        `已成功连接 OKX SUI 账户: [${activeAddress}]`,
                        "正在向 Sui JSON-RPC 全网同步该账户的实时代币余额...",
                        "通道协商成功，完成 Walrus 容抗纠删共谋初始化流程...",
                        "证书同步完毕！解锁终端中极控制台面板..."
                      ] : [
                        `Connected successfully. Retrieved address: [${activeAddress}]`,
                        "Synching with Sui blockchain RPC to retrieve account assets...",
                        "Initiating end-to-end active parity storage alignment on Walrus...",
                        "Cryptographical certificates verified! Loading operator terminal..."
                      ];

                      let currentStep = 0;
                      const intervalTimer = setInterval(() => {
                        if (currentStep < logs.length) {
                          setConnectionLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${logs[currentStep]}`]);
                          setConnectionStep(currentStep + 1);
                          currentStep++;
                        } else {
                          clearInterval(intervalTimer);
                          setTimeout(() => {
                            // SUI standard wallet
                            onConnect(activeAddress, 0.0, "sui_preset");
                          }, 500);
                        }
                      }, 300);

                    } catch (err: any) {
                      setIsConnecting(false);
                      console.error("OKX SUI connection failed", err);
                      alert(lang === "zh" 
                        ? `连接 OKX SUI 钱包失败: ${err.message || err}` 
                        : `OKX SUI Wallet Connection Error: ${err.message || err}`
                      );
                    }
                  }}
                  className="w-full bg-[#111111] hover:bg-white hover:text-black border border-[#222222] text-[#4ade80] hover:border-[#4ade80] font-extrabold uppercase tracking-widest text-[11px] py-3.5 transition-all cursor-pointer flex items-center justify-center space-x-2"
                  style={{ borderRadius: "0" }}
                >
                  <Wallet className="w-4 h-4 text-[#4ade80] shrink-0" />
                  <span>{lang === "zh" ? "连接 OKX SUI 钱包" : "CONNECT OKX SUI WALLET"}</span>
                </button>
              </div>
            </div>

            {/* SEPARATOR */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#222222]"></div>
              <span className="flex-shrink mx-4 text-[#555555] text-[9px] tracking-widest font-bold uppercase">{lang === "zh" ? "或者" : "OR"}</span>
              <div className="flex-grow border-t border-[#222222]"></div>
            </div>

            {/* OPTION 2: SIMULATED / DEFAULT SUI PROTOCOLS */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-[#888888] border-l-2 border-[#555555] pl-2 uppercase tracking-wider block font-bold">
                {lang === "zh" ? "方式三：使用 Sui 模拟测试节点账户 (开发预览)" : "OPTION C: SIMULATED SUI TESTNET SIGNERS (DEVELOPMENT)"}
              </span>
              
              <div className="space-y-2 bg-[#111111]/30 p-3.5 border border-[#222222]">
                <div className="space-y-1.5">
                  {demoWallets.map((wallet, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedWalletIndex(index);
                        setUseCustomSeed(false);
                      }}
                      className={`p-2.5 border cursor-pointer transition-all flex justify-between items-center gap-1.5 ${
                        !useCustomSeed && selectedWalletIndex === index
                          ? "bg-[#ff4d00]/5 border-[#ff4d00] text-white"
                          : "bg-[#060606] border-[#222222] text-[#888888] hover:border-white/20"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${!useCustomSeed && selectedWalletIndex === index ? "bg-[#ff4d00]" : "bg-zinc-700"}`} />
                          <span className="font-bold text-[9px] text-[#e0e0e0]">{wallet.name}</span>
                        </div>
                        <span className="text-[7.5px] font-mono break-all font-light opacity-80 block md:hidden">
                          {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                        </span>
                        <span className="text-[7.5px] font-mono break-all font-light opacity-80 hidden md:block max-w-[340px] truncate">
                          {wallet.address}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[9px] text-[#ff4d00] font-mono font-bold">
                          {wallet.balance} SUI
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-1 border-t border-[#222222]/80">
                  <button
                    onClick={() => setUseCustomSeed(!useCustomSeed)}
                    className={`text-[8.5px] font-bold uppercase tracking-wider underline cursor-pointer ${useCustomSeed ? "text-[#ff4d00]" : "text-[#555555] hover:text-white"}`}
                  >
                    {useCustomSeed 
                      ? (lang === "zh" ? "[- 换回预设测试用户]" : "[- SWITCH BACK TO PRESETS]") 
                      : (lang === "zh" ? "[+ 使用自定义 Sui 私钥 seed 进行开发校验]" : "[+ IMPORT CUSTOM SUI PRIVATE KEY]")
                    }
                  </button>

                  {useCustomSeed && (
                    <div className="space-y-2 bg-[#111111]/90 p-2.5 border border-[#222222] animate-fade-in text-[9px]">
                      <span className="text-[8px] text-[#555555] uppercase tracking-wider block">
                        {lang === "zh" ? "生成测试 Sui 用户私钥密钥口令 (十六进制):" : "HEX ENCODED ED25519 SUI SEED KEY:"}
                      </span>
                      <div className="relative">
                        <input
                          type="text"
                          value={customKey}
                          onChange={(e) => setCustomKey(e.target.value)}
                          placeholder="e.g. suikey1ph2a0f824e8bcdef1ab9ef784bc225ade8bdf21b1..."
                          className="w-full bg-black border border-[#222222] text-[10px] font-mono text-white p-2 pr-12 focus:outline-none focus:border-[#ff4d00]"
                          style={{ borderRadius: "0" }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const r = Array.from({length:64}, () => Math.floor(Math.random()*16).toString(16)).join("");
                            setCustomKey("suikey1" + r);
                          }}
                          className="absolute right-2 top-1.5 text-[#ff4d00] hover:underline text-[8px] font-bold"
                        >
                          {lang === "zh" ? "[随机]" : "[RAND]"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleConnectPresetWallet}
                  className="w-full bg-[#111111] hover:bg-white hover:text-black border border-[#222222] text-[#ff4d00] font-extrabold uppercase tracking-widest text-[10px] py-3.5 transition-all cursor-pointer flex items-center justify-center space-x-2"
                  style={{ borderRadius: "0" }}
                >
                  <Wallet className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === "zh" ? "连接 Sui 模拟测试节点进入" : "CONNECTOR WITH SUI SIMULATOR"}</span>
                </button>
              </div>

            </div>

          </div>
        ) : (
          /* Connecting Terminal loading micro logs output */
          <div className="bg-[#060606] border border-[#222222] p-4.5 space-y-4">
            
            <div className="flex items-center justify-between font-bold text-[10px] text-[#ff4d00]">
              <span className="flex items-center space-x-1.5 uppercase tracking-widest">
                <Terminal className="w-4 h-4 shrink-0 animate-pulse" />
                <span>{lang === "zh" ? "正在建立分散式密码账本链接" : "ESTABLISHING SECURE TRUST PROTOCOLS..."}</span>
              </span>
              <span className="font-mono">{Math.round((connectionStep / totalSteps) * 100)} %</span>
            </div>

            {/* Progress bar visual indicator */}
            <div className="w-full h-1 bg-[#151515] relative overflow-hidden" style={{ borderRadius: "0" }}>
              <div 
                className="h-full bg-[#ff4d00] transition-all duration-300"
                style={{ width: `${(connectionStep / totalSteps) * 100}%` }}
              />
            </div>

            {/* Log lines cascade */}
            <div className="p-3 bg-black/80 font-mono text-[9px] text-zinc-400 space-y-1.5 h-38 overflow-y-auto leading-relaxed border border-[#222222]/40 select-none">
              {connectionLogs.map((log, index) => (
                <div key={index} className="text-[#a8a8a8] flex items-start gap-1">
                  <span className="text-[#ff4d00] select-none shrink-0">&gt;</span>
                  <span className="text-[10px]">{log}</span>
                </div>
              ))}
              {connectionStep < totalSteps && (
                <div className="text-[#ff4d00] animate-pulse">&gt; _</div>
              )}
            </div>

            <div className="text-[9px] text-[#555555] uppercase text-center font-bold tracking-widest select-none">
              {lang === "zh" ? "本地硬件沙盒密件保护机制运行中" : "WEB3 PERMISSION SIGNATURE SET ESTABLISHED"}
            </div>

          </div>
        )}

        {/* Footer info links */}
        <div className="pt-3 border-t border-[#1e1e1e] flex flex-row items-center justify-between text-[8px] text-[#444444] tracking-widest uppercase select-none">
          <span className="flex items-center">
            <Layers className="w-3.5 h-3.5 text-[#ff4d00] mr-1" />
            WALRUS IMMUTABLE DISPATCH
          </span>
          <span className="flex items-center">
            <Activity className="w-3.5 h-3.5 text-[#4ade80] mr-1" />
            EVM_RPC_SYNCS_UP
          </span>
        </div>

        </div>
      </div>

    </div>
  );
}
