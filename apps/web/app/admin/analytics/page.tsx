"use client";
import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../../../src/store/hooks';
import { API_URL } from '../../../src/lib/api';
import { formatCurrency } from '../../../src/lib/format';

export default function AdminAnalyticsPage() {
  const auth = useAppSelector((s) => s.user);
  const token = auth.token;
  const [summary, setSummary] = useState<{ vendors: number; orders: number; gmv: number } | null>(null);
  const [series, setSeries] = useState<Array<{ date: string; orders: number; gmv: number }>>([]);
  const [top, setTop] = useState<{ topVendors: Array<{ vendorId: string; storeName?: string; gmv: number; orders: number }>; topProducts: Array<{ productId: string; name?: string; image?: string; gmv: number; units: number }> } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.user) {
      if (typeof window !== 'undefined') window.location.href = '/login';
      return;
    }
    if (auth.user.role !== 'admin') {
      if (typeof window !== 'undefined') window.location.href = '/';
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [sRes, tRes, topRes] = await Promise.all([
          fetch(`${API_URL}/admin/analytics/summary`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/admin/analytics/timeseries`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/admin/analytics/top`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const sData = await sRes.json().catch(() => ({}));
        const tData = await tRes.json().catch(() => ([]));
        const topData = await topRes.json().catch(() => ({}));
        if (!sRes.ok) throw new Error(sData.message || 'Failed to load summary');
        if (!tRes.ok) throw new Error((tData as any).message || 'Failed to load timeseries');
        if (!topRes.ok) throw new Error((topData as any).message || 'Failed to load breakdowns');
        setSummary(sData);
        setSeries(Array.isArray(tData) ? tData : []);
        setTop(topData as any);
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    })();
  }, [auth.user, token]);

  const maxGMV = useMemo(() => Math.max(1, ...series.map((p) => Number(p.gmv) || 0)), [series]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Analytics</h1>
      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
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
              {series.map((pt) => {
                const h = (Number(pt.gmv) / maxGMV) * 100;
                return (
                  <div key={pt.date} className="bg-brand/60" style={{ height: `${h}%`, width: '10px' }} title={`${pt.date}: ${formatCurrency(Number(pt.gmv))}`}></div>
                );
              })}
            </div>
            <div className="mt-2 grid grid-cols-3 text-xs text-gray-600">
              {series.slice(0, 3).map((pt) => (
                <div key={pt.date}>{pt.date}</div>
              ))}
            </div>
          </div>
          {top && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded p-4">
                <div className="font-medium mb-2">Top Vendors</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-gray-600">
                      <tr>
                        <th className="py-2">Vendor</th>
                        <th className="py-2">Orders</th>
                        <th className="py-2">GMV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top.topVendors.map((v, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="py-2">{v.storeName || v.vendorId}</td>
                          <td className="py-2">{v.orders}</td>
                          <td className="py-2">{formatCurrency(v.gmv)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="border rounded p-4">
                <div className="font-medium mb-2">Top Products</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-gray-600">
                      <tr>
                        <th className="py-2">Product</th>
                        <th className="py-2">Units</th>
                        <th className="py-2">GMV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top.topProducts.map((p, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="py-2 flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                              {p.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.image} alt={p.name || String(p.productId)} className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-[10px] text-gray-500">No image</div>
                              )}
                            </div>
                            <div className="truncate max-w-[200px]" title={p.name || String(p.productId)}>{p.name || String(p.productId)}</div>
                          </td>
                          <td className="py-2">{p.units}</td>
                          <td className="py-2">{formatCurrency(p.gmv)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
