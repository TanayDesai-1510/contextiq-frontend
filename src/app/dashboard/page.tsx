'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

export default function DashboardPage() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState('')
  const [citations, setCitations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const answerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, logout, accessToken } = useAuthStore()

  useEffect(() => {
    if (!accessToken) router.push('/login')
  }, [accessToken, router])

  useEffect(() => {
    if (answerRef.current) {
      answerRef.current.scrollTop = answerRef.current.scrollHeight
    }
  }, [answer])

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setAnswer('')
    setCitations([])

    try {
      const response = await fetch('http://localhost:3000/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ query }),
      })

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace('data: ', ''))
            if (data.type === 'citations') setCitations(data.chunks)
            if (data.type === 'token') setAnswer(prev => prev + data.text)
            if (data.type === 'done') setLoading(false)
          } catch {}
        }
      }
    } catch (err) {
      toast.error('Something went wrong')
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .dash-root {
          min-height: 100svh;
          background: #0a0a0b;
          font-family: 'DM Sans', sans-serif;
          color: #f5f0e8;
          display: flex;
          flex-direction: column;
        }

        /* Navbar */
        .navbar {
          height: 56px;
          border-bottom: 1px solid rgba(255,255,255,.07);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.5rem;
          background: rgba(10,10,11,.8);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'DM Serif Display', serif;
          font-size: 1.1rem;
          color: #f5f0e8;
          text-decoration: none;
        }
        .nav-icon {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #c4983a, #e8c06e);
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
        }
        .nav-icon svg {
          width: 14px; height: 14px;
          stroke: #0a0a0b; fill: none;
          stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;
        }
        .nav-right { display: flex; align-items: center; gap: 1rem; }
        .nav-email {
          font-size: .78rem;
          color: rgba(245,240,232,.5);
          font-weight: 300;
        }
        .nav-links { display: flex; gap: .25rem; }
        .nav-link {
          padding: 6px 12px;
          border-radius: 7px;
          font-size: .8rem;
          color: rgba(245,240,232,.45);
          text-decoration: none;
          transition: background .18s, color .18s;
          cursor: pointer;
          background: none; border: none;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-link:hover { background: rgba(255,255,255,.06); color: rgba(245,240,232,.8); }
        .nav-link.active { background: rgba(196,152,58,.12); color: #c4983a; }
        .logout-btn {
          padding: 6px 14px;
          border-radius: 7px;
          font-size: .8rem;
          color: rgba(245,240,232,.4);
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all .18s;
        }
        .logout-btn:hover { background: rgba(255,255,255,.08); color: rgba(245,240,232,.7); }

        /* Main layout */
        .main {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 0;
          height: calc(100svh - 56px);
          overflow: hidden;
        }

        /* Chat panel */
        .chat-panel {
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(255,255,255,.07);
          overflow: hidden;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 2rem 2.5rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,.1) transparent;
        }
        .chat-messages::-webkit-scrollbar { width: 4px; }
        .chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 4px; }

        .empty-state {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          opacity: .4;
        }
        .empty-icon {
          width: 48px; height: 48px;
          border: 1.5px solid rgba(245,240,232,.2);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
        }
        .empty-icon svg {
          width: 22px; height: 22px;
          stroke: rgba(245,240,232,.5); fill: none;
          stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round;
        }
        .empty-text { font-size: .88rem; color: rgba(245,240,232,.6); }

        .query-bubble {
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: flex-end;
        }
        .query-text {
          max-width: 70%;
          background: rgba(196,152,58,.12);
          border: 1px solid rgba(196,152,58,.2);
          border-radius: 12px 12px 2px 12px;
          padding: .75rem 1rem;
          font-size: .88rem;
          color: #f5f0e8;
          line-height: 1.5;
        }

        .answer-bubble {
          margin-bottom: 2rem;
        }
        .answer-label {
          font-size: .7rem;
          font-weight: 500;
          letter-spacing: .08em;
          text-transform: uppercase;
          color: rgba(245,240,232,.25);
          margin-bottom: .6rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .answer-dot {
          width: 6px; height: 6px;
          background: #c4983a;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .answer-text {
          font-size: .9rem;
          line-height: 1.75;
          color: rgba(245,240,232,1);
          white-space: pre-wrap;
        }
        .cursor {
          display: inline-block;
          width: 2px; height: 14px;
          background: #c4983a;
          margin-left: 2px;
          vertical-align: middle;
          animation: blink .8s step-end infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        /* Input area */
        .input-area {
          padding: 1.25rem 2.5rem 1.5rem;
          border-top: 1px solid rgba(255,255,255,.07);
        }
        .input-wrap {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }
        .query-input {
          flex: 1;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 12px;
          padding: .75rem 1rem;
          color: #f5f0e8;
          font-family: 'DM Sans', sans-serif;
          font-size: .88rem;
          font-weight: 300;
          outline: none;
          resize: none;
          min-height: 48px;
          max-height: 120px;
          line-height: 1.5;
          transition: border-color .2s, box-shadow .2s;
        }
        .query-input::placeholder { color: rgba(245,240,232,.2); }
        .query-input:focus {
          border-color: rgba(196,152,58,.4);
          box-shadow: 0 0 0 3px rgba(196,152,58,.08);
        }
        .send-btn {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #c4983a, #d4a84a);
          border: none; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: transform .15s, box-shadow .2s, opacity .2s;
          flex-shrink: 0;
        }
        .send-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(196,152,58,.3);
        }
        .send-btn:disabled { opacity: .4; cursor: not-allowed; }
        .send-btn svg {
          width: 16px; height: 16px;
          stroke: #0a0a0b; fill: none;
          stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round;
        }
        .input-hint {
          font-size: .72rem;
          color: rgba(245,240,232,.18);
          margin-top: .5rem;
          font-weight: 300;
        }

        /* Citations panel */
        .citations-panel {
          overflow-y: auto;
          padding: 1.5rem;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,.1) transparent;
        }
        .citations-panel::-webkit-scrollbar { width: 4px; }
        .citations-panel::-webkit-scrollbar-thumb { background: rgba(255,255,255,.1); border-radius: 4px; }

        .citations-title {
          font-size: .7rem;
          font-weight: 500;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: rgba(245,240,232,.25);
          margin-bottom: 1rem;
        }

        .citation-card {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 10px;
          padding: .875rem;
          margin-bottom: .75rem;
          transition: border-color .18s, background .18s;
          cursor: default;
        }
        .citation-card:hover {
          background: rgba(255,255,255,.05);
          border-color: rgba(255,255,255,.12);
        }
        .citation-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px; height: 18px;
          background: rgba(196,152,58,.15);
          border-radius: 5px;
          font-size: .68rem;
          font-weight: 600;
          color: #c4983a;
          margin-bottom: .5rem;
        }
        .citation-text {
          font-size: .78rem;
          color: rgba(245,240,232,.75);
          line-height: 1.55;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .citation-score {
          font-size: .68rem;
          color: rgba(245,240,232,.2);
          margin-top: .4rem;
          font-weight: 300;
        }

        .empty-citations {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          gap: 8px;
          opacity: .3;
          text-align: center;
        }
        .empty-citations svg {
          width: 28px; height: 28px;
          stroke: rgba(245,240,232,.4); fill: none;
          stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round;
        }
        .empty-citations p {
          font-size: .78rem;
          color: rgba(245,240,232,.7);
          font-weight: 300;
        }
      `}</style>

      <div className="dash-root">
        {/* Navbar */}
        <nav className="navbar">
          <a href="/dashboard" className="nav-brand">
            <div className="nav-icon">
              <svg viewBox="0 0 24 24">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            ContextIQ
          </a>
          <div className="nav-right">
            <div className="nav-links">
              <a href="/dashboard" className="nav-link active">Chat</a>
              <a href="/sources" className="nav-link">Sources</a>
              <a href="/analytics" className="nav-link">Analytics</a>
            </div>
            <span className="nav-email">{user?.email}</span>
            <button className="logout-btn" onClick={handleLogout}>Sign out</button>
          </div>
        </nav>

        {/* Main */}
        <div className="main">
          {/* Chat panel */}
          <div className="chat-panel">
            <div className="chat-messages" ref={answerRef}>
              {!answer && !loading && (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg viewBox="0 0 24 24">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
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

            <div className="input-area">
              <form onSubmit={handleQuery}>
                <div className="input-wrap">
                  <textarea
                    className="query-input"
                    placeholder="Ask a question about your knowledge base..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleQuery(e as any)
                      }
                    }}
                    rows={1}
                    disabled={loading}
                  />
                  <button type="submit" className="send-btn" disabled={loading || !query.trim()}>
                    <svg viewBox="0 0 24 24">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
                <p className="input-hint">Press Enter to send · Shift+Enter for new line</p>
              </form>
            </div>
          </div>

          {/* Citations panel */}
          <div className="citations-panel">
            <p className="citations-title">Sources</p>
            {citations.length === 0 ? (
              <div className="empty-citations">
                <svg viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <p>Sources will appear here after your first query</p>
              </div>
            ) : (
              citations.map((c, i) => (
                <div key={c.id} className="citation-card">
                  <div className="citation-num">{i + 1}</div>
                  <p className="citation-text">{c.content}</p>
                  <p className="citation-score">
                    Similarity: {(c.similarity * 100).toFixed(1)}%
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}