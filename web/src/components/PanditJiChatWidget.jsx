import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, SendHorizontal, Sparkles, Trash2, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "./Button";
import { hindiContent } from "../lib/hindi";

const STORAGE_KEY = "digipandit_panditji_messages_v2";

const defaultMessages = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "नमस्ते। मैं पंडितजी हूँ। आप पूजा बुकिंग, ज्योतिष परामर्श, भुगतान, सामग्री आदेश या पंडित पंजीकरण के बारे में पूछ सकते हैं।",
  },
];

const quickPrompts = [
  "ज्योतिष परामर्श कैसे बुक करूँ?",
  "पूजा बुकिंग के चरण बताएँ",
  "पूजा सामग्री का आदेश कैसे दूँ?",
];

export function PanditJiChatWidget() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultMessages;
  });
  const scrollRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const canSend = useMemo(() => draft.trim().length > 0 && !loading, [draft, loading]);

  const sendMessage = async (input) => {
    const content = input?.trim();
    if (!content) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setLoading(true);

    try {
      const conversationHistory = [...messages, userMessage]
        .slice(-10)
        .map(({ role, content: messageContent }) => ({ role, content: messageContent }));
      const response = await api.post("/ai/panditji-chat", {
        message: content,
        history: conversationHistory,
        pathname,
      });
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: hindiContent(response.data.data.reply, "आपके प्रश्न का उत्तर अभी हिन्दी में उपलब्ध नहीं हो सका। कृपया प्रश्न सरल शब्दों में दोबारा पूछें।"),
        suggestions: (response.data.data.suggestions || []).map((item) => hindiContent(item, "अधिक जानकारी")),
        route: response.data.data.route,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "पंडितजी अभी व्यस्त हैं। कृपया थोड़ी देर बाद पुनः प्रयास करें।",
          suggestions: ["पूजा बुक करें", "ज्योतिष परामर्श", "पूजा सामग्री देखें"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages(defaultMessages);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      <button
        onClick={() => setOpen((value) => !value)}
        className="panditji-trigger fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-brand-maroon px-5 py-4 text-sm font-bold text-white shadow-soft hover:bg-brand-ink"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        PanditJi
      </button>

      {open ? (
        <div className="panditji-panel fixed bottom-24 right-5 z-50 flex h-[560px] w-[calc(100vw-2rem)] max-w-[380px] flex-col overflow-hidden rounded-[30px] border border-brand-sand bg-white shadow-soft">
          <div className="bg-brand-maroon p-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold">PanditJi</p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/75">आध्यात्मिक सहायक</p>
              </div>
              <button type="button" onClick={clearConversation} className="ml-auto rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white" aria-label="बातचीत साफ करें" title="बातचीत साफ करें">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-brand-cream/50 p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[90%] rounded-[24px] px-4 py-3 text-sm leading-7 ${
                  message.role === "user"
                    ? "ml-auto bg-brand-maroon text-white"
                    : "bg-white text-brand-ink shadow-soft"
                }`}
              >
                <p>{message.content}</p>
                {message.role === "assistant" && message.suggestions?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        className="rounded-full bg-brand-cream px-3 py-1 text-xs font-semibold text-brand-maroon"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                ) : null}
                {message.role === "assistant" && message.route ? (
                  <Link to={message.route} onClick={() => setOpen(false)} className="mt-3 inline-flex rounded-full border border-brand-gold/40 px-3 py-1 text-xs font-bold text-brand-maroon">
                    संबंधित पृष्ठ खोलें
                  </Link>
                ) : null}
              </div>
            ))}

            {loading ? (
              <div className="max-w-[85%] rounded-[24px] bg-white px-4 py-3 text-sm text-brand-ink shadow-soft">
                पंडितजी विचार कर रहे हैं...
              </div>
            ) : null}
          </div>

          <div className="border-t border-brand-sand bg-white p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-cream px-3 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-sand"
                >
                  <Sparkles className="h-3.5 w-3.5 text-brand-clay" />
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-3">
              <textarea
                rows={2}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    if (canSend) sendMessage(draft);
                  }
                }}
                placeholder="अपना प्रश्न लिखें—अनुष्ठान, मंत्र, समय या सामग्री"
                className="min-h-[52px] flex-1 resize-none rounded-[20px] border border-brand-sand px-4 py-3 text-sm outline-none focus:border-brand-clay"
              />
              <Button onClick={() => sendMessage(draft)} disabled={!canSend} className="h-[52px] w-[52px] rounded-2xl px-0">
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
