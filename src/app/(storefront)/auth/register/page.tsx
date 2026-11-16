'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, User, Phone, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import Logo from '@/components/shared/Logo';

export const dynamic = 'force-dynamic';

function CustomerRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/checkout';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      router.push(redirectTarget);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cream-50">
      <div className="max-w-md w-full space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block transition-transform hover:scale-[1.02]">
            <Logo width={190} height={75} className="mx-auto" />
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-forest-900 tracking-tight mt-3">
            Create Client Account
          </h1>
          <p className="text-xs text-forest-600/90 max-w-sm mx-auto leading-relaxed">
            Join the Aura Luxe Home circle to save bespoke architectural furniture, receive islandwide concierge delivery, and access private collections.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs flex items-start gap-2.5 shadow-sm">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white p-7 sm:p-9 rounded-2xl border border-cream-300/80 shadow-md space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-forest-800 block">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ruwan Jayawardena"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-cream-50/60 border border-cream-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-forest-600 focus:border-forest-600 text-forest-900 placeholder:text-forest-400 font-medium"
                />
                <User className="w-4 h-4 text-forest-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-forest-800 block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-cream-50/60 border border-cream-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-forest-600 focus:border-forest-600 text-forest-900 placeholder:text-forest-400 font-medium"
                />
                <Mail className="w-4 h-4 text-forest-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Sri Lanka Mobile */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-forest-800 block">Sri Lankan Mobile Phone</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="077 123 4567 or +94 77 123 4567"
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-cream-50/60 border border-cream-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-forest-600 focus:border-forest-600 text-forest-900 placeholder:text-forest-400 font-medium"
                />
                <Phone className="w-4 h-4 text-forest-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-forest-800 block">Password (min. 8 characters)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs pl-9 pr-10 py-2.5 bg-cream-50/60 border border-cream-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-forest-600 focus:border-forest-600 text-forest-900 placeholder:text-forest-400 font-medium"
                />
                <Lock className="w-4 h-4 text-forest-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-forest-800 block">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs pl-9 pr-10 py-2.5 bg-cream-50/60 border border-cream-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-forest-600 focus:border-forest-600 text-forest-900 placeholder:text-forest-400 font-medium"
                />
                <Lock className="w-4 h-4 text-forest-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-lg bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-cream-50 font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4 text-gold-300" />
            </button>
          </form>

          {/* Social Sign-in Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cream-300" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
              <span className="bg-white px-3 text-forest-500">Or register with</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`/api/auth/oauth/google?redirect=${encodeURIComponent(redirectTarget)}`}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-cream-300 hover:border-gold-400/80 hover:bg-cream-50/60 rounded-lg text-xs font-semibold text-forest-800 transition-all shadow-sm"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </a>

            <a
              href={`/api/auth/oauth/facebook?redirect=${encodeURIComponent(redirectTarget)}`}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white border border-cream-300 hover:border-gold-400/80 hover:bg-cream-50/60 rounded-lg text-xs font-semibold text-forest-800 transition-all shadow-sm"
            >
              <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </a>
          </div>

          {/* Login Link */}
          <div className="text-center pt-1 border-t border-cream-200 text-xs text-forest-700">
            Already have an account?{' '}
            <Link
              href={`/auth/login?redirect=${encodeURIComponent(redirectTarget)}`}
              className="font-bold text-gold-600 hover:text-gold-700 underline transition-colors ml-1"
            >
              Sign In Here
            </Link>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="flex items-center justify-center gap-2 text-center text-[11px] text-forest-600/80">
          <ShieldCheck className="w-4 h-4 text-gold-500 shrink-0" />
          <span>Your personal data is encrypted and strictly confidential.</span>
        </div>
      </div>
    </div>
  );
}

export default function CustomerRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center bg-cream-50">
          <div className="w-8 h-8 border-2 border-forest-700 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CustomerRegisterForm />
    </Suspense>
  );
}
