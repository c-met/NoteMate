import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef, useState } from "react";
import type { Message } from "../types";

interface Props {
  messages: Message[];
  loading: boolean;
  onAsk: (text: string) => Promise<void>;
  onOpenSidebar: () => void;
  onClearChat: () => Promise<void>;
  clearingChat: boolean;
}

interface PromptCard {
  label: string;
  desc: string;
  iconKey: "book" | "formula" | "lightbulb" | "quiz" | "target";
  fullWidth?: boolean;
}

const PROMPT_CARDS: PromptCard[] = [
  { label: "Summarize", desc: "Get a concise overview", iconKey: "book" },
  { label: "What are the key formulas?", desc: "Essential equations", iconKey: "formula" },
  { label: "Explain this concept simply", desc: "Break it down for me", iconKey: "lightbulb" },
  { label: "Create a quiz for me", desc: "Test my knowledge", iconKey: "quiz" },
  { label: "What might appear in the exam?", desc: "Predict exam topics", iconKey: "target", fullWidth: true },
];

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.94 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.25 + i * 0.07, type: "spring", stiffness: 300, damping: 22 },
  }),
};

function getPromptIcon(key: PromptCard["iconKey"]) {
  switch (key) {
    case "book":      return <BookIcon />;
    case "formula":   return <FormulaIcon />;
    case "lightbulb": return <LightbulbIcon />;
    case "quiz":      return <QuizIcon />;
    case "target":    return <TargetIcon />;
  }
}

