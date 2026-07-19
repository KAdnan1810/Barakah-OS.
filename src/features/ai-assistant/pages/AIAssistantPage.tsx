import { useState, useRef, useEffect } from "react";
import { Sparkles, Send } from "lucide-react";
import { PageHeader } from "@components/shared/PageHeader";
import { Card, CardContent } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { useAppStore } from "@store/app-store";
import { askAssistant, SUGGESTED_QUESTIONS } from "@services/ai.service";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AIAssistantPage() {
  const store = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: "As-salamu alaykum! Ask me anything about your finances — spending, savings, goals, or a monthly summary." },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const reply = askAssistant(text, store);
    const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: reply };
    setMessages((m) => [...m, userMsg, assistantMsg]);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
      <PageHeader title="AI Assistant" description="Answers computed from your own data — nothing leaves your device in demo mode." />

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {m.role === "assistant" && (
                  <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                    <Sparkles className="h-3 w-3" /> Assistant
                  </span>
                )}
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </CardContent>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2"
          >
            <Input placeholder="Ask about your finances…" value={input} onChange={(e) => setInput(e.target.value)} />
            <Button type="submit" size="icon" aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
