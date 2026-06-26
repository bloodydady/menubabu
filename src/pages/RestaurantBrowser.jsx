import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, ArrowLeft, MapPin, UtensilsCrossed } from "lucide-react";

export default function RestaurantBrowser() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const q = query(
          collection(db, "restaurants"),
          where("isActive", "==", true),
          orderBy("name", "asc")
        );
        const snap = await getDocs(q);
        setRestaurants(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        // If index not ready, fallback without ordering
        try {
          const snap2 = await getDocs(collection(db, "restaurants"));
          setRestaurants(
            snap2.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(r => r.isActive)
              .sort((a, b) => a.name.localeCompare(b.name))
          );
        } catch (_) {}
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.description || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.nameHindi || "").includes(search)
  );

  return (
    <div className="min-h-screen" style={{ background: "#FFFBF5" }}>
      {/* Header */}
      <div className="hero-gradient pt-12 pb-16 px-4 relative overflow-hidden">
        {/* Floating emojis */}
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
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
              Restaurants
            </h1>
          </div>
          <p className="text-white/80 text-base mb-8">
            Apne pasand ka restaurant dhundho aur menu dekho
          </p>

          {/* Search bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Restaurant ka naam search karo..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 text-base shadow-xl outline-none border-0 focus:ring-2 focus:ring-orange-300"
              style={{ background: "rgba(255,255,255,0.97)" }}
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Wave separator */}
      <div className="-mt-6 relative z-10">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 48L1440 48L1440 20C1200 48 960 0 720 20C480 40 240 0 0 20L0 48Z" fill="#FFFBF5" />
        </svg>
      </div>

      {/* Results */}
      <div className="max-w-2xl mx-auto px-4 py-4 -mt-2">
        {/* Count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-500 text-sm font-medium">
            {loading ? "Loading..." : `${filtered.length} restaurant${filtered.length !== 1 ? "s" : ""} ${search ? "mila" : "available"}`}
          </p>
          {search && (
            <button onClick={() => setSearch("")} className="text-orange-500 text-sm font-medium hover:underline">
              Clear search
            </button>
          )}
        </div>

        {/* Skeleton loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="shimmer h-28 rounded-3xl" />
            ))}
          </div>
        )}

        {/* No results */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="font-heading text-xl font-bold text-gray-800 mb-2">
              {search ? `"${search}" nahi mila` : "Koi restaurant nahi mila"}
            </h3>
            <p className="text-gray-400 text-sm">
              {search ? "Doosra naam try karein" : "Admin se restaurant add karne ko kahein"}
            </p>
          </motion.div>
        )}

        {/* Restaurant cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {!loading && filtered.map((r, i) => (
              <motion.div
                key={r.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate(`/restaurant/${r.id}`)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-100 hover:border-orange-200"
              >
                <div className="flex items-stretch">
                  {/* Logo */}
                  <div className="w-28 h-28 flex-shrink-0 relative overflow-hidden">
                    <img
                      src={r.logoUrl}
                      alt={r.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/112x112/FFF3E0/FF6B00?text=${encodeURIComponent(r.name[0])}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/0 group-hover:to-orange-500/5 transition-all duration-300" />
                  </div>

                  {/* Info */}
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
                        <motion.div
                          className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-50 group-hover:bg-orange-500 flex items-center justify-center transition-all"
                          whileHover={{ scale: 1.1 }}
                        >
                          <ChevronRight size={16} className="text-orange-400 group-hover:text-white transition-colors" />
                        </motion.div>
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

        {/* Footer note */}
        {!loading && filtered.length > 0 && (
          <p className="text-center text-gray-300 text-xs mt-10 pb-6">
            Powered by 🍽️ Menubabu
          </p>
        )}
      </div>
    </div>
  );
}
