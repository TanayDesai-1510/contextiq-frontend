'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap } from 'lucide-react'

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [cache, setCache] = useState<any[]>([])
  const [gaps, setGaps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { logout } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) router.push('/login')
  }, [router])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, cacheRes, gapsRes] = await Promise.all([
          api.get('/analytics/stats'),
          api.get('/analytics/cache'),
          api.get('/analytics/gaps'),
        ])
        setStats(statsRes.data)
        setCache(cacheRes.data)
        setGaps(gapsRes.data)
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const totalQueries = stats?.totalQueries ?? 0
  const cacheHits = cache.find(c => c.cacheHit !== 'miss')?.count ?? 0
  const hitRate = totalQueries > 0 ? Math.round((cacheHits / totalQueries) * 100) : 0

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .analytics-root {
          min-height: 100svh;
          background: #0a0a0b;
          font-family: 'DM Sans', sans-serif;
          color: #f5f0e8;
        }

        /* ── Navbar ── */
        .analytics-nav {
          height: 56px;
          border-bottom: 1px solid rgba(255,255,255,.07);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 1rem;
          background: rgba(10,10,11,.8);
          backdrop-filter: blur(12px);
          position: sticky; top: 0; z-index: 10;
        }
        @media (min-width: 640px) { .analytics-nav { padding: 0 1.5rem; } }

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
        .analytics-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 1.5rem 1rem;
        }
        @media (min-width: 480px) { .analytics-page { padding: 2rem 1.25rem; } }
        @media (min-width: 640px) { .analytics-page { padding: 2.5rem 1.5rem; } }

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

        /* ── Stat cards ── */
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: .75rem;
          margin-bottom: 1.5rem;
        }
        @media (min-width: 480px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem; }
        }

        .stat-card {
          background: rgba(255,255,255,.03) !important;
          border: 1px solid rgba(255,255,255,.07) !important;
          border-radius: 12px !important;
        }
        @media (min-width: 480px) { .stat-card { border-radius: 14px !important; } }

        /* On mobile: stat cards are horizontal */
        .stat-card-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.25rem;
        }
        @media (min-width: 480px) {
          .stat-card-inner { display: block; padding: 1.5rem; }
        }

        .stat-label {
          font-size: .68rem; font-weight: 500;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(245,240,232,.35);
          margin-bottom: 0;
        }
        @media (min-width: 480px) { .stat-label { font-size: .7rem; margin-bottom: .75rem; } }

        .stat-right { text-align: right; }
        @media (min-width: 480px) { .stat-right { text-align: left; } }

        .stat-value {
          font-family: 'DM Serif Display', serif;
          font-size: 1.75rem; color: #f5f0e8; line-height: 1;
        }
        @media (min-width: 480px) { .stat-value { font-size: 2.5rem; } }

        .stat-sub {
          font-size: .7rem; color: rgba(245,240,232,.3);
          font-weight: 300; margin-top: .25rem;
        }
        @media (min-width: 480px) { .stat-sub { font-size: .75rem; margin-top: .4rem; } }

        /* ── Sections ── */
        .section { margin-bottom: 1.5rem; }
        @media (min-width: 480px) { .section { margin-bottom: 2rem; } }

        .section-title {
          font-size: .68rem; font-weight: 500;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(245,240,232,.35); margin-bottom: .75rem;
        }
        @media (min-width: 480px) { .section-title { font-size: .7rem; margin-bottom: 1rem; } }

        /* Query rows */
        .query-card {
          background: rgba(255,255,255,.03) !important;
          border: 1px solid rgba(255,255,255,.07) !important;
          border-radius: 10px !important;
          margin-bottom: .5rem;
          transition: background .18s !important;
          cursor: default;
        }
        .query-card:hover { background: rgba(255,255,255,.05) !important; }

        .query-row-inner {
          display: flex; align-items: center;
          justify-content: space-between; gap: .75rem;
        }
        .query-text {
          font-size: .85rem; color: rgba(245,240,232,.85);
          line-height: 1.4; flex: 1; min-width: 0;
          word-break: break-word;
        }
        @media (min-width: 480px) { .query-text { font-size: .88rem; } }

        .query-count {
          font-size: .72rem; color: #c4983a; font-weight: 500;
          background: rgba(196,152,58,.1);
          padding: 3px 8px; border-radius: 5px;
          white-space: nowrap; flex-shrink: 0;
        }
        @media (min-width: 480px) { .query-count { font-size: .78rem; } }

        /* Cache rows */
        .cache-card {
          background: rgba(255,255,255,.03) !important;
          border: 1px solid rgba(255,255,255,.07) !important;
          border-radius: 10px !important;
          margin-bottom: .5rem;
        }
        .cache-row-inner {
          display: flex; align-items: center; gap: 10px;
        }
        @media (min-width: 480px) { .cache-row-inner { gap: 12px; } }

        .cache-type {
          font-size: .82rem; color: rgba(245,240,232,.8);
          flex: 0 0 60px; text-transform: capitalize;
        }
        @media (min-width: 480px) { .cache-type { font-size: .85rem; flex: 0 0 80px; } }

        .cache-bar-wrap {
          flex: 1; height: 5px;
          background: rgba(255,255,255,.06);
          border-radius: 3px; overflow: hidden;
        }
        @media (min-width: 480px) { .cache-bar-wrap { height: 6px; } }

        .cache-bar {
          height: 100%; border-radius: 3px;
          background: linear-gradient(90deg, #c4983a, #e8c06e);
          transition: width .4s ease;
        }
        .cache-count {
          font-size: .75rem; color: rgba(245,240,232,.4);
          min-width: 24px; text-align: right; flex-shrink: 0;
        }
        @media (min-width: 480px) { .cache-count { font-size: .78rem; min-width: 30px; } }

        /* Gap rows */
        .gap-card {
          background: rgba(255,255,255,.03) !important;
          border: 1px solid rgba(255,255,255,.07) !important;
          border-radius: 10px !important;
          margin-bottom: .5rem;
        }
        .gap-text {
          font-size: .85rem; color: rgba(245,240,232,.75);
          line-height: 1.4; word-break: break-word;
        }
        @media (min-width: 480px) { .gap-text { font-size: .88rem; } }

        .gap-date {
          font-size: .68rem; color: rgba(245,240,232,.25);
          margin-top: 3px; font-weight: 300;
        }
        @media (min-width: 480px) { .gap-date { font-size: .72rem; } }

        .empty {
          font-size: .8rem; color: rgba(245,240,232,.25);
          font-weight: 300; padding: .75rem 0;
        }
        @media (min-width: 480px) { .empty { font-size: .82rem; padding: 1rem 0; } }

        .loading-text {
          font-size: .85rem; color: rgba(245,240,232,.3); font-weight: 300;
        }
      `}</style>

      <div className="analytics-root">
        {/* Navbar */}
        <nav className="analytics-nav">
          <a href="/dashboard" className="nav-brand">
            <div className="nav-icon">
              <Zap strokeWidth={2.5} />
            </div>
            ContextIQ
          </a>
          <div className="nav-right">
            <div className="nav-links">
              <a href="/dashboard" className="nav-link-btn">Chat</a>
              <a href="/sources" className="nav-link-btn">Sources</a>
              <a href="/analytics" className="nav-link-btn active">Analytics</a>
            </div>
            <Button
              className="logout-btn"
              onClick={() => { logout(); router.push('/login') }}
            >
              Sign out
            </Button>
          </div>
        </nav>

        <div className="analytics-page">
          <h1 className="page-title">Analytics</h1>
          <p className="page-sub">
            Query performance, cache efficiency, and knowledge gaps across your workspace.
          </p>

          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : (
            <>
              {/* Stat cards */}
              <div className="stats-grid">
                {[
                  { label: 'Total queries',    value: totalQueries, sub: 'All time' },
                  { label: 'Cache hit rate',   value: `${hitRate}%`, sub: 'Semantic + exact hits' },
                  { label: 'Knowledge gaps',   value: gaps.length,  sub: 'Unanswered queries' },
                ].map((s) => (
                  <Card key={s.label} className="stat-card">
                    <CardContent className="p-0">
                      <div className="stat-card-inner">
                        <p className="stat-label">{s.label}</p>
                        <div className="stat-right">
                          <p className="stat-value">{s.value}</p>
                          <p className="stat-sub">{s.sub}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Top queries */}
              <div className="section">
                <p className="section-title">Top queries</p>
                {!stats?.topQueries?.length ? (
                  <p className="empty">No queries yet.</p>
                ) : (
                  stats.topQueries.map((q: any, i: number) => (
                    <Card key={i} className="query-card">
                      <CardContent className="py-3 px-3.5 sm:py-[0.875rem] sm:px-4">
                        <div className="query-row-inner">
                          <span className="query-text">{q.queryText}</span>
                          <span className="query-count">{q.count}×</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Cache breakdown */}
              <div className="section">
                <p className="section-title">Cache breakdown</p>
                {!cache.length ? (
                  <p className="empty">No data yet.</p>
                ) : (
                  cache.map((c, i) => (
                    <Card key={i} className="cache-card">
                      <CardContent className="py-3 px-3.5 sm:py-[0.875rem] sm:px-4">
                        <div className="cache-row-inner">
                          <span className="cache-type">{c.cacheHit}</span>
                          <div className="cache-bar-wrap">
                            <div
                              className="cache-bar"
                              style={{ width: `${Math.round((c.count / totalQueries) * 100)}%` }}
                            />
                          </div>
                          <span className="cache-count">{c.count}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Knowledge gaps */}
              <div className="section">
                <p className="section-title">Knowledge gaps</p>
                {!gaps.length ? (
                  <p className="empty">No gaps detected — your knowledge base is covering all queries.</p>
                ) : (
                  gaps.map((g, i) => (
                    <Card key={i} className="gap-card">
                      <CardContent className="py-3 px-3.5 sm:py-[0.875rem] sm:px-4">
                        <p className="gap-text">{g.queryText}</p>
                        <p className="gap-date">{new Date(g.createdAt).toLocaleDateString()}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}