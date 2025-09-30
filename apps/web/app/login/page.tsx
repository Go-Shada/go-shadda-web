"use client";
import { FormEvent, useState } from 'react';
import { api } from '../../src/lib/api';
import { useAppDispatch } from '../../src/store/hooks';
import { setUser } from '../../src/store/userSlice';
import { useRouter } from 'next/navigation';
import { useToast } from '../../src/components/Toaster';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Login failed' }));
        setError(data.message || 'Login failed');
        toast.push(data.message || 'Login failed', 'error');
        setLoading(false);
        return;
      }
      const data = await res.json();
      dispatch(setUser({ token: data.token, user: data.user }));
      // persist auth in localStorage for future navigations/refreshes
      try {
        localStorage.setItem('auth', JSON.stringify({ token: data.token, user: data.user }));
      } catch {}
      // Redirect based on role
      const role = data.user?.role;
      if (role === 'admin') router.push('/admin');
      else if (role === 'vendor') router.push('/vendor');
      else router.push('/customer');
    } catch (err: any) {
      setError(err.message || 'Network error');
      toast.push(err.message || 'Network error', 'error');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button disabled={loading} className="w-full bg-brand text-white py-2 rounded inline-flex items-center justify-center gap-2 disabled:opacity-60" type="submit">
          {loading && (
            <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
              <path className="opacity-75" d="M4 12a8 8 0 018-8" strokeWidth="4"></path>
            </svg>
          )}
          <span>Sign In</span>
        </button>
      </form>
      <div className="mt-3 text-sm text-gray-600">
        New here? <Link href="/signup" className="text-primary underline">Create an account</Link>
      </div>
    </div>
  );
}
