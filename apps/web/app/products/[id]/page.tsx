import { api } from '../../../src/lib/api';
import { AddToCartButton } from '../../../src/components/AddToCartButton';
import { formatCurrency } from '../../../src/lib/format';

async function getProduct(id: string) {
  const res = await api(`/products/${id}`, { next: { revalidate: 30 } });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) return <div>Not found</div>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="aspect-square bg-gray-100 rounded" />
      <div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <div className="text-gray-600 mt-1">{formatCurrency(Number(product.price))}</div>
        {product.description && <p className="mt-3 text-gray-700">{product.description}</p>}
        <div className="mt-6">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
