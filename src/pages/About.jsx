import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen" style={{ background: "#FFFBF5" }}>
      {/* Header */}
      <div className="hero-gradient py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-8 transition-colors">
            ← Back to Home
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-center mb-4">
              <img src="/logo.jpeg" alt="Menubabu" className="w-20 h-20 rounded-2xl object-cover shadow-xl border-4 border-white/30" />
            </div>
            <h1 className="font-heading text-4xl font-bold text-white mb-3">About Menubabu</h1>
            <p className="text-white/80 text-lg">India ka apna digital menu platform 🇮🇳</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">

        {/* Mission */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="text-3xl mb-3">🎯</div>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            Menubabu was born from a simple idea — every Indian restaurant deserves a beautiful digital menu, without spending thousands on app development. We make it as easy as printing a QR code and placing it on your table.
          </p>
          <p className="text-gray-600 leading-relaxed mt-3">
            No apps to download. No complicated setup. Just scan, see, and eat. <span className="font-hindi font-semibold text-orange-600">स्कैन करो, खाओ मारो!</span>
          </p>
        </motion.div>

        {/* Story */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="text-3xl mb-3">📖</div>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-3">Our Story</h2>
          <p className="text-gray-600 leading-relaxed">
            Founded by <strong>Deepak Singh</strong>, Menubabu started as a passion project to help local Indian restaurants modernize without the complexity. After seeing restaurant owners struggle with expensive menu printing, outdated price boards, and "sold out" confusion, we built a solution that works for everyone — from a small dhaba to a fine dining restaurant.
          </p>
        </motion.div>

        {/* What We Do */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="text-3xl mb-3">⚡</div>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "📱", title: "QR-Based Menu", desc: "Customers scan a QR code — no app needed" },
              { icon: "🌐", title: "Hindi + English", desc: "Full bilingual support for every customer" },
              { icon: "⚡", title: "Instant Updates", desc: "Change prices and dishes in real-time" },
              { icon: "🛒", title: "Bill Calculator", desc: "Customers add items and see their total" },
              { icon: "🚫", title: "Sold Out Toggle", desc: "Mark dishes unavailable instantly" },
              { icon: "🆓", title: "Free to Start", desc: "First month completely free, always" },
            ].map((f, i) => (
              <div key={i} className="flex gap-3 p-4 bg-orange-50 rounded-2xl">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{f.title}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-orange-500 to-red-700 rounded-3xl p-8 text-white text-center">
          <div className="text-4xl mb-3">👨‍💻</div>
          <h2 className="font-heading text-2xl font-bold mb-2">Built with ❤️ in India</h2>
          <p className="text-white/80 leading-relaxed">
            Menubabu is made by <strong>Deepak Singh</strong> and a small passionate team dedicated to empowering Indian restaurants with modern technology at honest prices.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact" className="bg-white text-orange-600 font-semibold px-6 py-3 rounded-2xl hover:shadow-lg transition-all active:scale-95">
              Get in Touch
            </Link>
            <Link to="/restaurants" className="bg-white/15 border border-white/30 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-white/25 transition-all">
              Browse Restaurants
            </Link>
          </div>
        </motion.div>

      </div>

      {/* Footer */}
      <SimpleFooter />
    </div>
  );
}

function SimpleFooter() {
  return (
    <footer className="bg-gray-900 text-white py-8 px-4 mt-8">
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img src="/logo.jpeg" alt="Menubabu" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-heading font-bold text-orange-400">Menubabu</span>
        </div>
        <div className="flex gap-5 text-sm text-gray-400">
          <Link to="/about" className="hover:text-white transition-colors">About</Link>
          <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
        </div>
        <div className="text-gray-500 text-xs">Made with ❤️ for Indian restaurants</div>
      </div>
    </footer>
  );
}
