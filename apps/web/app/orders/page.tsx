"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { API_URL } from '../../src/lib/api';
import { useAppSelector } from '../../src/store/hooks';
import { formatCurrency } from '../../src/lib/format';

export default function OrdersPage() {
  const auth = useAppSelector((s) => s.user);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  async function fetchOrders() {
    try {
      setError(null);
      if (!auth.token) return;
      const res = await fetch(`${API_URL}/orders/mine`, { headers: { Authorization: `Bearer ${auth.token}` } });
      const data = await res.json().catch(() => ([]));
      if (!res.ok) throw new Error(data.message || 'Failed to load orders');
      setOrders(Array.isArray(data) ? data : []);
      setFetched(true);
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  }

  useEffect(() => {
    if (!auth.user || !auth.token) {
      // Not authenticated yet; stop loading to render sign-in prompt
      setLoading(false);
      setFetched(false);
      return;
    }
    setLoading(true);
    fetchOrders().finally(() => setLoading(false));
    function onFocus() {
      fetchOrders();
    }
    function onVisibility() {
      if (document.visibilityState === 'visible') fetchOrders();
    }
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    const id = auth.token ? setInterval(() => fetchOrders(), 10000) : undefined as any;
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      if (id) clearInterval(id);
    };
  }, [auth.user, auth.token]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">My Orders</h1>
        <button onClick={() => fetchOrders()} className="btn border px-3 py-1 rounded text-sm">Refresh</button>
      </div>
      {(!auth.user || !auth.token) ? (
        <div className="text-sm">Please <a className="underline text-primary" href="/login">sign in</a> to view your orders.</div>
      ) : loading || !fetched ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : orders.length === 0 ? (
        <div>No orders yet.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const total = (o.items || []).reduce((s: number, it: any) => s + Number(it.price) * Number(it.quantity), 0);
            const count = (o.items || []).reduce((s: number, it: any) => s + Number(it.quantity), 0);
            return (
              <Link key={o._id} href={`/orders/${o._id}`} className="block border rounded p-4 hover:shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Order #{o._id.slice(-6)}</div>
                    <div className="text-sm text-gray-600">Status: {o.status} • Items: {count}</div>
                  </div>
                  <div className="text-sm">{formatCurrency(total)}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
