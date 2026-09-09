import { useEffect, useRef } from "react";
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
  const callbacksRef = useRef({ onInsert, onUpdate, onDelete });
  useEffect(() => {
    callbacksRef.current = { onInsert, onUpdate, onDelete };
  });

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
            callbacksRef.current.onInsert?.(payload.new as T, payload);
          }
        }
      )
      .on(
        "postgres_changes",
        { ...filterConfig, event: "UPDATE" as const },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.new) {
            callbacksRef.current.onUpdate?.(payload.new as T, payload);
          }
        }
      )
      .on(
        "postgres_changes",
        { ...filterConfig, event: "DELETE" as const },
        (payload: RealtimePostgresChangesPayload<T>) => {
          const oldRecord = (payload.old || payload.new || {}) as Partial<T> & { id?: string };
          callbacksRef.current.onDelete?.(oldRecord, payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, schema, filter]);
}

export interface UseRealtimeTablesOptions {
  tables: string[];
  schema?: string;
  onChange: (table: string, payload: RealtimePostgresChangesPayload<any>) => void;
  debounceMs?: number;
}

export function useRealtimeTables({
  tables,
  schema = "public",
  onChange,
  debounceMs = 300,
}: UseRealtimeTablesOptions) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const tablesKey = tables.slice().sort().join(",");

  useEffect(() => {
    if (!isSupabaseConfigured() || tables.length === 0) return;

    const supabase = createClient();
    const channelName = `realtime:multi:${tablesKey}`;
    let timer: NodeJS.Timeout | null = null;

    const debouncedOnChange = (table: string, payload: RealtimePostgresChangesPayload<any>) => {
      if (debounceMs > 0) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          onChangeRef.current?.(table, payload);
        }, debounceMs);
      } else {
        onChangeRef.current?.(table, payload);
      }
    };

    let channel = supabase.channel(channelName);

    tables.forEach((table) => {
      channel = channel.on(
        "postgres_changes",
        {
          event: "*",
          schema,
          table,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          debouncedOnChange(table, payload);
        }
      );
    });

    channel.subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [tablesKey, schema, debounceMs]);
}
