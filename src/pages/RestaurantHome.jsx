import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Clock, Phone, ChevronRight, ArrowLeft,
  Share2, Star, UtensilsCrossed, Tag, Info
} from "lucide-react";

const CATEGORY_EMOJIS = {
  Starters: "🥗",
  "Main Course": "🍛",
  Breads: "🍞",
  Drinks: "🥤",
  Desserts: "🍮",
};

export default function RestaurantHome() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [shareMsg, setShareMsg] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const rDoc = await getDoc(doc(db, "restaurants", restaurantId));
        if (!rDoc.exists()) { setError("Restaurant not found"); setLoading(false); return; }
        setRestaurant({ id: rDoc.id, ...rDoc.data() });

        const q = query(
          collection(db, "restaurants", restaurantId, "dishes"),
          orderBy("sortOrder", "asc")
        );
        const dishSnap = await getDocs(q);
        setDishes(dishSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        setError("Failed to load restaurant");
      }
      setLoading(false);
    };
    fetch();
  }, [restaurantId]);

  useEffect(() => {
    if (restaurant) {
      document.title = `${restaurant.name} | Menubabu`;
    }
  }, [restaurant]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: restaurant?.name, url });
    } else {
      navigator.clipboard.writeText(url);
      setShareMsg(true);
      setTimeout(() => setShareMsg(false), 2000);
    }
  };

  // Group dishes by category for preview
  const groupedDishes = dishes.reduce((acc, d) => {
    if (!acc[d.category]) acc[d.category] = [];
    acc[d.category].push(d);
    return acc;
  }, {});

  const availableDishes = dishes.filter(d => !d.isSoldOut);
  const vegCount = dishes.filter(d => d.isVeg).length;
  const nonVegCount = dishes.filter(d => !d.isVeg).length;

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#FFFBF5" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
        <p className="font-hindi text-orange-600 font-medium">लोड हो रहा है...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#FFFBF5" }}>
      <div className="text-6xl mb-4">😕</div>
      <h2 className="font-heading text-2xl font-bold mb-2">Restaurant not found</h2>
      <p className="text-gray-500 mb-6">{error}</p>
      <button onClick={() => navigate("/restaurants")} className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-semibold">
        ← Browse Restaurants
      </button>
    </div>
  );

  if (restaurant && restaurant.isActive === false) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center" style={{ background: "#FFFBF5" }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md bg-white p-8 rounded-3xl shadow-xl border border-orange-100 flex flex-col items-center"
      >
        <div className="text-6xl mb-4">🏪⚠️</div>
        <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">Service Suspended</h2>
        <p className="text-gray-500 mb-6 text-sm">
          This restaurant is temporarily suspended or inactive. Please contact the administrator at <strong className="text-orange-600">monsterproduction21@gmail.com</strong> or call <strong className="text-orange-600">8303858857</strong> for details.
        </p>
        <div className="font-heading text-xs font-bold text-orange-500 tracking-wider">
          POWERED BY MENUBABU
        </div>
      </motion.div>
    </div>
  );

  const cuisines = restaurant.cuisineTypes
    ? (Array.isArray(restaurant.cuisineTypes) ? restaurant.cuisineTypes : restaurant.cuisineTypes.split(",").map(c => c.trim()))
    : [];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO BANNER ──────────────────────────────────────────────── */}
      <div className="relative h-56 md:h-72 overflow-hidden bg-gradient-to-br from-orange-500 to-red-800">
        {restaurant.bannerUrl && (
          <>
            {!imgLoaded && <div className="absolute inset-0 shimmer" />}
            <img
              src={restaurant.bannerUrl}
              alt="banner"
              className={`w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </>
        )}
        {!restaurant.bannerUrl && (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <span className="text-[120px]">🍽️</span>
          </div>
        )}

        {/* Top nav buttons */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/restaurants")}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all"
          >
            <ArrowLeft size={18} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all relative"
          >
            <Share2 size={17} />
            <AnimatePresence>
              {shareMsg && (
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap"
                >
                  Link copied!
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* ── RESTAURANT CARD ──────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* Logo + Name row */}
          <div className="p-5 flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg bg-orange-50"
                onError={e => { e.target.src = `https://placehold.co/80x80/FFF3E0/FF6B00?text=${restaurant.name[0]}`; }}
              />
              {restaurant.isActive && (
                <span className="absolute -bottom-1.5 -right-1.5 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Open
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-heading text-2xl font-bold text-gray-900 leading-tight">{restaurant.name}</h1>
              {restaurant.nameHindi && (
                <p className="font-hindi text-sm text-gray-400 mt-0.5">{restaurant.nameHindi}</p>
              )}
              {cuisines.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {cuisines.map((c, i) => (
                    <span key={i} className="text-xs bg-orange-50 text-orange-600 border border-orange-100 px-2.5 py-1 rounded-full font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 border-t border-gray-50 divide-x divide-gray-100">
            <div className="flex flex-col items-center py-3">
              <span className="text-lg font-black text-gray-900">{dishes.length}</span>
              <span className="text-xs text-gray-400 font-medium">Dishes</span>
            </div>
            <div className="flex flex-col items-center py-3">
              <span className="text-lg font-black text-green-600">{vegCount}</span>
              <span className="text-xs text-gray-400 font-medium">🟢 Veg</span>
            </div>
            <div className="flex flex-col items-center py-3">
              <span className="text-lg font-black text-red-500">{nonVegCount}</span>
              <span className="text-xs text-gray-400 font-medium">🔴 Non-Veg</span>
            </div>
          </div>
        </motion.div>

        {/* ── INFO CARDS ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-4 bg-white rounded-3xl shadow-sm overflow-hidden"
        >
          {restaurant.description && (
            <InfoRow
              icon={<Info size={16} className="text-orange-500" />}
              label="About"
              value={restaurant.description}
            />
          )}
          {restaurant.address && (
            <InfoRow
              icon={<MapPin size={16} className="text-orange-500" />}
              label="Address"
              value={restaurant.address}
              isLink={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`}
              linkLabel="Get Directions →"
            />
          )}
          {restaurant.timings && (
            <InfoRow
              icon={<Clock size={16} className="text-orange-500" />}
              label="Timings"
              value={restaurant.timings}
            />
          )}
          {restaurant.phone && (
            <InfoRow
              icon={<Phone size={16} className="text-orange-500" />}
              label="Phone"
              value={restaurant.phone}
              isLink={`tel:${restaurant.phone}`}
              linkLabel={`Call ${restaurant.phone}`}
            />
          )}
        </motion.div>

        {/* ── MENU PREVIEW ─────────────────────────────────────────────── */}
        {Object.keys(groupedDishes).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-lg font-bold text-gray-900">Menu Preview</h2>
              <button
                onClick={() => navigate(`/menu/${restaurantId}`)}
                className="text-orange-500 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All <ChevronRight size={15} />
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(groupedDishes).map(([cat, catDishes], ci) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + ci * 0.07 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Category header */}
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                    <span className="text-lg">{CATEGORY_EMOJIS[cat] || "🍽️"}</span>
                    <span className="font-heading font-bold text-gray-800 text-sm">{cat}</span>
                    <span className="text-xs text-gray-400 font-medium">({catDishes.length})</span>
                  </div>

                  {/* Show up to 3 dishes per category */}
                  <div className="divide-y divide-gray-50">
                    {catDishes.slice(0, 3).map((dish) => (
                      <PreviewDishRow key={dish.id} dish={dish} />
                    ))}
                    {catDishes.length > 3 && (
                      <button
                        onClick={() => navigate(`/menu/${restaurantId}`)}
                        className="w-full py-3 text-xs font-semibold text-orange-500 hover:bg-orange-50 transition-colors flex items-center justify-center gap-1"
                      >
                        +{catDishes.length - 3} more items <ChevronRight size={13} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty menu */}
        {!loading && dishes.length === 0 && (
          <div className="mt-4 text-center py-10 bg-white rounded-3xl shadow-sm">
            <div className="text-5xl mb-3">🍽️</div>
            <p className="text-gray-500 font-medium">Menu abhi available nahi hai</p>
            <p className="text-gray-400 text-sm">Please check back later</p>
          </div>
        )}

        {/* ── BIG CTA ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-5 mb-10"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ boxShadow: "0 12px 32px rgba(255,107,0,0.3)" }}
            onClick={() => navigate(`/menu/${restaurantId}`)}
            className="w-full bg-gradient-to-r from-orange-500 to-red-700 text-white font-bold py-5 rounded-3xl text-lg shadow-xl shadow-orange-200 flex items-center justify-center gap-3 transition-all"
          >
            <UtensilsCrossed size={22} />
            View Full Menu
            <ChevronRight size={20} />
          </motion.button>
          <p className="text-center text-gray-400 text-xs mt-3">
            Scan the QR on your table or browse here 📱
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────

function InfoRow({ icon, label, value, isLink, linkLabel }) {
  return (
    <div className="flex items-start gap-3 px-5 py-4 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</div>
        <div className="text-sm text-gray-700 leading-relaxed">{value}</div>
        {isLink && linkLabel && (
          <a
            href={isLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-orange-500 font-semibold mt-1 inline-block hover:underline"
          >
            {linkLabel}
          </a>
        )}
      </div>
    </div>
  );
}

function PreviewDishRow({ dish }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${dish.isSoldOut ? "opacity-50" : ""}`}>
      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-orange-50">
        {!loaded && <div className="absolute inset-0 shimmer rounded-xl" />}
        <img
          src={dish.imageUrl}
          alt={dish.name}
          loading="lazy"
          className={`w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          onError={e => { e.target.src = "https://placehold.co/56x56/FFF3E0/FF6B00?text=🍽"; setLoaded(true); }}
        />
        {dish.isSoldOut && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
            <span className="text-white text-[8px] font-bold">SOLD OUT</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <div className={dish.isVeg ? "veg-dot scale-75" : "nonveg-dot scale-75"} />
          <span className="font-semibold text-sm text-gray-900 truncate">{dish.name}</span>
        </div>
        {dish.description && (
          <p className="text-xs text-gray-400 truncate">{dish.description}</p>
        )}
      </div>
      <div className="font-black text-orange-600 text-sm flex-shrink-0">₹{dish.price}</div>
    </div>
  );
}
