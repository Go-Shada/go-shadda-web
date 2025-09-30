"use client";
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateQuantity, removeFromCart, clearCart } from '../store/cartSlice';
import { formatCurrency } from '../lib/format';
import { API_URL } from '../lib/api';

export function CartSidebar() {
  const items = useAppSelector((s) => s.cart.items);
  const auth = useAppSelector((s) => s.user);
  const dispatch = useAppDispatch();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  async function checkout() {
    try {
      setError(null);
      if (!auth.user || !auth.token) {
        if (typeof window !== 'undefined') window.location.href = '/login';
        return;
      }
      const byVendor: Record<string, typeof items> = {} as any;
      for (const it of items) {
        const v = it.vendorId || 'unknown';
        if (!byVendor[v]) byVendor[v] = [] as any;
        byVendor[v].push(it);
      }
      setPlacing(true);
      for (const [vendorId, vendorItems] of Object.entries(byVendor)) {
        if (vendorId === 'unknown') continue;
        const payload = {
          vendorId,
          items: vendorItems.map((i) => ({ productId: i.productId, quantity: i.quantity, price: Number(i.price) })),
        };
        const res = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Failed to place order');
        }
      }
      dispatch(clearCart());
      if (typeof window !== 'undefined') window.location.href = '/orders';
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <aside className="border rounded p-4 space-y-3 sticky top-4">
      <div className="font-semibold text-lg">Your Cart</div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {items.length === 0 ? (
        <div className="text-sm text-gray-600">Your cart is empty.</div>
      ) : (
        <div className="space-y-2">
          {items.map((i) => (
            <div key={i.productId} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{i.name}</div>
                <div className="text-xs text-gray-600 flex items-center gap-2 mt-1">
                  <button className="border px-2 rounded" onClick={() => dispatch(updateQuantity({ productId: i.productId, quantity: i.quantity - 1 }))}>-</button>
                  <input className="w-14 border rounded px-2 py-1 text-center" value={i.quantity} onChange={(e) => dispatch(updateQuantity({ productId: i.productId, quantity: Number(e.target.value) || 1 }))} />
                  <button className="border px-2 rounded" onClick={() => dispatch(updateQuantity({ productId: i.productId, quantity: i.quantity + 1 }))}>+</button>
                </div>
              </div>
              <div className="text-sm flex items-center gap-3">
                <div>{formatCurrency(Number(i.price) * i.quantity)}</div>
                <button className="text-red-600" onClick={() => dispatch(removeFromCart(i.productId))}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="pt-2 border-t flex items-center justify-between">
        <div className="font-semibold">Total</div>
        <div className="font-semibold">{formatCurrency(total)}</div>
      </div>
      <button disabled={placing || items.length === 0} onClick={checkout} className="w-full bg-brand text-white py-2 rounded disabled:opacity-60">
        {placing ? 'Placing…' : 'Checkout'}
      </button>
    </aside>
  );
}
