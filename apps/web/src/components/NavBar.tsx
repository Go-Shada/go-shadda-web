"use client";
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/userSlice';
import { useEffect, useRef, useState } from 'react';
import { ModalTabs } from './ModalTabs';
import { API_URL } from '../lib/api';
import { useToast } from './Toaster';
import { setUser } from '../store/userSlice';

export function NavBar() {
  const auth = useAppSelector((s) => s.user);
  const dispatch = useAppDispatch();

  function onLogout() {
    try {
      localStorage.removeItem('auth');
    } catch {}
    dispatch(logout());
    if (typeof window !== 'undefined') window.location.href = '/';
  }

  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<string>('account');
  const toast = useToast();

  // Local state to prefill and live edit account form
  const [profileForm, setProfileForm] = useState<{ email: string; displayName?: string; campus?: string; phone?: string; address?: string; avatarUrl?: string }>({ email: '' });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch /auth/me when the profile opens to prefill
  useEffect(() => {
    let ignore = false;
    async function fetchMe() {
      if (!profileOpen || !auth.token) return;
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Failed to load profile');
        if (!ignore) {
          setProfileForm({
            email: data.email || '',
            displayName: data.profile?.displayName || '',
            campus: data.profile?.campus || '',
            phone: data.profile?.phone || '',
            address: data.profile?.address || '',
            avatarUrl: data.profile?.avatarUrl || '',
          });
        }
      } catch (err: any) {
        toast.push(err.message || 'Failed to load profile', 'error');
      }
    }
    fetchMe();
    return () => { ignore = true; };
  }, [profileOpen, auth.token]);

  return (
    <header className="border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="container flex items-center justify-between h-16">
        <Link href="/" className="font-extrabold text-xl text-content-light dark:text-content-dark">
          <span className="text-content-light">Go</span>
          <span className="text-primary">Shada</span>
        </Link>
        <nav className="flex items-center gap-5">
          <Link href="/" className="link-nav">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m0 0H6a2 2 0 01-2-2v-5m7 7h5a2 2 0 002-2v-5m0 0l2 2m-2-2l-7-7"/></svg>
            <span>Home</span>
          </Link>
          <Link href="/products" className="link-nav">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V7a2 2 0 00-2-2h-3V3H9v2H6a2 2 0 01-2 2v6m16 0a2 2 0 01-2 2h-3v2H9v-2H6a2 2 0 01-2-2m16 0V9M4 13V9"/></svg>
            <span>Products</span>
          </Link>
          <Link href={"/cart"} className="link-nav">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l1.8-8H6.2M7 13L5.4 5M7 13l-2 9m12-9a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z"/></svg>
            <span>Cart</span>
          </Link>
          {auth.user && auth.user.role === 'customer' && (
            <Link href="/orders" className="link-nav">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18"/></svg>
              <span>Orders</span>
            </Link>
          )}
          {!auth.user ? (
            <Link href="/login" className="link-nav">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5m5 5H3"/></svg>
              <span>Login</span>
            </Link>
          ) : (
            <>
              {/* Profile Slide-in trigger */}
              <button className="link-nav" onClick={() => { setProfileTab('account'); setProfileOpen(true); }}>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A7 7 0 0112 14a7 7 0 016.879 3.804M12 14a5 5 0 100-10 5 5 0 000 10z"/></svg>
                <span>Profile</span>
              </button>
              {auth.user.role === 'admin' && (
                <Link href="/admin" className="link-nav">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm6 12v-2a4 4 0 00-4-4H10a4 4 0 00-4 4v2m14-6h2m-2-4h2m-2 8h2"/></svg>
                  <span>Admin</span>
                </Link>
              )}
              {auth.user.role === 'vendor' && (
                <Link href="/vendor" className="link-nav">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18l-1 12H4L3 7zm2-4h14v4H5V3z"/></svg>
                  <span>Vendor</span>
                </Link>
              )}
              {/* Account link removed to avoid duplication with Profile slide-in */}
              <button onClick={onLogout} className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 transition-base">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"/></svg>
                <span>Logout</span>
              </button>
            </>
          )}
        </nav>
      </div>
      {/* Profile Slide-in Modal */}
      {(() => {
        const role = auth.user?.role;
        const header = (
          <div className="flex items-center gap-3 p-3 rounded-md bg-gray-50 border">
            {profileForm.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profileForm.avatarUrl} alt="avatar" className="h-10 w-10 rounded-full object-cover border" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-primary/10 grid place-items-center text-primary font-semibold">
                {(profileForm.email || auth.user?.email || 'U').slice(0,1).toUpperCase()}
              </div>
            )}
            <div className="text-sm">
              <div className="font-medium">{profileForm.email || auth.user?.email || '—'}</div>
              <div className="inline-flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">{role}</span>
              </div>
            </div>
          </div>
        );

        const baseAccount = {
          id: 'account',
          label: (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A7 7 0 0112 14a7 7 0 016.879 3.804M12 14a5 5 0 100-10 5 5 0 000 10z"/></svg>
              Account
            </span>
          ),
          content: (
            <div className="space-y-4 text-sm">
              {header}
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const payload: any = { ...profileForm };
                  try {
                    const res = await fetch(`${API_URL}/auth/profile`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
                      },
                      body: JSON.stringify(payload),
                    });
                    const data = await res.json().catch(() => ({}));
                    if (!res.ok) throw new Error(data.message || 'Failed to update profile');
                    // Sync Redux and localStorage with fresh /auth/me
                    const meRes = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${auth.token}` } });
                    const me = await meRes.json().catch(() => ({}));
                    if (meRes.ok && me?._id) {
                      dispatch(setUser({ token: auth.token!, user: me }));
                      try { localStorage.setItem('auth', JSON.stringify({ token: auth.token, user: me })); } catch {}
                    }
                    toast.push('Profile updated', 'success');
                  } catch (err: any) {
                    toast.push(err.message || 'Failed to update profile', 'error');
                  }
                }}
              >
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1">Email</label>
                    <input name="email" value={profileForm.email} onChange={(e) => setProfileForm((s) => ({ ...s, email: e.target.value }))} className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Display name</label>
                    <input name="displayName" value={profileForm.displayName || ''} onChange={(e) => setProfileForm((s) => ({ ...s, displayName: e.target.value }))} placeholder="e.g. John Doe" className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Campus</label>
                    <input name="campus" value={profileForm.campus || ''} onChange={(e) => setProfileForm((s) => ({ ...s, campus: e.target.value }))} placeholder="e.g. Main Campus" className="border rounded px-3 py-2 w-full" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Phone</label>
                    <input name="phone" value={profileForm.phone || ''} onChange={(e) => setProfileForm((s) => ({ ...s, phone: e.target.value }))} placeholder="e.g. +1 555-123-4567" className="border rounded px-3 py-2 w-full" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs mb-1">Address</label>
                  <input name="address" value={profileForm.address || ''} onChange={(e) => setProfileForm((s) => ({ ...s, address: e.target.value }))} placeholder="Street, City" className="border rounded px-3 py-2 w-full" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs mb-1">Avatar URL</label>
                  <input name="avatarUrl" value={profileForm.avatarUrl || ''} onChange={(e) => setProfileForm((s) => ({ ...s, avatarUrl: e.target.value }))} placeholder="https://..." className="border rounded px-3 py-2 w-full" />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="btn-primary">Save Profile</button>
                </div>
              </form>
            </div>
          )
        };
        const tabs: Array<{id:string;label:string;content:JSX.Element}> = [baseAccount];
        if (role === 'customer') {
          tabs.push(
            { id: 'orders', label: (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18"/></svg>
                Orders
              </span>
            ), content: (
              <div className="space-y-2 text-sm">
                <p>View and track your orders.</p>
                <Link className="btn-primary" href="/orders">Go to Orders</Link>
              </div>
            )},
            { id: 'addresses', label: (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/></svg>
                Addresses
              </span>
            ), content: (
              <div className="text-sm text-gray-600">Address management coming soon.</div>
            )},
          );
        }
        if (role === 'vendor') {
          tabs.push(
            { id: 'vendor', label: (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18l-1 12H4L3 7zm2-4h14v4H5V3z"/></svg>
                Vendor
              </span>
            ), content: (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Link href="/vendor" className="border rounded p-3 hover:bg-gray-50">Dashboard</Link>
                <Link href="/vendor/products" className="border rounded p-3 hover:bg-gray-50">Products</Link>
                <Link href="/vendor/orders" className="border rounded p-3 hover:bg-gray-50">Orders</Link>
                <Link href="/vendor/inventory" className="border rounded p-3 hover:bg-gray-50">Inventory</Link>
              </div>
            )}
          );
        }
        if (role === 'admin') {
          tabs.push(
            { id: 'admin', label: (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zm6 12v-2a4 4 0 00-4-4H10a4 4 0 00-4 4v2m14-6h2m-2-4h2m-2 8h2"/></svg>
                Admin
              </span>
            ), content: (
              <div className="space-y-2 text-sm">
                <p>Admin Console</p>
                <Link className="btn-primary" href="/admin">Open Admin</Link>
              </div>
            )}
          );
        }
        tabs.push(
          { id: 'password', label: (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3v2h-6v-2z M6 20h12a2 2 0 002-2v-5H4v5a2 2 0 002 2z"/></svg>
              Password
            </span>
          ), content: (
            <form
              className="space-y-3 text-sm"
              onSubmit={async (e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget as HTMLFormElement);
                const payload = {
                  currentPassword: String(fd.get('currentPassword') || ''),
                  newPassword: String(fd.get('newPassword') || ''),
                };
                try {
                  const res = await fetch(`${API_URL}/auth/password`, {
                    method: 'PATCH',
                    headers: {
                      'Content-Type': 'application/json',
                      ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
                    },
                    body: JSON.stringify(payload),
                  });
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) throw new Error(data.message || 'Failed to change password');
                  toast.push('Password changed', 'success');
                  (e.currentTarget as HTMLFormElement).reset();
                } catch (err: any) {
                  toast.push(err.message || 'Failed to change password', 'error');
                }
              }}
            >
              <div>
                <label className="block text-xs mb-1">Current password</label>
                <input name="currentPassword" type="password" className="border rounded px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block text-xs mb-1">New password</label>
                <input name="newPassword" type="password" className="border rounded px-3 py-2 w-full" />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary">Update Password</button>
              </div>
            </form>
          )}
        );
        return (
          <ModalTabs
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
            tabs={tabs}
            activeTabId={profileTab}
            onTabChange={(id) => setProfileTab(id as any)}
            title={'Profile'}
            slideIn="center"
          />
        );
      })()}
    </header>
  );
}
