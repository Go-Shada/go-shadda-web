"use client";
import { FormEvent, useState, useEffect } from 'react';
import { useAppSelector } from '../../../src/store/hooks';
import { API_URL } from '../../../src/lib/api';

export default function AdminVendorsPage() {
  const auth = useAppSelector((s) => s.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [bio, setBio] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = auth.token;

  // listing state
  const [list, setList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStoreName, setEditStoreName] = useState('');
  const [editBio, setEditBio] = useState('');

  if (!auth.user) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }
  if (auth.user.role !== 'admin') {
    if (typeof window !== 'undefined') window.location.href = '/';
    return null;
  }

  async function loadList(p = page, query = q) {
    try {
      setLoading(true);
      setError(null);
      const url = new URL(`${API_URL}/admin/vendors`);
      url.searchParams.set('page', String(p));
      url.searchParams.set('limit', String(limit));
      if (query) url.searchParams.set('q', query);
      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({ items: [], total: 0 }));
      if (!res.ok) throw new Error(data.message || 'Failed to load vendors');
      setList(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || p);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadList(1, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/admin/vendors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password, storeName, bio }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to create vendor');
      setMessage(`Vendor created: ${data.vendor?.storeName || storeName}`);
      setEmail('');
      setPassword('');
      setStoreName('');
      setBio('');
      loadList();
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  }

  function startEdit(v: any) {
    setEditingId(v._id);
    setEditStoreName(v.storeName || '');
    setEditBio(v.bio || '');
  }

  async function saveEdit(id: string) {
    try {
      const res = await fetch(`${API_URL}/admin/vendors/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ storeName: editStoreName, bio: editBio }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to update');
      setList((prev) => prev.map((v) => (v._id === id ? data : v)));
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Update failed');
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this vendor? This will remove linked vendor users.')) return;
    const res = await fetch(`${API_URL}/admin/vendors/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setList((prev) => prev.filter((v) => v._id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="max-w-lg">
        <h1 className="text-2xl font-semibold mb-4">Manage Vendors</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border rounded px-3 py-2" placeholder="Vendor Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" placeholder="Temporary Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input className="w-full border rounded px-3 py-2" placeholder="Store Name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          <textarea className="w-full border rounded px-3 py-2" placeholder="Bio (optional)" value={bio} onChange={(e) => setBio(e.target.value)} />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {message && <div className="text-green-600 text-sm">{message}</div>}
          <button type="submit" className="bg-brand text-white px-4 py-2 rounded">Create Vendor</button>
        </form>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input className="border rounded px-3 py-2" placeholder="Search vendors..." value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="border rounded px-3 py-2" onClick={() => loadList(1, q)}>Search</button>
          <button className="border rounded px-3 py-2" onClick={() => { setQ(''); loadList(1, ''); }}>Reset</button>
        </div>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <div className="space-y-2">
            {list.map((v) => (
              <div key={v._id} className="border rounded p-4">
                {editingId === v._id ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                    <input className="border rounded px-3 py-2" value={editStoreName} onChange={(e) => setEditStoreName(e.target.value)} />
                    <input className="border rounded px-3 py-2 md:col-span-2" value={editBio} onChange={(e) => setEditBio(e.target.value)} />
                    <div className="flex gap-2 justify-end">
                      <button className="bg-brand text-white px-3 py-2 rounded" onClick={() => saveEdit(v._id)}>Save</button>
                      <button className="border px-3 py-2 rounded" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                    <div className="font-medium">{v.storeName}</div>
                    <div className="text-sm text-gray-700 md:col-span-2 truncate">{v.bio}</div>
                    <div className="flex gap-2 justify-end">
                      <button className="border px-3 py-1 rounded" onClick={() => startEdit(v)}>Edit</button>
                      <button className="text-red-600 border px-3 py-1 rounded" onClick={() => remove(v._id)}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">Total: {total}</div>
          <div className="flex gap-2">
            <button disabled={page <= 1} className="border rounded px-3 py-1" onClick={() => loadList(page - 1, q)}>Prev</button>
            <button disabled={page * limit >= total} className="border rounded px-3 py-1" onClick={() => loadList(page + 1, q)}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
