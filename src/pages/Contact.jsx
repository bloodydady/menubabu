import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

const CONTACT = {
  name: "Deepak Singh",
  phone: "8303858857",
  email: "monsterproduction21@gmail.com",
  whatsapp: "918303858857",
};

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.message) return toast.error("Please fill in your name and message");
    // Build WhatsApp message
    const msg = encodeURIComponent(
      `Hi Deepak! 👋\n\nName: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}\n\n— Sent via Menubabu Contact Form`
    );
    window.open(`https://wa.me/${CONTACT.whatsapp}?text=${msg}`, "_blank");
    setSent(true);
    toast.success("Opening WhatsApp... 🎉");
  };

  return (
    <div className="min-h-screen" style={{ background: "#FFFBF5" }}>
      {/* Header */}
      <div className="hero-gradient py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-8 transition-colors">
            ← Back to Home
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-5xl mb-4">💬</div>
            <h1 className="font-heading text-4xl font-bold text-white mb-3">Contact Us</h1>
            <p className="text-white/80 text-lg">Hum yahan hain — koi bhi sawaal pucho!</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">

          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-5">Get In Touch</h2>

            {/* Person card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-700 flex items-center justify-center text-white font-heading font-bold text-2xl flex-shrink-0">
                D
              </div>
              <div>
                <div className="font-heading font-bold text-gray-900 text-lg">{CONTACT.name}</div>
                <div className="text-gray-500 text-sm">Founder, Menubabu</div>
              </div>
            </div>

            {/* Phone */}
            <a
              href={`tel:+91${CONTACT.phone}`}
              className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <Phone size={18} className="text-green-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone</div>
                <div className="font-semibold text-gray-900">+91 {CONTACT.phone}</div>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${CONTACT.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <MessageCircle size={18} className="text-green-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">WhatsApp</div>
                <div className="font-semibold text-gray-900">+91 {CONTACT.phone}</div>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${CONTACT.email}`}
              className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                <Mail size={18} className="text-orange-500 group-hover:text-white transition-colors" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</div>
                <div className="font-semibold text-gray-900 text-sm break-all">{CONTACT.email}</div>
              </div>
            </a>

            {/* Hours */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
              <div className="text-orange-700 font-semibold text-sm mb-1">⏰ Response Time</div>
              <div className="text-orange-600 text-sm">We usually reply within <strong>2–4 hours</strong> on WhatsApp. Email replies may take 24 hours.</div>
            </div>
          </motion.div>

          {/* Contact Form → WhatsApp */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="font-heading text-2xl font-bold text-gray-900 mb-5">Send a Message</h2>
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Your Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-300 transition-all"
                  placeholder="Rahul Sharma"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email (optional)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-300 transition-all"
                  placeholder="rahul@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Message *</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-300 transition-all resize-none"
                  rows={5}
                  placeholder="Restaurant ke baare mein batao, ya koi sawaal pucho..."
                  required
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                <MessageCircle size={18} />
                Send via WhatsApp
              </motion.button>
              <p className="text-center text-xs text-gray-400">
                This will open WhatsApp with your message pre-filled 📱
              </p>
            </form>
          </motion.div>
        </div>
      </div>

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
