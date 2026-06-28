import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView, useAnimation } from "framer-motion";
import { QrCode, Star, Zap, Globe, ShoppingCart, ToggleLeft, Download } from "lucide-react";

const EMOJIS = [
  { emoji: "🍛", x: "8%", y: "15%", delay: 0, duration: 6 },
  { emoji: "🍜", x: "82%", y: "22%", delay: 1.2, duration: 7 },
  { emoji: "🥘", x: "65%", y: "70%", delay: 0.5, duration: 5.5 },
  { emoji: "🍱", x: "18%", y: "75%", delay: 1.8, duration: 8 },
  { emoji: "🍕", x: "48%", y: "8%", delay: 0.8, duration: 6.5 },
  { emoji: "🥗", x: "90%", y: "55%", delay: 2, duration: 7 },
  { emoji: "🍲", x: "5%", y: "50%", delay: 1.5, duration: 6 },
];

function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const steps = [
  { icon: "📱", step: "01", title: "QR Code Table Pe", desc: "Restaurant owner prints the QR code and places it on every table." },
  { icon: "🔍", step: "02", title: "Customer Scans", desc: "Guest scans with any phone camera. No app download needed." },
  { icon: "✨", step: "03", title: "Menu Instantly", desc: "Full digital menu opens instantly — beautifully, in Hindi or English." },
];

const features = [
  { icon: <Zap size={22} />, title: "Instant Menu Updates", desc: "Change prices or dishes in seconds, live for all customers." },
  { icon: <Globe size={22} />, title: "Hindi + English", desc: "Bilingual menu with smooth language toggle for every customer." },
  { icon: <ShoppingCart size={22} />, title: "Bill Calculator Cart", desc: "Customers add items, see total, show to waiter. No app needed." },
  { icon: <ToggleLeft size={22} />, title: "Sold Out Toggle", desc: "Mark dishes as sold out instantly. No confusion, no disappointment." },
  { icon: <QrCode size={22} />, title: "QR Code Download", desc: "Download print-ready QR code for every table instantly." },
  { icon: <Star size={22} />, title: "Veg / Non-veg Filter", desc: "Customers filter menu by dietary preference with one tap." },
];

