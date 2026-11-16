'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import Logo from '@/components/shared/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@auraluxe.lk');
  const [password, setPassword] = useState('AdminAuraLuxe2026!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-forest-900 px-4 py-12">
      <div className="max-w-md w-full bg-cream-50 rounded-2xl p-8 border border-gold-400/40 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="bg-cream-100 p-3 rounded-xl inline-block border border-gold-300">
            <Logo width={180} height={70} />
          </div>
          <h1 className="font-serif text-2xl font-bold text-forest-900 mt-2">
            Secure Admin Management Portal
          </h1>
          <p className="text-xs text-forest-600">
            Authorized personnel only. Role-based access control enabled.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-forest-700 block">Admin Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-white border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
              />
              <Mail className="w-4 h-4 text-forest-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-forest-700 block">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-white border border-cream-300 rounded focus:outline-none focus:border-forest-600 text-forest-900"
              />
              <Lock className="w-4 h-4 text-forest-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-md bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-cream-50 font-serif font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading ? 'Verifying Credentials...' : 'Authenticate & Enter Dashboard'}
            <ArrowRight className="w-4 h-4 text-gold-300" />
          </button>
        </form>

        <div className="flex items-center gap-2 text-[11px] text-forest-600/80 justify-center pt-2 border-t border-cream-200">
          <ShieldCheck className="w-4 h-4 text-gold-500" />
          <span>MongoDB Atlas Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}

