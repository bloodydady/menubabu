import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { LogOut, QrCode, Copy, Download, AlertTriangle } from "lucide-react";
import QRCode from "react-qr-code";
import toast from "react-hot-toast";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import DishManagerPanel from "../components/DishManagerPanel";

export default function RestaurantDashboard() {
  const { user, ownerRestaurant, logout } = useAuth();
  const [showQR, setShowQR] = useState(false);
  const [restaurantData, setRestaurantData] = useState(ownerRestaurant);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ownerRestaurant?.id) {
      setLoading(false);
      return;
    }
    const unsub = onSnapshot(doc(db, "restaurants", ownerRestaurant.id), (docSnap) => {
      if (docSnap.exists()) {
        setRestaurantData({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });
    return unsub;
  }, [ownerRestaurant]);

  const menuUrl = `${window.location.origin}/menu/${restaurantData?.id}`;

  const downloadQR = () => {
    const svg = document.getElementById("owner-qr");
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
      ctx.fillText(restaurantData?.name || "", 150, 300);
      ctx.font = "12px Inter, sans-serif";
      ctx.fillStyle = "#FF6B00";
      ctx.fillText("Scan karo, khao maro!", 150, 325);
      const link = document.createElement("a");
      link.download = `menubabu-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FFFBF5" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
          <p className="font-hindi text-orange-600 font-medium">लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  if (restaurantData?.isActive === false) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FFFBF5" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-red-100 text-center flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
            <AlertTriangle size={32} />
          </div>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-2">Account Inactive</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Your restaurant panel for <strong>{restaurantData.name}</strong> is currently suspended by the administrator. This is usually due to pending subscription payments or configuration updates.
          </p>
          <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 w-full text-left text-xs text-gray-600 mb-6 space-y-2">
            <div>📧 <strong>Admin Email:</strong> monsterproduction21@gmail.com</div>
            <div>📞 <strong>Admin Phone:</strong> +91 8303858857</div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 text-white font-semibold py-3 rounded-xl hover:bg-red-600 transition-all"
          >
            <LogOut size={16} /> Logout
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#FFFBF5" }}>
      {/* Top bar */}
      <header className="sticky top-0 z-20 glass border-b border-white/30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <img
            src={restaurantData?.logoUrl}
            alt=""
            className="w-10 h-10 rounded-xl object-cover bg-orange-100"
            onError={e => e.target.src = "https://placehold.co/40x40/FF6B00/fff?text=🍽"}
          />
          <div className="flex-1 min-w-0">
            <div className="font-heading font-bold text-gray-900 text-base leading-tight">{restaurantData?.name}</div>
            <div className="text-xs text-gray-400">{user?.email}</div>
          </div>
          <button
            onClick={() => setShowQR(true)}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-all"
          >
            <QrCode size={14} /> QR Code
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-all"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-orange-500 to-red-700 rounded-2xl p-5 text-white"
        >
          <div className="text-2xl mb-1">🙏 Namaste!</div>
          <div className="font-heading text-xl font-bold">{restaurantData?.name}</div>
          <div className="text-white/80 text-sm mt-1">Manage your menu from here</div>
        </motion.div>

        <DishManagerPanel restaurant={restaurantData} isOwnerView />
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-heading text-xl font-bold mb-1">Your Menu QR Code</h3>
              <p className="text-gray-500 text-sm mb-5">{restaurantData?.name}</p>
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white rounded-2xl border-4 border-orange-100 shadow-inner">
                  <QRCode id="owner-qr" value={menuUrl} size={180} fgColor="#1A1A1A" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-5 break-all">{menuUrl}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(menuUrl); toast.success("Link copied!"); }}
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-orange-300 text-orange-600 font-semibold text-sm py-3 rounded-xl hover:bg-orange-50"
                >
                  <Copy size={14} /> Copy Link
                </button>
                <button
                  onClick={downloadQR}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold text-sm py-3 rounded-xl hover:bg-orange-600"
                >
                  <Download size={14} /> Download
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-4">Print this and place on every table 📋</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
