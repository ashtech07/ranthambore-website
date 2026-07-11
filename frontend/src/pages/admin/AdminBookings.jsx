import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { CalendarDays, Search, Check, X, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TABS = [
  { id: "all", label: "All", color: "bg-stone-200 text-stone-800" },
  { id: "pending", label: "Pending", color: "bg-amber-100 text-amber-800" },
  { id: "confirmed", label: "Confirmed", color: "bg-green-100 text-green-800" },
  { id: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/admin/bookings");
      setBookings(data);
    } catch { toast.error("Could not load bookings."); }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (tab !== "all" && b.status !== tab) return false;
      if (q && !`${b.full_name} ${b.ref} ${b.email}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [bookings, tab, q]);

  async function setStatus(ref, status) {
    try {
      await api.patch(`/admin/bookings/${ref}/status`, { status });
      toast.success(`Booking ${status}`);
      load();
    } catch { toast.error("Could not update status."); }
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <h1 className="font-serif text-3xl">Bookings</h1>
        <span className="text-xs px-3 py-1 rounded-full bg-white border border-stone-200">{bookings.length} bookings total</span>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap" data-testid="bookings-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            data-testid={`booking-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-full text-sm border border-stone-200 ${tab === t.id ? t.color + " font-semibold" : "bg-white"}`}
          >{t.label}</button>
        ))}
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          data-testid="bookings-search"
          placeholder="Search name or ref..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-full border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8860A]/40"
        />
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarDays className="w-12 h-12 mx-auto text-stone-300 mb-3" />
            <p className="text-stone-500 text-sm">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-left text-xs text-stone-500 uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3">Ref</th>
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Date & Shift</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.ref} className="border-t border-stone-100">
                    <td className="px-4 py-3 font-medium">{b.ref}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{b.full_name}</div>
                      <div className="text-xs text-stone-500">{b.whatsapp}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{b.date}</div>
                      <div className="text-xs text-stone-500 capitalize">{b.shift}</div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {b.vehicle} · Zone {b.zone} · {b.guests}g
                    </td>
                    <td className="px-4 py-3 font-semibold">₹{(b.total || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3"><StatusPill status={b.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button data-testid={`confirm-${b.ref}`} onClick={() => setStatus(b.ref, "confirmed")} className="p-1.5 rounded-md bg-green-100 text-green-700 hover:bg-green-200" title="Confirm"><Check className="w-4 h-4" /></button>
                        <button data-testid={`cancel-${b.ref}`} onClick={() => setStatus(b.ref, "cancelled")} className="p-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200" title="Cancel"><X className="w-4 h-4" /></button>
                        <button data-testid={`view-${b.ref}`} onClick={() => setView(b)} className="p-1.5 rounded-md bg-stone-100 text-stone-700 hover:bg-stone-200" title="View"><Eye className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!view} onOpenChange={(o) => !o && setView(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Booking {view?.ref}</DialogTitle>
          </DialogHeader>
          {view && (
            <div className="text-sm space-y-2">
              <Row k="Status" v={view.status} />
              <Row k="Name" v={view.full_name} />
              <Row k="WhatsApp" v={view.whatsapp} />
              <Row k="Email" v={view.email} />
              <Row k="Date" v={`${view.date} (${view.shift})`} />
              <Row k="Vehicle" v={view.vehicle} />
              <Row k="Zone" v={view.zone} />
              <Row k="Nationality" v={view.nationality} />
              <Row k="Guests" v={view.guests} />
              <Row k="Per Person" v={`₹${view.per_person?.toLocaleString("en-IN")}`} />
              <Row k="Total" v={`₹${view.total?.toLocaleString("en-IN")}`} />
              <Row k="Add-ons" v={(view.addons || []).join(", ") || "—"} />
              <Row k="ID Proof" v={`${view.id_proof_type || "—"} ${view.id_proof_number || ""}`} />
              <Row k="Emergency" v={`${view.emergency_contact_name || "—"} ${view.emergency_contact_number || ""}`} />
              <Row k="Created" v={view.created_at} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ k, v }) {
  return <div className="flex justify-between border-b border-stone-100 py-1"><span className="text-stone-500">{k}</span><span className="font-medium text-right">{String(v)}</span></div>;
}
function StatusPill({ status }) {
  const map = { pending: "bg-amber-100 text-amber-800", confirmed: "bg-green-100 text-green-800", cancelled: "bg-red-100 text-red-800" };
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${map[status] || "bg-stone-100"}`}>{status}</span>;
}
