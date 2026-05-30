/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { StoredMemory } from "../types";
import { Language } from "../locales";
import { Send, Bot, User, Trash2, Key, HelpCircle, Sparkles, Terminal } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

interface MemoryChatBotProps {
  memories: StoredMemory[];
  lang: Language;
  walletConnected: boolean;
  walletAddress: string;
}

export default function MemoryChatBot({
  memories,
  lang,
  walletConnected,
  walletAddress
}: MemoryChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isChinese = lang === "zh";

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "model",
          content: isChinese 
            ? `👋 您好！我是 MemoSui 智能认知大脑。我能够读取您在 Sui 区块链以及 Walrus 去中心化存储中存证的全部 ${memories.length} 条记忆记录。

您可以向我提问任何关于您存在这里的记忆、部署日志或技术便签的问题，例如：
1. "我最近都记录了哪些关于 Sui 智能合约部署的内容？"
2. "根据我的记忆，我的有什么下周准备向团队汇报的计划？"
3. "帮我分析一下我最近的学习和技术动态。"
`
            : `👋 Hello! I am the MemoSui Intelligent Brain. I can view and analyze your secure ledger containing ${memories.length} immutable memory blocks.

Ask me anything about your technical notes, travel diaries, or secret ideas recorded here:
1. "What details did I save about my the Sui-Move smart contract deployment?"
2. "Looking at my logs, what Walden pond reflections did I write down?"
3. "Help me summarize my active tags and technical trajectory."`,
          timestamp: new Date()
        }
      ]);
    }
  }, [memories.length, isChinese]);

  // Scroll to bottom when logs arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isLoading) return;

    if (!customText) {
      setInput("");
    }

    const newUserMessage: Message = {
      id: "usr-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Assemble full transaction context for Gemini
      const conversationHistory = [...messages, newUserMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: conversationHistory,
          memories: memories,
          lang: lang
        })
      });

      if (response.ok) {
        const data = await response.json();
        const modelReply: Message = {
          id: "bot-" + Date.now(),
          role: "model",
          content: data.reply || "Error reading memory mapping response.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, modelReply]);
      } else {
        throw new Error("Terminal connection timed out");
      }
    } catch (err: any) {
      console.error("ChatBot error:", err);
      const fallbackReply: Message = {
        id: "err-" + Date.now(),
        role: "model",
        content: isChinese 
          ? "⚠️ 抱歉，连接到认知大脑核心服务超时，请确认您的网络状态和后端配置是否工作良好。" 
          : "⚠️ Sorry, connection to the cognitive brain timed out. Please check your network and Gemini configuration.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const PROMPT_SUGGESTIONS = isChinese ? [
    "分析我的记忆重心和主要常驻标签",
    "查找有没有关于「智能合约」或「Move」的内容",
    "帮我整理记忆里提到过的待办计划(Action Items)",
  ] : [
    "Analyze my main topics and storage focus.",
    "Search for contract deployments or Move logs.",
    "Aggregate all actionable tasks across my timeline.",
  ];

  return (
    <div id="memory-chatbot-panel" className="bg-[#0c0c0c] border border-[#ff4d00]/20 p-5 space-y-4 flex flex-col h-[580px] relative font-mono">
      {/* Visual cyber anchors */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#ff4d00]/40" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#ff4d00]/40" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#ff4d00]/40" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#ff4d00]/40" />

      {/* Cyber Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#222222]">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-[#ff4d00] animate-pulse" />
          <span className="text-xs text-white font-bold tracking-widest uppercase">
            MEMOSUI COGNITIVE BRAIN AGENT // CLIENT_0x9
          </span>
        </div>
        <button
          onClick={handleClearChat}
          className="p-1 px-2.5 bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-500 hover:text-white hover:border-red-500 hover:bg-red-950/20 cursor-pointer flex items-center gap-1.5 transition-colors uppercase font-bold"
          style={{ borderRadius: "0" }}
          title={isChinese ? "清空对话" : "Clear conversation"}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isChinese ? "清空终端" : "Clear Log"}</span>
        </button>
      </div>

      {/* Message Output Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            className={`flex items-start gap-3.5 max-w-[90%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
            }`}
          >
            {/* Avatar Indicator */}
            <div className={`w-8 h-8 flex items-center justify-center shrink-0 border select-none ${
              msg.role === "user" 
                ? "bg-[#ff4d00]/10 border-[#ff4d00]/35 text-[#ff4d00]" 
                : "bg-zinc-900 border-zinc-800 text-zinc-300"
            }`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble block */}
            <div className={`p-4 leading-relaxed text-xs border ${
              msg.role === "user"
                ? "bg-zinc-900/60 border-zinc-800 text-white"
                : "bg-black/90 border-[#222222] text-zinc-300"
            }`} style={{ whiteSpace: "pre-line" }}>
              <div className="flex items-center space-x-2 mb-1 border-b border-zinc-800/50 pb-1 text-[9px] text-[#888888]">
                <span className="font-bold">
                  {msg.role === "user" 
                    ? (walletConnected ? `USER_ADDR: ${walletAddress.substring(0, 10)}...` : "CLIENT_VISITOR") 
                    : "MEMOSUI_AI_BRAIN"}
                </span>
                <span>•</span>
                <span>{msg.timestamp.toLocaleTimeString()}</span>
              </div>
              <p className="font-sans leading-relaxed tracking-wider select-text">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3.5 mr-auto max-w-[85%]">
            <div className="w-8 h-8 flex items-center justify-center border bg-zinc-950 border-[#ff4d00]/40 text-[#ff4d00] animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 bg-[#111111] border border-[#ff4d00]/30 text-xs text-zinc-400 space-y-2">
              <div className="flex items-center space-x-1.5 text-[9px] text-[#ff4d00] font-bold">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span className="animate-pulse">CONNECTING TO ON-CHAIN SECURED MEMORY CONTEXT...</span>
              </div>
              <p className="animate-pulse text-[10px]">{isChinese ? "正在索引您的知识分片，开始量子推理..." : "Retrieving storage shard indexing pointers..."}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Interactive suggestions prompt pills */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block">
          {isChinese ? "💡 建议可以向大脑提问的问题:" : "💡 DYNAMIC TOPICAL SUGGESTIONS:"}
        </span>
        <div className="flex flex-wrap gap-2">
          {PROMPT_SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sug)}
              className="text-[9.5px] py-1 px-2.5 bg-zinc-950 hover:bg-[#ff4d00]/10 border border-zinc-800 hover:border-[#ff4d00]/30 text-[#888888] hover:text-white cursor-pointer select-none transition-all"
              style={{ borderRadius: "0" }}
              disabled={isLoading}
            >
              # {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Text Input Block */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex border border-[#222222] bg-black"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isChinese
              ? "向去中心化安全记忆库提问... (回车发送)"
              : "Ask your secure on-chain memory ledger... (Enter to send)"
          }
          className="flex-1 bg-transparent px-4 py-3.5 text-xs text-white placeholder-zinc-700 font-mono border-none focus:outline-none focus:ring-0"
          disabled={isLoading}
        />
        <div className="w-px bg-[#222222]" />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 bg-zinc-950 hover:bg-[#ff4d00] text-zinc-500 hover:text-black cursor-pointer font-bold uppercase tracking-widest text-[10px] transition-colors flex items-center justify-center gap-1 border-none disabled:bg-zinc-950 disabled:text-zinc-800 disabled:cursor-not-allowed"
          style={{ borderRadius: "0" }}
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isChinese ? "发 送" : "SEND"}</span>
        </button>
      </form>
    </div>
  );
}
