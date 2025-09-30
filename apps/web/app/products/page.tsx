import Link from 'next/link';
import { api } from '../../src/lib/api';
import { SearchFilters } from '../../src/components/SearchFilters';
import { formatCurrency } from '../../src/lib/format';
import { ProductsClient } from '../../src/components/ProductsClient';

async function getProducts(searchParams: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (v !== undefined && v !== '') params.set(k, String(v));
  }
  const qs = params.toString();
  const res = await api(`/products${qs ? `?${qs}` : ''}`, { next: { revalidate: 30 } });
  return res.json();
}

export default async function ProductsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const data = await getProducts(searchParams);
  const items = Array.isArray(data) ? data : data.items;
  const total = Array.isArray(data) ? items.length : data.total;
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Products</h1>
      <SearchFilters />
      <div className="text-sm text-gray-600 mb-2">{total} results</div>
      <ProductsClient items={items || []} />
    </div>
  );
}
