import { useEffect } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Generic hook for listening to Supabase Realtime channel table events with clean unmount.
 */
export function useRealtimeTable({
  table,
  schema = "public",
  onInsert,
  onUpdate,
  onDelete,
}: {
  table: string;
  schema?: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}) {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    try {
      const supabase = createClient();
      const channelName = `realtime-${table}-${Date.now()}`;

      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          { event: "INSERT", schema, table },
          (payload) => onInsert && onInsert(payload.new)
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema, table },
          (payload) => onUpdate && onUpdate(payload.new)
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema, table },
          (payload) => onDelete && onDelete(payload.old)
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn(`Failed to initialize realtime for table: ${table}`, err);
    }
  }, [table, schema, onInsert, onUpdate, onDelete]);
}