export function ChatPanel({ messages, loading, onAsk, onOpenSidebar, onClearChat, clearingChat }: Props) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Focus input automatically when loading finishes */
  useEffect(() => {
    if (!loading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  /* Scroll to bottom on new messages — using page scroll, not inner container */
  useEffect(() => {
    if (messages.length > 0) {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput("");
    await onAsk(trimmed);
  }

  const questionCount = messages.filter((m) => m.role === "user").length;

  return (
    <>
      {/* ── Floating premium workspace status bar ── */}
      <header className="sticky top-3 z-20 px-2 sm:px-4 lg:px-8">
        <div className="top-workspace-bar mx-auto max-w-5xl rounded-full px-2 sm:px-4 lg:px-5 py-1.5 sm:py-2.5 flex items-center gap-1.5 sm:gap-3">
          
          <button
            type="button"
            onClick={onOpenSidebar}
            className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            title="Open Library"
          >
            <MenuIcon />
          </button>

          <div className="min-w-0 flex items-center gap-2 sm:gap-2.5">
            <span className="status-dot-pro w-2 h-2 rounded-full bg-primary inline-block" />
            <span className="hidden sm:inline text-[12px] font-medium text-text-subtle truncate">
              {questionCount === 0
                ? "AI study assistant online"
                : `${questionCount} question${questionCount !== 1 ? "s" : ""} asked`}
            </span>
            <span className="sm:hidden text-[11px] font-medium text-text-subtle truncate">NoteMate AI</span>
          </div>
          <div className="hidden md:block flex-1 text-center">
            <span className="text-[11px] text-text-muted tracking-wide">
              Upload notes and start mastering concepts faster
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onClearChat}
              disabled={clearingChat}
              className={`flex items-center justify-center w-8 h-8 sm:w-auto sm:px-3 sm:py-1 rounded-full sm:text-[11px] font-semibold transition-all duration-200 border ${
                clearingChat 
                  ? "text-text-muted bg-white/5 border-transparent cursor-not-allowed"
                  : "text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border-transparent hover:border-red-500/30"
              }`}
              title="Clear chat and restart session"
            >
              {clearingChat ? (
                <div className="animate-spin w-3.5 h-3.5 border-2 border-text-muted border-t-transparent rounded-full" />
              ) : (
                <TrashSmallIcon />
              )}
              <span className="hidden sm:inline ml-1.5">{clearingChat ? "Clearing..." : "Clear Chat"}</span>
            </button>
            <span className="hidden sm:inline top-status-pill text-[10px] font-semibold text-primary px-2.5 py-1 rounded-full">
              LIVE
            </span>
            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-2 sm:px-3 py-1 bg-primary-xmuted border border-border-primary transition-all duration-200 hover:border-primary/50">
              <SparkleSmallIcon size={10} className="text-primary" />
              <span className="hidden sm:inline text-[11px] text-primary font-bold tracking-wide">NoteMate AI</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Open seamless workspace — NO glass card, NO overflow constraints ── */}
      {/* Extra bottom padding so content doesn't hide behind fixed input dock */}
      <div
        className={
          messages.length === 0 || clearingChat
            ? "px-4 sm:px-6 lg:px-10 h-[calc(100dvh-5rem)] overflow-hidden flex flex-col pb-28 sm:pb-32"
            : "px-4 sm:px-6 lg:px-10 pb-32 sm:pb-36"
        }
      >
        <AnimatePresence initial={false} mode="wait">

          {clearingChat ? (
            /* ══════════════ CLEARING STATE ══════════════ */
            <motion.div
              key="clearing"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)" }}
              transition={{ duration: 0.3 }}
              className="flex-1 min-h-0 flex flex-col items-center justify-center text-center pb-20"
            >
              <div className="relative flex items-center justify-center mb-6">
                 {/* Glowing circles for loading */}
                 <div className="absolute w-24 h-24 rounded-full border border-primary/30 animate-[spin_3s_linear_infinite]" />
                 <div className="absolute w-16 h-16 rounded-full border border-primary/50 animate-[spin_2s_linear_infinite_reverse]" />
                 <div className="w-4 h-4 rounded-full bg-primary animate-pulse" style={{ boxShadow: "0 0 16px rgba(20,184,166,0.6)" }} />
              </div>
              <h2 className="text-[20px] font-bold text-text-heading mb-2">Resetting Session</h2>
              <p className="text-[14px] text-text-subtle">Deleting your documents securely...</p>
            </motion.div>
          ) : messages.length === 0 ? (
            /* ══════════════ EMPTY STATE — full viewport hero ══════════════ */
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="flex-1 min-h-0 flex flex-col items-center justify-start pt-10 sm:pt-12 lg:pt-14 text-center"
            >
              {/* ── Hero orb ── */}
              <div className="relative flex items-center justify-center mb-5 sm:mb-6">
                {/* Outer ambient glow */}
                <div
                  className="absolute w-60 h-60 rounded-full pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(20,184,166,0.22) 0%, rgba(45,212,191,0.1) 45%, transparent 75%)",
                    filter: "blur(32px)",
                  }}
                />
                {/* Mid glow */}
                <div
                  className="absolute w-40 h-40 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, rgba(20,184,166,0.32) 0%, transparent 65%)",
                    filter: "blur(18px)",
                  }}
                />
                {/* Rotating dashed ring */}
                <div className="absolute w-[152px] h-[152px] spin-ring pointer-events-none" aria-hidden="true">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50" cy="50" r="46"
                      fill="none"
                      stroke="rgba(20,184,166,0.3)"
                      strokeWidth="1.2"
                      strokeDasharray="5 9"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                {/* Counter-rotating ring */}
                <div
                  className="absolute w-[124px] h-[124px] pointer-events-none"
                  style={{ animation: "spin-ring 30s linear infinite reverse" }}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <circle
                      cx="50" cy="50" r="46"
                      fill="none"
                      stroke="rgba(34,211,238,0.16)"
                      strokeWidth="0.9"
                      strokeDasharray="3 12"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                {/* Floating glass icon */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative hero-icon rounded-[1.75rem] flex items-center justify-center z-10"
                  style={{ width: "5.5rem", height: "5.5rem" }}
                >
                  <img src="/logo.png" alt="NoteMate logo" className="w-9 h-9 object-contain" />
                </motion.div>

                {/* Sparkles */}
                <motion.div
                  animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
                  className="absolute top-0 right-3 text-primary-glow pointer-events-none"
                  aria-hidden="true"
                >
                  <StarIcon size={13} />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 5, 0], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
                  className="absolute bottom-1 left-2 text-accent pointer-events-none"
                  aria-hidden="true"
                >
                  <StarIcon size={7} />
                </motion.div>
                <motion.div
                  animate={{ y: [0, -4, 0], opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute top-6 left-0 text-primary pointer-events-none"
                  aria-hidden="true"
                >
                  <StarIcon size={5} />
                </motion.div>
              </div>

              {/* ── AI Badge ── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="inline-flex items-center gap-1.5 bg-primary-xmuted border border-border-primary text-primary text-[10px] font-bold tracking-[0.14em] uppercase rounded-full px-3.5 py-1.5 mb-3 sm:mb-4"
              >
                <SparkleSmallIcon size={9} className="text-primary" />
                AI-Powered Study Assistant
              </motion.div>

              {/* ── Heading ── */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
                className="text-[30px] sm:text-[34px] lg:text-[42px] font-extrabold text-text-heading tracking-tight leading-tight"
              >
                Chat with your{" "}
                <span className="gradient-text">study notes.</span>
              </motion.h1>

              {/* ── Subtitle ── */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-2 text-[14px] sm:text-[15px] text-text-subtle max-w-[380px] leading-relaxed"
              >
                Upload your PDFs and ask anything — instant, cited answers for your exam prep.
              </motion.p>

              {/* ── Prompt bento cards (individual glassmorphism) ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-[448px] mt-4 sm:mt-5">
                {PROMPT_CARDS.map((card, i) => (
                  <motion.button
                    key={card.label}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ y: -3, transition: { duration: 0.18 } }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => void onAsk(card.label)}
                    className={`prompt-card text-left flex items-center gap-2.5 rounded-2xl px-3.5 py-3 ${
                      card.fullWidth ? "sm:col-span-2" : ""
                    }`}
                  >
                    <div className="flex-shrink-0 w-8.5 h-8.5 rounded-xl bg-primary-xmuted border border-border-primary flex items-center justify-center text-primary">
                      {getPromptIcon(card.iconKey)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-semibold text-text-body leading-tight">{card.label}</p>
                      <p className="text-[10.5px] text-text-muted mt-0.5">{card.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

            </motion.div>

          ) : (
            /* ══════════════ MESSAGES — natural page flow ══════════════ */
            <div key="messages" className="max-w-3xl mx-auto pt-6">
              {messages.map((m, idx) => (
                <motion.div
                  key={`${idx}-${m.timestamp}`}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.22, type: "spring", stiffness: 280, damping: 22 }}
                  className={`flex mb-6 last:mb-0 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col gap-1.5 max-w-[78%]">
                    {/* Role + timestamp */}
                    <div
                      className={`flex items-center gap-1.5 ${
                        m.role === "user" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {m.role === "assistant" && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #0D9488, #14B8A6)" }}
                        >
                          <SparkleSmallIcon size={8} className="text-white" />
                        </div>
                      )}
                      <span
                        className={`text-[11px] font-semibold ${
                          m.role === "assistant" ? "text-primary" : "text-text-muted"
                        }`}
                      >
                        {m.role === "assistant" ? "NoteMate AI" : "You"}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Bubble */}
                    <div
                      className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                        m.role === "user" ? "user-bubble rounded-tr-sm" : "ai-bubble rounded-tl-sm"
                      } overflow-x-auto`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => (
                            <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
                          ),
                          li: ({ children }) => <li className="text-[14px]">{children}</li>,
                          strong: ({ children }) => (
                            <strong
                              className={
                                m.role === "user"
                                  ? "font-bold text-white"
                                  : "text-primary-bright font-semibold"
                              }
                            >
                              {children}
                            </strong>
                          ),
                          code: ({ children }) => (
                            <code
                              className={
                                m.role === "user"
                                  ? "bg-white/20 text-white px-1.5 py-0.5 rounded text-[12px] font-mono"
                                  : "bg-primary-xmuted text-primary-bright border border-border-primary px-1.5 py-0.5 rounded text-[12px] font-mono"
                              }
                            >
                              {children}
                            </code>
                          ),
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-3">
                              <table className="min-w-full divide-y divide-border-primary border border-border-primary rounded-lg overflow-hidden">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => <thead className="bg-primary-xmuted">{children}</thead>,
                          tbody: ({ children }) => <tbody className="divide-y divide-border-primary/50">{children}</tbody>,
                          tr: ({ children }) => <tr>{children}</tr>,
                          th: ({ children }) => (
                            <th className="px-3 py-2 text-left text-[12px] font-bold text-primary-bright tracking-wider">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="px-3 py-2 text-[13px] text-text-body whitespace-normal">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>

                    {/* Citations */}
                    {m.citations && m.citations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-0.5">
                        {m.citations.map((c, ci) => (
                          <motion.span
                            key={ci}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: ci * 0.05 }}
                            className="text-[10px] px-2.5 py-1 rounded-full bg-primary-xmuted border border-border-primary text-primary font-medium cursor-default"
                            title={c.snippet}
                          >
                            📄 {c.document}
                            {c.page ? ` · p.${c.page}` : ""}
                          </motion.span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* ── Thinking indicator ── */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex justify-start mb-6"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, #0D9488, #14B8A6)" }}
                        >
                          <SparkleSmallIcon size={8} className="text-white" />
                        </div>
                        <span className="text-[11px] font-semibold text-primary">NoteMate AI</span>
                      </div>
                      <div className="ai-bubble rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                        <span className="thinking-dot w-2 h-2 rounded-full bg-primary inline-block" />
                        <span className="thinking-dot w-2 h-2 rounded-full bg-primary inline-block" />
                        <span className="thinking-dot w-2 h-2 rounded-full bg-primary inline-block" />
                        <span className="ml-1.5 text-[12px] text-text-muted">Thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Fixed floating input dock — solid surface, premium contrast ── */}
      {/* Positioned to start after sidebar on desktop */}
      <div className="fixed bottom-0 left-0 lg:left-[288px] right-0 z-30 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className={`input-dock rounded-3xl flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-3 sm:py-3.5 ${isFocused ? "focused" : ""}`}>
              <div
                className={`flex-shrink-0 transition-colors duration-200 ${
                  isFocused ? "text-primary" : "text-text-muted"
                }`}
              >
                <SparkleInputIcon />
              </div>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="chat-input flex-1 bg-transparent text-text-body text-[13px] sm:text-[14px] outline-none placeholder:text-text-muted"
                placeholder="Ask anything about your documents..."
                disabled={loading}
                aria-label="Ask a question"
                autoFocus
              />
              <div className="flex items-center gap-2.5">
                <AnimatePresence>
                  {input.trim() && (
                    <motion.span
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      className="text-[10px] text-text-muted hidden sm:block select-none"
                    >
                      ↵ Enter
                    </motion.span>
                  )}
                </AnimatePresence>
                <motion.button
                  type="submit"
                  disabled={loading || !input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Send message"
                  className="send-btn flex items-center gap-1.5 rounded-xl px-3 sm:px-4 py-2 text-[13px] font-bold text-white disabled:text-white/20"
                >
                  <SendIcon />
                  <span className="hidden sm:inline">Send</span>
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════
   Icons
════════════════════════════════════════ */

function SparkleSmallIcon({ size = 12, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M6 0L7.1 4.9L12 6L7.1 7.1L6 12L4.9 7.1L0 6L4.9 4.9L6 0Z" />
    </svg>
  );
}

function StarIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      <path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4L5 0Z" />
    </svg>
  );
}

function SparkleInputIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2L13.8 9.2L21 12L13.8 14.8L12 22L10.2 14.8L3 12L10.2 9.2L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 4H14C15.1 4 16 4.9 16 6V18C16 19.1 15.1 20 14 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M16 6H18C19.1 6 20 6.9 20 8V18C20 19.1 19.1 20 18 20H16" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 9H12M6 13H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FormulaIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 4H6L12 12L6 20H18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.5 14.5C7.6 13.5 6.3 11.5 6.3 9.2C6.3 5.9 8.9 3.2 12.2 3.2C15.5 3.2 18.1 5.9 18.1 9.2C18.1 11.5 16.8 13.5 14.9 14.5V16C14.9 16.6 14.4 17 13.8 17H10.6C10 17 9.5 16.6 9.5 16V14.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10.5 19.5H13.9M11.5 22H12.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function QuizIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 5H7C5.895 5 5 5.895 5 7V19C5 20.105 5.895 21 7 21H17C18.105 21 19 20.105 19 19V7C19 5.895 18.105 5 17 5H15M9 5C9 3.895 9.895 3 11 3H13C14.105 3 15 3.895 15 5M9 5C9 6.105 9.895 7 11 7H13C14.105 7 15 6.105 15 5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M9 12L11 14L15 10M9 17H13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashSmallIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 7H18M9 7V5C9 4.448 9.448 4 10 4H14C14.552 4 15 4.448 15 5V7M10 11V17M14 11V17M5 7L6 19C6 19.552 6.448 20 7 20H17C17.552 20 18 19.552 18 19L19 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6H20M4 12H20M4 18H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
