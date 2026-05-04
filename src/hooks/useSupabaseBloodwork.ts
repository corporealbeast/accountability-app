"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export interface BloodworkEntry {
  id: string;
  title: string;
  date?: string;
  lab?: string;
  nextDate?: string;
  notes?: string;
  fileName?: string;
  fileType?: string;
  filePath?: string;
  createdAt: string;
}

export function useSupabaseBloodwork() {
  const [items, setItems] = useState<BloodworkEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();

  const fetchItems = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    const { data } = await supabase
      .from("bloodwork")
      .select("*")
      .order("date", { ascending: false, nullsFirst: false });

    if (data) {
      setItems(
        data.map((r) => ({
          id: r.id,
          title: r.title,
          date: r.date ?? undefined,
          lab: r.lab ?? undefined,
          nextDate: r.next_date ?? undefined,
          notes: r.notes ?? undefined,
          fileName: r.file_name ?? undefined,
          fileType: r.file_type ?? undefined,
          filePath: r.file_path ?? undefined,
          createdAt: r.created_at?.split("T")[0] ?? "",
        }))
      );
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    fetchItems();

    const channel = supabase
      .channel("bloodwork_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "bloodwork" }, () => fetchItems())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchItems, supabase]);

  const addItem = async (data: Omit<BloodworkEntry, "id" | "createdAt">, file?: File) => {
    if (!supabase) return "";
    let filePath: string | undefined;

    if (file) {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("bloodwork").upload(path, file);
      if (!error) filePath = path;
    }

    const { data: row } = await supabase
      .from("bloodwork")
      .insert({
        title: data.title,
        date: data.date ?? null,
        lab: data.lab ?? null,
        next_date: data.nextDate ?? null,
        notes: data.notes ?? null,
        file_path: filePath ?? data.filePath ?? null,
        file_name: data.fileName ?? file?.name ?? null,
        file_type: data.fileType ?? file?.type ?? null,
      })
      .select()
      .single();

    return row?.id ?? "";
  };

  const updateItem = async (id: string, changes: Partial<Omit<BloodworkEntry, "id" | "createdAt">>) => {
    if (!supabase) return;
    const dbChanges: Record<string, unknown> = {};
    if (changes.title !== undefined)    dbChanges.title = changes.title;
    if (changes.date !== undefined)     dbChanges.date = changes.date;
    if (changes.lab !== undefined)      dbChanges.lab = changes.lab;
    if (changes.nextDate !== undefined) dbChanges.next_date = changes.nextDate;
    if (changes.notes !== undefined)    dbChanges.notes = changes.notes;
    await supabase.from("bloodwork").update(dbChanges).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  };

  const deleteItem = async (id: string) => {
    if (!supabase) return;
    const item = items.find((i) => i.id === id);
    if (item?.filePath) {
      await supabase.storage.from("bloodwork").remove([item.filePath]);
    }
    await supabase.from("bloodwork").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const getFileUrl = (filePath: string) => {
    if (!supabase) return "";
    const { data } = supabase.storage.from("bloodwork").getPublicUrl(filePath);
    return data.publicUrl;
  };

  return { items, loading, addItem, updateItem, deleteItem, getFileUrl };
}
