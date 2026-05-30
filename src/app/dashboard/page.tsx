"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Send, MessageSquare, FileText, ChevronRight } from "lucide-react";

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCitations, setShowCitations] = useState(false); // mobile drawer
  const answerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout, accessToken } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push("/login");
  }, [router]);

  useEffect(() => {
    if (answerRef.current) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight;
    }
  }, [answer]);

  // Auto-open citations drawer on mobile when citations arrive
  useEffect(() => {
    if (citations.length > 0) setShowCitations(true);
  }, [citations]);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setAnswer("");
    setCitations([]);
    setShowCitations(false);

    try {
      const response = await fetch("http://localhost:3000/rag/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ query }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace("data: ", ""));
            if (data.type === "citations") setCitations(data.chunks);
            if (data.type === "token") setAnswer((prev) => prev + data.text);
            if (data.type === "done") setLoading(false);
          } catch {}
        }
      }
    } catch (err) {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .dash-root {
          min-height: 100svh;
          background: #0a0a0b;
          font-family: 'DM Sans', sans-serif;
          color: #f5f0e8;
          display: flex;
          flex-direction: column;
        }

        /* ── Navbar ── */
        .dash-nav {
          height: 56px;
          border-bottom: 1px solid rgba(255,255,255,.07);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1rem;
          background: rgba(10,10,11,.8);
          backdrop-filter: blur(12px);
          position: sticky; top: 0; z-index: 20;
          flex-shrink: 0;
        }
        @media (min-width: 640px) { .dash-nav { padding: 0 1.5rem; } }

        .nav-brand {
          display: flex; align-items: center; gap: 8px;
          font-family: 'DM Serif Display', serif;
          font-size: 1.1rem; color: #f5f0e8; text-decoration: none;
          flex-shrink: 0;
        }
        .nav-icon {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #c4983a, #e8c06e);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-icon svg { color: #0a0a0b; width: 14px; height: 14px; }

        .nav-right { display: flex; align-items: center; gap: .5rem; }
        @media (min-width: 640px) { .nav-right { gap: 1rem; } }

        /* Hide email on mobile */
        .nav-email {
          font-size: .78rem; color: rgba(245,240,232,.5); font-weight: 300;
          display: none;
        }
        @media (min-width: 768px) { .nav-email { display: block; } }

        .nav-links { display: flex; gap: .1rem; }
        @media (min-width: 480px) { .nav-links { gap: .25rem; } }

        .nav-link-btn {
          padding: 5px 8px !important;
          border-radius: 7px !important;
          font-size: .75rem !important;
          color: rgba(245,240,232,.45) !important;
          background: none !important;
          border: none !important;
          height: auto !important;
          font-family: 'DM Sans', sans-serif !important;
          transition: background .18s, color .18s !important;
          text-decoration: none;
          display: inline-flex; align-items: center;
        }
        @media (min-width: 480px) {
          .nav-link-btn { padding: 6px 12px !important; font-size: .8rem !important; }
        }
        .nav-link-btn:hover {
          background: rgba(255,255,255,.06) !important;
          color: rgba(245,240,232,.8) !important;
        }
        .nav-link-btn.active {
          background: rgba(196,152,58,.12) !important;
          color: #c4983a !important;
        }

        .logout-btn {
          padding: 5px 10px !important;
          height: auto !important;
          font-size: .75rem !important;
          color: rgba(245,240,232,.4) !important;
          background: rgba(255,255,255,.04) !important;
          border: 1px solid rgba(255,255,255,.08) !important;
          border-radius: 7px !important;
          font-family: 'DM Sans', sans-serif !important;
          transition: all .18s !important;
          white-space: nowrap;
        }
        @media (min-width: 480px) {
          .logout-btn { padding: 6px 14px !important; font-size: .8rem !important; }
        }
        .logout-btn:hover {
          background: rgba(255,255,255,.08) !important;
          color: rgba(245,240,232,.7) !important;
        }

        /* ── Main layout ── */
        /* Mobile: stacked, Desktop: side-by-side */
        .dash-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          height: calc(100svh - 56px);
        }
        @media (min-width: 768px) {
          .dash-main {
            display: grid;
            grid-template-columns: 1fr 280px;
          }
        }
        @media (min-width: 1024px) {
          .dash-main { grid-template-columns: 1fr 320px; }
        }

        /* ── Chat panel ── */
        .chat-panel {
          display: flex; flex-direction: column;
          border-right: none;
          overflow: hidden;
          flex: 1;
          min-height: 0;
        }
        @media (min-width: 768px) {
          .chat-panel { border-right: 1px solid rgba(255,255,255,.07); }
        }

        .chat-messages {
          flex: 1; overflow-y: auto;
          padding: 1.25rem 1rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,.1) transparent;
        }
        @media (min-width: 480px) { .chat-messages { padding: 1.5rem 1.5rem; } }
        @media (min-width: 768px)  { .chat-messages { padding: 2rem 2.5rem; } }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 4px; }

        /* Empty state */
        .empty-state {
          height: 100%;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 12px; opacity: .4;
        }
        .empty-icon-wrap {
          width: 44px; height: 44px;
          border: 1.5px solid rgba(245,240,232,.2);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
        }
        @media (min-width: 480px) {
          .empty-icon-wrap { width: 48px; height: 48px; border-radius: 14px; }
        }
        .empty-icon-wrap svg { color: rgba(245,240,232,.5); width: 20px; height: 20px; }
        @media (min-width: 480px) { .empty-icon-wrap svg { width: 22px; height: 22px; } }
        .empty-text { font-size: .82rem; color: rgba(245,240,232,.6); text-align: center; }
        @media (min-width: 480px) { .empty-text { font-size: .88rem; } }

        /* Bubbles */
        .query-bubble { margin-bottom: 1.25rem; display: flex; justify-content: flex-end; }
        @media (min-width: 480px) { .query-bubble { margin-bottom: 1.5rem; } }
        .query-text {
          max-width: 85%;
          background: rgba(196,152,58,.12);
          border: 1px solid rgba(196,152,58,.2);
          border-radius: 12px 12px 2px 12px;
          padding: .65rem .875rem;
          font-size: .85rem; color: #f5f0e8; line-height: 1.5;
        }
        @media (min-width: 480px) {
          .query-text { max-width: 75%; padding: .75rem 1rem; font-size: .88rem; }
        }
        @media (min-width: 768px) { .query-text { max-width: 70%; } }

        .answer-bubble { margin-bottom: 1.5rem; }
        @media (min-width: 480px) { .answer-bubble { margin-bottom: 2rem; } }
        .answer-label {
          font-size: .68rem; font-weight: 500;
          letter-spacing: .08em; text-transform: uppercase;
          color: rgba(245,240,232,.25);
          margin-bottom: .5rem;
          display: flex; align-items: center; gap: 6px;
        }
        @media (min-width: 480px) { .answer-label { font-size: .7rem; margin-bottom: .6rem; } }
        .answer-dot {
          width: 6px; height: 6px; background: #c4983a; border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .answer-text {
          font-size: .875rem; line-height: 1.75;
          color: rgba(245,240,232,1); white-space: pre-wrap;
        }
        @media (min-width: 480px) { .answer-text { font-size: .9rem; } }
        .cursor {
          display: inline-block; width: 2px; height: 14px;
          background: #c4983a; margin-left: 2px; vertical-align: middle;
          animation: blink .8s step-end infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* ── Input area ── */
        .input-area {
          padding: .875rem 1rem 1rem;
          border-top: 1px solid rgba(255,255,255,.07);
          flex-shrink: 0;
        }
        @media (min-width: 480px) { .input-area { padding: 1rem 1.5rem 1.25rem; } }
        @media (min-width: 768px) { .input-area { padding: 1.25rem 2.5rem 1.5rem; } }

        .input-row { display: flex; gap: 8px; align-items: flex-end; }
        @media (min-width: 480px) { .input-row { gap: 10px; } }

        .query-textarea {
          flex: 1;
          background: rgba(255,255,255,.04) !important;
          border: 1px solid rgba(255,255,255,.09) !important;
          border-radius: 10px !important;
          color: #f5f0e8 !important;
          font-family: 'DM Sans', sans-serif !important;
          font-size: .85rem !important; font-weight: 300 !important;
          min-height: 44px !important; max-height: 120px !important;
          line-height: 1.5 !important; resize: none !important;
          transition: border-color .2s, box-shadow .2s !important;
        }
        @media (min-width: 480px) {
          .query-textarea { border-radius: 12px !important; font-size: .88rem !important; min-height: 48px !important; }
        }
        .query-textarea::placeholder { color: rgba(245,240,232,.2) !important; }
        .query-textarea:focus-visible {
          border-color: rgba(196,152,58,.4) !important;
          box-shadow: 0 0 0 3px rgba(196,152,58,.08) !important;
          outline: none !important;
        }
        .query-textarea:disabled { opacity: .5 !important; cursor: not-allowed !important; }

        .send-btn {
          width: 40px !important; height: 40px !important;
          background: linear-gradient(135deg, #c4983a, #d4a84a) !important;
          border: none !important; border-radius: 9px !important;
          display: flex !important; align-items: center !important; justify-content: center !important;
          flex-shrink: 0; padding: 0 !important;
          transition: transform .15s, box-shadow .2s, opacity .2s !important;
        }
        @media (min-width: 480px) {
          .send-btn { width: 44px !important; height: 44px !important; border-radius: 10px !important; }
        }
        .send-btn:hover:not(:disabled) {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 16px rgba(196,152,58,.3) !important;
        }
        .send-btn:disabled { opacity: .4 !important; cursor: not-allowed !important; }
        .send-btn svg { color: #0a0a0b; width: 15px; height: 15px; }
        @media (min-width: 480px) { .send-btn svg { width: 16px; height: 16px; } }

        .input-hint {
          font-size: .68rem; color: rgba(245,240,232,.15);
          margin-top: .4rem; font-weight: 300;
          display: none;
        }
        @media (min-width: 640px) {
          .input-hint { display: block; font-size: .72rem; color: rgba(245,240,232,.18); margin-top: .5rem; }
        }

        /* ── Mobile citations toggle bar ── */
        .citations-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: .625rem 1rem;
          border-top: 1px solid rgba(255,255,255,.07);
          background: rgba(255,255,255,.02);
          cursor: pointer;
          flex-shrink: 0;
          transition: background .18s;
        }
        .citations-toggle:hover { background: rgba(255,255,255,.04); }
        @media (min-width: 768px) { .citations-toggle { display: none; } }

        .citations-toggle-label {
          display: flex; align-items: center; gap: 8px;
          font-size: .75rem; font-weight: 500;
          letter-spacing: .08em; text-transform: uppercase;
          color: rgba(245,240,232,.35);
        }
        .citations-badge {
          background: rgba(196,152,58,.2);
          color: #c4983a;
          font-size: .65rem; font-weight: 600;
          padding: 1px 6px; border-radius: 10px;
        }
        .citations-chevron {
          color: rgba(245,240,232,.25);
          width: 15px; height: 15px;
          transition: transform .2s;
        }
        .citations-chevron.open { transform: rotate(90deg); }

        /* ── Mobile citations drawer ── */
        .citations-drawer {
          overflow: hidden;
          max-height: 0;
          transition: max-height .3s cubic-bezier(.22,1,.36,1);
          border-top: none;
          flex-shrink: 0;
        }
        .citations-drawer.open {
          max-height: 260px;
          border-top: 1px solid rgba(255,255,255,.05);
          overflow-y: auto;
        }
        @media (min-width: 768px) { .citations-drawer { display: none; } }

        .citations-drawer-inner { padding: 1rem; }

        /* ── Desktop citations panel ── */
        .citations-panel {
          display: none;
          overflow-y: auto; padding: 1.5rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,.1) transparent;
        }
        @media (min-width: 768px) { .citations-panel { display: block; } }
        .citations-panel::-webkit-scrollbar { width: 4px; }
        .citations-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 4px; }

        .citations-title {
          font-size: .7rem; font-weight: 500;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(245,240,232,.25); margin-bottom: 1rem;
        }

        /* Citation cards */
        .citation-card {
          background: rgba(255,255,255,.03) !important;
          border: 1px solid rgba(255,255,255,.07) !important;
          border-radius: 10px !important;
          margin-bottom: .75rem;
          transition: border-color .18s, background .18s !important;
          cursor: default;
        }
        .citation-card:hover {
          background: rgba(255,255,255,.05) !important;
          border-color: rgba(255,255,255,.12) !important;
        }
        .citation-num {
          display: inline-flex; align-items: center; justify-content: center;
          width: 18px; height: 18px;
          background: rgba(196,152,58,.15); border-radius: 5px;
          font-size: .68rem; font-weight: 600; color: #c4983a;
          margin-bottom: .5rem;
        }
        .citation-text {
          font-size: .78rem; color: rgba(245,240,232,.75);
          line-height: 1.55;
          display: -webkit-box; -webkit-line-clamp: 3;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .citation-score {
          font-size: .68rem; color: rgba(245,240,232,.2);
          margin-top: .4rem; font-weight: 300;
        }

        /* Empty citations */
        .empty-citations {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          height: 180px; gap: 8px; opacity: .3; text-align: center;
        }
        @media (min-width: 768px) { .empty-citations { height: 200px; } }
        .empty-citations svg { color: rgba(245,240,232,.4); width: 26px; height: 26px; }
        .empty-citations p { font-size: .75rem; color: rgba(245,240,232,.7); font-weight: 300; }
        @media (min-width: 768px) { .empty-citations svg { width: 28px; height: 28px; } .empty-citations p { font-size: .78rem; } }
      `}</style>

      <div className="dash-root">
        {/* Navbar */}
        <nav className="dash-nav">
          <a href="/dashboard" className="nav-brand">
            <div className="nav-icon">
              <Zap strokeWidth={2.5} />
            </div>
            ContextIQ
          </a>
          <div className="nav-right">
            <div className="nav-links">
              <a href="/dashboard" className="nav-link-btn active">Chat</a>
              <a href="/sources" className="nav-link-btn">Sources</a>
              <a href="/analytics" className="nav-link-btn">Analytics</a>
            </div>
            <span className="nav-email">{user?.email}</span>
            <Button className="logout-btn" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </nav>

        {/* Main */}
        <div className="dash-main">

          {/* Chat panel */}
          <div className="chat-panel">
            <div className="chat-messages" ref={answerRef}>
              {!answer && !loading && (
                <div className="empty-state">
                  <div className="empty-icon-wrap">
                    <MessageSquare strokeWidth={1.5} />
                  </div>
                  <p className="empty-text">Ask anything about your knowledge base</p>
                </div>
              )}

              {query && (
                <div className="query-bubble">
                  <div className="query-text">{query}</div>
                </div>
              )}

              {(answer || loading) && (
                <div className="answer-bubble">
                  <div className="answer-label">
                    {loading && <span className="answer-dot" />}
                    ContextIQ
                  </div>
                  <div className="answer-text">
                    {answer}
                    {loading && <span className="cursor" />}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile citations toggle */}
            <div
              className="citations-toggle"
              onClick={() => setShowCitations(!showCitations)}
            >
              <span className="citations-toggle-label">
                <FileText size={13} strokeWidth={1.8} />
                Sources
                {citations.length > 0 && (
                  <span className="citations-badge">{citations.length}</span>
                )}
              </span>
              <ChevronRight
                className={`citations-chevron ${showCitations ? "open" : ""}`}
                strokeWidth={1.8}
              />
            </div>

            {/* Mobile citations drawer */}
            <div className={`citations-drawer ${showCitations ? "open" : ""}`}>
              <div className="citations-drawer-inner">
                {citations.length === 0 ? (
                  <div className="empty-citations">
                    <FileText strokeWidth={1.5} />
                    <p>Sources will appear here after your first query</p>
                  </div>
                ) : (
                  citations.map((c, i) => (
                    <Card key={c.id} className="citation-card">
                      <CardContent className="p-3.5">
                        <div className="citation-num">{i + 1}</div>
                        <p className="citation-text">{c.content}</p>
                        <p className="citation-score">
                          Similarity: {(c.similarity * 100).toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Input area */}
            <div className="input-area">
              <form onSubmit={handleQuery}>
                <div className="input-row">
                  <Textarea
                    className="query-textarea"
                    placeholder="Ask a question about your knowledge base..."
                    value={query}
                    onChange={(e: any) => setQuery(e.target.value)}
                    onKeyDown={(e: any) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleQuery(e as any);
                      }
                    }}
                    rows={1}
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    className="send-btn"
                    disabled={loading || !query.trim()}
                  >
                    <Send strokeWidth={2.2} />
                  </Button>
                </div>
                <p className="input-hint">Press Enter to send · Shift+Enter for new line</p>
              </form>
            </div>
          </div>

          {/* Desktop citations panel */}
          <div className="citations-panel">
            <p className="citations-title">Sources</p>
            {citations.length === 0 ? (
              <div className="empty-citations">
                <FileText strokeWidth={1.5} />
                <p>Sources will appear here after your first query</p>
              </div>
            ) : (
              citations.map((c, i) => (
                <Card key={c.id} className="citation-card">
                  <CardContent className="p-3.5">
                    <div className="citation-num">{i + 1}</div>
                    <p className="citation-text">{c.content}</p>
                    <p className="citation-score">
                      Similarity: {(c.similarity * 100).toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

        </div>
      </div>
    </>
  );
}