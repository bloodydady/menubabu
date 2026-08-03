import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { collection, doc, getDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { ShoppingCart, X, Plus, Minus, Printer, Trash2, ArrowLeft, Receipt, Search, Users, Share2, UserPlus, Check, Settings } from "lucide-react";
import { getDirectImageUrl } from "../utils/imageHelper";
import { useAuth } from "../context/AuthContext";

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

function RestaurantLogo({ logoUrl, name, sizeClass = "w-12 h-12 rounded-full" }) {
  const [error, setError] = useState(false);
  const directUrl = logoUrl ? getDirectImageUrl(logoUrl) : "";

  if (error || !directUrl) {
    return (
      <div className={`${sizeClass} bg-gradient-to-br from-orange-400 to-red-500 flex-shrink-0 flex items-center justify-center text-white font-bold border-2 border-white shadow-md`}>
        {name ? name[0].toUpperCase() : "🍽️"}
      </div>
    );
  }

  return (
    <img
      src={directUrl}
      alt={name}
      className={`${sizeClass} object-cover border-2 border-white shadow-md flex-shrink-0`}
      onError={() => setError(true)}
    />
  );
}

export default function CustomerMenu() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const { user, isSuperAdmin, ownerRestaurant } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState("en");
  const [filter, setFilter] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [waiterModal, setWaiterModal] = useState(false);
  const [splitBillOpen, setSplitBillOpen] = useState(false);
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const categoryRefs = useRef({});

  // Always fetch from Firestore — no demo mode
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const rDoc = await getDoc(doc(db, "restaurants", restaurantId));
        if (!rDoc.exists()) { setError("Restaurant not found"); setLoading(false); return; }
        setRestaurant({ id: rDoc.id, ...rDoc.data() });
      } catch (e) { setError("Failed to load menu"); setLoading(false); }
    };
    fetchRestaurant();

    const q = query(
      collection(db, "restaurants", restaurantId, "dishes"),
      orderBy("sortOrder", "asc")
    );
    const unsub = onSnapshot(q, snap => {
      setDishes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => { setError("Failed to load dishes"); setLoading(false); });
    return unsub;
  }, [restaurantId]);

  // SEO
  useEffect(() => {
    if (restaurant) {
      document.title = `${restaurant.name} - Menu | Menubabu`;
    }
  }, [restaurant]);

  // Cart helpers
  const addToCart = useCallback((dish, portion = null) => {
    const key = dish.id + (portion ? `-${portion}` : "");
    const price = portion && dish.portions ? Number(dish.portions[portion]) : Number(dish.price);
    setCart(c => ({
      ...c,
      [key]: {
        dish,
        portion,
        qty: (c[key]?.qty || 0) + 1,
        price
      }
    }));
  }, []);

  const removeFromCart = useCallback((dishId, portion = null) => {
    const key = dishId + (portion ? `-${portion}` : "");
    setCart(c => {
      const next = { ...c };
      if (next[key]?.qty > 1) {
        next[key] = { ...next[key], qty: next[key].qty - 1 };
      } else {
        delete next[key];
      }
      return next;
    });
  }, []);

  const clearCart = () => setCart({});

  const cartItems = Object.values(cart);
  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.qty * i.price, 0);

  // Filter and group dishes
  const filteredDishes = dishes.filter(d => {
    if (filter === "Veg" && !d.isVeg) return false;
    if (filter === "NonVeg" && d.isVeg) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        (d.nameHindi || "").includes(searchQuery) ||
        (d.description || "").toLowerCase().includes(q) ||
        (d.category || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const groupedByCategory = CATEGORIES.reduce((acc, cat) => {
    const items = filteredDishes.filter(d => d.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  const scrollToCategory = (cat) => {
    categoryRefs.current[cat]?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveCategory(cat);
  };

  // Loading state
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FFFBF5" }}>
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          {/* Outer pulsing ring */}
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-orange-100 animate-ping opacity-60" />
          {/* Middle ring */}
          <div className="absolute inset-2 w-16 h-16 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
          {/* Center food emoji */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-200">
            🍽️
          </div>
        </div>
        <div className="text-center">
          <p className="font-heading font-bold text-orange-600 text-base">मेनू लोड हो रहा है...</p>
          <p className="text-gray-400 text-xs mt-1">Loading your delicious menu</p>
        </div>
        {/* Animated dots */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-orange-400"
              style={{ animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#FFFBF5" }}>
      <div className="text-6xl mb-4">😕</div>
      <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">Menu not found</h2>
      <p className="text-gray-500">{error}</p>
    </div>
  );

  if (!restaurant) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FFFBF5" }}>
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-orange-100 animate-ping opacity-60" />
          <div className="absolute inset-2 w-16 h-16 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-200">
            🍽️
          </div>
        </div>
        <p className="font-hindi text-orange-600 font-medium">मेनू लोड हो रहा है...</p>
      </div>
    </div>
  );

  if (restaurant.isActive === false) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: "#FFFBF5" }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md bg-white p-8 rounded-3xl shadow-xl border border-orange-100 flex flex-col items-center"
      >
        <div className="text-6xl mb-4">🏪⚠️</div>
        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">Service Suspended</h2>
        <p className="text-gray-500 mb-6 text-sm">
          This restaurant's menu card is temporarily suspended or inactive. Please contact the administrator at <strong className="text-orange-600">monsterproduction21@gmail.com</strong> or call <strong className="text-orange-600">8303858857</strong> for details.
        </p>
        <div className="font-heading text-xs font-bold text-orange-500 tracking-wider">
          POWERED BY MENUBABU
        </div>
      </motion.div>
    </div>
  );

  const t = {
    all: lang === "hi" ? "सभी" : "All",
    veg: lang === "hi" ? "शाकाहारी" : "Veg",
    nonveg: lang === "hi" ? "मांसाहारी" : "Non-Veg",
    soldOut: lang === "hi" ? "बिक गया" : "SOLD OUT",
    addToCart: lang === "hi" ? "जोड़ें" : "Add",
    cart: lang === "hi" ? "आइटम लिस्ट" : "Selected Items",
    total: lang === "hi" ? "कुल बिल" : "Total Bill",
    showWaiter: lang === "hi" ? "टोटल बिल वेटर को दिखाएं 🙏" : "Show Bill to Waiter 🙏",
    taxes: lang === "hi" ? "टैक्स (यदि लागू हो)" : "Taxes (if applicable)",
    emptyCart: lang === "hi" ? "कोई आइटम सिलेक्ट नहीं है" : "No items selected",
    orderSummary: lang === "hi" ? "बिल विवरण" : "Bill Summary",
  };

  return (
    <div className="min-h-screen pb-36" style={{ background: "#FFFBF5" }}>

      {/* ── BANNER HERO (shown at top when scanning QR) ─────────────────── */}
      {restaurant.bannerUrl ? (
        <div className="relative h-44 sm:h-56 overflow-hidden">
          <img
            src={getDirectImageUrl(restaurant.bannerUrl)}
            alt={restaurant.name + " banner"}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {/* Overlay restaurant name on banner */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 flex items-end gap-3">
            <RestaurantLogo
              logoUrl={restaurant.logoUrl}
              name={restaurant.name}
              sizeClass="w-14 h-14 rounded-2xl border-2 border-white shadow-lg"
            />
            <div className="flex-1 min-w-0">
              <h1 className="font-heading text-lg font-bold text-white leading-tight drop-shadow truncate">{restaurant.name}</h1>
              {restaurant.description && (
                <p className="text-white/80 text-xs truncate">{restaurant.description}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* No banner – show a gradient strip with logo + name */
        <div className="relative h-28 bg-gradient-to-br from-orange-500 to-red-700 flex items-end px-4 pb-4">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center text-[120px] select-none">🍽️</div>
          <div className="relative flex items-end gap-3">
            <RestaurantLogo
              logoUrl={restaurant.logoUrl}
              name={restaurant.name}
              sizeClass="w-14 h-14 rounded-2xl border-2 border-white shadow-lg"
            />
            <div className="flex-1 min-w-0 pb-0.5">
              <h1 className="font-heading text-lg font-bold text-white leading-tight truncate">{restaurant.name}</h1>
              {restaurant.description && (
                <p className="text-white/70 text-xs truncate">{restaurant.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-orange-100 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <RestaurantLogo
            logoUrl={restaurant.logoUrl}
            name={restaurant.name}
            sizeClass="w-10 h-10 rounded-xl border-2 border-orange-200"
          />
          <div className="flex-1 min-w-0">
            <div className="font-heading text-sm font-bold text-gray-900 leading-tight truncate">{restaurant.name}</div>
            <p className="text-gray-400 text-xs truncate">{restaurant.description}</p>
          </div>
          {/* Language Toggle */}
          <div className="flex-shrink-0 bg-gray-100 rounded-full p-0.5 flex">
            {["en", "hi"].map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${lang === l ? "bg-orange-500 text-white shadow" : "text-gray-500 hover:text-gray-700"}`}
              >
                {l === "en" ? "EN" : "हिं"}
              </button>
            ))}
          </div>
          {/* Owner / Admin quick access */}
          {isSuperAdmin ? (
            <Link
              to="/admin"
              className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md"
              title="Admin Panel"
            >
              <Settings size={14} />
            </Link>
          ) : user && ownerRestaurant?.id === restaurantId ? (
            <Link
              to="/dashboard"
              className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md"
              title="Manage Menu"
            >
              <Settings size={14} />
            </Link>
          ) : !user ? (
            <Link
              to="/login"
              className="flex-shrink-0 text-[10px] text-gray-400 hover:text-orange-500 font-semibold transition-colors"
            >
              Owner?
            </Link>
          ) : null}
        </div>

        {/* Filter Bar + Search */}
        <div className="max-w-2xl mx-auto px-4 pb-2 flex gap-2 items-center">
          <div className="flex gap-2 flex-1 overflow-x-auto no-scrollbar">
            {[
              { key: "All", label: t.all },
              { key: "Veg", label: `🟢 ${t.veg}` },
              { key: "NonVeg", label: `🔴 ${t.nonveg}` },
            ].map(f => (
              <motion.button
                key={f.key}
                onClick={() => setFilter(f.key)}
                whileTap={{ scale: 0.95 }}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filter === f.key
                    ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"
                }`}
              >
                {f.label}
              </motion.button>
            ))}
          </div>
          <button
            onClick={() => setSearchOpen(s => !s)}
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              searchOpen ? "bg-orange-500 text-white" : "bg-white border border-gray-200 text-gray-500"
            }`}
          >
            <Search size={15} />
          </button>
        </div>

        {/* Search Input (expandable) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="max-w-2xl mx-auto px-4 pb-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={lang === "hi" ? "डिश खोजें..." : "Search dishes..."}
                    className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-orange-200 text-sm bg-white shadow-sm outline-none focus:ring-2 focus:ring-orange-300"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CATEGORY NAV */}
        {!searchQuery && Object.keys(groupedByCategory).length > 0 && (
          <div className="border-t border-gray-100 bg-white">
            <div className="max-w-2xl mx-auto flex gap-0 overflow-x-auto no-scrollbar">
              {Object.keys(groupedByCategory).map(cat => (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(cat)}
                  className={`flex-shrink-0 px-4 py-3 text-xs font-semibold border-b-2 transition-all uppercase tracking-wider ${
                    activeCategory === cat
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-orange-500"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* MENU CONTENT */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {/* Search results banner */}
        {searchQuery && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-orange-600">{filteredDishes.length}</span>
              {" "}{lang === "hi" ? `"${searchQuery}" के लिए परिणाम` : `results for "${searchQuery}"`}
            </p>
            <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="text-xs text-orange-500 font-medium hover:underline">
              {lang === "hi" ? "साफ करें" : "Clear"}
            </button>
          </div>
        )}
        {filteredDishes.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-3">{searchQuery ? "🔍" : "🍽️"}</div>
            <p className="font-medium text-lg">{searchQuery ? `No dishes match "${searchQuery}"` : "No dishes available"}</p>
            <p className="text-sm">{searchQuery ? "Try a different word" : "Try changing the filter"}</p>
          </div>
        ) : searchQuery ? (
          /* Flat search results */
          <div className="space-y-3 mb-8">
            {filteredDishes.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                lang={lang}
                cart={cart}
                onAdd={addToCart}
                onRemove={removeFromCart}
                soldOutLabel={t.soldOut}
              />
            ))}
          </div>
        ) : (
          /* Grouped by category */
          Object.entries(groupedByCategory).map(([cat, catDishes]) => (
            <div
              key={cat}
              ref={el => categoryRefs.current[cat] = el}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-heading text-xl font-bold text-gray-900">{cat}</h2>
                <div className="flex-1 h-px bg-orange-100" />
                <span className="text-xs text-gray-400 font-medium">{catDishes.length} items</span>
              </div>
              <div className="space-y-3">
                {catDishes.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    lang={lang}
                    cart={cart}
                    onAdd={addToCart}
                    onRemove={removeFromCart}
                    soldOutLabel={t.soldOut}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CART BOTTOM BAR */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="w-full max-w-2xl mx-auto flex items-center justify-between bg-gradient-to-r from-orange-500 to-red-700 text-white rounded-2xl px-5 py-4 shadow-xl shadow-orange-300/50 block"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Receipt size={18} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">{totalItems} {totalItems === 1 ? "Item" : "Items"} Selected</div>
                  <div className="text-white/70 text-xs">{lang === "hi" ? "कुल बिल देखने के लिए दबाएं" : "Tap to check total bill"}</div>
                </div>
              </div>
              <div className="font-black text-xl">₹{totalPrice}</div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CART BOTTOM SHEET */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => setCartOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              className="absolute bottom-0 left-0 right-0 bg-white bottom-sheet max-h-[85vh] overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Sheet handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-200 rounded-full" />
              </div>
              <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
                <h3 className="font-heading text-lg font-bold text-gray-900">🛒 {t.cart}</h3>
                <div className="flex items-center gap-2">
                  {cartItems.length > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.93 }}
                      onClick={() => { clearCart(); toast.success("Cart cleared 🗑️"); }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-xl transition-all"
                    >
                      <Trash2 size={13} />
                      {lang === "hi" ? "साफ करें" : "Clear All"}
                    </motion.button>
                  )}
                  <button onClick={() => setCartOpen(false)} className="p-2 rounded-xl hover:bg-gray-100">
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <div className="text-5xl mb-3">🛒</div>
                    <p className="font-medium">{t.emptyCart}</p>
                  </div>
                ) : cartItems.map(({ dish, portion, qty, price }) => (
                  <div key={dish.id + (portion ? `-${portion}` : "")} className="flex items-center gap-3 p-3 bg-orange-50 rounded-2xl">
                    <img src={getDirectImageUrl(dish.imageUrl)} alt={dish.name} className="w-12 h-12 rounded-xl object-cover bg-orange-100" onError={e => e.target.src = "https://placehold.co/48x48/FFF3E0/FF6B00?text=🍽"} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">
                        {lang === "hi" && dish.nameHindi ? dish.nameHindi : dish.name}
                        {portion && (
                          <span className="ml-1.5 text-[9px] text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded font-bold uppercase">
                            {portion === "half" ? (lang === "hi" ? "हाफ" : "Half") : portion === "quarter" ? (lang === "hi" ? "क्वार्टर" : "Quarter") : (lang === "hi" ? "फुल" : "Full")}
                          </span>
                        )}
                      </div>
                      <div className="text-orange-600 font-bold text-sm">₹{price * qty}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => removeFromCart(dish.id, portion)} className="w-7 h-7 rounded-lg bg-white border border-orange-200 flex items-center justify-center text-orange-500 hover:bg-orange-50">
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-sm w-5 text-center">{qty}</span>
                      <button onClick={() => addToCart(dish, portion)} className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600">
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {cartItems.length > 0 && (
                <div className="px-5 py-4 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{t.taxes}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-heading text-lg font-bold">{t.total}</span>
                    <span className="font-black text-2xl text-orange-600">₹{totalPrice}</span>
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => { setCartOpen(false); setSplitBillOpen(true); }}
                      className="flex-1 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-bold py-3.5 rounded-2xl text-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Users size={16} />
                      {lang === "hi" ? "बिल बांटें" : "Split Bill"}
                    </button>
                    <button
                      onClick={() => { setCartOpen(false); setWaiterModal(true); }}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-700 text-white font-bold py-3.5 rounded-2xl text-sm shadow-lg shadow-orange-200/50 active:scale-95 transition-all"
                    >
                      {t.showWaiter}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WAITER MODAL */}
      <AnimatePresence>
        {waiterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setWaiterModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
              id="waiter-order-card"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🙏</div>
                <h3 className="font-heading text-xl font-bold text-gray-900">{t.orderSummary}</h3>
                <p className="text-gray-500 text-sm">{restaurant.name}</p>
              </div>
              <div className="border-t border-b border-dashed border-gray-200 py-4 space-y-2 mb-4">
                {cartItems.map(({ dish, portion, qty, price }, i) => (
                  <div key={dish.id + (portion ? `-${portion}` : "")} className="flex justify-between text-sm">
                    <span className="text-gray-700 flex gap-2">
                      <span className="font-semibold text-gray-400">{i + 1}.</span>
                      <div>
                        {lang === "hi" && dish.nameHindi ? dish.nameHindi : dish.name}
                        {portion && (
                          <span className="ml-1.5 text-[10px] text-orange-600 font-bold uppercase">
                            ({portion})
                          </span>
                        )}
                        <span className="text-gray-400 text-xs ml-1.5">× {qty}</span>
                      </div>
                    </span>
                    <span className="font-semibold">₹{price * qty}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-heading text-base font-bold">{t.total}</span>
                <span className="font-black text-2xl text-orange-600">₹{totalPrice}</span>
              </div>
              
              {restaurant?.upiId ? (
                <button
                  onClick={() => setUpiModalOpen(true)}
                  className="w-full mb-3 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Wallet size={16} />
                  {lang === "hi" ? `₹${totalPrice} UPI से पे करें (GPay/PhonePe)` : `Pay ₹${totalPrice} via UPI (GPay/PhonePe)`}
                </button>
              ) : null}

              <p className="text-center text-xs text-gray-400 mb-4">Please show this to your waiter to place the order 🙏</p>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 font-semibold text-sm py-3 rounded-xl hover:bg-gray-50 no-print"
                >
                  <Printer size={15} /> Print
                </button>
                <button
                  onClick={() => setWaiterModal(false)}
                  className="flex-1 bg-orange-500 text-white font-semibold text-sm py-3 rounded-xl hover:bg-orange-600"
                >
                  Done ✓
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SPLIT BILL MODAL */}
      <SplitBillModal
        isOpen={splitBillOpen}
        onClose={() => setSplitBillOpen(false)}
        cartItems={cartItems}
        totalPrice={totalPrice}
        lang={lang}
        restaurantName={restaurant.name}
      />

      {/* UPI PAYMENT MODAL */}
      <UPIPaymentModal
        isOpen={upiModalOpen}
        onClose={() => setUpiModalOpen(false)}
        totalPrice={totalPrice}
        restaurant={restaurant}
        lang={lang}
      />
    </div>
  );
}

function SplitBillModal({ isOpen, onClose, cartItems, totalPrice, lang, restaurantName }) {
  const [mode, setMode] = useState("equal"); // "equal" | "itemized"
  const [numPeople, setNumPeople] = useState(2);
  const [tipPercent, setTipPercent] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [personNames, setPersonNames] = useState(["Person 1", "Person 2"]);
  const [itemSharing, setItemSharing] = useState({});

  useEffect(() => {
    setPersonNames(prev => {
      const next = [...prev];
      if (next.length < numPeople) {
        for (let i = next.length; i < numPeople; i++) {
          next.push(lang === "hi" ? `दोस्त ${i + 1}` : `Friend ${i + 1}`);
        }
      } else if (next.length > numPeople) {
        next.splice(numPeople);
      }
      return next;
    });

    setItemSharing(prev => {
      const next = { ...prev };
      cartItems.forEach(item => {
        const key = item.dish.id + (item.portion ? `-${item.portion}` : "");
        if (!next[key] || next[key].length !== numPeople) {
          next[key] = Array(numPeople).fill(true);
        }
      });
      return next;
    });
  }, [numPeople, cartItems, lang]);

  const handleNameChange = (idx, newName) => {
    setPersonNames(prev => {
      const next = [...prev];
      next[idx] = newName;
      return next;
    });
  };

  const toggleItemShare = (itemKey, personIdx) => {
    setItemSharing(prev => {
      const next = { ...prev };
      if (!next[itemKey]) return prev;
      const updated = [...next[itemKey]];
      const activeCount = updated.filter(Boolean).length;
      if (activeCount === 1 && updated[personIdx]) {
        toast.error(lang === "hi" ? "कम से कम एक व्यक्ति चुनना होगा!" : "At least one person must share this!");
        return prev;
      }
      updated[personIdx] = !updated[personIdx];
      next[itemKey] = updated;
      return next;
    });
  };

  const calculatedTip = customTip !== "" ? Number(customTip) : (totalPrice * tipPercent) / 100;
  const billTotalWithTip = totalPrice + calculatedTip;
  const equalSplitShare = (billTotalWithTip / numPeople).toFixed(2);

  const getShares = () => {
    const shares = Array(numPeople).fill(0);
    cartItems.forEach(item => {
      const key = item.dish.id + (item.portion ? `-${item.portion}` : "");
      const sharingArray = itemSharing[key] || Array(numPeople).fill(true);
      const sharingCount = sharingArray.filter(Boolean).length;
      if (sharingCount === 0) return;

      const itemTotalCost = item.price * item.qty;
      const shareCost = itemTotalCost / sharingCount;

      sharingArray.forEach((isSharing, idx) => {
        if (isSharing) shares[idx] += shareCost;
      });
    });

    if (calculatedTip > 0 && totalPrice > 0) {
      shares.forEach((share, idx) => {
        const ratio = share / totalPrice;
        shares[idx] += ratio * calculatedTip;
      });
    }
    return shares;
  };

  const personShares = getShares();

  const getShareText = () => {
    let text = `🧾 *${restaurantName} - Bill Split Summary* 🧾\n`;
    text += `--------------------------\n`;
    text += `Subtotal: ₹${totalPrice}\n`;
    if (calculatedTip > 0) text += `Tip: ₹${calculatedTip}\n`;
    text += `*Total Bill: ₹${billTotalWithTip.toFixed(2)}*\n\n`;

    if (mode === "equal") {
      text += `Split equally among ${numPeople} people:\n`;
      text += `Each pays: *₹${equalSplitShare}*\n`;
    } else {
      text += `Split by items:\n`;
      personNames.forEach((name, idx) => {
        text += `• *${name}*: ₹${personShares[idx].toFixed(2)}\n`;
        const itemsList = [];
        cartItems.forEach(item => {
          const key = item.dish.id + (item.portion ? `-${item.portion}` : "");
          const sharingArray = itemSharing[key] || [];
          if (sharingArray[idx]) {
            const portionText = item.portion ? ` (${item.portion})` : "";
            itemsList.push(`${item.dish.name}${portionText} (x${item.qty})`);
          }
        });
        if (itemsList.length > 0) {
          text += `  Items: ${itemsList.join(", ")}\n`;
        }
        text += `\n`;
      });
    }
    text += `Powered by Menubabu 🍽️`;
    return text;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getShareText());
    toast.success(lang === "hi" ? "विवरण क्लिपबोर्ड पर कॉपी हो गया! 📋" : "Split summary copied to clipboard! 📋");
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-55 flex items-center justify-center p-4"
        style={{ zIndex: 100 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-gray-900">
                {lang === "hi" ? "👥 बिल विभाजन" : "👥 Split Bill"}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {lang === "hi" ? `कुल बिल: ₹${totalPrice}` : `Total Bill: ₹${totalPrice}`}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="px-5 pt-4">
            <div className="flex gap-2 bg-orange-50/50 p-1.5 rounded-2xl">
              <button
                onClick={() => setMode("equal")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === "equal" ? "bg-orange-500 text-white shadow-md" : "text-orange-700 hover:bg-orange-100/50"
                }`}
              >
                {lang === "hi" ? "बराबर बांटें" : "Split Equally"}
              </button>
              <button
                onClick={() => setMode("itemized")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === "itemized" ? "bg-orange-500 text-white shadow-md" : "text-orange-700 hover:bg-orange-100/50"
                }`}
              >
                {lang === "hi" ? "अलग-अलग बांटें" : "Split by Items"}
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 flex-1 overflow-y-auto space-y-4">
            {/* Number of People Counter */}
            <div className="bg-orange-50/30 rounded-2xl p-4 border border-orange-100/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  {lang === "hi" ? "लोगों की संख्या" : "Number of People"}
                </span>
                <span className="font-heading text-2xl font-black text-orange-600 mt-0.5 block">{numPeople}</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={numPeople <= 1}
                  onClick={() => setNumPeople(p => Math.max(1, p - 1))}
                  className="w-10 h-10 rounded-xl bg-white border border-orange-200 flex items-center justify-center text-orange-600 hover:bg-orange-50 font-bold text-lg disabled:opacity-50"
                >
                  -
                </button>
                <button
                  disabled={numPeople >= 10}
                  onClick={() => setNumPeople(p => Math.min(10, p + 1))}
                  className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 font-bold text-lg disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Tip Option */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                {lang === "hi" ? "टिप / सर्विस चार्ज जोड़ें" : "Add Tip / Service Charge"}
              </label>
              <div className="flex gap-2">
                {[0, 5, 10, 15].map(pct => (
                  <button
                    key={pct}
                    onClick={() => { setTipPercent(pct); setCustomTip(""); }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all border ${
                      customTip === "" && tipPercent === pct
                        ? "bg-orange-100 text-orange-700 border-orange-300"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {pct === 0 ? (lang === "hi" ? "कोई नहीं" : "None") : `${pct}%`}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input
                  type="number"
                  placeholder={lang === "hi" ? "कस्टम टिप राशि डालें..." : "Enter custom tip amount..."}
                  value={customTip}
                  onChange={e => setCustomTip(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-orange-200 text-sm bg-white outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </div>

            {/* Equal Split Result Panel */}
            {mode === "equal" ? (
              <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-6 text-white text-center shadow-lg shadow-orange-100/70">
                <span className="text-xs text-white/80 font-bold uppercase tracking-widest">
                  {lang === "hi" ? "प्रति व्यक्ति भुगतान" : "EACH PERSON PAYS"}
                </span>
                <h4 className="font-heading text-4xl font-black mt-2">₹{equalSplitShare}</h4>
                <p className="text-white/60 text-xs mt-2">
                  {lang === "hi"
                    ? `कुल बिल (टिप सहित): ₹${billTotalWithTip.toFixed(2)}`
                    : `Total Bill (incl. tip): ₹${billTotalWithTip.toFixed(2)}`}
                </p>
              </div>
            ) : (
              /* Itemized Split View */
              <div className="space-y-4">
                {/* Person names customization */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    {lang === "hi" ? "नाम बदलें" : "Customize Names"}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {personNames.map((name, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={name}
                        onChange={e => handleNameChange(idx, e.target.value)}
                        placeholder={`Person ${idx + 1}`}
                        className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white focus:border-orange-300 outline-none"
                      />
                    ))}
                  </div>
                </div>

                {/* List items with checklist sharing */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    {lang === "hi" ? "डिश के अनुसार विभाजन" : "Assign Items (Tap to toggle share)"}
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {cartItems.map(item => {
                      const key = item.dish.id + (item.portion ? `-${item.portion}` : "");
                      const sharingArray = itemSharing[key] || Array(numPeople).fill(true);
                      const portionText = item.portion ? ` (${item.portion})` : "";
                      return (
                        <div key={key} className="bg-orange-50/40 border border-orange-100/50 rounded-2xl p-3 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-800">
                              {lang === "hi" && item.dish.nameHindi ? item.dish.nameHindi : item.dish.name}
                              {portionText} <span className="text-gray-400 font-medium">x{item.qty}</span>
                            </span>
                            <span className="font-extrabold text-orange-600">₹{item.price * item.qty}</span>
                          </div>
                          {/* Person selectors for this item */}
                          <div className="flex flex-wrap gap-1.5">
                            {personNames.map((name, pIdx) => {
                              const isSharing = sharingArray[pIdx];
                              return (
                                <button
                                  key={pIdx}
                                  onClick={() => toggleItemShare(key, pIdx)}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                    isSharing
                                      ? "bg-orange-500 text-white border-orange-500"
                                      : "bg-white text-gray-400 border-gray-200 hover:bg-gray-50"
                                  }`}
                                >
                                  {isSharing && <Check size={8} />}
                                  {name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Final Share List */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    {lang === "hi" ? "हिस्सेदारी का परिणाम" : "Calculated Shares"}
                  </label>
                  <div className="space-y-2">
                    {personNames.map((name, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-orange-50/20 p-3 rounded-xl border border-gray-100">
                        <span className="text-xs font-semibold text-gray-800">{name}</span>
                        <span className="text-sm font-black text-orange-600">₹{personShares[idx].toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-gray-100 flex gap-2">
            <button
              onClick={handleCopyText}
              className="flex-1 flex items-center justify-center gap-1.5 border-2 border-gray-200 text-gray-600 font-semibold text-xs py-3.5 rounded-xl hover:bg-gray-50 transition-all active:scale-95"
            >
              <Share2 size={14} />
              {lang === "hi" ? "समरी कॉपी करें" : "Copy Details"}
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-semibold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-green-100 active:scale-95"
            >
              <Users size={14} />
              {lang === "hi" ? "व्हाट्सएप शेयर" : "WhatsApp Share"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


function DishCard({ dish, lang, cart, onAdd, onRemove, soldOutLabel }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Parse available portions if dish has portions
  const availablePortions = Object.entries(dish.portions || {})
    .filter(([_, price]) => price && Number(price) > 0)
    .map(([name]) => name);

  const [selectedPortion, setSelectedPortion] = useState(availablePortions[0] || "full");

  const hasPortions = dish.hasPortions && availablePortions.length > 0;
  const activePortion = hasPortions ? selectedPortion : null;
  const currentPrice = hasPortions ? Number(dish.portions[selectedPortion]) : Number(dish.price);
  const cartKey = dish.id + (activePortion ? `-${activePortion}` : "");
  const qty = cart[cartKey]?.qty || 0;

  const portionLabel = (p) => {
    if (p === "half") return lang === "hi" ? "हाफ" : "Half";
    if (p === "quarter") return lang === "hi" ? "क्वार्टर" : "Quarter";
    return lang === "hi" ? "फुल" : "Full";
  };

  const desc = lang === "hi" && dish.descriptionHindi ? dish.descriptionHindi : dish.description;

  return (
    <motion.div
      layout
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all ${dish.isSoldOut ? "opacity-70" : "hover:shadow-md"}`}
    >
      {/* Top: image + info */}
      <div className="flex gap-3 p-3">
        {/* BIGGER image */}
        <div className="relative w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-orange-50">
          {!imgLoaded && <div className="absolute inset-0 shimmer" />}
          <img
            src={getDirectImageUrl(dish.imageUrl)}
            alt={dish.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={e => { e.target.src = "https://placehold.co/112x112/FFF3E0/FF6B00?text=\ud83c\udf7d"; setImgLoaded(true); }}
          />
          {dish.isSoldOut && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
              <span className="text-white text-[10px] font-bold bg-red-500 px-2 py-1 rounded-full">{soldOutLabel}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-1.5 mb-0.5">
              <div className={dish.isVeg ? "veg-dot mt-1 flex-shrink-0" : "nonveg-dot mt-1 flex-shrink-0"} />
              <div>
                <div className="font-semibold text-gray-900 text-sm leading-snug">
                  {lang === "hi" && dish.nameHindi ? dish.nameHindi : dish.name}
                </div>
                {lang === "hi" && dish.nameHindi && dish.name !== dish.nameHindi && (
                  <div className="text-xs text-gray-400">{dish.name}</div>
                )}
              </div>
            </div>

            {/* Description - expandable */}
            {desc && (
              <div className="mt-1">
                <p className={`text-gray-400 text-xs leading-relaxed ${expanded ? "" : "line-clamp-2"}`}>{desc}</p>
                {desc.length > 60 && (
                  <button
                    onClick={() => setExpanded(e => !e)}
                    className="text-[10px] text-orange-500 font-semibold mt-0.5"
                  >
                    {expanded ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            )}

            {/* ALL portion prices displayed */}
            {hasPortions ? (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {availablePortions.map(p => (
                  <button
                    key={p}
                    onClick={() => setSelectedPortion(p)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                      selectedPortion === p
                        ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                        : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                    }`}
                  >
                    {portionLabel(p)} • ₹{dish.portions[p]}
                  </button>
                ))}
              </div>
            ) : (
              <div className="font-black text-orange-600 text-base mt-1">₹{dish.price}</div>
            )}
          </div>

          {/* Add / qty controls */}
          <div className="flex items-center justify-between mt-2">
            {hasPortions && (
              <span className="font-black text-orange-600 text-base">₹{currentPrice}</span>
            )}
            <div className="ml-auto">
              {dish.isSoldOut ? (
                <div className="text-xs font-semibold text-red-400 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                  Sold Out
                </div>
              ) : qty === 0 ? (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => onAdd(dish, activePortion)}
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-200"
                >
                  <Plus size={13} /> {lang === "hi" ? "जोड़ें" : "Add"}
                </motion.button>
              ) : (
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl overflow-hidden"
                >
                  <button onClick={() => onRemove(dish.id, activePortion)} className="w-8 h-8 flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="font-black text-orange-700 text-sm min-w-[18px] text-center">{qty}</span>
                  <button onClick={() => onAdd(dish, activePortion)} className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white hover:bg-orange-600 transition-colors">
                    <Plus size={14} />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function UPIPaymentModal({ isOpen, onClose, totalPrice, restaurant, lang }) {
  if (!isOpen || !restaurant?.upiId) return null;

  const upiId = restaurant.upiId;
  const restaurantName = restaurant.name;
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(restaurantName)}&am=${totalPrice}&cu=INR&tn=${encodeURIComponent("Menubabu Bill Payment - " + restaurantName)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    toast.success(lang === "hi" ? "UPI ID कॉपी हो गया!" : "UPI ID copied to clipboard!");
  };

  const handlePayClick = (appScheme) => {
    // If specific app scheme is requested, fallback to default upiLink
    window.location.href = appScheme || upiLink;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-55 flex items-center justify-center p-4"
        style={{ zIndex: 110 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
                💳
              </div>
              <div>
                <h3 className="font-heading text-base font-bold">
                  {lang === "hi" ? "UPI भुगतान" : "UPI Direct Payment"}
                </h3>
                <p className="text-xs text-white/80">{restaurantName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/20 text-white">
              <X size={18} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Total amount card */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
              <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider block">
                {lang === "hi" ? "भुगतान राशि" : "AMOUNT TO PAY"}
              </span>
              <h2 className="font-heading text-4xl font-black text-emerald-700 mt-1">₹{totalPrice}</h2>
              <div className="mt-2 text-xs text-emerald-800 font-mono bg-white/80 py-1.5 px-3 rounded-xl inline-flex items-center gap-2 border border-emerald-200">
                <span>UPI ID: <strong>{upiId}</strong></span>
                <button onClick={handleCopyUpi} className="text-emerald-600 hover:text-emerald-900 font-bold text-[10px] underline">
                  Copy
                </button>
              </div>
            </div>

            {/* Direct Pay Buttons */}
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2 text-center">
                {lang === "hi" ? "भुगतान ऐप से भुगतान करें" : "Pay directly via UPI App"}
              </label>
              
              <a
                href={upiLink}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 active:scale-95 text-center mb-2"
              >
                <ExternalLink size={16} />
                {lang === "hi" ? "यूपीआई ऐप खोलें (GPay/PhonePe)" : "Open Any UPI App (GPay / PhonePe / Paytm)"}
              </a>
              
              <p className="text-[10px] text-gray-400 text-center">
                {lang === "hi" ? "राशि ऑटो-फील हो जाएगी" : "Amount ₹" + totalPrice + " will be pre-filled automatically"}
              </p>
            </div>

            {/* Waiter verification notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-900 flex items-start gap-2">
              <span className="text-base flex-shrink-0">⚠️</span>
              <div>
                <strong className="block font-bold">
                  {lang === "hi" ? "महत्वपूर्ण सूचना:" : "Verification Notice:"}
                </strong>
                {lang === "hi" 
                  ? "भुगतान करने के बाद पेमेंट सक्सेस स्क्रीन (Payment Success Screen) अपने वेटर को अवश्य दिखाएं।" 
                  : "Please show the payment success screen to your waiter after completing payment."}
              </div>
            </div>
          </div>

          <div className="px-5 pb-5">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-all"
            >
              {lang === "hi" ? "बंद करें" : "Close"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

