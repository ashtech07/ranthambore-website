import { useState } from "react";
import { toast } from "sonner";
import { Hotel as HotelIcon, Pencil, Trash2, Plus, ImagePlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CropModal, { pickImageFile } from "@/components/CropModal";
import { useHotels } from "@/lib/hotelsStore";

const AMENITY_OPTIONS = ["WiFi", "Pool", "Breakfast Included", "AC", "Parking", "Restaurant", "Spa", "Airport Transfer"];

const EMPTY = { name: "", stars: 5, distance: "", description: "", amenities: [], image1: null, image2: null };

export default function AdminHotels() {
  const { hotels, addHotel, updateHotel, removeHotel } = useHotels();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [cropTarget, setCropTarget] = useState(null);

  function startNew() { setEditing(null); setForm(EMPTY); setOpen(true); }
  function startEdit(h) { setEditing(h); setForm({ ...EMPTY, ...h, amenities: h.amenities || [] }); setOpen(true); }
  function toggleAmenity(a) {
    setForm((f) => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] }));
  }
  async function pickAndCrop(target) {
    const dataUrl = await pickImageFile();
    if (!dataUrl) return;
    setCropTarget(target);
    setCropSrc(dataUrl);
  }
  function handleCropConfirm(dataUrl) {
    setForm((f) => ({ ...f, [cropTarget]: dataUrl }));
    setCropSrc(null); setCropTarget(null);
  }
  async function save() {
    if (!form.name.trim() || !form.distance.trim() || !form.description.trim()) {
      toast.error("Name, distance and description are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        stars: Number(form.stars) || 5,
        distance: form.distance,
        description: form.description,
        amenities: form.amenities,
        image1: form.image1 || null,
        image2: form.image2 || null,
      };
      if (editing) { await updateHotel(editing.id, payload); toast.success("Hotel updated."); }
      else { await addHotel(payload); toast.success("Hotel published."); }
      setOpen(false);
    } catch { toast.error("Could not save hotel."); }
    finally { setSaving(false); }
  }
  async function remove(h) {
    if (!window.confirm(`Delete ${h.name}?`)) return;
    try {
      await removeHotel(h.id);
      toast.success("Hotel deleted.");
    } catch { toast.error("Could not delete hotel."); }
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-1 gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl">Hotel Manager</h1>
          <p className="text-sm text-stone-500">Add and manage hotels shown on the Hotels page of your website</p>
        </div>
        <button
          data-testid="add-hotel-btn"
          onClick={startNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C8860A] hover:bg-[#a86f08] text-white text-sm font-semibold"
        ><Plus className="w-4 h-4" /> Add New Hotel</button>
      </div>

      <div className="mt-6 bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {hotels.length === 0 ? (
          <div className="py-16 text-center">
            <HotelIcon className="w-12 h-12 mx-auto text-stone-300 mb-3" />
            <p className="text-stone-500 text-sm">No hotels added yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-left text-xs text-stone-500 uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3">Hotel Name</th>
                  <th className="px-4 py-3">Star Rating</th>
                  <th className="px-4 py-3">Distance</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((h) => (
                  <tr key={h.id} className="border-t border-stone-100">
                    <td className="px-4 py-3 font-medium">{h.name}</td>
                    <td className="px-4 py-3 text-[#C8860A]">{"★".repeat(Math.max(0, Math.min(5, Math.round(h.stars || 0))))}</td>
                    <td className="px-4 py-3 text-stone-600">{h.distance}</td>
                    <td className="px-4 py-3"><span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-green-100 text-green-800">Live</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button data-testid={`edit-hotel-${h.id}`} onClick={() => startEdit(h)} className="p-1.5 rounded-md bg-amber-100 text-amber-800 hover:bg-amber-200" title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button data-testid={`delete-hotel-${h.id}`} onClick={() => remove(h)} className="p-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">{editing ? "Edit Hotel" : "Add New Hotel"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Field label="Hotel Name" required>
              <input data-testid="hotel-name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm" />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Star Rating" required>
                <select data-testid="hotel-stars" value={form.stars} onChange={(e)=>setForm({...form, stars: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm bg-white">
                  {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} Star{n>1?"s":""}</option>)}
                </select>
              </Field>
              <Field label="Distance from Park Gate" required>
                <input data-testid="hotel-distance" value={form.distance} onChange={(e)=>setForm({...form, distance: e.target.value})} placeholder="e.g. 1.2 km from gate" className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm" />
              </Field>
            </div>
            <Field label="Description" required>
              <textarea data-testid="hotel-description" value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-sm min-h-[80px]" />
            </Field>
            <Field label="Amenities">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {AMENITY_OPTIONS.map((a) => (
                  <label key={a} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} className="accent-[#C8860A]" />
                    {a}
                  </label>
                ))}
              </div>
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <ImageSlot label="Image 1" value={form.image1} onPick={() => pickAndCrop("image1")} onClear={() => setForm({...form, image1: null})} testId="hotel-image1" />
              <ImageSlot label="Image 2" value={form.image2} onPick={() => pickAndCrop("image2")} onClear={() => setForm({...form, image2: null})} testId="hotel-image2" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setOpen(false)} className="px-5 py-2.5 rounded-full bg-white border border-stone-300 text-sm">Cancel</button>
              <button data-testid="hotel-publish" onClick={save} disabled={saving} className="px-5 py-2.5 rounded-full bg-[#C8860A] hover:bg-[#a86f08] text-white text-sm font-semibold disabled:opacity-60">
                {saving ? "Saving..." : (editing ? "Save Changes" : "Publish Hotel")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CropModal
        open={!!cropSrc}
        src={cropSrc}
        aspect={4/3}
        onCancel={() => { setCropSrc(null); setCropTarget(null); }}
        onConfirm={handleCropConfirm}
      />
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium mb-1 block">{label}{required && <span className="text-red-500"> *</span>}</span>
      {children}
    </label>
  );
}

function ImageSlot({ label, value, onPick, onClear, testId }) {
  return (
    <div>
      <span className="text-sm font-medium mb-1 block">{label}</span>
      <div className="aspect-[4/3] bg-stone-100 rounded-lg overflow-hidden border border-stone-200 mb-2 flex items-center justify-center">
        {value ? <img src={value} alt={label} className="w-full h-full object-cover" /> : <ImagePlus className="w-8 h-8 text-stone-400" />}
      </div>
      <div className="flex gap-2">
        <button type="button" data-testid={testId} onClick={onPick} className="px-3 py-1.5 rounded-full bg-[#C8860A] hover:bg-[#a86f08] text-white text-xs font-semibold">{value ? "Change Image" : "Upload Image"}</button>
        {value && <button type="button" onClick={onClear} className="px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">Remove Image</button>}
      </div>
    </div>
  );
}
