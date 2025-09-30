"use client";
import { useEffect } from 'react';
import { useAppDispatch } from './hooks';
import { setUser } from './userSlice';

export function AuthGate() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token && parsed?.user) {
          dispatch(setUser({ token: parsed.token, user: parsed.user }));
        }
      }
    } catch {
      // ignore
    }
  }, [dispatch]);
  return null;
}
