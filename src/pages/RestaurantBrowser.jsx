import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, ArrowLeft, UtensilsCrossed, X, Utensils } from "lucide-react";
import { getDirectImageUrl } from "../utils/imageHelper";

export default function RestaurantBrowser() {
  const [restaurants, setRestaurants] = useState([]);
  const [allDishes, setAllDishes] = useState([]); // {dish, restaurant}
  const [loading, setLoading] = useState(true);
  const [dishesLoading, setDishesLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("restaurants"); // "restaurants" | "dishes"
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const snap = await getDocs(collection(db, "restaurants"));
        const list = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(r => r.isActive !== false)
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setRestaurants(list);
      } catch (_) {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Fetch all dishes across all restaurants when switching to dish tab
  const loadAllDishes = useCallback(async () => {
    if (allDishes.length > 0) return;
    setDishesLoading(true);
    try {
      const restSnap = await getDocs(collection(db, "restaurants"));
      const rests = restSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(r => r.isActive !== false);

      const results = [];
      await Promise.all(
        rests.map(async rest => {
          try {
            const dishSnap = await getDocs(collection(db, "restaurants", rest.id, "dishes"));
            dishSnap.docs.forEach(d => {
              results.push({ dish: { id: d.id, ...d.data() }, restaurant: rest });
            });
          } catch (_) {}
        })
      );
      setAllDishes(results);
    } catch (_) {}
    setDishesLoading(false);
  }, [allDishes.length]);

  useEffect(() => {
    if (tab === "dishes") loadAllDishes();
  }, [tab, loadAllDishes]);

  const filteredRestaurants = restaurants.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    (r.description || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.nameHindi || "").includes(search) ||
    (r.cuisineTypes || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredDishes = allDishes.filter(({ dish, restaurant }) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      dish.name?.toLowerCase().includes(q) ||
      (dish.nameHindi || "").includes(search) ||
      (dish.description || "").toLowerCase().includes(q) ||
      (dish.category || "").toLowerCase().includes(q) ||
      restaurant.name?.toLowerCase().includes(q)
    );
  });

  const portionLabel = (p) => p === "half" ? "Half" : p === "quarter" ? "Quarter" : "Full";

  return (
    <div className="min-h-screen" style={{ background: "#FFFBF5" }}>
      {/* Header */}
      <div className="hero-gradient pt-12 pb-16 px-4 relative overflow-hidden">
        {["🍛", "🥘", "🍜", "🍱"].map((e, i) => (
          <motion.span
            key={i}
            className="absolute text-3xl opacity-20 pointer-events-none"
            style={{ left: `${10 + i * 24}%`, top: `${20 + (i % 2) * 40}%` }}
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
          >
            {e}
          </motion.span>
        ))}

        <div className="max-w-2xl mx-auto relative">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🍽️</span>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">Find Food</h1>
          </div>
          <p className="text-white/80 text-base mb-6">
            Search restaurants or find any dish by name
          </p>

          {/* Search bar */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={tab === "restaurants" ? "Restaurant name search karo..." : "Dish name ya category search karo..."}
              className="w-full pl-12 pr-10 py-4 rounded-2xl text-gray-900 text-base shadow-xl outline-none border-0 focus:ring-2 focus:ring-orange-300"
              style={{ background: "rgba(255,255,255,0.97)" }}
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Wave */}
      <div className="-mt-6 relative z-10">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 48L1440 48L1440 20C1200 48 960 0 720 20C480 40 240 0 0 20L0 48Z" fill="#FFFBF5" />
        </svg>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-2">
        {/* Tab switcher */}
        <div className="flex gap-2 mb-5">
          {[
            { key: "restaurants", label: "🏪 Restaurants" },
            { key: "dishes", label: "🍽️ Dishes" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                tab === t.key
                  ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-500 text-sm font-medium">
            {tab === "restaurants"
              ? (loading ? "Loading..." : `${filteredRestaurants.length} restaurant${filteredRestaurants.length !== 1 ? "s" : ""} ${search ? "found" : "available"}`)
              : (dishesLoading ? "Loading dishes..." : `${filteredDishes.length} dish${filteredDishes.length !== 1 ? "es" : ""} ${search ? "found" : ""}`)
            }
          </p>
          {search && (
            <button onClick={() => setSearch("")} className="text-orange-500 text-sm font-medium hover:underline">
              Clear
            </button>
          )}
        </div>

        {/* ── RESTAURANT TAB ── */}
        {tab === "restaurants" && (
          <>
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="shimmer h-28 rounded-3xl" />)}
              </div>
            )}

            {!loading && filteredRestaurants.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-heading text-xl font-bold text-gray-800 mb-2">
                  {search ? `"${search}" nahi mila` : "Koi restaurant nahi mila"}
                </h3>
                <p className="text-gray-400 text-sm">
                  {search ? "Doosra naam try karein" : "Admin se restaurant add karne ko kahein"}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <AnimatePresence>
                {!loading && filteredRestaurants.map((r, i) => (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/restaurant/${r.id}`)}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-orange-200"
                  >
                    <div className="flex items-stretch">
                      <div className="w-28 h-28 flex-shrink-0 relative overflow-hidden bg-orange-50">
                        {r.logoUrl ? (
                          <img
                            src={getDirectImageUrl(r.logoUrl)}
                            alt={r.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={e => { e.target.onerror = null; e.target.src = `https://placehold.co/112x112/FFF3E0/FF6B00?text=${encodeURIComponent(r.name?.[0] || "R")}`; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-3xl font-bold">
                            {r.name?.[0]?.toUpperCase() || "R"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <h3 className="font-heading font-bold text-gray-900 text-base leading-tight group-hover:text-orange-600 transition-colors">
                                {r.name}
                              </h3>
                              {r.nameHindi && (
                                <div className="font-hindi text-xs text-gray-400 mt-0.5">{r.nameHindi}</div>
                              )}
                            </div>
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 group-hover:bg-orange-500 flex items-center justify-center transition-all">
                              <ChevronRight size={16} className="text-orange-400 group-hover:text-white transition-colors" />
                            </div>
                          </div>
                          {r.description && (
                            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{r.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                            Menu Available
                          </span>
                          <span className="text-xs text-orange-500 font-semibold flex items-center gap-1">
                            <UtensilsCrossed size={11} />
                            View Menu →
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* ── DISHES TAB ── */}
        {tab === "dishes" && (
          <>
            {dishesLoading && (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="shimmer h-24 rounded-2xl" />)}
              </div>
            )}

            {!dishesLoading && filteredDishes.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-heading text-xl font-bold text-gray-800 mb-2">
                  {search ? `"${search}" nahi mila` : "No dishes found"}
                </h3>
                <p className="text-gray-400 text-sm">
                  {search ? "Doosra naam try karein" : "Restaurants ke dishes load ho rahe hain..."}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <AnimatePresence>
                {!dishesLoading && filteredDishes.map(({ dish, restaurant }, i) => (
                  <motion.div
                    key={dish.id + restaurant.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-orange-200 cursor-pointer group"
                  >
                    <div className="flex items-stretch gap-0">
                      {/* Dish image */}
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden bg-orange-50">
                        {dish.imageUrl ? (
                          <img
                            src={getDirectImageUrl(dish.imageUrl)}
                            alt={dish.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => { e.target.src = "https://placehold.co/96x96/FFF3E0/FF6B00?text=🍽"; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                        )}
                      </div>

                      <div className="flex-1 p-3 min-w-0">
                        <div className="flex items-start gap-1 mb-0.5">
                          <div className={`mt-1 flex-shrink-0 ${dish.isVeg ? "veg-dot" : "nonveg-dot"}`} />
                          <div className="font-semibold text-gray-900 text-sm truncate">{dish.name}</div>
                        </div>

                        {/* Prices */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {dish.hasPortions && dish.portions ? (
                            Object.entries(dish.portions)
                              .filter(([, price]) => price && Number(price) > 0)
                              .map(([portion, price]) => (
                                <span key={portion} className="text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full">
                                  {portionLabel(portion)} ₹{price}
                                </span>
                              ))
                          ) : (
                            <span className="text-orange-600 font-black text-sm">₹{dish.price}</span>
                          )}
                        </div>

                        {dish.description && (
                          <p className="text-gray-400 text-xs line-clamp-1 mt-0.5">{dish.description}</p>
                        )}

                        {/* Restaurant name chip */}
                        <div className="flex items-center gap-1 mt-1.5">
                          <Utensils size={10} className="text-orange-400" />
                          <span className="text-[10px] text-orange-600 font-semibold truncate">{restaurant.name}</span>
                          <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0">Tap to view menu →</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Footer */}
        <p className="text-center text-gray-300 text-xs mt-10 pb-6">
          Powered by 🍽️ Menubabu
        </p>
      </div>
    </div>
  );
}
