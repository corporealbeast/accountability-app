"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export type Mood = "strong" | "solid" | "off";

export interface CheckIn {
  id: string;
  date: string;
  mood: Mood;
  wins: string;
  struggles: string;
  tomorrow: string;
  createdAt: string;
}

export function useSupabaseCheckIns() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();

  const fetchCheckIns = useCallback(async () => {
    const { data } = await supabase
      .from("check_ins")
      .select("*")
      .order("date", { ascending: false });

    if (data) {
      setCheckIns(
        data.map((r) => ({
          id: r.id,
          date: r.date,
          mood: r.mood as Mood,
          wins: r.wins ?? "",
          struggles: r.struggles ?? "",
          tomorrow: r.tomorrow ?? "",
          createdAt: r.created_at?.split("T")[0] ?? "",
        }))
      );
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchCheckIns();

    const channel = supabase
      .channel("check_ins_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "check_ins" }, () => fetchCheckIns())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchCheckIns, supabase]);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayCheckIn = checkIns.find((c) => c.date === todayStr);

  const submitCheckIn = async (data: Omit<CheckIn, "id" | "createdAt">) => {
    const { data: row } = await supabase
      .from("check_ins")
      .upsert({ date: data.date, mood: data.mood, wins: data.wins, struggles: data.struggles, tomorrow: data.tomorrow }, { onConflict: "user_id,date" })
      .select()
      .single();
    return row?.id ?? "";
  };

  // Streak: consecutive days with a check-in up to today
  const streak = (() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      if (checkIns.find((c) => c.date === dateStr)) count++;
      else break;
    }
    return count;
  })();

  return { checkIns, loading, todayCheckIn, streak, submitCheckIn };
}
