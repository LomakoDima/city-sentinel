import { useEffect, useRef, useState, useCallback } from "react";
import type { CityId } from "@/lib/traffic";

export interface LiveEvent {
  id: string;
  city_id: string;
  type: "ДТП" | "ремонт" | "перекрытие" | "затор" | "погода" | "полиция";
  severity: "low" | "medium" | "high" | "critical";
  lat: number;
  lng: number;
  road_name: string;
  description: string;
  timestamp: string;
  delay_minutes: number;
  remaining_seconds: number;
  is_new: boolean;
}

interface WSMessage {
  type: "snapshot" | "update";
  city_id?: string;
  events?: LiveEvent[];
  new?: LiveEvent[];
  expired?: string[];
  total_active?: number;
}

const WS_BASE = (import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8001")
  .replace(/^http/, "ws");

export function useRealtimeEvents(cityId: CityId) {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [newEventIds, setNewEventIds] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`${WS_BASE}/ws/events/${cityId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);

        if (msg.type === "snapshot" && msg.events) {
          setEvents(msg.events);
          setNewEventIds(new Set());
        }

        if (msg.type === "update") {
          setEvents((prev) => {
            // Remove expired
            const expiredSet = new Set(msg.expired ?? []);
            let updated = prev.filter((e) => !expiredSet.has(e.id));

            // Add new
            if (msg.new && msg.new.length > 0) {
              updated = [...updated, ...msg.new];

              // Track new event IDs for animation
              const newIds = new Set(msg.new.map((e) => e.id));
              setNewEventIds(newIds);

              // Clear "new" flag after 5 seconds
              setTimeout(() => {
                setNewEventIds((prev) => {
                  const next = new Set(prev);
                  newIds.forEach((id) => next.delete(id));
                  return next;
                });
              }, 5000);
            }

            return updated;
          });
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      setConnected(false);
      // Auto-reconnect after 3s
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [cityId]);

  useEffect(() => {
    connect();

    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { events, connected, newEventIds };
}
