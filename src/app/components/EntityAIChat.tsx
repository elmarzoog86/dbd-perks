"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Skull, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export default function EntityAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Welcome to the Fog, mortal. I am the Entity AI. What knowledge do you seek for your next Trial?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].filter((m) => m.role !== "system"),
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "The connection to the fog was severed. Try again..." },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "The Entity is unreachable right now..." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-[#150a0a] border border-[#8b0000] p-4 rounded-full shadow-[0_0_20px_rgba(139,0,0,0.6)] hover:shadow-[0_0_30px_rgba(255,0,0,0.8)] transition-all duration-300 group flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-red-900/20 rounded-full blur-md animate-pulse"></div>
            <Skull className="w-8 h-8 text-red-500 group-hover:text-red-400 group-hover:scale-110 transition-all z-10" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] sm:w-[450px] h-[600px] max-h-[85vh] max-w-[90vw] flex flex-col overflow-hidden 
                       bg-[#0a0505]/95 backdrop-blur-md border border-[#8b0000]/60 rounded-2xl shadow-[0_0_40px_rgba(80,0,0,0.8)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#3e0000] via-[#1a0000] to-[#0d0000] border-b border-[#8b0000]/40 shadow-inner">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Skull className="w-6 h-6 text-red-500" />
                  <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                </div>
                <div>
                  <h3 className="font-bold text-red-50 tracking-wide font-serif text-lg">Entity AI</h3>
                  <p className="text-xs text-red-400/80 font-mono italic">Whispering from the void...</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-red-400 hover:text-red-100 hover:bg-white/10 p-1.5 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('/bg-texture.png')] bg-cover bg-center scrollbar-thin scrollbar-thumb-red-900 scrollbar-track-transparent">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 ${
                      m.role === "user"
                        ? "bg-red-900/40 border border-red-800/50 text-red-50 rounded-br-sm"
                        : "bg-stone-900/60 border border-stone-700/50 text-gray-200 rounded-bl-sm font-serif"
                    } shadow-lg whitespace-pre-wrap`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl rounded-bl-sm p-3 bg-stone-900/60 border border-stone-700/50 text-red-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm italic shadow-red-500">The Entity is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-[#0a0505] border-t border-[#8b0000]/40">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for a build, or query the lore..."
                  className="flex-1 bg-stone-900/50 border border-stone-700/50 text-red-50 placeholder:text-stone-500 rounded-xl px-4 py-3 
                             focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-red-600 transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-red-900 hover:bg-red-800 disabled:bg-red-900/30 disabled:text-red-900/50 text-red-50 p-3 rounded-xl 
                             transition-all shadow-md shadow-red-900/20 disabled:shadow-none"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
