import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { collection, doc, getDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { ShoppingCart, X, Plus, Minus, Printer, Trash2, ArrowLeft } from "lucide-react";

const CATEGORIES = ["Starters", "Main Course", "Breads", "Drinks", "Desserts"];

export default function CustomerMenu() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

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
  const addToCart = useCallback((dish) => {
    setCart(c => ({ ...c, [dish.id]: { dish, qty: (c[dish.id]?.qty || 0) + 1 } }));
  }, []);
  const removeFromCart = useCallback((dishId) => {
    setCart(c => {
      const next = { ...c };
      if (next[dishId]?.qty > 1) next[dishId] = { ...next[dishId], qty: next[dishId].qty - 1 };
      else delete next[dishId];
      return next;
    });
  }, []);
  const clearCart = () => setCart({});

  const cartItems = Object.values(cart);
  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cartItems.reduce((s, i) => s + i.qty * i.dish.price, 0);

  // Filter and group dishes
  const filteredDishes = dishes.filter(d => {
    if (filter === "Veg" && !d.isVeg) return false;
    if (filter === "NonVeg" && d.isVeg) return false;
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
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
        <p className="font-hindi text-orange-600">मेनू लोड हो रहा है...</p>
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
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
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
    cart: lang === "hi" ? "कार्ट" : "Cart",
    total: lang === "hi" ? "कुल" : "Total",
    showWaiter: lang === "hi" ? "वेटर को दिखाएं 🙏" : "Show This to Waiter 🙏",
    taxes: lang === "hi" ? "टैक्स लागू" : "Taxes as applicable",
    emptyCart: lang === "hi" ? "कार्ट खाली है" : "Cart is empty",
    orderSummary: lang === "hi" ? "ऑर्डर सारांश" : "Order Summary",
  };

  return (
    <div className="min-h-screen pb-36" style={{ background: "#FFFBF5" }}>
      {/* STICKY HEADER */}
      <header className="sticky top-0 z-30 glass border-b border-white/30 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <img
            src={restaurant.logoUrl || "/logo.jpeg"}
            alt={restaurant.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-orange-200 shadow flex-shrink-0"
            onError={e => { e.target.onerror = null; e.target.src = "/logo.jpeg"; }}
          />
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-lg font-bold text-gray-900 leading-tight truncate">{restaurant.name}</h1>
            <p className="text-gray-500 text-xs truncate">{restaurant.description}</p>
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
        </div>

        {/* Filter Bar */}
        <div className="max-w-2xl mx-auto px-4 pb-2 flex gap-2">
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
      </header>

      {/* CATEGORY NAV */}
      <div className="sticky top-[104px] z-20 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-2xl mx-auto flex gap-0 overflow-x-auto no-scrollbar">
          {Object.keys(groupedByCategory).map(cat => (
            <button
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
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

      {/* MENU CONTENT */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {Object.keys(groupedByCategory).length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-3">🍽️</div>
            <p className="font-medium text-lg">No dishes available</p>
            <p className="text-sm">Try changing the filter</p>
          </div>
        ) : (
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
                    qty={cart[dish.id]?.qty || 0}
                    onAdd={() => addToCart(dish)}
                    onRemove={() => removeFromCart(dish.id)}
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
                  <ShoppingCart size={18} />
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">{totalItems} {totalItems === 1 ? "item" : "items"}</div>
                  <div className="text-white/70 text-xs">Tap to view cart</div>
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
                ) : cartItems.map(({ dish, qty }) => (
                  <div key={dish.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-2xl">
                    <img src={dish.imageUrl} alt={dish.name} className="w-12 h-12 rounded-xl object-cover bg-orange-100" onError={e => e.target.src = "https://placehold.co/48x48/FFF3E0/FF6B00?text=🍽"} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">{lang === "hi" && dish.nameHindi ? dish.nameHindi : dish.name}</div>
                      <div className="text-orange-600 font-bold text-sm">₹{dish.price * qty}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => removeFromCart(dish.id)} className="w-7 h-7 rounded-lg bg-white border border-orange-200 flex items-center justify-center text-orange-500 hover:bg-orange-50">
                        <Minus size={14} />
                      </button>
                      <span className="font-bold text-sm w-5 text-center">{qty}</span>
                      <button onClick={() => addToCart(dish)} className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600">
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
                  <button
                    onClick={() => { setCartOpen(false); setWaiterModal(true); }}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-700 text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-orange-200 active:scale-95 transition-all"
                  >
                    {t.showWaiter}
                  </button>
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
                {cartItems.map(({ dish, qty }, i) => (
                  <div key={dish.id} className="flex justify-between text-sm">
                    <span className="text-gray-700 flex gap-2">
                      <span className="font-semibold text-gray-400">{i + 1}.</span>
                      {lang === "hi" && dish.nameHindi ? dish.nameHindi : dish.name} × {qty}
                    </span>
                    <span className="font-semibold">₹{dish.price * qty}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-heading text-base font-bold">{t.total}</span>
                <span className="font-black text-2xl text-orange-600">₹{totalPrice}</span>
              </div>
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
    </div>
  );
}

function DishCard({ dish, lang, qty, onAdd, onRemove, soldOutLabel }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      layout
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all ${dish.isSoldOut ? "opacity-70" : "hover:shadow-md"}`}
    >
      <div className="flex gap-3 p-3">
        {/* Image */}
        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-orange-50">
          {!imgLoaded && <div className="absolute inset-0 shimmer" />}
          <img
            src={dish.imageUrl}
            alt={dish.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgLoaded(true)}
            onError={e => { e.target.src = "https://placehold.co/96x96/FFF3E0/FF6B00?text=🍽"; setImgLoaded(true); }}
          />
          {dish.isSoldOut && (
            <div className="sold-out-overlay rounded-xl">
              <span className="text-white text-[9px] font-bold bg-red-500 px-1.5 py-0.5 rounded-full">{soldOutLabel}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start gap-1.5 mb-0.5">
              <div className={dish.isVeg ? "veg-dot mt-0.5" : "nonveg-dot mt-0.5"} />
              <div>
                <div className="font-semibold text-gray-900 text-sm leading-snug">
                  {lang === "hi" && dish.nameHindi ? dish.nameHindi : dish.name}
                </div>
                {lang === "hi" && dish.nameHindi && dish.name !== dish.nameHindi && (
                  <div className="text-xs text-gray-400">{dish.name}</div>
                )}
              </div>
            </div>
            <p className="text-gray-400 text-xs line-clamp-2 mt-0.5 leading-relaxed">
              {lang === "hi" && dish.descriptionHindi ? dish.descriptionHindi : dish.description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="font-black text-orange-600 text-base">₹{dish.price}</span>

            {dish.isSoldOut ? (
              <div className="text-xs font-semibold text-red-400 bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                Sold Out
              </div>
            ) : qty === 0 ? (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onAdd}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-orange-200"
              >
                <Plus size={13} /> Add
              </motion.button>
            ) : (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl overflow-hidden"
              >
                <button onClick={onRemove} className="w-8 h-8 flex items-center justify-center text-orange-600 hover:bg-orange-100 transition-colors">
                  <Minus size={14} />
                </button>
                <span className="font-black text-orange-700 text-sm min-w-[18px] text-center">{qty}</span>
                <button onClick={onAdd} className="w-8 h-8 flex items-center justify-center bg-orange-500 text-white hover:bg-orange-600 transition-colors">
                  <Plus size={14} />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
