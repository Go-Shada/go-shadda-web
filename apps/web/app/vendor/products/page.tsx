"use client";
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useAppSelector } from '../../../src/store/hooks';
import { API_URL } from '../../../src/lib/api';
import { formatCurrency } from '../../../src/lib/format';
import { ModalTabs } from '../../../src/components/ModalTabs';
import { useDropzone } from 'react-dropzone';

export default function VendorProductsPage() {
  const auth = useAppSelector((s) => s.user);
  const token = auth.token;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [variantRows, setVariantRows] = useState<Array<{ size?: string; color?: string; stock?: number }>>([]);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'image'>('details');
  const [selected, setSelected] = useState<any | null>(null);
  // no file inputs; API expects images array of URLs
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!auth.user) {
      if (typeof window !== 'undefined') window.location.href = '/login';
      return;
    }
    if (auth.user.role !== 'vendor') {
      if (typeof window !== 'undefined') window.location.href = '/';
      return;
    }
    (async () => { await fetchList(); })();
  }, [auth.user, token]);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/vendor/products`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json().catch(() => ([]));
      if (!res.ok) throw new Error(data.message || 'Failed to fetch products');
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [token]);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    try {
      setError(null);
      // Create with JSON; API accepts images: string[]
      const payload: any = { name, price: Number(price) };
      if (description) payload.description = description;
      if (imageUrl) payload.images = [imageUrl];
      if (initialStock && !isNaN(Number(initialStock))) {
        payload.variants = [{ stock: Math.max(0, Number(initialStock)) }];
      }
      if (Array.isArray(categories) && categories.length) payload.categories = categories;
      if (Array.isArray(variantRows) && variantRows.length) {
        const normalized = variantRows
          .map((v) => ({ size: v.size?.trim() || undefined, color: v.color?.trim() || undefined, stock: Math.max(0, Number(v.stock) || 0) }))
          .filter((v) => (v.size || v.color || typeof v.stock === 'number'));
        if (normalized.length) payload.variants = normalized;
      }
      const res = await fetch(`${API_URL}/vendor/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to create product');
      await fetchList();
      setName('');
      setPrice('');
      setDescription('');
      setImageUrl('');
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  }

  async function onOpenEdit(p: any) {
    setSelected(p);
    setActiveTab('details');
    setEditOpen(true);
  }

  async function onSaveDetails(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    try {
      setError(null);
      const res = await fetch(`${API_URL}/vendor/products/${selected._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: selected.name, price: Number(selected.price), description: selected.description }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to update product');
      await fetchList();
      setEditOpen(false);
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  }

  async function onSaveImages(urls: string[]) {
    if (!selected) return;
    const res = await fetch(`${API_URL}/vendor/products/${selected._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ images: urls }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Failed to update images');
    await fetchList();
    setSelected((s: any) => (s && s._id === data._id ? data : s));
  }

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted.length || !selected) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of accepted) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`${API_URL}/vendor/uploads`, {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: fd,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.url) throw new Error(data.message || 'Upload failed');
        urls.push(String(data.url));
      }
      // append to local selected images array
      setSelected((s: any) => ({ ...s, images: [...(s?.images || []), ...urls] }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }, [API_URL, token, selected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Products</h1>
        <p className="text-gray-600">Create and manage your product listings.</p>
      </div>

      <form onSubmit={onCreate} className="border rounded p-4 grid grid-cols-1 gap-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Initial Stock (optional)" inputMode="numeric" value={initialStock} onChange={(e) => setInitialStock(e.target.value)} />
          <input className="md:col-span-3 border rounded px-3 py-2" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input className="md:col-span-3 border rounded px-3 py-2" placeholder="Image URL (optional)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>

        <div className="pt-2">
          <div className="font-medium mb-2">Categories</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {['jewelry','footwear','stationery','dorm needs','toiletries'].map((c) => (
              <label key={c} className="inline-flex items-center gap-2 border rounded px-2 py-1">
                <input
                  type="checkbox"
                  checked={categories.includes(c)}
                  onChange={(e) => setCategories((prev) => e.target.checked ? [...new Set([...prev, c])] : prev.filter((x) => x !== c))}
                />
                <span className="capitalize">{c}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <div className="font-medium mb-2">Variants (optional)</div>
          <div className="space-y-2">
            {variantRows.map((v, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <input className="border rounded px-3 py-2" placeholder="Size (e.g., Small, Large, Extra)" value={v.size || ''} onChange={(e) => setVariantRows((rows) => rows.map((r, i) => i === idx ? { ...r, size: e.target.value } : r))} />
                <input className="border rounded px-3 py-2" placeholder="Color (e.g., Red, Blue)" value={v.color || ''} onChange={(e) => setVariantRows((rows) => rows.map((r, i) => i === idx ? { ...r, color: e.target.value } : r))} />
                <input className="border rounded px-3 py-2" placeholder="Stock" inputMode="numeric" value={String(v.stock ?? '')} onChange={(e) => setVariantRows((rows) => rows.map((r, i) => i === idx ? { ...r, stock: Math.max(0, Number(e.target.value) || 0) } : r))} />
                <button type="button" className="text-red-600" onClick={() => setVariantRows((rows) => rows.filter((_, i) => i !== idx))}>Remove</button>
              </div>
            ))}
            <button type="button" className="btn" onClick={() => setVariantRows((rows) => [...rows, {}])}>Add Variant</button>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary">Add Product</button>
        </div>
      </form>

      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <div key={p._id} className="border rounded p-4 space-y-2 bg-white">
              <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {Array.isArray(p.images) && p.images[0] ? (
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-gray-400 text-sm">No image</div>
                )}
              </div>
              <div className="font-medium truncate">{p.name}</div>
              <div className="text-sm text-gray-600">{formatCurrency(Number(p.price))}</div>
              {p.description && <div className="text-sm mt-1 text-gray-700">{p.description}</div>}
              <div className="pt-2">
                <button className="btn text-primary hover:text-primary/90" onClick={() => onOpenEdit(p)}>
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5h2m-7 7l8-8 4 4-8 8H6v-4z"/></svg>
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <ModalTabs
        open={editOpen}
        onClose={() => setEditOpen(false)}
        tabs={[
          { id: 'details', label: 'Details', content: (
            <form onSubmit={onSaveDetails} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Name</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    value={selected?.name ?? ''}
                    onChange={(e) => setSelected((s: any) => ({...s, name: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Price</label>
                  <input
                    className="border rounded px-3 py-2 w-full"
                    inputMode="decimal"
                    value={selected?.price ?? ''}
                    onChange={(e) => setSelected((s: any) => ({...s, price: e.target.value}))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Description</label>
                  <textarea
                    className="border rounded px-3 py-2 w-full"
                    rows={3}
                    value={selected?.description ?? ''}
                    onChange={(e) => setSelected((s: any) => ({...s, description: e.target.value}))}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          )},
          { id: 'image', label: 'Images', content: (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {Array.isArray(selected?.images) && selected?.images?.[0] ? (
                  <img src={selected.images[0]} alt={selected?.name || 'Product'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-gray-400 text-sm">No image</div>
                )}
              </div>
              {/* thumbnails */}
              {Array.isArray(selected?.images) && selected!.images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {selected!.images.map((u: string, i: number) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u} alt={`img-${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded p-4 text-sm ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
                >
                  <input {...getInputProps()} />
                  {uploading ? (
                    <div>Uploading…</div>
                  ) : (
                    <div>Drag and drop images here, or click to select files</div>
                  )}
                </div>
                <div className="text-sm font-medium">Image URLs</div>
                <div className="space-y-2">
                  {(selected?.images || []).map((u: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        className="border rounded px-3 py-2 w-full"
                        value={u}
                        onChange={(e) => setSelected((s: any) => {
                          const next = [...(s.images || [])];
                          next[idx] = e.target.value.trim();
                          return { ...s, images: next };
                        })}
                      />
                      <button
                        className="text-red-600"
                        onClick={() => setSelected((s: any) => ({ ...s, images: (s.images || []).filter((_: any, i: number) => i !== idx) }))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    className="border rounded px-3 py-2 w-full"
                    placeholder="Add image URL"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const v = (e.target as HTMLInputElement).value.trim();
                        if (v) {
                          setSelected((s: any) => ({ ...s, images: [...(s.images || []), v] }));
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <button
                    className="btn-primary"
                    onClick={() => {
                      const input = (document.activeElement as HTMLInputElement);
                      if (input && input.tagName === 'INPUT') {
                        const v = input.value.trim();
                        if (v) {
                          setSelected((s: any) => ({ ...s, images: [...(s.images || []), v] }));
                          input.value = '';
                        }
                      }
                    }}
                  >Add</button>
                </div>
                <div className="flex justify-end">
                  <button
                    className="btn-primary"
                    onClick={async () => {
                      try {
                        await onSaveImages(selected?.images || []);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                  >Save Images</button>
                </div>
              </div>
            </div>
          )},
        ]}
        activeTabId={activeTab}
        onTabChange={(id) => setActiveTab(id as any)}
        title={selected?.name || 'Edit Product'}
        slideIn="right"
      />
    </div>
  );
}

// Edit Modal rendering
export function VendorProductsEditModalWrapper() {
  return null;
}
