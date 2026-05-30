'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Eye, EyeOff, Mail, Lock, LayoutGrid, Zap, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { login } = useAuthStore()

  useEffect(() => { setMounted(true) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/register', { email, password, workspaceName })
      const { data } = await api.post('/auth/login', { email, password })
      login(data.user, data.accessToken)
      toast.success('Workspace created!')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .reg-root {
          min-height: 100svh;
          display: flex; align-items: center; justify-content: center;
          background: #0a0a0b;
          font-family: 'DM Sans', sans-serif;
          padding: 1rem;
          position: relative; overflow: hidden;
        }
        @media (min-width: 480px) { .reg-root { padding: 1.5rem; } }

        .bg-grid {
          position: fixed; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.022) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .bg-glow {
          position: fixed; top: -20%; right: -10%;
          width: 560px; height: 560px; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle, rgba(196,152,58,.07) 0%, transparent 65%);
        }

        /* Card wrap + mount animation */
        .reg-card-wrap {
          width: 100%; max-width: 92vw;
          position: relative; z-index: 1;
          opacity: 0; transform: translateY(16px);
          transition: opacity .5s cubic-bezier(.22,1,.36,1),
                      transform .5s cubic-bezier(.22,1,.36,1);
        }
        .reg-card-wrap.mounted { opacity: 1; transform: translateY(0); }
        @media (min-width: 400px) { .reg-card-wrap { max-width: 390px; } }
        @media (min-width: 640px) { .reg-card-wrap { max-width: 420px; } }

        /* shadcn Card override */
        .reg-card {
          background: rgba(255,255,255,.04) !important;
          border: 1px solid rgba(255,255,255,.09) !important;
          border-radius: 14px !important;
          box-shadow: 0 24px 60px rgba(0,0,0,.5) !important;
          backdrop-filter: blur(12px) !important;
        }
        @media (min-width: 480px) { .reg-card { border-radius: 16px !important; } }

        /* Brand */
        .brand-block {
          display: flex; flex-direction: column;
          align-items: center; gap: 5px;
          margin-bottom: 1.25rem;
        }
        @media (min-width: 480px) { .brand-block { gap: 6px; margin-bottom: 1.5rem; } }

        .brand-icon-wrap {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #c4983a, #e8c06e);
          border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 3px;
        }
        .brand-icon-wrap svg { color: #0a0a0b; width: 18px; height: 18px; }
        @media (min-width: 480px) {
          .brand-icon-wrap { width: 44px; height: 44px; border-radius: 12px; margin-bottom: 4px; }
          .brand-icon-wrap svg { width: 20px; height: 20px; }
        }

        .brand-wordmark {
          font-family: 'DM Serif Display', serif;
          font-size: 1.3rem; color: #f5f0e8; letter-spacing: -.02em;
        }
        @media (min-width: 480px) { .brand-wordmark { font-size: 1.45rem; } }

        .brand-tagline {
          font-size: .74rem; color: rgba(245,240,232,.3); font-weight: 300;
        }
        @media (min-width: 480px) { .brand-tagline { font-size: .78rem; } }

        /* Card header */
        .reg-card-title {
          font-family: 'DM Serif Display', serif !important;
          font-size: 1.35rem !important;
          color: #f5f0e8 !important;
          letter-spacing: -.02em !important;
          font-weight: 400 !important;
        }
        @media (min-width: 480px) { .reg-card-title { font-size: 1.5rem !important; } }

        .reg-card-desc {
          font-size: .8rem !important;
          color: rgba(245,240,232,.35) !important;
          font-weight: 300 !important;
        }
        @media (min-width: 480px) { .reg-card-desc { font-size: .83rem !important; } }

        /* Labels */
        .reg-label {
          font-size: .7rem !important;
          font-weight: 500 !important;
          color: rgba(245,240,232,.5) !important;
          letter-spacing: .07em !important;
          text-transform: uppercase !important;
        }

        /* Input with icon */
        .input-icon-wrap { position: relative; }
        .input-icon-wrap .field-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: rgba(245,240,232,.22); width: 15px; height: 15px;
          pointer-events: none; transition: color .2s;
        }
        .input-icon-wrap:focus-within .field-icon { color: #c4983a; }

        .reg-input {
          padding-left: 38px !important;
          padding-right: 38px !important;
          height: 44px !important;
          background: rgba(255,255,255,.04) !important;
          border: 1px solid rgba(255,255,255,.09) !important;
          border-radius: 10px !important;
          color: #f5f0e8 !important;
          font-size: .875rem !important; font-weight: 300 !important;
          transition: border-color .2s, background .2s, box-shadow .2s !important;
        }
        @media (min-width: 480px) { .reg-input { height: 46px !important; } }

        .reg-input::placeholder { color: rgba(245,240,232,.18) !important; }
        .reg-input:hover {
          border-color: rgba(255,255,255,.15) !important;
          background: rgba(255,255,255,.055) !important;
        }
        .reg-input:focus-visible {
          border-color: rgba(196,152,58,.55) !important;
          background: rgba(196,152,58,.035) !important;
          box-shadow: 0 0 0 3px rgba(196,152,58,.1) !important;
          outline: none !important;
        }
        .reg-input:-webkit-autofill,
        .reg-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #111110 inset !important;
          -webkit-text-fill-color: #f5f0e8 !important;
        }

        /* Eye toggle */
        .eye-toggle {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; padding: 4px; cursor: pointer;
          color: rgba(245,240,232,.22); display: flex; align-items: center;
          border-radius: 4px; transition: color .18s;
        }
        .eye-toggle:hover { color: rgba(245,240,232,.55); }
        .eye-toggle svg { width: 15px; height: 15px; }

        /* Submit */
        .reg-submit {
          width: 100%; height: 44px !important;
          background: linear-gradient(135deg, #c4983a 0%, #d4a84a 50%, #c4983a 100%) !important;
          background-size: 200% 100% !important; background-position: 0% !important;
          color: #0a0a0b !important;
          font-size: .875rem !important; font-weight: 600 !important;
          letter-spacing: .02em !important;
          border: none !important; border-radius: 10px !important;
          transition: background-position .4s, transform .15s, box-shadow .2s, opacity .2s !important;
          position: relative; overflow: hidden;
        }
        @media (min-width: 480px) { .reg-submit { height: 48px !important; } }

        .reg-submit::after {
          content: ''; position: absolute; inset: 0;
          background: rgba(255,255,255,0); transition: background .2s;
        }
        .reg-submit:hover:not(:disabled) {
          background-position: 100% !important;
          box-shadow: 0 4px 22px rgba(196,152,58,.3), 0 1px 4px rgba(196,152,58,.15) !important;
          transform: translateY(-1px) !important;
        }
        .reg-submit:hover:not(:disabled)::after { background: rgba(255,255,255,.06); }
        .reg-submit:active:not(:disabled) { transform: translateY(0) !important; }
        .reg-submit:disabled { opacity: .58 !important; cursor: not-allowed !important; }

        /* Footer */
        .reg-footer {
          text-align: center; margin-top: 1.1rem;
          font-size: .8rem; color: rgba(245,240,232,.28); font-weight: 300;
        }
        @media (min-width: 480px) { .reg-footer { margin-top: 1.25rem; font-size: .82rem; } }
        .reg-footer a {
          color: #c4983a; text-decoration: none;
          font-weight: 500; transition: opacity .18s;
        }
        .reg-footer a:hover { opacity: .72; }
      `}</style>

      <div className="reg-root">
        <div className="bg-grid" />
        <div className="bg-glow" />

        <div className={`reg-card-wrap ${mounted ? 'mounted' : ''}`}>

          {/* Brand */}
          <div className="brand-block">
            <div className="brand-icon-wrap">
              <Zap strokeWidth={2.3} />
            </div>
            <span className="brand-wordmark">ContextIQ</span>
            <span className="brand-tagline">AI-powered knowledge base</span>
          </div>

          <Card className="reg-card">
            <CardHeader className="pb-3 pt-5 px-5 text-center sm:pb-4 sm:pt-6 sm:px-6">
              <CardTitle className="reg-card-title">Create workspace</CardTitle>
              <CardDescription className="reg-card-desc">
                Start building your knowledge base
              </CardDescription>
            </CardHeader>

            <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">

                {/* Workspace name */}
                <div className="space-y-1.5">
                  <Label htmlFor="workspace" className="reg-label">Workspace name</Label>
                  <div className="input-icon-wrap">
                    <LayoutGrid className="field-icon" strokeWidth={1.8} />
                    <Input
                      id="workspace"
                      type="text"
                      placeholder="My Engineering Team"
                      value={workspaceName}
                      onChange={e => setWorkspaceName(e.target.value)}
                      required
                      className="reg-input"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="reg-label">Email</Label>
                  <div className="input-icon-wrap">
                    <Mail className="field-icon" strokeWidth={1.8} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      className="reg-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="reg-label">Password</Label>
                  <div className="input-icon-wrap">
                    <Lock className="field-icon" strokeWidth={1.8} />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                      className="reg-input"
                    />
                    <button
                      type="button"
                      className="eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword
                        ? <EyeOff strokeWidth={1.8} />
                        : <Eye strokeWidth={1.8} />
                      }
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="reg-submit"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating workspace…
                    </>
                  ) : (
                    'Create workspace'
                  )}
                </Button>
              </form>

              <p className="reg-footer">
                Already have an account?{' '}
                <a href="/login">Sign in</a>
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  )
}