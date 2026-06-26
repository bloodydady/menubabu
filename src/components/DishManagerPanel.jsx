import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp, onSnapshot, query, orderBy
} from "firebase/firestore";
import { db } from "../firebase";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, X } from "lucide-react";

const CATEGORIES = [
  "Paneer Special",
  "Chinese",
  "Thali",
  "Dal Special",
  "Rice & Biryani",
  "Chaap Special",
  "Rolls & Burgers",
  "Chowmein & Noodles",
  "Tandoori Items",
  "Dosa & South Indian",
  "Cold Drinks & Beverages",
  "Ice Creams",
  "Shakes",
  "Starters",
  "Main Course",
  "Breads",
  "Drinks",
  "Desserts"
];

export default function DishManagerPanel({ restaurant, isOwnerView = false }) {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editDish, setEditDish] = useState(null);

  useEffect(() => {
    if (!restaurant?.id) return;
    const q = query(
      collection(db, "restaurants", restaurant.id, "dishes"),
      orderBy("sortOrder", "asc")
    );
    const unsub = onSnapshot(q, snap => {
      setDishes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [restaurant?.id]);

  const toggleSoldOut = async (dish) => {
    await updateDoc(doc(db, "restaurants", restaurant.id, "dishes", dish.id), {
      isSoldOut: !dish.isSoldOut,
    });
    toast.success(dish.isSoldOut ? "Dish available again! ✅" : "Marked as sold out");
  };

  const handleDelete = async (dishId) => {
    if (!window.confirm("Delete this dish?")) return;
    await deleteDoc(doc(db, "restaurants", restaurant.id, "dishes", dishId));
    toast.success("Dish deleted");
  };

  const categories = ["All", ...CATEGORIES];
  const filtered = activeCategory === "All" ? dishes : dishes.filter(d => d.category === activeCategory);
  const available = dishes.filter(d => !d.isSoldOut).length;
  const soldOut = dishes.filter(d => d.isSoldOut).length;

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total Dishes", value: dishes.length, color: "bg-blue-50 text-blue-700" },
          { label: "Available", value: available, color: "bg-green-50 text-green-700" },
          { label: "Sold Out", value: soldOut, color: "bg-red-50 text-red-700" },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-2xl p-3 text-center`}>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-xs font-medium opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-5">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Add Dish button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => { setEditDish(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-md shadow-orange-200"
        >
          <Plus size={16} /> Add Dish
        </button>
      </div>

      {/* Dish grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="shimmer h-28 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 text-gray-400">
          <div className="text-5xl mb-3">🍽️</div>
          <p className="font-medium">No dishes in {activeCategory}</p>
          <p className="text-sm">Click "Add Dish" to create one</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {filtered.map((dish, i) => (
              <motion.div
                key={dish.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all ${dish.isSoldOut ? "opacity-60 border-red-100" : "border-gray-100 hover:shadow-md"}`}
              >
                <div className="flex gap-3 p-3">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-orange-50">
                    <img
                      src={dish.imageUrl}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={e => { e.target.src = "https://placehold.co/80x80/FFF3E0/FF6B00?text=🍽"; }}
                    />
                    {dish.isSoldOut && (
                      <div className="sold-out-overlay rounded-xl">
                        <span className="text-white text-[9px] font-bold bg-red-500 px-1.5 py-0.5 rounded-full">SOLD OUT</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-1 mb-0.5">
                      <div className={dish.isVeg ? "veg-dot" : "nonveg-dot"} />
                      <div className="font-semibold text-gray-900 text-sm leading-tight">{dish.name}</div>
                    </div>
                    {dish.nameHindi && <div className="font-hindi text-xs text-gray-500">{dish.nameHindi}</div>}
                    <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{dish.description}</div>
                    
                    {dish.hasPortions ? (
                      <div className="text-xs text-orange-600 font-bold mt-1 space-y-0.5 bg-orange-50/50 p-1.5 rounded-lg border border-orange-100 max-w-max">
                        {dish.portions?.full > 0 && <div>Full: ₹{dish.portions.full}</div>}
                        {dish.portions?.half > 0 && <div>Half: ₹{dish.portions.half}</div>}
                        {dish.portions?.quarter > 0 && <div>Quarter: ₹{dish.portions.quarter}</div>}
                      </div>
                    ) : (
                      <div className="text-orange-600 font-bold text-sm mt-1">₹{dish.price}</div>
                    )}
                  </div>
                </div>
                <div className="border-t border-gray-50 flex">
                  <button
                    onClick={() => toggleSoldOut(dish)}
                    className={`flex-1 text-xs font-medium py-2 transition-colors ${dish.isSoldOut ? "text-green-600 hover:bg-green-50" : "text-red-500 hover:bg-red-50"}`}
                  >
                    {dish.isSoldOut ? "✅ Mark Available" : "🚫 Sold Out"}
                  </button>
                  <button
                    onClick={() => { setEditDish(dish); setShowModal(true); }}
                    className="flex-1 text-xs font-medium py-2 text-blue-500 hover:bg-blue-50 transition-colors border-l border-gray-50"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(dish.id)}
                    className="flex-1 text-xs font-medium py-2 text-red-400 hover:bg-red-50 transition-colors border-l border-gray-50"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Dish Modal */}
      <AnimatePresence>
        {showModal && (
          <DishModal
            restaurantId={restaurant.id}
            dish={editDish}
            onClose={() => { setShowModal(false); setEditDish(null); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DishModal({ restaurantId, dish, onClose }) {
  const isEdit = !!dish;
  const [form, setForm] = useState({
    name: dish?.name || "",
    nameHindi: dish?.nameHindi || "",
    category: dish?.category || CATEGORIES[0],
    price: dish?.price || "",
    description: dish?.description || "",
    descriptionHindi: dish?.descriptionHindi || "",
    imageUrl: dish?.imageUrl || "",
    isVeg: dish?.isVeg ?? true,
    isSoldOut: dish?.isSoldOut ?? false,
    sortOrder: dish?.sortOrder ?? 0,
    hasPortions: dish?.hasPortions ?? false,
    portions: {
      full: dish?.portions?.full || "",
      half: dish?.portions?.half || "",
      quarter: dish?.portions?.quarter || "",
    }
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name) return toast.error("Dish name is required");
    if (!form.hasPortions && !form.price) return toast.error("Price is required");
    if (form.hasPortions && !form.portions.full && !form.portions.half && !form.portions.quarter) {
      return toast.error("At least one portion price is required");
    }
    setSaving(true);
    try {
      const data = {
        name: form.name,
        nameHindi: form.nameHindi,
        category: form.category,
        description: form.description,
        descriptionHindi: form.descriptionHindi,
        imageUrl: form.imageUrl,
        isVeg: form.isVeg,
        isSoldOut: form.isSoldOut,
        sortOrder: Number(form.sortOrder) || 0,
        hasPortions: form.hasPortions,
        price: form.hasPortions
          ? (Number(form.portions.full) || Number(form.portions.half) || Number(form.portions.quarter) || 0)
          : Number(form.price),
        portions: form.hasPortions ? {
          full: form.portions.full ? Number(form.portions.full) : 0,
          half: form.portions.half ? Number(form.portions.half) : 0,
          quarter: form.portions.quarter ? Number(form.portions.quarter) : 0,
        } : null
      };

      if (isEdit) {
        await updateDoc(doc(db, "restaurants", restaurantId, "dishes", dish.id), data);
        toast.success("Dish updated! ✏️");
      } else {
        await addDoc(collection(db, "restaurants", restaurantId, "dishes"), {
          ...data,
          createdAt: serverTimestamp(),
        });
        toast.success("Dish added! 🎉");
      }
      onClose();
    } catch (e) {
      toast.error("Failed to save dish");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-xl font-bold text-gray-900">{isEdit ? "Edit Dish" : "Add New Dish"}</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Name (English) *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300" placeholder="Paneer Butter Masala" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Name (Hindi)</label>
                <input value={form.nameHindi} onChange={e => setForm(f => ({ ...f, nameHindi: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-hindi outline-none focus:ring-2 focus:ring-orange-300" placeholder="पनीर बटर मसाला" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300 bg-white">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300" placeholder="0" />
              </div>
            </div>

            {/* Portions section */}
            <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Portion Pricing (Half/Full/Quarter)</span>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, hasPortions: !f.hasPortions }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${form.hasPortions ? "bg-orange-500" : "bg-gray-300"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.hasPortions ? "left-6" : "left-0.5"}`} />
                </button>
              </div>

              {form.hasPortions ? (
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Full Price (₹)</label>
                    <input
                      type="number"
                      value={form.portions.full}
                      onChange={e => setForm(f => ({ ...f, portions: { ...f.portions, full: e.target.value } }))}
                      className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-orange-300"
                      placeholder="180"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Half Price (₹)</label>
                    <input
                      type="number"
                      value={form.portions.half}
                      onChange={e => setForm(f => ({ ...f, portions: { ...f.portions, half: e.target.value } }))}
                      className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-orange-300"
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Quarter Price (₹)</label>
                    <input
                      type="number"
                      value={form.portions.quarter}
                      onChange={e => setForm(f => ({ ...f, portions: { ...f.portions, quarter: e.target.value } }))}
                      className="w-full border border-gray-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-orange-300"
                      placeholder="60"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Single Price (₹) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="120"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description (English)</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-orange-300" rows={2} placeholder="Rich and creamy..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description (Hindi)</label>
              <textarea value={form.descriptionHindi} onChange={e => setForm(f => ({ ...f, descriptionHindi: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-hindi resize-none outline-none focus:ring-2 focus:ring-orange-300" rows={2} placeholder="टमाटर और मक्खन की ग्रेवी..." />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Image URL</label>
              <input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-300" placeholder="https://images.unsplash.com/..." />
              {form.imageUrl && (
                <img src={form.imageUrl} alt="" className="w-20 h-20 rounded-xl object-cover mt-2 border-2 border-orange-100" onError={e => e.target.style.display = 'none'} />
              )}
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Veg</span>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, isVeg: !f.isVeg }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${form.isVeg ? "bg-green-500" : "bg-red-400"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isVeg ? "left-6" : "left-0.5"}`} />
                </button>
                <span className="text-sm text-gray-500">{form.isVeg ? "🟢 Veg" : "🔴 Non-veg"}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Sold Out</span>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, isSoldOut: !f.isSoldOut }))}
                  className={`w-12 h-6 rounded-full transition-colors relative ${form.isSoldOut ? "bg-red-500" : "bg-gray-300"}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isSoldOut ? "left-6" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-60">
              {saving ? "Saving..." : isEdit ? "Update Dish" : "Add Dish"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
