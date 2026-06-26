import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Welcome to Menubabu! 🎉");
      // Navigation handled by App.jsx routing
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background floating emojis */}
      {["🍛","🍜","🥘","🍱"].map((e, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl opacity-20 pointer-events-none select-none"
          style={{ left: `${15 + i * 22}%`, top: `${20 + (i % 2) * 55}%` }}
          animate={{ y: [0, -20, 0], rotate: [0, 10, -5, 0] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          {e}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg shadow-orange-200 border-4 border-orange-100"
          >
            <img src="/logo.jpeg" alt="Menubabu" className="w-full h-full object-cover" />
          </motion.div>
          <h1 className="font-heading text-3xl font-bold text-gray-900">Menubabu</h1>
            <p className="text-orange-500 font-hindi font-medium mt-1">Scan karo, khao maro! 😄</p>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-1">Restaurant Owner Login</h2>
            <p className="text-gray-500 text-sm">Apne restaurant ka digital menu manage karein</p>
          </div>

          {/* Google Sign In */}
          <motion.button
            whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(255,107,0,0.25)" }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-4 rounded-2xl text-base transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-100"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="rgba(255,255,255,0.85)"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="rgba(255,255,255,0.7)"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="rgba(255,255,255,0.9)"/>
              </svg>
            )}
            {loading ? "Signing in..." : "Sign in with Google"}
          </motion.button>

          <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100">
            <p className="text-center text-orange-700 text-xs font-medium">
              🔒 For restaurant owners only. <br />
              Customer? Just scan the QR code on your table!
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full mt-4 text-center text-gray-400 text-sm hover:text-gray-600 transition-colors py-2"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}