const plans = [
  {
    name: "Free Trial",
    price: "₹0",
    period: "first 30 days",
    color: "from-gray-100 to-gray-50",
    border: "border-gray-200",
    badge: "Trial",
    features: ["1 Restaurant Profile", "Unlimited Dishes & Images", "QR Code Generation", "Bilingual Support (Hindi + EN)"],
    cta: "Start Free Trial",
    ctaStyle: "border-2 border-orange-500 text-orange-600 hover:bg-orange-50",
  },
  {
    name: "Menubabu Premium",
    price: "₹149",
    period: "per month (after trial)",
    color: "from-orange-500 to-red-700",
    border: "border-orange-400",
    badge: "Highly Recommended",
    features: ["1 Restaurant Profile", "Unlimited Portion Pricing", "QR Code Downloads", "Interactive Bill Calculator", "Real-time Sold-out Toggle"],
    cta: "Subscribe Now",
    ctaStyle: "bg-white text-orange-600 hover:bg-orange-50",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "For multiple locations",
    color: "from-yellow-400 to-orange-500",
    border: "border-yellow-400",
    badge: "Big Chains",
    features: ["Multiple Locations", "Unlimited Menus & Dishes", "Custom Domain Name", "Priority 24/7 Support", "Personal Admin Training"],
    cta: "Contact Sales",
    ctaStyle: "border-2 border-white text-white hover:bg-white/10",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen" style={{ background: "#FFFBF5", fontFamily: "Inter, sans-serif" }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
          <img src="/logo.jpeg" alt="Menubabu" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-heading text-xl font-bold text-orange-600">Menubabu</span>
        </div>
          <div className="flex items-center gap-3">
            <Link to="/restaurants" className="hidden sm:block text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors px-3 py-2">
              Browse Restaurants
            </Link>
            <Link to="/login" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all active:scale-95">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero-gradient min-h-screen flex items-center relative overflow-hidden pt-16">
        {EMOJIS.map((e, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl select-none pointer-events-none"
            style={{ left: e.x, top: e.y }}
            animate={{ y: [0, -18, 0], rotate: [0, 8, -5, 0] }}
            transition={{ duration: e.duration, delay: e.delay, repeat: Infinity, ease: "easeInOut" }}
          >
            {e.emoji}
          </motion.div>
        ))}
        <div className="max-w-6xl mx-auto px-4 py-20 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-medium px-4 py-2 rounded-full mb-6 border border-white/20">
                <img src="/logo.jpeg" alt="" className="w-5 h-5 rounded object-cover" /> India's #1 Digital Menu Platform
              </div>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                Aapke Restaurant Ka<br />
                <span className="text-yellow-300">Digital Menu</span>
              </h1>
              <p className="text-white/85 text-lg md:text-xl mb-8 leading-relaxed">
                QR scan karo, menu dekho. <br className="hidden sm:block" />
                <span className="text-yellow-200 font-medium">No app needed.</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/login")}
                  className="bg-white text-orange-600 font-bold px-6 py-4 rounded-2xl text-base hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  🏪 Restaurant Owner? Login Here
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/restaurants")}
                  className="bg-white/15 border border-white/30 text-white font-semibold px-6 py-4 rounded-2xl text-base hover:bg-white/25 transition-all flex items-center justify-center gap-2"
                >
                  🔍 Browse Restaurants
                </motion.button>
              </div>
              <div className="mt-10 flex gap-8">
                {[
                  { num: 500, suffix: "+", label: "Restaurants" },
                  { num: 50000, suffix: "+", label: "Dishes Served" },
                  { num: 99, suffix: "%", label: "Satisfaction" },
                ].map((s, i) => (
                  <div key={i} className="text-white">
                    <div className="font-heading text-2xl font-bold text-yellow-300">
                      <AnimatedCounter target={s.num} suffix={s.suffix} />
                    </div>
                    <div className="text-white/70 text-sm">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Phone Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="w-64 h-[520px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-white/30 relative">
                  <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-orange-500 to-red-700 flex items-center justify-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-white/20 overflow-hidden flex items-center justify-center text-3xl">🏪</div>
                  </div>
                  <div className="pt-16 px-3 pb-3 flex flex-col gap-2">
                    <div className="text-center py-2">
                      <div className="font-heading text-sm font-bold text-gray-800">Saffron Spice</div>
                      <div className="text-xs text-gray-500">North Indian Cuisine</div>
                    </div>
                    {["Paneer Butter Masala", "Dal Makhani", "Garlic Naan", "Chicken Tikka"].map((dish, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-orange-50 border border-orange-100">
                        <div className="w-10 h-10 rounded-lg bg-orange-200 flex items-center justify-center text-base">
                          {["🧀", "🫘", "🍞", "🍗"][i]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-800 truncate">{dish}</div>
                          <div className="text-xs text-orange-600 font-bold">₹{[320, 280, 60, 380][i]}</div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">+</div>
                      </div>
                    ))}
                    <div className="mt-2 bg-orange-500 rounded-xl p-2 text-center text-white text-xs font-bold">
                      🛒 2 items | ₹600
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg"
                >
                  📱 Scan & Order!
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="#FFFBF5" />
          </svg>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-widest">Simple Process</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mt-2">Kaise Kaam Karta Hai?</h2>
            <p className="text-gray-500 mt-3 text-lg">Teen simple steps mein aapka digital menu ready</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="card-lift bg-white rounded-3xl p-8 shadow-md border border-orange-50 text-center relative"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
                  {s.step}
                </div>
                <div className="text-5xl mb-4 mt-2">{s.icon}</div>
                <h3 className="font-heading text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-widest">Features</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mt-2">Sab Kuch Ek Jagah</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.92 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="glass rounded-2xl p-6 card-lift"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <span className="text-orange-500 font-semibold text-sm uppercase tracking-widest">Pricing</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-gray-900 mt-2">Simple, Transparent Plans</h2>
            <p className="text-gray-500 mt-3">Pehla mahina bilkul free!</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {plans.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                whileHover={{ y: -6 }}
                className={`rounded-3xl overflow-hidden border ${p.border} flex flex-col ${i === 1 ? "shadow-2xl shadow-orange-200 scale-105" : "shadow-md"}`}
              >
                <div className={`bg-gradient-to-br ${p.color} p-6 relative`}>
                  {p.badge && (
                    <span className="absolute top-4 right-4 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                      {p.badge}
                    </span>
                  )}
                  <div className={`font-heading text-xl font-bold ${i === 1 ? "text-white" : "text-gray-800"}`}>{p.name}</div>
                  <div className={`text-4xl font-black mt-1 ${i === 1 ? "text-white" : "text-gray-900"}`}>{p.price}</div>
                  <div className={`text-sm ${i === 1 ? "text-white/70" : "text-gray-500"}`}>{p.period}</div>
                </div>
                <div className="bg-white p-6 flex-1 flex flex-col">
                  <ul className="space-y-3 flex-1 mb-6">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-green-500 font-bold">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => navigate("/login")}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${i === 1 ? "bg-orange-500 text-white hover:bg-orange-600" : p.ctaStyle}`}
                  >
                    {p.cta}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
            <img src="/logo.jpeg" alt="Menubabu" className="w-10 h-10 rounded-xl object-cover" />
            <div>
              <div className="font-heading text-xl font-bold text-orange-400">Menubabu</div>
              <div className="text-gray-400 text-xs">Scan karo, khao maro! 😄</div>
            </div>
          </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link to="/about" className="hover:text-white transition-colors">About</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-center text-gray-500 text-sm">
            Made with ❤️ for Indian restaurants • menubabu.in
          </div>
        </div>
      </footer>
    </div>
  );
}
