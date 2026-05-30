"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap } from "lucide-react";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
       strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export default function SourcesPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();
  const { logout } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) router.push("/login");
  }, [router]);

  const fetchSources = async () => {
    try {
      const { data } = await api.get("/sources");
      setSources(data);
    } catch {
      toast.error("Failed to fetch sources");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSources();
    const interval = setInterval(fetchSources, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/sources", { owner, repo, branch });
      toast.success("Source added! Ingestion started.");
      setOwner("");
      setRepo("");
      setBranch("main");
      fetchSources();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add source");
    } finally {
      setLoading(false);
    }
  };

  const statusStyles: Record<string, { color: string; bg: string }> = {
    idle:    { color: "rgba(245,240,232,.3)",  bg: "rgba(245,240,232,.06)" },
    running: { color: "#c4983a",               bg: "rgba(196,152,58,.12)"  },
    done:    { color: "#4ade80",               bg: "rgba(74,222,128,.12)"  },
    error:   { color: "#f87171",               bg: "rgba(248,113,113,.12)" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .sources-root {
          min-height: 100svh;
          background: #0a0a0b;
          font-family: 'DM Sans', sans-serif;
          color: #f5f0e8;
        }

        /* ── Navbar ── */
        .sources-nav {
          height: 56px;
          border-bottom: 1px solid rgba(255,255,255,.07);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1rem;
          background: rgba(10,10,11,.8);
          backdrop-filter: blur(12px);
          position: sticky; top: 0; z-index: 10;
        }
        @media (min-width: 640px) { .sources-nav { padding: 0 1.5rem; } }

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

        .nav-links { display: flex; gap: .1rem; }
        @media (min-width: 480px) { .nav-links { gap: .25rem; } }

        .nav-link-btn {
          padding: 5px 8px !important;
          border-radius: 7px !important;
          font-size: .75rem !important;
          color: rgba(245,240,232,.6) !important;
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
          color: rgba(245,240,232,.5) !important;
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
          color: rgba(245,240,232,.8) !important;
        }

        /* ── Page ── */
        .sources-page {
          max-width: 860px;
          margin: 0 auto;
          padding: 1.5rem 1rem;
        }
        @media (min-width: 480px) { .sources-page { padding: 2rem 1.25rem; } }
        @media (min-width: 640px) { .sources-page { padding: 2.5rem 1.5rem; } }

        .page-title {
          font-family: 'DM Serif Display', serif;
          font-size: 1.45rem; color: #f5f0e8; margin-bottom: .35rem;
        }
        @media (min-width: 480px) { .page-title { font-size: 1.75rem; margin-bottom: .4rem; } }

        .page-sub {
          font-size: .8rem; color: rgba(245,240,232,.4);
          font-weight: 300; margin-bottom: 1.5rem; line-height: 1.6;
        }
        @media (min-width: 480px) { .page-sub { font-size: .85rem; margin-bottom: 2rem; } }

        /* ── Add form card ── */
        .add-card {
          background: rgba(255,255,255,.03) !important;
          border: 1px solid rgba(255,255,255,.08) !important;
          border-radius: 12px !important;
          margin-bottom: 1.5rem;
        }
        @media (min-width: 480px) {
          .add-card { border-radius: 14px !important; margin-bottom: 2rem; }
        }

        .add-card-title {
          font-size: .68rem !important;
          font-weight: 500 !important;
          letter-spacing: .1em !important;
          text-transform: uppercase !important;
          color: rgba(245,240,232,.35) !important;
        }

        /* Form grid — stacked on mobile, 4-col on desktop */
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          align-items: end;
        }
        @media (min-width: 640px) {
          .form-row { grid-template-columns: 1fr 1fr 130px auto; }
        }

        /* Branch + button fill second row on mobile */
        .form-branch { grid-column: 1 / 2; }
        .form-submit { grid-column: 2 / 3; }
        @media (min-width: 640px) {
          .form-branch { grid-column: auto; }
          .form-submit { grid-column: auto; }
        }

        .sources-label {
          font-size: .7rem !important;
          font-weight: 500 !important;
          letter-spacing: .06em !important;
          text-transform: uppercase !important;
          color: rgba(245,240,232,.4) !important;
        }

        .sources-input {
          height: 40px !important;
          background: rgba(255,255,255,.04) !important;
          border: 1px solid rgba(255,255,255,.09) !important;
          border-radius: 9px !important;
          color: #f5f0e8 !important;
          font-size: .83rem !important;
          font-weight: 300 !important;
          font-family: 'DM Sans', sans-serif !important;
          transition: border-color .2s, box-shadow .2s !important;
        }
        @media (min-width: 480px) { .sources-input { height: 42px !important; font-size: .85rem !important; } }
        .sources-input::placeholder { color: rgba(245,240,232,.2) !important; }
        .sources-input:focus-visible {
          border-color: rgba(196,152,58,.45) !important;
          box-shadow: 0 0 0 3px rgba(196,152,58,.08) !important;
          outline: none !important;
        }

        .add-source-btn {
          height: 40px !important;
          width: 100% !important;
          padding: 0 16px !important;
          background: linear-gradient(135deg, #c4983a, #d4a84a) !important;
          border: none !important;
          border-radius: 9px !important;
          color: #0a0a0b !important;
          font-size: .83rem !important;
          font-weight: 600 !important;
          font-family: 'DM Sans', sans-serif !important;
          white-space: nowrap;
          transition: transform .15s, box-shadow .2s, opacity .2s !important;
        }
        @media (min-width: 480px) { .add-source-btn { height: 42px !important; font-size: .85rem !important; } }
        @media (min-width: 640px) { .add-source-btn { width: auto !important; padding: 0 20px !important; } }
        .add-source-btn:hover:not(:disabled) {
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 16px rgba(196,152,58,.3) !important;
        }
        .add-source-btn:disabled { opacity: .5 !important; cursor: not-allowed !important; }

        /* ── Source list cards ── */
        .source-card {
          background: rgba(255,255,255,.03) !important;
          border: 1px solid rgba(255,255,255,.07) !important;
          border-radius: 11px !important;
          transition: border-color .18s, background .18s !important;
        }
        @media (min-width: 480px) { .source-card { border-radius: 12px !important; } }
        .source-card:hover {
          background: rgba(255,255,255,.05) !important;
          border-color: rgba(255,255,255,.12) !important;
        }

        .source-icon-wrap {
          width: 34px; height: 34px;
          background: rgba(255,255,255,.05);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        @media (min-width: 480px) { .source-icon-wrap { width: 38px; height: 38px; border-radius: 9px; } }
        .source-icon-wrap svg { color: rgba(245,240,232,.5); }

        .source-name {
          font-size: .85rem; font-weight: 500; color: #f5f0e8;
          word-break: break-all;
        }
        @media (min-width: 480px) { .source-name { font-size: .92rem; word-break: normal; } }

        .source-meta {
          font-size: .72rem; color: rgba(245,240,232,.4);
          font-weight: 300; margin-top: 2px;
        }
        @media (min-width: 480px) { .source-meta { font-size: .75rem; } }

        .source-right { text-align: right; flex-shrink: 0; }
        .source-date {
          font-size: .68rem; color: rgba(245,240,232,.3);
          font-weight: 300; margin-top: 4px;
        }
        @media (min-width: 480px) { .source-date { font-size: .72rem; } }

        .status-badge {
          padding: 3px 8px !important;
          border-radius: 6px !important;
          font-size: .68rem !important;
          font-weight: 500 !important;
          letter-spacing: .04em !important;
          border: none !important;
          white-space: nowrap;
        }
        @media (min-width: 480px) {
          .status-badge { padding: 4px 10px !important; font-size: .72rem !important; }
        }

        .empty {
          text-align: center; padding: 3rem 0;
          color: rgba(245,240,232,.3); font-size: .85rem; font-weight: 300;
        }
        @media (min-width: 480px) { .empty { padding: 4rem 0; font-size: .88rem; } }
      `}</style>

      <div className="sources-root">
        {/* Navbar */}
        <nav className="sources-nav">
          <a href="/dashboard" className="nav-brand">
            <div className="nav-icon">
              <Zap strokeWidth={2.5} />
            </div>
            ContextIQ
          </a>
          <div className="nav-right">
            <div className="nav-links">
              <a href="/dashboard" className="nav-link-btn">Chat</a>
              <a href="/sources" className="nav-link-btn active">Sources</a>
              <a href="/analytics" className="nav-link-btn">Analytics</a>
            </div>
            <Button
              className="logout-btn"
              onClick={() => { logout(); router.push("/login"); }}
            >
              Sign out
            </Button>
          </div>
        </nav>

        <div className="sources-page">
          <h1 className="page-title">Knowledge Sources</h1>
          <p className="page-sub">
            Connect GitHub repositories to your knowledge base. READMEs are
            automatically ingested and indexed.
          </p>

          {/* Add source form */}
          <Card className="add-card">
            <CardHeader className="pb-2 pt-4 px-4 sm:pb-3 sm:pt-5 sm:px-5">
              <CardTitle className="add-card-title">Add GitHub Repository</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
              <form onSubmit={handleAddSource}>
                <div className="form-row">
                  <div className="space-y-1.5">
                    <Label htmlFor="owner" className="sources-label">Owner</Label>
                    <Input
                      id="owner"
                      className="sources-input"
                      placeholder="facebook"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="repo" className="sources-label">Repository</Label>
                    <Input
                      id="repo"
                      className="sources-input"
                      placeholder="react"
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5 form-branch">
                    <Label htmlFor="branch" className="sources-label">Branch</Label>
                    <Input
                      id="branch"
                      className="sources-input"
                      placeholder="main"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    />
                  </div>
                  <div className="form-submit flex flex-col justify-end">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="add-source-btn"
                    >
                      {loading
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : "Add source"
                      }
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Sources list */}
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {fetching ? (
              <p className="empty">Loading sources...</p>
            ) : sources.length === 0 ? (
              <p className="empty">No sources yet. Add your first GitHub repository above.</p>
            ) : (
              sources.map((source) => {
                const st = statusStyles[source.status] ?? statusStyles.idle;
                return (
                  <Card key={source.id} className="source-card">
                    <CardContent className="py-3 px-4 flex items-center justify-between gap-3 sm:py-4 sm:px-5">
                      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                        <div className="source-icon-wrap">
                          <GithubIcon />
                        </div>
                        <div className="min-w-0">
                          <p className="source-name">
                            {source.config.owner}/{source.config.repo}
                          </p>
                          <p className="source-meta">Branch: {source.config.branch}</p>
                        </div>
                      </div>
                      <div className="source-right">
                        <Badge
                          className="status-badge"
                          style={{ color: st.color, background: st.bg }}
                        >
                          {source.status === "running" ? "⟳ indexing..." : source.status}
                        </Badge>
                        <p className="source-date">
                          {source.lastSyncedAt
                            ? `Synced ${new Date(source.lastSyncedAt).toLocaleDateString()}`
                            : "Not yet synced"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}