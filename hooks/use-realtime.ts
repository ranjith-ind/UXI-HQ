import { useEffect } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export interface UseRealtimeTableOptions<T extends { [key: string]: any } = Record<string, any>> {
  table: string;
  schema?: string;
  filter?: string;
  onInsert?: (record: T, payload: RealtimePostgresChangesPayload<T>) => void;
  onUpdate?: (record: T, payload: RealtimePostgresChangesPayload<T>) => void;
  onDelete?: (record: Partial<T> & { id?: string }, payload: RealtimePostgresChangesPayload<T>) => void;
}

export function useRealtimeTable<T extends { [key: string]: any } = Record<string, any>>({
  table,
  schema = "public",
  filter,
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeTableOptions<T>) {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    const filterConfig = {
      event: "*" as const,
      schema,
      table,
      ...(filter ? { filter } : {}),
    };

    const channel = supabase
      .channel(`realtime:${table}${filter ? `:${filter}` : ""}`)
      .on(
        "postgres_changes",
        { ...filterConfig, event: "INSERT" as const },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.new) {
            onInsert?.(payload.new as T, payload);
          }
        }
      )
      .on(
        "postgres_changes",
        { ...filterConfig, event: "UPDATE" as const },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.new) {
            onUpdate?.(payload.new as T, payload);
          }
        }
      )
      .on(
        "postgres_changes",
        { ...filterConfig, event: "DELETE" as const },
        (payload: RealtimePostgresChangesPayload<T>) => {
          const oldRecord = (payload.old || payload.new || {}) as Partial<T> & { id?: string };
          onDelete?.(oldRecord, payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, schema, filter, onInsert, onUpdate, onDelete]);
}
