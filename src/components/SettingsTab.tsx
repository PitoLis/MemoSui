/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Language, TRANSLATIONS } from "../locales";
import { Sliders, RefreshCw, Key, Trash2, Globe, Database, HelpCircle, CheckCircle, Info, Cpu, Check } from "lucide-react";

interface SettingsTabProps {
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  walletConnected: boolean;
  setWalletConnected: (connected: boolean) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onWipeData: () => void;
  consensusHealth: number;
  setConsensusHealth: (health: number) => void;

  memwalKey: string;
  setMemwalKey: (key: string) => void;
  memwalAccountId: string;
  setMemwalAccountId: (id: string) => void;
  memwalServerUrl: string;
  setMemwalServerUrl: (url: string) => void;
  memwalNamespace: string;
  setMemwalNamespace: (ns: string) => void;
  memwalUseRealSDK: boolean;
  setMemwalUseRealSDK: (b: boolean) => void;
}

export default function SettingsTab({
  walletBalance,
  setWalletBalance,
  walletConnected,
  setWalletConnected,
  lang,
  setLang,
  onWipeData,
  consensusHealth,
  setConsensusHealth,
  memwalKey,
  setMemwalKey,
  memwalAccountId,
  setMemwalAccountId,
  memwalServerUrl,
  setMemwalServerUrl,
  memwalNamespace,
  setMemwalNamespace,
  memwalUseRealSDK,
  setMemwalUseRealSDK
}: SettingsTabProps) {
  const [showKey, setShowKey] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [packManager, setPackManager] = useState<"pnpm" | "npm" | "yarn" | "bun">("pnpm");
  const [copied, setCopied] = useState(false);
  
  const t = TRANSLATIONS[lang];

  // Roll new wallet addresses
  const handleRollWallet = () => {
    const chars = "0123456789abcdef";
    let newAddr = "0x";
    let newPrivKey = "memkey1";
    for (let i = 0; i < 56; i++) {
      newAddr += chars[Math.floor(Math.random() * 16)];
      newPrivKey += chars[Math.floor(Math.random() * 16)];
    }
    setMemwalAccountId(newAddr);
    setMemwalKey(newPrivKey);
    setWalletBalance(100.0);
    setWalletConnected(true);
  };

  const codeSnippet = `import { MemWal } from "@mysten-incubation/memwal";

const memwal = MemWal.create({
  key: "${memwalKey.length > 20 ? memwalKey.substring(0, 24) + "..." : memwalKey}",
  accountId: "${memwalAccountId}",
  serverUrl: "${memwalServerUrl}",
  namespace: "${memwalNamespace}",
});`;

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(codeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn("Clipboard access failed", e);
    }
  };

  return (
    <div id="settings-panel-tab" className="space-y-6 max-w-4xl font-mono text-xs">
      
      {/* Intro section */}
      <div className="bg-[#0c0c0c] border border-[#222222] p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#ff4d00]/40" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#ff4d00]/40" />
        
        <h3 className="text-xs font-bold font-mono tracking-[0.2em] text-[#ffffff] uppercase flex items-center mb-1">
          <Sliders className="w-4 h-4 text-[#ff4d00] mr-2" />
          {lang === "zh" ? "MemWal 链上参数与 SDK 配置控制器" : "MEMWAL PARAMETERS & SDK CONTROLLER"}
        </h3>
        <p className="text-[10px] text-[#888888] leading-relaxed">
          {lang === "zh"
            ? "在这里调优并控制您的 MemWal 验证账户、SDK 委托证书、系统共识负载。您可以任意输入您自己的 MemWal 真实私钥，在此界面中即可一键将您的信息碎片加密存证上传至 Walrus 去中心化存储并调用真实 Relayer。"
            : "Optimize and inspect your MemWal account credentials, developer delegate keys, SDK setup metrics, and configure local variables. You can key-in your direct MemWal credentials below to execute real uploads directly to the live Walrus protocol relayer."
          }
        </p>
      </div>

      {/* Mode selection switcher banner */}
      <div className="bg-[#111111]/90 border border-[#ff4d00]/40 p-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-white text-[10px] uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-[#ff4d00]" />
            <span>{lang === "zh" ? "SDK 物理上链模式选择" : "SDK ENDPOINT PROTOCOL SELECTION"}</span>
          </div>
          <p className="text-[9px] text-[#888888] max-w-xl">
            {lang === "zh" 
              ? "选择「仿真本地沙盒」将由 AI 极速仿真出块数据；选择「真实 MemWal 链上同步」则使用您在下方输入的专属密钥与账户，实时组装打包请求在后台与 https://relayer.memwal.ai 等真实中继完成通信归档。" 
              : "Choose 'Simulated Local Sandbox' for zero-friction browser-stored values, or 'Real Live MemWal SDK Sync' to make live network requests and persist real values using your own developer keys."}
          </p>
        </div>

        <div className="flex bg-black border border-zinc-800 p-1 divide-x divide-zinc-950 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setMemwalUseRealSDK(false)}
            className={`px-3 py-1.5 text-[9px] font-bold uppercase transition-all duration-150 cursor-pointer ${
              !memwalUseRealSDK
                ? "bg-zinc-900 border border-zinc-750 text-emerald-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {lang === "zh" ? "⚙ 仿真本地沙盒" : "⚙ SIMULATED SANDBOX"}
          </button>
          <button
            onClick={() => {
              setMemwalUseRealSDK(true);
              setWalletConnected(true);
            }}
            className={`px-3 py-1.5 text-[9px] font-bold uppercase transition-all duration-150 cursor-pointer ${
              memwalUseRealSDK
                ? "bg-[#ff4d00]/10 border border-[#ff4d00]/30 text-[#ff4d00]"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {lang === "zh" ? "⚡ 真实 LIVE 联调" : "⚡ REAL LIVE SDK"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Wallet Controller Card */}
        <div className="bg-[#0c0c0c] border border-[#222222] p-5 space-y-4">
          <div className="pb-3 border-b border-[#222222] flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-white tracking-widest uppercase flex items-center">
              <Key className="w-4 h-4 text-[#ff4d00] mr-2" />
              {lang === "zh" ? "MemWal 账户密钥配置" : "MEMWAL ACCOUNT CREDENTIALS"}
            </h4>
            <span className="px-2 py-0.5 bg-[#ff4d00]/5 text-[#ff4d00] border border-[#ff4d00]/20 text-[8px] uppercase font-bold">
              ED25519 DELEGATE
            </span>
          </div>

          <div className="space-y-4">
            
            {/* Account ID / Wallet Address Input */}
            <div className="space-y-1">
              <label className="text-[9px] text-[#888888] uppercase tracking-wider block">
                {lang === "zh" ? "账户标识 (MemWal Account ID):" : "MEMWAL ACCREDITED ACCOUNT ID:"}
              </label>
              <input
                type="text"
                value={memwalAccountId}
                onChange={(e) => setMemwalAccountId(e.target.value)}
                placeholder="e.g. 0x..."
                className="w-full bg-[#111111] border border-[#222222] text-[10px] text-white font-mono p-2 focus:outline-none focus:border-[#ff4d00] leading-tight"
              />
            </div>

            {/* Delegate Private Key Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[9px] text-[#888888] uppercase tracking-wider block">
                  {lang === "zh" ? "委托签名私钥 (Delegate Private Key):" : "MEMWAL DELEGATE PRIVATE KEY:"}
                </label>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="text-[9px] text-[#ff4d00] hover:underline focus:outline-none cursor-pointer"
                >
                  {showKey ? (lang === "zh" ? "[隐蔽]" : "[hide]") : (lang === "zh" ? "[可见]" : "[reveal]")}
                </button>
              </div>
              <input
                type={showKey ? "text" : "password"}
                value={memwalKey}
                onChange={(e) => setMemwalKey(e.target.value)}
                placeholder="e.g. your-ed25519-private-key"
                className="w-full bg-[#111111] border border-[#222222] text-[10px] text-white font-mono p-2 focus:outline-none focus:border-[#ff4d00] leading-tight"
              />
            </div>

            {/* Server Relayer URLs Input */}
            <div className="space-y-1">
              <label className="text-[9px] text-[#888888] uppercase tracking-wider block">
                {lang === "zh" ? "SDK 中继网点 (Server Relayer URL):" : "MEMWAL SERVER RELAYER URL:"}
              </label>
              <div className="relative">
                <input
                type="text"
                value={memwalServerUrl}
                onChange={(e) => setMemwalServerUrl(e.target.value)}
                placeholder="e.g. https://relayer.staging.memwal.ai"
                className="w-full bg-[#111111] border border-[#222222] text-[10px] text-white font-mono p-2 focus:outline-none focus:border-[#ff4d00] leading-tight"
                />
                <div className="flex gap-1.5 mt-1.5">
                  {(["https://relayer.staging.memwal.ai", "https://relayer.memwal.ai"] as const).map(url => (
                    <button
                      key={url}
                      onClick={() => setMemwalServerUrl(url)}
                      className="text-[8px] bg-[#111111] text-zinc-500 hover:text-[#ff4d00] border border-zinc-900 px-1.5 py-0.5 cursor-pointer uppercase font-bold"
                    >
                      {url.includes("staging") ? (lang === "zh" ? "测试网" : "STAGING") : (lang === "zh" ? "主网" : "MAINNET")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* App namespace customization */}
            <div className="space-y-1">
              <label className="text-[9px] text-[#888888] uppercase tracking-wider block">
                {lang === "zh" ? "应用专属命名空间 (Namespace):" : "APPLICATION NAMESPACE:"}
              </label>
              <input
                type="text"
                value={memwalNamespace}
                onChange={(e) => setMemwalNamespace(e.target.value)}
                placeholder="my-app"
                className="w-full bg-[#111111] border border-[#222222] text-[10px] text-white font-mono p-2 focus:outline-none focus:border-[#ff4d00] leading-tight"
              />
            </div>

            {/* Faucet request button and reroll */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleRollWallet}
                className="bg-[#111111] border border-[#222222] text-[#888888] hover:text-[#ff4d00] hover:border-[#ff4d00] font-bold text-[10px] tracking-widest uppercase py-2 cursor-pointer transition-colors"
                style={{ borderRadius: "0" }}
              >
                {lang === "zh" ? "🔄 更换随机密钥" : "🔄 REROLL KEYS"}
              </button>
              <button
                onClick={() => setWalletBalance(prev => prev + 10)}
                className="bg-[#ff4d00] text-black hover:bg-white font-bold text-[10px] tracking-widest uppercase py-2 cursor-pointer transition-colors"
                style={{ borderRadius: "0" }}
              >
                {lang === "zh" ? "🚰 memwal 注入(WAL/SUI)" : "🚰 FAUCET MEMWAL"}
              </button>
            </div>
          </div>
        </div>

        {/* Console Customizer Sliders */}
        <div className="bg-[#0c0c0c] border border-[#222222] p-5 space-y-4">
          <div className="pb-3 border-b border-[#222222] flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-white tracking-widest uppercase flex items-center">
              <Globe className="w-4 h-4 text-[#ff4d00] mr-2" />
              {lang === "zh" ? "网络共识参数调整" : "NET TESTING CONTROLLERS"}
            </h4>
            <span className="px-2 py-0.5 bg-[#ff4d00]/5 text-[#ff4d00] border border-[#ff4d00]/20 text-[8px] uppercase font-bold">
              SYS STATUS
            </span>
          </div>

          <div className="space-y-4">
            {/* Slider consensus */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[#888888]">{lang === "zh" ? "仿真节点共识健康度:" : "SIMULATED CONSENSUS HEALTH:"}</span>
                <span className="text-[#ff4d00] font-bold">{consensusHealth}% NORMAL</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={consensusHealth}
                onChange={(e) => setConsensusHealth(Number(e.target.value))}
                className="w-full h-1 bg-[#1a1a1a] appearance-none cursor-pointer accent-[#ff4d00] outline-none"
              />
              <p className="text-[9px] text-[#555555] leading-relaxed uppercase">
                {lang === "zh"
                  ? "调节本指标将实时同步至数据头部的共识表现计数，低于 90% 将触发网络断联预警。"
                  : "Drag to adjust mock validator cluster response accuracy. If set below 90%, custom network alert states will activate."
                }
              </p>
            </div>

            {/* Language Switch */}
            <div className="space-y-1 pt-2">
              <span className="text-[9px] text-[#555555] uppercase tracking-wider block">{lang === "zh" ? "切换用户交互语系 (Global System Language):" : "SWITCH DISPLAY LANGUAGE:"}</span>
              <div className="flex bg-[#111111] border border-[#222222] h-9">
                <button
                  onClick={() => setLang("en")}
                  className={`flex-1 font-mono text-[10px] font-bold tracking-widest transition-all cursor-pointer ${
                    lang === "en" ? "bg-[#ff4d00] text-black" : "text-[#555555] hover:text-white"
                  }`}
                >
                  ENGLISH
                </button>
                <div className="w-[1px] bg-[#222222]" />
                <button
                  onClick={() => setLang("zh")}
                  className={`flex-1 font-mono text-[10px] font-bold tracking-widest transition-all cursor-pointer ${
                    lang === "zh" ? "bg-[#ff4d00] text-black" : "text-[#555555] hover:text-white"
                  }`}
                >
                  简体中文 (CHINESE)
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>



      {/* Dangerous Wipe Zone */}
      <div className="bg-[#111111]/30 border border-[#8a2020]/35 p-5 space-y-4">
        <div className="pb-3 border-b border-[#8a2020]/20 flex items-center justify-between">
          <h4 className="text-[10px] font-bold text-[#f87171] tracking-widest uppercase flex items-center">
            <Trash2 className="w-4 h-4 text-[#f87171] mr-2" />
            {lang === "zh" ? "核心档案擦除与重置区" : "DANGEROUS RESET & DATA PURGE"}
          </h4>
          <span className="px-2 py-0.5 bg-[#f87171]/5 text-[#f87171] border border-[#8a2020]/30 text-[8px] uppercase font-bold">
            DESTRUCTIVE SET
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[#a0a0a0] font-sans">
              {lang === "zh" ? "擦除本地缓冲记忆链指针对齐数据" : "Reset Sandbox memories timeline register"}
            </p>
            <p className="text-[9px] text-[#555555] max-w-xl uppercase leading-normal font-sans">
              {lang === "zh"
                ? "擦除本地所有已录入上链的记忆元数据并回归种子测试账本。此操作完全不可逆，重置后自动刷回默认的 3 个 Sui 演示存证条目。"
                : "Reset custom state, wipe browser local Storage back to seed defaults. Useful for cleaning custom data and tracing default test layouts."
              }
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            {resetConfirm ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setResetConfirm(false)}
                  className="bg-[#111111] border border-[#222222] text-[#888888] px-4 py-2 hover:text-white cursor-pointer"
                  style={{ borderRadius: "0" }}
                >
                  {lang === "zh" ? "取消" : "Cancel"}
                </button>
                <button
                  onClick={() => {
                    onWipeData();
                    setResetConfirm(false);
                  }}
                  className="bg-[#8a2020] text-white px-4 py-2 font-bold hover:bg-red-500 transition-colors cursor-pointer"
                  style={{ borderRadius: "0" }}
                >
                  {lang === "zh" ? "确认擦除并重置" : "Confirm Purge"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setResetConfirm(true)}
                className="w-full sm:w-auto bg-[#8a2020]/10 border border-[#8a2020] text-[#f87171] font-bold px-4 py-2 hover:bg-[#8a2020] hover:text-white transition-all cursor-pointer"
                style={{ borderRadius: "0" }}
              >
                {lang === "zh" ? "重置全部数据" : "WIPE SYSTEM STATE"}
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
