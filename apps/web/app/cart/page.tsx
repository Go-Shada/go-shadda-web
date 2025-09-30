"use client";
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { removeFromCart, clearCart, updateQuantity } from '../../src/store/cartSlice';
import { formatCurrency } from '../../src/lib/format';
import { API_URL } from '../../src/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../../src/components/Toaster';

export default function CartPage() {
  const items = useAppSelector((s) => s.cart.items);
  const auth = useAppSelector((s) => s.user);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();
  const total = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    try {
      setError(null);
      if (!auth.user || !auth.token) {
        if (typeof window !== 'undefined') window.location.href = '/login';
        return;
      }
      // group items by vendorId
      const byVendor: Record<string, typeof items> = {} as any;
      for (const it of items) {
        const v = it.vendorId || 'unknown';
        if (!byVendor[v]) byVendor[v] = [] as any;
        byVendor[v].push(it);
      }
      setPlacing(true);
      // create an order per vendor and collect created order IDs
      const createdIds: string[] = [];
      for (const [vendorId, vendorItems] of Object.entries(byVendor)) {
        if (vendorId === 'unknown') continue; // skip items without vendor
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
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?._id) {
          throw new Error(data.message || 'Failed to place order');
        }
        createdIds.push(String(data._id));
      }
      dispatch(clearCart());
      if (createdIds.length === 1) {
        toast.push('Order placed', 'success', { href: `/orders/${createdIds[0]}`, linkText: 'View order' });
        router.push(`/orders/${createdIds[0]}`);
      } else {
        toast.push('Orders placed', 'success', { href: `/orders`, linkText: 'View orders' });
        router.push('/orders');
      }
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Your Cart</h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="space-y-3">
        {items.length === 0 && <div>Your cart is empty.</div>}
        {items.map((i) => (
          <div key={i.productId} className="flex items-center justify-between border rounded p-3">
            <div>
              <div className="font-medium">{i.name}</div>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <button
                  className="border px-2 rounded"
                  onClick={() => dispatch(updateQuantity({ productId: i.productId, quantity: i.quantity - 1 }))}
                >
                  -
                </button>
                <input
                  className="w-14 border rounded px-2 py-1 text-center"
                  value={i.quantity}
                  onChange={(e) => dispatch(updateQuantity({ productId: i.productId, quantity: Number(e.target.value) || 1 }))}
                />
                <button
                  className="border px-2 rounded"
                  onClick={() => dispatch(updateQuantity({ productId: i.productId, quantity: i.quantity + 1 }))}
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>{formatCurrency(Number(i.price) * i.quantity)}</div>
              <button className="text-red-600" onClick={() => dispatch(removeFromCart(i.productId))}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between border-t pt-4">
        <div className="text-lg font-semibold">Total: {formatCurrency(total)}</div>
        <button disabled={placing || items.length === 0} onClick={checkout} className="bg-brand text-white px-4 py-2 rounded disabled:opacity-60">
          {placing ? 'Placing…' : 'Checkout'}
        </button>
      </div>
    </div>
  );
}