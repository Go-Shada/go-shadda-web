"use client";
import { useEffect, useMemo, useState } from 'react';
import { useAppSelector } from '../../../src/store/hooks';
import { API_URL } from '../../../src/lib/api';

export default function VendorInventoryPage() {
  const auth = useAppSelector((s) => s.user);
  const token = auth.token;
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveVariants = async (productId: string, variants: Array<{ size?: string; color?: string; stock?: number }>) => {
    try {
      const res = await fetch(`${API_URL}/vendor/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ variants }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to save variants');
      setProducts((prev) => prev.map((p) => (p._id === productId ? data : p)));
    } catch (err: any) {
      setError(err.message || 'Failed to save variants');
    }
  };

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
        const [pRes, oRes] = await Promise.all([
          fetch(`${API_URL}/vendor/products`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          }),
          fetch(`${API_URL}/vendor/orders`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          }),
        ]);
        const pData = await pRes.json().catch(() => ([]));
        const oData = await oRes.json().catch(() => ([]));
        if (!pRes.ok) throw new Error((pData as any).message || 'Failed to load products');
        if (!oRes.ok) throw new Error((oData as any).message || 'Failed to load orders');
        setProducts(Array.isArray(pData) ? pData : []);
        setOrders(Array.isArray(oData) ? oData : []);
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    })();
  }, [auth.user, token]);

  // Auto-refresh via polling every 10 seconds
  useEffect(() => {
    if (!auth.user || !token) return;
    const id = setInterval(async () => {
      try {
        const [pRes, oRes] = await Promise.all([
          fetch(`${API_URL}/vendor/products`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/vendor/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const pData = await pRes.json().catch(() => ([]));
        const oData = await oRes.json().catch(() => ([]));
        if (pRes.ok) setProducts(Array.isArray(pData) ? pData : []);
        if (oRes.ok) setOrders(Array.isArray(oData) ? oData : []);
      } catch {}
    }, 10000);
    return () => clearInterval(id);
  }, [auth.user, token]);

  const metrics = useMemo(() => {
    const totalProducts = products.length;
    let totalUnits = 0;
    let productsAvailable = 0; // any variant stock > 0
    let productsOut = 0; // all variants stock == 0 or no variants
    for (const p of products) {
      const variants = Array.isArray(p.variants) ? p.variants : [];
      const sum = variants.reduce((s: number, v: any) => s + (Number(v.stock) || 0), 0);
      totalUnits += sum;
      if (variants.length === 0 || sum === 0) productsOut += 1; else productsAvailable += 1;
    }
    // Units delivered = sum of quantities across delivered orders (per vendor)
    const deliveredUnits = orders
      .filter((o) => o.status === 'delivered')
      .reduce((acc, o: any) => acc + (Array.isArray(o.items) ? o.items.reduce((s: number, it: any) => s + (Number(it.quantity) || 0), 0) : 0), 0);
    const availableUnits = Math.max(0, totalUnits - deliveredUnits);
    // ready for delivery: vendor orders in status 'paid'
    const readyForDelivery = orders.filter((o) => o.status === 'paid').length;
    return { totalProducts, totalUnits, availableUnits, productsAvailable, productsOut, readyForDelivery };
  }, [products, orders]);

  

  async function adjustInventoryAll(id: string, action: 'add'|'clear', amount?: number) {
    try {
      const res = await fetch(`${API_URL}/vendor/products/${id}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action, amount }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to update inventory');
      setProducts((prev) => prev.map((p) => (p._id === id ? data : p)));
    } catch (err: any) {
      setError(err.message || 'Inventory update failed');
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Inventory</h1>
      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600">Total Products</div>
              <div className="text-2xl font-semibold">{metrics.totalProducts}</div>
            </div>
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600">Units in Stock</div>
              <div className="text-2xl font-semibold">{metrics.totalUnits}</div>
            </div>
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600">Available</div>
              <div className="text-2xl font-semibold">{metrics.availableUnits}</div>
            </div>
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600">Out of Stock</div>
              <div className="text-2xl font-semibold">{metrics.productsOut}</div>
            </div>
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600">Ready for Delivery</div>
              <div className="text-2xl font-semibold">{metrics.readyForDelivery}</div>
            </div>
          </div>

          <div className="space-y-3">
            {products.map((p) => {
              const variants = Array.isArray(p.variants) ? p.variants : [];
              const sum = variants.reduce((s: number, v: any) => s + (Number(v.stock) || 0), 0);
              return (
                <div key={p._id} className="border rounded p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-600">Total stock: {sum}</div>
                  </div>
                  {variants.length > 0 ? (
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {variants.map((v: any, idx: number) => (
                        <div key={idx} className="border rounded p-2 flex items-center justify-between gap-2">
                          <div className="truncate">{v.size || '-'} / {v.color || '-'}</div>
                          <div className="inline-flex items-center gap-2">
                            <span>Stock</span>
                            <input
                              type="number"
                              className="w-20 border rounded px-2 py-1"
                              value={Number(v.stock || 0)}
                              onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value || '0', 10));
                                setProducts((prev) => prev.map((pp) => (
                                  pp._id === p._id
                                    ? { ...pp, variants: pp.variants.map((vv: any, i: number) => i === idx ? { ...vv, stock: val } : vv) }
                                    : pp
                                )));
                              }}
                            />
                            <input
                              type="number"
                              placeholder="Amt"
                              className="w-16 border rounded px-2 py-1"
                              onChange={(e) => {
                                const val = parseInt(e.target.value || '0', 10);
                                (v as any).__delta = Number.isFinite(val) ? val : 0;
                              }}
                            />
                            <button
                              className="border rounded px-2 py-1 text-xs"
                              onClick={() => {
                                const delta = (v as any).__delta || 1;
                                const next = variants.map((vv: any, i: number) => i === idx ? { ...vv, stock: Math.max(0, (Number(vv.stock)||0) + delta) } : vv);
                                setProducts((prev) => prev.map((pp) => (pp._id === p._id ? { ...pp, variants: next } : pp)));
                                saveVariants(p._id, next);
                              }}
                            >+Add</button>
                            <button
                              className="border rounded px-2 py-1 text-xs"
                              onClick={() => {
                                const next = variants.map((vv: any, i: number) => i === idx ? { ...vv, stock: 0 } : vv);
                                setProducts((prev) => prev.map((pp) => (pp._id === p._id ? { ...pp, variants: next } : pp)));
                                saveVariants(p._id, next);
                              }}
                            >Clear</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600 mt-2">No variants</div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      placeholder="Amount"
                      className="border rounded px-2 py-1 w-28"
                      onChange={(e) => {
                        const val = parseInt(e.target.value || '0', 10);
                        (p as any).__amount = Number.isFinite(val) ? val : 0;
                      }}
                    />
                    <button
                      className="border rounded px-3 py-1"
                      onClick={() => adjustInventoryAll(p._id, 'add', (p as any).__amount || 1)}
                    >
                      Add stock
                    </button>
                    <button className="border rounded px-3 py-1" onClick={() => adjustInventoryAll(p._id, 'clear')}>Clear stock</button>
                    <div className="flex-1" />
                    {variants.length > 0 && (
                      <button
                        className="btn-primary"
                        onClick={() => saveVariants(p._id, variants)}
                      >Save Variants</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
