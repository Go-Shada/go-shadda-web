"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_URL } from "../../src/lib/api";
import { useToast } from "../../src/components/Toaster";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [campus, setCampus] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.push("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        email,
        password,
        role: "customer",
        displayName: displayName || undefined,
        campus: campus || undefined,
        phone: phone || undefined,
        address: address || undefined,
      };
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to sign up");
      toast.push("Account created. Please sign in.", "success");
      router.push("/login");
    } catch (err: any) {
      toast.push(err.message || "Sign up failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="text-sm text-gray-600">Customers can sign up below. <span className="font-medium">Vendors</span> should contact <a className="text-primary underline" href="mailto:admin@example.com">admin@example.com</a> to get a vendor account.</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <input className="w-full border rounded px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div>
            <input className="w-full border rounded px-3 py-2" placeholder="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <div>
            <input className="w-full border rounded px-3 py-2" placeholder="Display name (optional)" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div>
            <input className="w-full border rounded px-3 py-2" placeholder="Campus (optional)" value={campus} onChange={(e) => setCampus(e.target.value)} />
          </div>
          <div>
            <input className="w-full border rounded px-3 py-2" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <input className="w-full border rounded px-3 py-2" placeholder="Address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
        </div>
        <button disabled={loading} className="w-full btn-primary disabled:opacity-60" type="submit">{loading ? "Creating..." : "Sign Up"}</button>
      </form>
      <div className="text-sm text-gray-600">Already have an account? <Link className="text-primary underline" href="/login">Sign in</Link></div>
    </div>
  );
}
