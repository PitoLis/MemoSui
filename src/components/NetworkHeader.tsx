/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { NetworkStats } from "../types";
import { Language, TRANSLATIONS } from "../locales";
import MemoSuiLogo from "./MemoSuiLogo";
import { Coins, Cpu, Database, Network, Wifi, RefreshCw, Languages, Sun, Moon, Brain, Link } from "lucide-react";

interface NetworkHeaderProps {
  stats: NetworkStats;
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  walletConnected: boolean;
  setWalletConnected: (connected: boolean) => void;
  walletAddress: string;
  setWalletAddress: React.Dispatch<React.SetStateAction<string>>;
  walletType: "metamask" | "sui_preset" | "";
  setWalletType: React.Dispatch<React.SetStateAction<"metamask" | "sui_preset" | "">>;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
}

export default function NetworkHeader({
  stats,
  walletBalance,
  setWalletBalance,
  walletConnected,
  setWalletConnected,
  walletAddress,
  setWalletAddress,
  walletType,
  setWalletType,
  lang,
  setLang,
  theme,
  setTheme
}: NetworkHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const t = TRANSLATIONS[lang];

  const simulateFaucet = () => {
    if (!walletConnected) {
      setWalletConnected(true);
      return;
    }
    const amount = walletType === "metamask" ? 0.5 : 10;
    setWalletBalance(prev => prev + amount);
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <header className="border-b border-[#222222] bg-[#0a0a0a] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[80px]">
          
          {/* Logo Brand Section */}
          <div className="flex items-center space-x-4">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#111111] border border-[#ff4d00]/30 shadow-lg shadow-[#ff4d00]/10 overflow-hidden">
              {/* Brain logo */}
              <MemoSuiLogo className="w-6.5 h-6.5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tighter italic text-white uppercase">
                  {t.brandTitle}
                </span>
                <span className="px-1.5 py-0.5 text-[8px] font-mono tracking-widest text-[#ff4d00] bg-[#111111] border border-[#222222] font-semibold uppercase">
                  AI v2.5
                </span>
              </div>
              <p className="text-[9px] text-[#555555] font-mono tracking-[0.2em] uppercase hidden sm:block">
                {t.brandSubtitle}
              </p>
            </div>
          </div>

          {/* Connected Stats & Quick Wallet & Language Picker */}
          <div className="flex items-center space-x-3.5">
            {/* Theme Switcher Selector */}
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center justify-center bg-[#111111] border border-[#222222] hover:border-[#ff4d00]/60 h-[44px] w-[44px] text-white cursor-pointer transition-all duration-150 shrink-0"
              title={lang === "zh" ? "切换护眼浅色/深色主题" : "Switch Dark/Light Theme"}
              id="theme-toggle-control"
              style={{ borderRadius: "0" }}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-[#ff4d00]" />
              ) : (
                <Moon className="w-4 h-4 text-[#ff4d00]" />
              )}
            </button>

            {/* Language Switcher */}
            <div className="flex bg-[#111111] border border-[#222222] h-[44px] overflow-hidden">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-3 text-[10px] font-mono font-bold tracking-widest transition-all cursor-pointer ${
                  lang === "en" ? "bg-[#ff4d00] text-black" : "text-[#555555] hover:text-[#ff4d00]"
                }`}
              >
                EN
              </button>
              <div className="w-[1px] bg-[#222222] h-full" />
              <button
                type="button"
                onClick={() => setLang("zh")}
                className={`px-3 text-[10px] font-mono font-bold tracking-widest transition-all cursor-pointer ${
                  lang === "zh" ? "bg-[#ff4d00] text-black" : "text-[#555555] hover:text-[#ff4d00]"
                }`}
              >
                中
              </button>
            </div>

            {walletConnected ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-[#111111] border border-[#222222] px-3.5 h-[44px] text-xs font-mono">
                  <Coins className="w-3.5 h-3.5 text-[#ff4d00] mr-2 animate-pulse" />
                  <span className="text-white font-bold mr-1.5">
                    {walletBalance.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 4 })}
                  </span>
                  <span className="text-[#ff4d00] font-bold mr-2 text-[10px] tracking-wider font-mono">
                    {walletType === "metamask" ? "ETH" : "SUI"}
                  </span>
                  <div className="h-4 w-px bg-[#222222] mx-2" />
                  <span className="text-[#888888] text-[10px] hidden md:inline">
                    {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : t.connectedWallet}
                  </span>
                  <span className="text-[#888888] text-[10px] md:hidden">
                    {walletAddress ? `${walletAddress.substring(0, 6)}...` : "0x7b2a"}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-[#ff4d00] ml-2 animate-ping" />
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setWalletConnected(false);
                    setWalletAddress("");
                    setWalletType("");
                    localStorage.removeItem("memosui_wallet_connected");
                    localStorage.removeItem("memosui_wallet_address");
                    localStorage.removeItem("memosui_wallet_type");
                    localStorage.removeItem("memosui_wallet_balance");
                  }}
                  className="px-3 h-[44px] bg-[#240a0a] hover:bg-[#861919] border border-[#ff4d00]/20 text-[#ef4444] hover:text-white font-mono font-bold text-[9px] sm:text-[10px] tracking-widest uppercase transition-all duration-150 cursor-pointer flex items-center shrink-0"
                  style={{ borderRadius: "0" }}
                >
                  {lang === "zh" ? "断开" : "DISCONNECT"}
                </button>
              </div>
            ) : null}


          </div>
        </div>

        {/* Dynamic Secondary Stats Grid */}
        <div id="stats_dashboard" className="grid grid-cols-2 md:grid-cols-5 border-t border-[#222222] text-xs text-gray-400">
          <div className="flex items-center space-x-3 bg-[#0d0d0d]/80 border-r border-[#222222] py-3.5 px-4">
            <Database className="w-4 h-4 text-[#ff4d00] shrink-0" />
            <div>
              <p className="text-[9px] text-[#555555] font-mono tracking-[0.2em] uppercase">{t.vaultFree}</p>
              <p className="font-bold font-mono text-[#ffffff]">{stats.walrusStorageRemaining}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-[#0d0d0d]/80 border-r border-[#222222] py-3.5 px-4">
            <Cpu className="w-4 h-4 text-[#ff4d00] shrink-0" />
            <div>
              <p className="text-[9px] text-[#555555] font-mono tracking-[0.2em] uppercase">{t.securedBlobs}</p>
              <p className="font-bold font-mono text-[#ffffff]">{stats.totalSecuredMemories} {t.entriesCount}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-[#0d0d0d]/80 border-r border-[#222222] py-3.5 px-4 col-span-1">
            <Network className="w-4 h-4 text-[#ff4d00] shrink-0" />
            <div>
              <p className="text-[9px] text-[#555555] font-mono tracking-[0.2em] uppercase">{t.suiNetwork}</p>
              <p className="font-bold font-mono text-[#ffffff] text-[11px] truncate max-w-[120px]">{stats.suiNetworkStatus}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-[#0d0d0d]/80 border-r border-[#222222] py-3.5 px-4 col-span-1">
            <Wifi className="w-4 h-4 text-[#ff4d00] shrink-0" />
            <div>
              <p className="text-[9px] text-[#555555] font-mono tracking-[0.2em] uppercase">{t.consensus}</p>
              <p className="font-bold font-mono text-[#ffffff]">{stats.consensusHealth}% OK</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-[#0d0d0d]/80 py-3.5 px-4 col-span-2 md:col-span-1">
            <div className="flex items-center justify-center w-5 h-5 bg-[#111111] border border-[#222222] text-[10px] font-mono text-[#ff4d00] font-bold">#</div>
            <div>
              <p className="text-[9px] text-[#555555] font-mono tracking-[0.2em] uppercase">{t.epochFee}</p>
              <p className="font-bold font-mono text-[#ffffff] truncate max-w-[120px]">{stats.suiGasPrice}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
