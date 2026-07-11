import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { MessageSquare, Search, Phone } from "lucide-react";

function timeAgo(iso) {
  if (!iso) return "—";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff/60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)} hrs ago`;
  return `${Math.floor(diff/86400)} d ago`;
}

const TABS = [
  { id: "all", label: "All", color: "bg-stone-200 text-stone-800" },
  { id: "contact", label: "Contact", color: "bg-blue-100 text-blue-800" },
  { id: "callback", label: "Callback", color: "bg-teal-100 text-teal-800" },
  { id: "package", label: "Package", color: "bg-purple-100 text-purple-800" },
];

export default function AdminInquiries() {
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const { data } = await api.get("/admin/inquiries");
    setItems(data);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (tab !== "all") {
        if (tab === "package" && !["package", "custom_package"].includes(i.type)) return false;
        if (tab !== "package" && i.type !== tab) return false;
      }
      if (q) {
        const hay = `${i.name} ${i.email || ""} ${i.phone || ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [items, tab, q]);

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <h1 className="font-serif text-3xl">Inquiries</h1>
        <span className="text-xs px-3 py-1 rounded-full bg-white border border-stone-200">{items.length} inquiries total</span>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap" data-testid="inquiry-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            data-testid={`inquiry-tab-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-full text-sm border border-stone-200 ${tab === t.id ? t.color + " font-semibold" : "bg-white"}`}
          >{t.label}</button>
        ))}
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          data-testid="inquiry-search"
          placeholder="Search name, email, phone..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 rounded-full border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8860A]/40"
        />
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-stone-300 mb-3" />
            <p className="text-stone-500 text-sm">No inquiries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-left text-xs text-stone-500 uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Sender</th>
                  <th className="px-4 py-3">Message / Context</th>
                  <th className="px-4 py-3">Received</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id} className="border-t border-stone-100">
                    <td className="px-4 py-3"><TypeBadge type={i.type} /></td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{i.name}</div>
                      {(i.phone || i.email) && (
                        <div className="text-xs text-stone-500 flex items-center gap-1">
                          {i.phone && <><Phone className="w-3 h-3" />{i.phone}</>}
                          {i.email && <span className="ml-2">{i.email}</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      {i.message ? <span>{i.message}</span> : <span className="text-stone-400 italic">No message provided</span>}
                    </td>
                    <td className="px-4 py-3 text-stone-500">{timeAgo(i.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TypeBadge({ type }) {
  const map = {
    callback: "bg-teal-100 text-teal-800",
    contact: "bg-blue-100 text-blue-800",
    package: "bg-purple-100 text-purple-800",
    custom_package: "bg-purple-100 text-purple-800",
    hotel: "bg-amber-100 text-amber-800",
    tatkal_request: "bg-red-100 text-red-800",
  };
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ${map[type] || "bg-stone-100"}`}>{type}</span>;
}
