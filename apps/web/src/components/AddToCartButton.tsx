"use client";
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/cartSlice';

export function AddToCartButton({ product }: { product: any }) {
  const dispatch = useAppDispatch();
  const totalStock = Array.isArray(product?.variants)
    ? product.variants.reduce((s: number, v: any) => s + (Number(v?.stock) || 0), 0)
    : 0;
  const disabled = totalStock <= 0;
  return (
    <button
      className={`btn-primary ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() =>
        !disabled &&
        dispatch(
          addToCart({
            productId: product._id,
            vendorId: product.vendorId,
            name: product.name,
            price: Number(product.price),
            quantity: 1,
          })
        )
      }
    >
      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l1.8-8H6.2M7 13L5.4 5M7 13l-2 9m12-9a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z"/></svg>
      {disabled ? 'Out of stock' : 'Add to Cart'}
    </button>
  );
}
