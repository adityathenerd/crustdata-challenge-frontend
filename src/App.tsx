import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

const App: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [messages, setMessages] = useState<
    { text: string; sender: "user" | "ai" }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async () => {
  if (!query.trim()) {
    setError("Please enter a valid query.");
    return;
  }

  setError(null);
  setLoading(true);
  setMessages((prev) => [...prev, { text: query, sender: "user" }]);

  try {
    const res = await fetch("https://crustdata-challenge-yyyv.onrender.com/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: query }), // Updated to send { "question": "..." }
    });

    if (!res.ok) {
      throw new Error("Failed to fetch response. Please try again.");
    }

    const data = await res.json();
    setMessages((prev) => [...prev, { text: data.answer, sender: "ai" }]);
    setQuery("");
  } catch (err: any) {
    setError(err.message || "Something went wrong.");
  } finally {
    setLoading(false);
  }
};


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
      <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
        <nav className="border-b border-cyan-800/30 bg-black/80 backdrop-blur-xl supports-[backdrop-filter]:bg-black/60 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Zap className="h-8 w-8 text-cyan-400" />
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
                  HoloAI
                </span>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
          <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <div className="w-[800px] h-[800px] bg-cyan-500 rounded-full filter blur-[120px]" />
            <div className="w-[600px] h-[600px] bg-purple-500 rounded-full filter blur-[120px]" />
          </div>
          <div className="h-[calc(100vh-8rem)] mb-8 flex flex-col rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="flex-1 overflow-y-auto space-y-4 p-4 sm:p-6 scrollbar-thin scrollbar-thumb-cyan-800 scrollbar-track-transparent">
              <AnimatePresence initial={false}>
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center h-full text-cyan-400"
                  >
                    <Bot className="h-16 w-16 mb-4" />
                    <p className="text-xl">
                      How can I assist you in this digital realm?
                    </p>
                  </motion.div>
                ) : (
                  messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "flex items-start gap-3",
                        msg.sender === "user" ? "flex-row-reverse" : ""
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full border",
                          msg.sender === "user"
                            ? "bg-purple-600 border-purple-400"
                            : "bg-cyan-800 border-cyan-600"
                        )}
                      >
                        {msg.sender === "user" ? (
                          <User className="w-6 h-6 text-white" />
                        ) : (
                          <Bot className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "px-6 py-4 rounded-2xl max-w-[80%] backdrop-blur-md",
                          msg.sender === "user"
                            ? "bg-purple-600/30 border border-purple-500/50 text-white"
                            : "bg-cyan-800/30 border border-cyan-700/50 text-cyan-50"
                        )}
                      >
                        <ReactMarkdown className="prose prose-invert max-w-none">
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="m-4 p-3 rounded-lg bg-red-900/50 border border-red-700 text-red-200"
              >
                {error}
              </motion.div>
            )}

            <div className="p-4 bg-black/50 border-t border-white/10 backdrop-blur-xl">
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Enter your query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 bg-white/5 border-cyan-800/50 text-white placeholder-cyan-400/50 focus:border-cyan-400 focus:ring-cyan-400"
                />
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default App;
