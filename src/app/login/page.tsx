"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, Zap, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { login } = useAuthStore();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.user, data.accessToken);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .login-root {
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0b;
          font-family: 'DM Sans', sans-serif;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }

        /* Background */
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

        /* Card mount animation */
        .login-card-wrap {
          width: 100%; max-width: 400px;
          position: relative; z-index: 1;
          opacity: 0; transform: translateY(16px);
          transition: opacity .5s cubic-bezier(.22,1,.36,1),
                      transform .5s cubic-bezier(.22,1,.36,1);
        }
        .login-card-wrap.mounted { opacity: 1; transform: translateY(0); }

        /* Override shadcn Card for dark theme */
        .login-card {
          background: rgba(255,255,255,.04) !important;
          border: 1px solid rgba(255,255,255,.09) !important;
          border-radius: 16px !important;
          box-shadow: 0 24px 60px rgba(0,0,0,.5) !important;
          backdrop-filter: blur(12px) !important;
        }

        /* Brand block */
        .brand-block {
          display: flex; flex-direction: column;
          align-items: center; gap: 6px;
          margin-bottom: 1.5rem;
        }
        .brand-icon-wrap {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #c4983a, #e8c06e);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 4px;
        }
        .brand-icon-wrap svg { color: #0a0a0b; width: 20px; height: 20px; }
        .brand-wordmark {
          font-family: 'DM Serif Display', serif;
          font-size: 1.45rem; color: #f5f0e8; letter-spacing: -.02em;
        }
        .brand-tagline {
          font-size: .78rem; color: rgba(245,240,232,.3); font-weight: 300;
        }

        /* Card header text */
        .login-card-title {
          font-family: 'DM Serif Display', serif !important;
          font-size: 1.5rem !important;
          color: #f5f0e8 !important;
          letter-spacing: -.02em !important;
          font-weight: 400 !important;
        }
        .login-card-desc {
          font-size: .83rem !important;
          color: rgba(245,240,232,.35) !important;
          font-weight: 300 !important;
        }

        /* Label overrides */
        .login-label {
          font-size: .72rem !important;
          font-weight: 500 !important;
          color: rgba(245,240,232,.5) !important;
          letter-spacing: .07em !important;
          text-transform: uppercase !important;
        }

        /* Input wrapper with icon */
        .input-icon-wrap { position: relative; }
        .input-icon-wrap .field-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: rgba(245,240,232,.22); width: 15px; height: 15px;
          pointer-events: none; transition: color .2s;
        }
        .input-icon-wrap:focus-within .field-icon { color: #c4983a; }

        /* shadcn Input overrides */
        .login-input {
          padding-left: 38px !important;
          padding-right: 38px !important;
          height: 46px !important;
          background: rgba(255,255,255,.04) !important;
          border: 1px solid rgba(255,255,255,.09) !important;
          border-radius: 10px !important;
          color: #f5f0e8 !important;
          font-size: .875rem !important;
          font-weight: 300 !important;
          transition: border-color .2s, background .2s, box-shadow .2s !important;
        }
        .login-input::placeholder { color: rgba(245,240,232,.18) !important; }
        .login-input:hover {
          border-color: rgba(255,255,255,.15) !important;
          background: rgba(255,255,255,.055) !important;
        }
        .login-input:focus-visible {
          border-color: rgba(196,152,58,.55) !important;
          background: rgba(196,152,58,.035) !important;
          box-shadow: 0 0 0 3px rgba(196,152,58,.1) !important;
          outline: none !important;
          ring: none !important;
        }
        .login-input:-webkit-autofill,
        .login-input:-webkit-autofill:focus {
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

        /* Forgot link */
        .forgot-link {
          font-size: .72rem; color: rgba(245,240,232,.3);
          text-decoration: none; transition: color .18s;
        }
        .forgot-link:hover { color: #c4983a; }

        /* Submit button */
        .login-submit {
          width: 100%; height: 48px !important;
          background: linear-gradient(135deg, #c4983a 0%, #d4a84a 50%, #c4983a 100%) !important;
          background-size: 200% 100% !important;
          background-position: 0% !important;
          color: #0a0a0b !important;
          font-size: .88rem !important; font-weight: 600 !important;
          letter-spacing: .02em !important;
          border: none !important; border-radius: 10px !important;
          transition: background-position .4s, transform .15s,
                      box-shadow .2s, opacity .2s !important;
          position: relative; overflow: hidden;
        }
        .login-submit::after {
          content: ''; position: absolute; inset: 0;
          background: rgba(255,255,255,0); transition: background .2s;
        }
        .login-submit:hover:not(:disabled) {
          background-position: 100% !important;
          box-shadow: 0 4px 22px rgba(196,152,58,.3),
                      0 1px 4px rgba(196,152,58,.15) !important;
          transform: translateY(-1px) !important;
        }
        .login-submit:hover:not(:disabled)::after { background: rgba(255,255,255,.06); }
        .login-submit:active:not(:disabled) { transform: translateY(0) !important; }
        .login-submit:disabled { opacity: .58 !important; cursor: not-allowed !important; }

        /* Footer */
        .login-footer {
          text-align: center; margin-top: 1.25rem;
          font-size: .82rem; color: rgba(245,240,232,.28); font-weight: 300;
        }
        .login-footer a {
          color: #c4983a; text-decoration: none;
          font-weight: 500; transition: opacity .18s;
        }
        .login-footer a:hover { opacity: .72; }
      `}</style>

      <div className="login-root">
        <div className="bg-grid" />
        <div className="bg-glow" />

        <div className={`login-card-wrap ${mounted ? "mounted" : ""}`}>

          {/* Brand */}
          <div className="brand-block">
            <div className="brand-icon-wrap">
              <Zap strokeWidth={2.3} />
            </div>
            <span className="brand-wordmark">ContextIQ</span>
            <span className="brand-tagline">AI-powered knowledge base</span>
          </div>

          <Card className="login-card">
            <CardHeader className="pb-4 text-center">
              <CardTitle className="login-card-title">Welcome back</CardTitle>
              <CardDescription className="login-card-desc">
                Sign in to your workspace
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="login-label">Email</Label>
                  <div className="input-icon-wrap">
                    <Mail className="field-icon" strokeWidth={1.8} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      className="login-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="login-label">Password</Label>
                    <a href="/forgot-password" className="forgot-link">
                      Forgot password?
                    </a>
                  </div>
                  <div className="input-icon-wrap">
                    <Lock className="field-icon" strokeWidth={1.8} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                      className="login-input"
                    />
                    <button
                      type="button"
                      className="eye-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
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
                  className="login-submit"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              <p className="login-footer">
                Don't have an account?{" "}
                <a href="/register">Create one</a>
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}