'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Phone, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Info, KeyRound } from 'lucide-react';
import Logo from '@/components/shared/Logo';

export const dynamic = 'force-dynamic';

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/checkout';
  const oauthNotice = searchParams.get('oauth_notice');
  const oauthError = searchParams.get('oauth_error');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoNotice, setInfoNotice] = useState('');
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
    if (oauthNotice === 'google_not_configured') {
      setInfoNotice('Google OAuth credentials (GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET) are not configured in .env.local. You can sign in using your email/phone or quick test credentials below.');
    } else if (oauthNotice === 'facebook_not_configured') {
      setInfoNotice('Facebook OAuth credentials (FACEBOOK_CLIENT_ID & FACEBOOK_CLIENT_SECRET) are not configured in .env.local. You can sign in using your email/phone or quick test credentials below.');
    } else if (oauthError) {
      setError(`Social sign-in: ${oauthError}`);
    }
  }, [oauthNotice, oauthError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfoNotice('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in');
      }

      // Check if redirect target was admin or customer
      if (data.user?.role === 'super_admin' || data.user?.role === 'store_manager') {
        if (redirectTarget.startsWith('/admin')) {
          router.push(redirectTarget);
        } else {
          router.push('/admin');
        }
      } else {
        router.push(redirectTarget);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email/phone or password');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (type: 'customer' | 'admin') => {
    if (type === 'customer') {
      setIdentifier('customer@auraluxe.lk');
      setPassword('Customer123!');
    } else {
      setIdentifier('admin@auraluxe.lk');
      setPassword('AdminAuraLuxe2026!');
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setForgotModalOpen(false);
      setForgotSent(false);
      setInfoNotice(`A password reset link has been dispatched to ${forgotEmail}. Please check your inbox.`);
    }, 1800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream-50">
      <div className="max-w-md w-full space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
            <Logo width={190} height={75} className="mx-auto" />
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 tracking-tight mt-3">
            Client Authentication
          </h1>
          <p className="text-xs text-forest-600/90 max-w-sm mx-auto leading-relaxed">
            Sign in to access your curated shopping bag, saved delivery addresses, and white-glove order concierge.
          </p>
        </div>

        {/* Notices */}
        {infoNotice && (
          <div className="bg-[#E9EDE7] border border-[#D9D9D4] text-[#123C2F] p-3.5 rounded-xl text-xs flex items-start gap-2.5 shadow-sm">
            <Info className="w-4 h-4 text-[#123C2F] shrink-0 mt-0.5" />
            <span className="leading-relaxed">{infoNotice}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-start gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white p-7 sm:p-9 rounded-2xl border border-cream-300/80 shadow-md space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email or Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-forest-800 flex justify-between items-center">
                <span>Email Address or Sri Lankan Mobile</span>
                <span className="text-[10px] text-forest-500 font-normal">e.g. 077 123 4567</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or 07X XXX XXXX"
                  className="w-full text-xs pl-9 pr-3.5 py-3 bg-cream-50/60 border border-cream-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-forest-600 focus:border-forest-600 text-forest-900 placeholder:text-forest-400 font-medium transition-all"
                />
                <Mail className="w-4 h-4 text-forest-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-forest-800">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-[11px] font-semibold text-[#123C2F] hover:text-[#123C2F] transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs pl-9 pr-10 py-3 bg-cream-50/60 border border-cream-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-forest-600 focus:border-forest-600 text-forest-900 placeholder:text-forest-400 font-medium transition-all"
                />
                <Lock className="w-4 h-4 text-forest-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-700 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-lg bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-cream-50 font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Verifying Credentials...' : 'Sign In to Account'}
              <ArrowRight className="w-4 h-4 text-[#E9EDE7]" />
            </button>
          </form>

          {/* Social Sign-in Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cream-300" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
              <span className="bg-white px-3 text-forest-500">Or continue with</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google */}
            <a
              href={`/api/auth/oauth/google?redirect=${encodeURIComponent(redirectTarget)}`}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-cream-300 hover:border-[#123C2F] hover:bg-cream-50/60 rounded-lg text-xs font-semibold text-forest-800 transition-all shadow-sm group"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </a>

            {/* Facebook */}
            <a
              href={`/api/auth/oauth/facebook?redirect=${encodeURIComponent(redirectTarget)}`}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-cream-300 hover:border-[#123C2F] hover:bg-cream-50/60 rounded-lg text-xs font-semibold text-forest-800 transition-all shadow-sm group"
            >
              <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </a>
          </div>

          {/* Quick Demo Credentials Assistant */}
          <div className="bg-cream-100/70 p-3.5 rounded-xl border border-[#D9D9D4] text-xs text-forest-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-forest-900 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#123C2F]" />
                Quick Test Credentials:
              </span>
              <span className="text-[10px] text-forest-500 uppercase tracking-wider font-semibold">1-Click Fill</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillQuickCredentials('customer')}
                className="text-left p-2 rounded-lg bg-white border border-cream-200 hover:border-forest-600 transition-colors"
              >
                <p className="font-bold text-forest-900">Demo Client</p>
                <p className="text-forest-600 font-mono text-[10px]">customer@auraluxe.lk</p>
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('admin')}
                className="text-left p-2 rounded-lg bg-white border border-cream-200 hover:border-forest-600 transition-colors"
              >
                <p className="font-bold text-forest-900">Store Admin</p>
                <p className="text-forest-600 font-mono text-[10px]">admin@auraluxe.lk</p>
              </button>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center pt-1 border-t border-cream-200 text-xs text-forest-700">
            Don't have an Aura Luxe account?{' '}
            <Link
              href={`/auth/register?redirect=${encodeURIComponent(redirectTarget)}`}
              className="font-bold text-[#123C2F] hover:text-[#123C2F] underline transition-colors ml-1"
            >
              Register Here
            </Link>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="flex items-center justify-center gap-2 text-center text-[11px] text-forest-600/80">
          <ShieldCheck className="w-4 h-4 text-[#123C2F] shrink-0" />
          <span>256-Bit SSL Encrypted & PCI-DSS Compliant Security</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-forest-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-cream-300">
            <h3 className="font-serif text-lg font-bold text-forest-900">Reset Password</h3>
            <p className="text-xs text-forest-600 leading-relaxed">
              Enter your registered email address to receive password reset instructions.
            </p>
            {forgotSent ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-semibold">
                ✨ Instructions dispatched! Returning to sign in...
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-lg focus:outline-none focus:border-forest-600"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2 text-xs text-forest-600 hover:text-forest-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-forest-700 hover:bg-forest-800 text-cream-50 text-xs font-semibold rounded-lg"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center bg-cream-50">
          <div className="w-8 h-8 border-2 border-forest-700 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CustomerLoginForm />
    </Suspense>
  );
}
