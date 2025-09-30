"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useEffect, FormEvent } from 'react';

function useInitialValue(key: string) {
  const sp = useSearchParams();
  return sp.get(key) ?? '';
}

export function SearchFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(useInitialValue('q'));
  const [category, setCategory] = useState(useInitialValue('category'));
  const [minPrice, setMinPrice] = useState(useInitialValue('minPrice'));
  const [maxPrice, setMaxPrice] = useState(useInitialValue('maxPrice'));
  const [color, setColor] = useState(useInitialValue('color'));
  const [size, setSize] = useState(useInitialValue('size'));
  const [inStock, setInStock] = useState(sp.get('inStock') === 'true');
  const [sort, setSort] = useState(sp.get('sort') ?? 'newest');

  // Keep state in sync when navigating via back/forward
  useEffect(() => {
    setQ(sp.get('q') ?? '');
    setCategory(sp.get('category') ?? '');
    setMinPrice(sp.get('minPrice') ?? '');
    setMaxPrice(sp.get('maxPrice') ?? '');
    setColor(sp.get('color') ?? '');
    setSize(sp.get('size') ?? '');
    setInStock(sp.get('inStock') === 'true');
    setSort(sp.get('sort') ?? 'newest');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (color) params.set('color', color);
    if (size) params.set('size', size);
    if (inStock) params.set('inStock', 'true');
    if (sort && sort !== 'newest') params.set('sort', sort);
    router.push(`/products${params.toString() ? `?${params.toString()}` : ''}`);
  }

  function onReset() {
    router.push('/products');
  }

  return (
    <form onSubmit={onSubmit} className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-2">
      <input
        className="border rounded px-3 py-2"
        placeholder="Search keyword"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <input
        className="border rounded px-3 py-2"
        placeholder="Categories (comma-separated)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <div className="flex gap-2">
        <input
          className="border rounded px-3 py-2 w-24"
          placeholder="Min $"
          inputMode="numeric"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2 w-24"
          placeholder="Max $"
          inputMode="numeric"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>
      <input
        className="border rounded px-3 py-2"
        placeholder="Color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <input
        className="border rounded px-3 py-2"
        placeholder="Size (XS,S,M,L,XL)"
        value={size}
        onChange={(e) => setSize(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          <span>In stock</span>
        </label>
        <select className="border rounded px-2 py-2" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
        <button type="submit" className="ml-auto bg-brand text-white px-4 py-2 rounded">Search</button>
        <button type="button" onClick={onReset} className="border px-3 py-2 rounded">Reset</button>
      </div>
    </form>
  );
}
