"use client";
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../../src/store/hooks';
import { API_URL } from '../../src/lib/api';
import { formatCurrency } from '../../src/lib/format';

export default function VendorDashboard() {
  const user = useAppSelector((s) => s.user.user);
  const auth = useAppSelector((s) => s.user);
  const token = auth.token;
  const [summary, setSummary] = useState<{ orders: number; revenue: number } | null>(null);
  const [series, setSeries] = useState<Array<{ date: string; orders: number; revenue: number }>>([]);
  const [range, setRange] = useState<'7d' | '30d' | '365d'>('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }
  if (user.role !== 'vendor') {
    if (typeof window !== 'undefined') window.location.href = '/';
    return null;
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [sRes, tRes] = await Promise.all([
          fetch(`${API_URL}/vendor/analytics/summary`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/vendor/analytics/timeseries`, { headers: { Authorization: `Bearer ${token}` } }),
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

  const maxRevenue = useMemo(() => Math.max(1, ...filtered.map((p) => Number(p.revenue) || 0)), [filtered]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Vendor Dashboard</h1>
      <p className="text-gray-600">Add products, manage stock, confirm orders, and view analytics.</p>

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
                <div className="text-sm text-gray-600">Orders</div>
                <div className="text-2xl font-semibold">{summary?.orders ?? 0}</div>
              </div>
              <div className="border rounded p-4">
                <div className="text-sm text-gray-600">Revenue</div>
                <div className="text-2xl font-semibold">{formatCurrency(summary?.revenue ?? 0)}</div>
              </div>
              <div className="border rounded p-4">
                <div className="text-sm text-gray-600">Days</div>
                <div className="text-2xl font-semibold">{filtered.length}</div>
              </div>
            </div>

            <div className="border rounded p-4">
              <div className="font-medium mb-2">Revenue over time</div>
              <div className="h-40 flex items-end gap-1">
                {filtered.map((pt) => {
                  const h = (Number(pt.revenue) / maxRevenue) * 100;
                  return (
                    <div key={pt.date} className="bg-brand/60" style={{ height: `${h}%`, width: '10px' }} title={`${pt.date}: ${formatCurrency(Number(pt.revenue))}`}></div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/vendor/products" className="border rounded p-4 hover:shadow">
          <div className="font-medium">My Products</div>
          <div className="text-sm text-gray-600">Create and manage your listings.</div>
        </Link>
        <Link href="/vendor/orders" className="border rounded p-4 hover:shadow">
          <div className="font-medium">Orders</div>
          <div className="text-sm text-gray-600">Receive and confirm customer orders.</div>
        </Link>
        <Link href="/vendor/inventory" className="border rounded p-4 hover:shadow">
          <div className="font-medium">Inventory</div>
          <div className="text-sm text-gray-600">Adjust stock levels (add/clear).</div>
        </Link>
      </div>
    </div>
  );
}
