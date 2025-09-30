"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppSelector } from '../../../src/store/hooks';
import { API_URL } from '../../../src/lib/api';
import { formatCurrency } from '../../../src/lib/format';

const STATUS = ['pending','paid','shipped','delivered','cancelled'] as const;

type Status = typeof STATUS[number];

export default function VendorOrdersPage() {
  const auth = useAppSelector((s) => s.user);
  const token = auth.token;
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.user) {
      if (typeof window !== 'undefined') window.location.href = '/login';
      return;
    }
    if (auth.user.role !== 'vendor') {
      if (typeof window !== 'undefined') window.location.href = '/';
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/vendor/orders`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        const data = await res.json().catch(() => ([]));
        if (!res.ok) throw new Error(data.message || 'Failed to load orders');
        setOrders(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    })();
  }, [auth.user, token]);

  async function updateStatus(id: string, status: Status) {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/vendor/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      setOrders((prev) => prev.map((o) => (o._id === id ? data : o)));
    } catch (err: any) {
      setError(err.message || 'Update failed');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Vendor Orders</h1>
      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : orders.length === 0 ? (
        <div>No orders yet.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const total = (o.items || []).reduce((s: number, it: any) => s + Number(it.price) * Number(it.quantity), 0);
            return (
              <div key={o._id} className="border rounded p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Order #{String(o._id).slice(-6)}</div>
                    <div className="text-sm text-gray-600">Placed: {new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-sm">{formatCurrency(total)}</div>
                </div>
                <div className="mt-3 flex items-center gap-2 overflow-x-auto">
                  {(o.items || []).slice(0, 3).map((it: any, idx: number) => {
                    const prod = it.productId;
                    const name = typeof prod === 'object' && prod?.name ? prod.name : String(prod);
                    const img = typeof prod === 'object' && Array.isArray(prod?.images) ? prod.images[0] : undefined;
                    return (
                      <div key={idx} className="flex items-center gap-2 border rounded px-2 py-1">
                        <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-[10px] text-gray-500">No image</div>
                          )}
                        </div>
                        <div className="text-xs truncate max-w-[120px]" title={name}>{name}</div>
                        <div className="text-[10px] text-gray-500">x{it.quantity}</div>
                      </div>
                    );
                  })}
                  {(o.items || []).length > 3 && (
                    <div className="text-xs text-gray-600">+{(o.items || []).length - 3} more</div>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-sm">Status:</span>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={o.status}
                    onChange={(e) => updateStatus(o._id, e.target.value as Status)}
                  >
                    {STATUS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="ml-auto">
                    <Link href={`/orders/${o._id}`} className="text-sm underline hover:text-brand">View customer order</Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
