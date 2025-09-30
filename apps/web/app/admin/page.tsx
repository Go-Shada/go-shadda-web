"use client";
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../../src/store/hooks';
import { API_URL } from '../../src/lib/api';
import { formatCurrency } from '../../src/lib/format';

export default function AdminDashboard() {
  const user = useAppSelector((s) => s.user.user);
  const auth = useAppSelector((s) => s.user);
  const token = auth.token;
  const [summary, setSummary] = useState<{ vendors: number; orders: number; gmv: number } | null>(null);
  const [series, setSeries] = useState<Array<{ date: string; orders: number; gmv: number }>>([]);
  const [range, setRange] = useState<'7d' | '30d' | '365d'>('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }
  if (user.role !== 'admin') {
    if (typeof window !== 'undefined') window.location.href = '/';
    return null;
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [sRes, tRes] = await Promise.all([
          fetch(`${API_URL}/admin/analytics/summary`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/admin/analytics/timeseries`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const sData = await sRes.json().catch(() => ({}));
        const tData = await tRes.json().catch(() => ([]));
        if (!sRes.ok) throw new Error(sData.message || 'Failed to load summary');
        if (!tRes.ok) throw new Error((tData as any).message || 'Failed to load timeseries');
        setSummary(sData);
        setSeries(Array.isArray(tData) ? tData : []);
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const filtered = useMemo(() => {
    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 365;
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - days + 1);
    return series.filter((pt) => new Date(pt.date) >= cutoff);
  }, [series, range]);

  const maxGMV = useMemo(() => Math.max(1, ...filtered.map((p) => Number(p.gmv) || 0)), [filtered]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Super Admin Dashboard</h1>
      <p className="text-gray-600">Manage vendors, oversee products and orders, and view analytics.</p>

      <div className="space-y-4">
        {loading ? (
          <div>Loading analytics…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Range:</span>
              <button className={`border rounded px-2 py-1 text-sm ${range==='7d'?'bg-gray-100':''}`} onClick={() => setRange('7d')}>7d</button>
              <button className={`border rounded px-2 py-1 text-sm ${range==='30d'?'bg-gray-100':''}`} onClick={() => setRange('30d')}>30d</button>
              <button className={`border rounded px-2 py-1 text-sm ${range==='365d'?'bg-gray-100':''}`} onClick={() => setRange('365d')}>1y</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded p-4">
                <div className="text-sm text-gray-600">Vendors</div>
                <div className="text-2xl font-semibold">{summary?.vendors ?? 0}</div>
              </div>
              <div className="border rounded p-4">
                <div className="text-sm text-gray-600">Orders</div>
                <div className="text-2xl font-semibold">{summary?.orders ?? 0}</div>
              </div>
              <div className="border rounded p-4">
                <div className="text-sm text-gray-600">GMV</div>
                <div className="text-2xl font-semibold">{formatCurrency(summary?.gmv ?? 0)}</div>
              </div>
            </div>

            <div className="border rounded p-4">
              <div className="font-medium mb-2">GMV over time</div>
              <div className="h-40 flex items-end gap-1">
                {filtered.map((pt) => {
                  const h = (Number(pt.gmv) / maxGMV) * 100;
                  return (
                    <div key={pt.date} className="bg-brand/60" style={{ height: `${h}%`, width: '10px' }} title={`${pt.date}: ${formatCurrency(Number(pt.gmv))}`}></div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/vendors" className="border rounded p-4 hover:shadow">
          <div className="font-medium">Vendors</div>
          <div className="text-sm text-gray-600">Create and manage vendor accounts.</div>
        </Link>
        <Link href="/admin/products" className="border rounded p-4 hover:shadow">
          <div className="font-medium">All Products</div>
          <div className="text-sm text-gray-600">Audit and moderate catalog.</div>
        </Link>
        <Link href="/admin/orders" className="border rounded p-4 hover:shadow">
          <div className="font-medium">All Orders</div>
          <div className="text-sm text-gray-600">Review marketplace orders.</div>
        </Link>
      </div>
    </div>
  );
}
