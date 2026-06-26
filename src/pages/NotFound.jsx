import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#FFFBF5" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-8xl mb-6"
        >
          🍽️
        </motion.div>
        <h1 className="font-heading text-6xl font-bold text-gray-900 mb-3">404</h1>
        <p className="font-heading text-2xl text-gray-700 mb-2">Yeh page nahi mila!</p>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Lagta hai aap galat jagah aa gaye. Wapas chalte hain.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-2xl transition-all active:scale-95 inline-block"
          >
            🏠 Home Pe Jao
          </Link>
          <Link
            to="/restaurants"
            className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold px-6 py-3 rounded-2xl transition-all active:scale-95 inline-block"
          >
            🍛 Browse Restaurants
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
