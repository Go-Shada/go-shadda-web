"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_URL } from '../../../src/lib/api';
import { useAppSelector } from '../../../src/store/hooks';
import { formatCurrency } from '../../../src/lib/format';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const auth = useAppSelector((s) => s.user);
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!auth.user || !auth.token) {
      if (typeof window !== 'undefined') window.location.href = '/login';
      return;
    }
    const normalizedId = Array.isArray(id) ? id[0] : String(id || '');
    if (!normalizedId || normalizedId.length < 12) {
      // Wait until a valid id is available from the router
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/orders/${normalizedId}`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Failed to load order');
        setOrder(data);
        setFetched(true);
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, auth.user, auth.token]);

  const total = (order?.items || []).reduce((s: number, it: any) => s + Number(it.price) * Number(it.quantity), 0);
  const totalItems = (order?.items || []).reduce((s: number, it: any) => s + Number(it.quantity), 0);
  const createdAt = order?.createdAt ? new Date(order.createdAt) : null;
  const updatedAt = order?.updatedAt ? new Date(order.updatedAt) : null;
  const statusOrder = ['pending','paid','shipped','delivered','cancelled'] as const;
  const statusIndex = Math.max(0, statusOrder.indexOf((order?.status || 'pending') as any));
  const steps = statusOrder.map((s, i) => ({
    id: s,
    label: s.charAt(0).toUpperCase() + s.slice(1),
    reached: i <= statusIndex,
    // Basic timestamps: use createdAt for Pending; use updatedAt as proxy for later updates
    time: i === 0 ? createdAt : updatedAt,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Order Details</h1>
      {loading || !fetched ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : !order ? (
        <div>Order not found.</div>
      ) : (
        <>
          <div className="border rounded p-4 space-y-1">
            <div className="font-medium">Order #{String(order._id).slice(-6)}</div>
            <div className="text-sm text-gray-600">Status: {order.status}</div>
            <div className="text-sm text-gray-600">Placed: {new Date(order.createdAt).toLocaleString()}</div>
            <div className="text-sm text-gray-600">Items: {totalItems}</div>
          </div>

          {/* Status Timeline */}
          <div className="border rounded p-4">
            <div className="font-medium mb-3">Status Timeline</div>
            <ol className="relative border-s border-gray-200 dark:border-gray-700 ml-3">
              {steps.map((st, idx) => (
                <li key={st.id} className="mb-4 ms-6">
                  <span className={`absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-white ${st.reached ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    {st.reached ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" strokeWidth="2"/></svg>
                    )}
                  </span>
                  <h3 className="font-medium leading-tight">
                    {st.label}
                    {st.time && (
                      <span className="ml-2 text-xs text-gray-500">{st.time.toLocaleString()}</span>
                    )}
                  </h3>
                  {idx < steps.length - 1 && (
                    <p className="text-xs text-gray-500">{st.reached ? 'Completed' : 'Pending'}</p>
                  )}
                </li>
              ))}
            </ol>
          </div>

          <div className="border rounded p-4">
            <div className="font-medium mb-2">Items</div>
            <div className="space-y-2">
              {(order.items || []).map((it: any, idx: number) => {
                const name = typeof it.productId === 'object' && it.productId?.name ? it.productId.name : String(it.productId);
                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="text-sm">{name}</div>
                    <div className="text-sm text-gray-600">Qty: {it.quantity}</div>
                    <div className="text-sm">{formatCurrency(Number(it.price) * Number(it.quantity))}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-right font-semibold">Total: {formatCurrency(total)}</div>
          </div>
        </>
      )}
    </div>
  );
}
