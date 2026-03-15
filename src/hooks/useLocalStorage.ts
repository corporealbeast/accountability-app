"use client";

import { useState, useEffect, Dispatch, SetStateAction } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  // Load from storage after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) setValue(JSON.parse(item));
    } catch {
      // corrupt data — fall back to initialValue
    }
    setHydrated(true);
  }, [key]);

  // Persist whenever value changes (skip the pre-hydration write)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable
    }
  }, [key, value, hydrated]);

  return [value, setValue];
}
