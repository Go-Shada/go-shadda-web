"use client";
import { motion } from 'framer-motion';
import { formatCurrency } from '../lib/format';
import { AddToCartButton } from './AddToCartButton';

export function ProductCard({ product, onClick }: { product: any; onClick?: () => void }) {
  const img = (Array.isArray(product.images) && product.images[0]) || product.image || product.imageUrl;
  const totalStock = Array.isArray(product?.variants)
    ? product.variants.reduce((s: number, v: any) => s + (Number(v?.stock) || 0), 0)
    : 0;
  return (
    <motion.div
      className="border rounded-lg p-3 space-y-3 bg-white"
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <button onClick={onClick} className="block w-full text-left">
        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {img ? (
            <img src={img as string} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-400 text-sm">No image</div>
          )}
          {totalStock <= 0 && (
            <div className="absolute top-2 left-0">
              <div className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-r-full shadow">
                Out of stock
              </div>
            </div>
          )}
        </div>
        <div className="mt-2 font-medium truncate text-content-light">{product.name}</div>
      </button>
      <div className="flex items-center justify-between gap-2">
        <div className="text-primary font-semibold">{formatCurrency(Number(product.price) || 0)}</div>
        <AddToCartButton product={product} />
      </div>
    </motion.div>
  );
}
