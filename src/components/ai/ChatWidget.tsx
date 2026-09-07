"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, Trash2, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { cn } from "@/lib/utils/cn";
import { useCartStore } from "@/stores/cart-store";
import { fetchProductsClient, type LiteProduct } from "@/lib/services/products-client";

type Message = { role: "user" | "model"; text: string; ts: number };

type CartAction =
  | { type: "add"; packLabel: string; quantity: number }
  | { type: "remove"; packLabel: string };

const QUICK_PROMPTS = [
  "🥚 Help me choose a pack",
  "🛒 What's in my cart?",
  "💰 Show current prices",
  "📦 Track my order",
  "🚚 Do you deliver here?",
  "💬 Contact AG Enterprises",
];

const STORAGE_KEY = "ag-fresh-eggs-chat";

function makeSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [products, setProducts] = useState<LiteProduct[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const items = useCartStore((s) => s.items);

  useEffect(() => {
    setSessionId(makeSessionId());
    fetchProductsClient().then(setProducts);
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function applyCartActions(actions: CartAction[]) {
    for (const action of actions) {
      const product = products.find(
        (p) => p.pack_label.toLowerCase() === action.packLabel.toLowerCase(),
      );
      if (!product) continue;

      if (action.type === "add") {
        addItem(
          { productId: product.id, packLabel: product.pack_label, pieces: product.pieces, price: product.price },
          action.quantity,
        );
      } else {
        removeItem(product.id);
      }
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || sending) return;
    const userMessage: Message = { role: "user", text, ts: Date.now() };
    const withCartContext =
      text.toLowerCase().includes("cart") && items.length > 0
        ? `${text}\n\n(Current cart: ${items.map((i) => `${i.packLabel} x${i.quantity}`).join(", ")})`
        : text;

    setMessages((m) => [...m, userMessage]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: withCartContext,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "model", text: data.reply, ts: Date.now() }]);
      if (data.cartActions?.length) applyCartActions(data.cartActions);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "model", text: "Something went wrong. Please try again in a moment.", ts: Date.now() },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open AG Assistant"
        className={cn(
          "fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ag-green text-white shadow-lg shadow-ag-green/30 transition-transform hover:scale-105 sm:bottom-6",
          open && "hidden",
        )}
      >
        <LogoMark size={22} className="absolute" />
        <Sparkles size={14} className="absolute -right-0.5 -top-0.5 rounded-full bg-ag-blue p-0.5 text-white" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:inset-auto sm:bottom-6 sm:right-4">
          <div className="flex h-full w-full flex-col bg-white shadow-2xl sm:h-[560px] sm:w-[380px] sm:rounded-2xl sm:border sm:border-border">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-ag-green px-4 py-3.5 text-white sm:rounded-t-2xl">
              <div className="flex items-center gap-2">
                <LogoMark size={24} />
                <div>
                  <p className="font-display text-sm font-semibold">AG Assistant</p>
                  <p className="text-[11px] opacity-85">Your personal egg-ordering assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  aria-label="Clear chat"
                  onClick={() => setMessages([])}
                  className="rounded-md p-1.5 hover:bg-white/15"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  aria-label="Close AG Assistant"
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1.5 hover:bg-white/15"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
              {messages.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
                  <p className="text-sm text-foreground-muted">
                    Ask me about packs, prices, delivery, or your order.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {QUICK_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => sendMessage(prompt.replace(/^[^\s]+\s/, ""))}
                        className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground hover:bg-surface"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={cn("mb-3 flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm",
                      m.role === "user"
                        ? "rounded-br-sm bg-ag-green text-white"
                        : "rounded-bl-sm bg-surface text-foreground",
                    )}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    <p
                      className={cn(
                        "mt-1 text-[10px] opacity-60",
                        m.role === "user" ? "text-white" : "text-foreground-muted",
                      )}
                    >
                      {new Date(m.ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="mb-3 flex justify-start">
                  <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-surface px-4 py-3">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground-muted"
                        style={{ animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AG Assistant…"
                className="ag-input flex-1"
              />
              <button
                type="submit"
                aria-label="Send"
                disabled={sending || !input.trim()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ag-green text-white disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
