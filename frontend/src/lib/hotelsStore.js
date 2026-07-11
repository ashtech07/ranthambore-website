import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

const EVENT = "rtc:hotels-updated";

export function useHotels() {
  const [hotels, setHotels] = useState([]);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get("/hotels");
      setHotels(data || []);
    } catch {
      setHotels([]);
    }
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, [refresh]);

  const addHotel = useCallback(async (h) => {
    const { data } = await api.post("/admin/hotels", h);
    setHotels((prev) => [data, ...prev]);
    window.dispatchEvent(new Event(EVENT));
    return data;
  }, []);

  const updateHotel = useCallback(async (id, patch) => {
    await api.patch(`/admin/hotels/${id}`, patch);
    setHotels((prev) => prev.map((x) => x.id === id ? { ...x, ...patch } : x));
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const removeHotel = useCallback(async (id) => {
    await api.delete(`/admin/hotels/${id}`);
    setHotels((prev) => prev.filter((x) => x.id !== id));
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { hotels, addHotel, updateHotel, removeHotel, refresh };
}
