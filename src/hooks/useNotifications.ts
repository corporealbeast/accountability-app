"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  read: boolean;
  source: string;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const supabase = getSupabaseBrowserClient();

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      const mapped = data.map((r) => ({
        id: r.id,
        type: r.type ?? "",
        title: r.title ?? "",
        body: r.body ?? undefined,
        read: r.read ?? false,
        source: r.source ?? "",
        createdAt: r.created_at ?? "",
      }));
      setNotifications(mapped);
      setUnreadCount(mapped.filter((n) => !n.read).length);
    }
  }, [supabase]);

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications_rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, () =>
        fetchNotifications()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchNotifications, supabase]);

  const markAllRead = async () => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return { notifications, unreadCount, markAllRead, markRead };
}
