import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy, onSnapshot
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Plus, Edit2, Trash2, QrCode, Menu, X, ChevronRight, LogOut, Store, UtensilsCrossed, BarChart3, Download, Copy } from "lucide-react";
import QRCode from "react-qr-code";
import DishManagerPanel from "../components/DishManagerPanel";
import { getDirectImageUrl } from "../utils/imageHelper";

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

export default function SuperAdmin() {
  const { user, logout } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState("dashboard"); // dashboard | restaurants | menu
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [restaurantToEdit, setRestaurantToEdit] = useState(null);
  const [showQRModal, setShowQRModal] = useState(null);
  const [totalDishes, setTotalDishes] = useState(0);

  useEffect(() => {
    const q = query(collection(db, "restaurants"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRestaurants(data);
      // Count total dishes across all restaurants
      let count = 0;
      for (const r of data) {
        const dishSnap = await getDocs(collection(db, "restaurants", r.id, "dishes"));
        count += dishSnap.size;
      }
      setTotalDishes(count);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this restaurant?")) return;
    await deleteDoc(doc(db, "restaurants", id));
    toast.success("Restaurant deleted");
  };

  const menuUrl = (id) => `${window.location.origin}/menu/${id}`;

  const downloadQR = (restaurantName, restaurantId) => {
    const svg = document.getElementById(`qr-${restaurantId}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 300; canvas.height = 340;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 300, 340);
      ctx.drawImage(img, 25, 25, 250, 250);
      ctx.font = "bold 16px Inter, sans-serif";
      ctx.fillStyle = "#1A1A1A";
      ctx.textAlign = "center";
      ctx.fillText(restaurantName, 150, 300);
      ctx.font = "12px Inter, sans-serif";
      ctx.fillStyle = "#FF6B00";
      ctx.fillText("Scan to View Menu & Calculate Bill", 150, 325);
      const link = document.createElement("a");
      link.download = `menubabu-qr-${restaurantName.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const stats = [
    { label: "Total Restaurants", value: restaurants.length, icon: <Store size={22} />, color: "from-orange-400 to-orange-600" },
    { label: "Active Menus", value: restaurants.filter(r => r.isActive !== false).length, icon: <UtensilsCrossed size={22} />, color: "from-green-400 to-green-600" },
    { label: "Total Dishes", value: totalDishes, icon: <BarChart3 size={22} />, color: "from-blue-400 to-blue-600" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#FFFBF5" }}>
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed md:relative z-40 w-64 min-h-screen bg-gray-900 text-white flex flex-col shadow-2xl"
          >
            <div className="p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-orange-400 flex-shrink-0">
                  <img src="/logo.jpeg" alt="Menubabu" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-heading font-bold text-orange-400">Menubabu</div>
                  <div className="text-xs text-gray-400">Super Admin</div>
                </div>
              </div>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: <BarChart3 size={18} /> },
                { id: "restaurants", label: "Restaurants", icon: <Store size={18} /> },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeView === item.id ? "bg-orange-500 text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"}`}
                >
                  {item.icon} {item.label}
                  {activeView === item.id && <ChevronRight size={16} className="ml-auto" />}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <img src={user?.photoURL} alt="" className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{user?.displayName}</div>
                  <div className="text-xs text-gray-400 truncate">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 py-2 rounded-lg text-sm transition-all"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 glass border-b border-white/30 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-orange-50 transition-colors"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <h1 className="font-heading text-xl font-bold text-gray-900 flex-1">
            {activeView === "dashboard" && "Dashboard"}
            {activeView === "restaurants" && "Restaurants"}
            {selectedRestaurant && `Menu: ${selectedRestaurant.name}`}
          </h1>
          {activeView === "restaurants" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-95"
            >
              <Plus size={16} /> Add Restaurant
            </button>
          )}
        </header>

        <main className="flex-1 p-4 md:p-6">
          {/* DASHBOARD */}
          {activeView === "dashboard" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {stats.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/70 text-sm font-medium">{s.label}</span>
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                        {s.icon}
                      </div>
                    </div>
                    <div className="text-4xl font-black">{s.value}</div>
                  </motion.div>
                ))}
              </div>
              {/* Recent Restaurants */}
              <div className="bg-white rounded-2xl shadow p-5">
                <h2 className="font-heading text-lg font-bold text-gray-800 mb-4">Recent Restaurants</h2>
                <div className="space-y-3">
                  {restaurants.slice(0, 5).map((r, i) => (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-colors">
                      <img src={getDirectImageUrl(r.logoUrl)} alt="" className="w-10 h-10 rounded-xl object-cover bg-orange-100" onError={e => e.target.src = "https://placehold.co/40x40/FF6B00/fff?text=🍽️"} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">{r.name}</div>
                        <div className="text-xs text-gray-400 truncate">{r.ownerEmail}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {r.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))}
                  {restaurants.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">No restaurants yet. Add one!</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* RESTAURANTS */}
          {activeView === "restaurants" && !selectedRestaurant && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {loading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1,2,3].map(i => <div key={i} className="shimmer h-48 rounded-2xl" />)}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restaurants.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className="bg-white rounded-2xl shadow hover:shadow-lg transition-all card-lift overflow-hidden"
                    >
                      <div className="h-2 bg-gradient-to-r from-orange-500 to-red-700" />
                      <div className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <img
                            src={getDirectImageUrl(r.logoUrl)}
                            alt=""
                            className="w-14 h-14 rounded-xl object-cover bg-orange-100 flex-shrink-0"
                            onError={e => e.target.src = "https://placehold.co/56x56/FF6B00/fff?text=🍽"}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-heading font-bold text-gray-900 text-base">{r.name}</div>
                            <div className="text-xs text-gray-400 truncate">{r.ownerEmail}</div>
                            <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium mt-1 ${r.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                              {r.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs line-clamp-2 mb-4">{r.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => { setSelectedRestaurant(r); setActiveView("menu"); }}
                            className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1"
                          >
                            <UtensilsCrossed size={13} /> Menu
                          </button>
                          <button
                            onClick={() => setShowQRModal(r)}
                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1"
                          >
                            <QrCode size={13} /> QR Code
                          </button>
                          <button
                            onClick={() => setRestaurantToEdit(r)}
                            className="bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold py-2 px-3 rounded-xl transition-all"
                            title="Edit Restaurant"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold py-2 px-3 rounded-xl transition-all"
                            title="Delete Restaurant"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {restaurants.length === 0 && (
                    <div className="col-span-full text-center py-16 text-gray-400">
                      <div className="text-5xl mb-3">🏪</div>
                      <p className="font-medium">No restaurants yet</p>
                      <p className="text-sm">Click "Add Restaurant" to get started</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* MENU EDITOR */}
          {activeView === "menu" && selectedRestaurant && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <button
                onClick={() => { setSelectedRestaurant(null); setActiveView("restaurants"); }}
                className="flex items-center gap-2 text-orange-600 font-medium text-sm mb-5 hover:gap-3 transition-all"
              >
                ← Back to Restaurants
              </button>
              <DishManagerPanel restaurant={selectedRestaurant} />
            </motion.div>
          )}
        </main>
      </div>

      {/* Add/Edit Restaurant Modal */}
      <AnimatePresence>
        {(showAddModal || restaurantToEdit) && (
          <RestaurantModal
            restaurantToEdit={restaurantToEdit}
            onClose={() => {
              setShowAddModal(false);
              setRestaurantToEdit(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* QR Modal */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQRModal(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-heading text-xl font-bold text-gray-900 mb-1">QR Code</h3>
              <p className="text-gray-500 text-sm mb-5">{showQRModal.name}</p>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white rounded-2xl border-4 border-orange-100 shadow-inner">
                  <QRCode
                    id={`qr-${showQRModal.id}`}
                    value={menuUrl(showQRModal.id)}
                    size={180}
                    fgColor="#1A1A1A"
                    bgColor="#FFFFFF"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-5 break-all">{menuUrl(showQRModal.id)}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(menuUrl(showQRModal.id)); toast.success("Link copied!"); }}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-orange-300 text-orange-600 font-semibold text-sm py-3 rounded-xl hover:bg-orange-50 transition-all"
                >
                  <Copy size={15} /> Copy Link
                </button>
                <button
                  onClick={() => downloadQR(showQRModal.name, showQRModal.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold text-sm py-3 rounded-xl hover:bg-orange-600 transition-all"
                >
                  <Download size={15} /> Download
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-4">Print this and place it on every table 📋</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RestaurantModal({ onClose, restaurantToEdit = null }) {
  const [form, setForm] = useState({
    name: restaurantToEdit?.name || "",
    nameHindi: restaurantToEdit?.nameHindi || "",
    logoUrl: restaurantToEdit?.logoUrl || "",
    bannerUrl: restaurantToEdit?.bannerUrl || "",
    description: restaurantToEdit?.description || "",
    ownerEmail: restaurantToEdit?.ownerEmail || "",
    isActive: restaurantToEdit?.isActive !== undefined ? restaurantToEdit.isActive : true,
    address: restaurantToEdit?.address || "",
    mapUrl: restaurantToEdit?.mapUrl || "",
    cuisineTypes: restaurantToEdit?.cuisineTypes || "",
    timings: restaurantToEdit?.timings || "",
    phone: restaurantToEdit?.phone || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name || !form.ownerEmail) return toast.error("Name and owner email are required");
    setSaving(true);
    try {
      if (restaurantToEdit) {
        await updateDoc(doc(db, "restaurants", restaurantToEdit.id), form);
        toast.success("Restaurant updated! 🎉");
      } else {
        await addDoc(collection(db, "restaurants"), {
          ...form,
          createdAt: serverTimestamp(),
        });
        toast.success("Restaurant added! 🎉");
      }
      onClose();
    } catch (e) {
      toast.error(restaurantToEdit ? "Failed to update restaurant" : "Failed to add restaurant");
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
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-bold text-gray-900">
              {restaurantToEdit ? "Edit Restaurant" : "Add Restaurant"}
            </h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button>
          </div>

          <div className="space-y-4">
            {/* Section: Basic */}
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">Basic Info</p>
            <Input label="Restaurant Name *" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="Saffron Spice" />
            <Input label="Name (Hindi)" value={form.nameHindi} onChange={v => setForm(f => ({ ...f, nameHindi: v }))} placeholder="सैफ्रॉन स्पाइस" />
            <Input label="Owner Gmail *" value={form.ownerEmail} onChange={v => setForm(f => ({ ...f, ownerEmail: v }))} placeholder="owner@gmail.com" type="email" />
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-orange-300 outline-none"
                rows={2}
                placeholder="Authentic North Indian cuisine..."
              />
            </div>

            {/* Section: Media */}
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest pt-1">Images</p>
            <Input label="Logo URL" value={form.logoUrl} onChange={v => setForm(f => ({ ...f, logoUrl: v }))} placeholder="https://..." />
            {form.logoUrl && (
              <img src={getDirectImageUrl(form.logoUrl)} alt="Logo preview" className="w-16 h-16 rounded-xl object-cover border-2 border-orange-100" onError={e => e.target.style.display = 'none'} />
            )}
            <Input label="Banner URL (wide cover photo)" value={form.bannerUrl} onChange={v => setForm(f => ({ ...f, bannerUrl: v }))} placeholder="https://..." />
            {form.bannerUrl && (
              <img src={getDirectImageUrl(form.bannerUrl)} alt="Banner preview" className="w-full h-24 rounded-xl object-cover border-2 border-orange-100" onError={e => e.target.style.display = 'none'} />
            )}

            {/* Section: Details */}
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest pt-1">Location & Contact</p>
            <Input label="Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="123 MG Road, Bangalore, Karnataka" />
            <Input label="Google Maps URL (optional)" value={form.mapUrl} onChange={v => setForm(f => ({ ...f, mapUrl: v }))} placeholder="https://maps.google.com/?q=..." />
            <Input label="Phone Number" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="+91 98765 43210" type="tel" />

            {/* Section: Cuisine & Timings */}
            <p className="text-xs font-bold text-orange-500 uppercase tracking-widest pt-1">Cuisine & Timings</p>
            <Input label="Cuisine Types (comma separated)" value={form.cuisineTypes} onChange={v => setForm(f => ({ ...f, cuisineTypes: v }))} placeholder="North Indian, Mughlai, Biryani" />
            <Input label="Opening Hours" value={form.timings} onChange={v => setForm(f => ({ ...f, timings: v }))} placeholder="Mon–Sun: 11:00 AM – 11:00 PM" />

            {/* Active toggle */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-sm font-medium text-gray-700">Active Status</span>
              <button
                onClick={() => setForm(f => ({ ...f, isActive: !f.isActive }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${form.isActive ? "bg-green-500" : "bg-gray-300"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.isActive ? "left-6" : "left-0.5"}`} />
              </button>
              <span className={`text-xs font-semibold ${form.isActive ? "text-green-600" : "text-red-500"}`}>
                {form.isActive ? "Active (Visible & Dashboard Enabled)" : "Inactive (Hidden & Dashboard Locked)"}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-semibold text-sm hover:bg-orange-600 disabled:opacity-60 transition-all"
            >
              {saving ? "Saving..." : (restaurantToEdit ? "Save Changes" : "Add Restaurant")}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-300 outline-none transition-all"
      />
    </div>
  );
}
