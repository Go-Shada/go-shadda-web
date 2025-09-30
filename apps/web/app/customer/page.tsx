"use client";
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAppSelector } from '../../src/store/hooks';
import { API_URL } from '../../src/lib/api';
import { AddToCartButton } from '../../src/components/AddToCartButton';
import { CartSidebar } from '../../src/components/CartSidebar';
import { formatCurrency } from '../../src/lib/format';
import { ModalTabs } from '../../src/components/ModalTabs';

export default function CustomerHome() {
  const user = useAppSelector((s) => s.user.user);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }
  if (user.role !== 'customer') {
    if (typeof window !== 'undefined') window.location.href = '/';
    return null;
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}/products?limit=20&sort=newest`);
        const data = await res.json().catch(() => ({ items: [] }));
        const arr = Array.isArray(data) ? data : data.items;
        setItems(arr || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Modal state for product details
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'shipping'>('details');
  const [selected, setSelected] = useState<any | null>(null);

  // Cart slide-in modal
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Shop</h1>
      <p className="text-gray-600">Browse products and manage your cart side by side.</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div>Loading…</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((p) => (
                <motion.div
                  key={p._id}
                  className="border rounded-lg p-3 space-y-3 bg-white"
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <button
                    onClick={() => { setSelected(p); setActiveTab('details'); setOpen(true); }}
                    className="block w-full text-left"
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {((Array.isArray(p.images) && p.images[0]) || p.image || p.imageUrl) ? (
                        <img src={(Array.isArray(p.images) && p.images[0] ? p.images[0] : (p.image || p.imageUrl)) as string} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-gray-400 text-sm">No image</div>
                      )}
                    </div>
                    <div className="mt-2 font-medium truncate text-content-light">{p.name}</div>
                  </button>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-primary font-semibold">{formatCurrency(Number(p.price) || 0)}</div>
                    <AddToCartButton product={p} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <CartSidebar />
      </div>

      {/* Product Details Modal */}
      <ModalTabs
        open={open}
        onClose={() => setOpen(false)}
        tabs={[
          { id: 'details', label: 'Details', content: (
            <div className="space-y-3">
              <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {(Array.isArray(selected?.images) && selected?.images?.[0]) || selected?.image || selected?.imageUrl ? (
                  <img src={((Array.isArray(selected?.images) && selected?.images?.[0]) ? selected!.images[0] : (selected?.image || selected?.imageUrl)) as string} alt={selected?.name || 'Product'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-gray-400 text-sm">No image</div>
                )}
              </div>
              <div className="text-xl font-semibold">{selected?.name}</div>
              <div className="text-primary font-semibold">{formatCurrency(Number(selected?.price) || 0)}</div>
              {selected?.description && (
                <p className="text-gray-700">{selected.description}</p>
              )}
              <div>
                {selected && <AddToCartButton product={selected} />}
              </div>
            </div>
          )},
          { id: 'reviews', label: 'Reviews', content: (
            <div className="text-sm text-gray-600">No reviews yet.</div>
          )},
          { id: 'shipping', label: 'Shipping', content: (
            <div className="text-sm text-gray-600">Ships in 3-5 business days.</div>
          )},
        ]}
        activeTabId={activeTab}
        onTabChange={(id) => setActiveTab(id as any)}
        title={selected?.name || 'Product Details'}
        slideIn="center"
      />

      {/* Floating Cart Button */}
      <button
        aria-label="Open Cart"
        onClick={() => setCartOpen(true)}
        className="fixed bottom-5 right-5 rounded-full bg-primary text-white h-12 w-12 grid place-items-center shadow-lg hover:bg-primary/90 transition-colors"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l1.8-8H6.2M7 13L5.4 5M7 13l-2 9m12-9a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z"/></svg>
      </button>

      {/* Cart Slide-in Modal */}
      <ModalTabs
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        tabs={[
          { id: 'cart', label: 'Cart', content: (
            <div className="pt-2">
              {/* Reuse existing sidebar content inside modal */}
              <CartSidebar />
            </div>
          )},
        ]}
        activeTabId={'cart'}
        onTabChange={() => {}}
        title={'Your Cart'}
        slideIn="right"
      />
    </div>
  );
}
