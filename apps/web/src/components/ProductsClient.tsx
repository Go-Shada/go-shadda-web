"use client";
import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { ModalTabs } from './ModalTabs';
import { CartSidebar } from './CartSidebar';

export function ProductsClient({ items }: { items: any[] }) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items?.map((p) => (
          <ProductCard key={p._id} product={p} onClick={() => { /* navigate to details if needed */ }} />
        ))}
      </div>

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
