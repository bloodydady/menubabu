import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: `We collect only the information necessary to provide our services:
• Restaurant owners: Name, email address (via Google Login), and restaurant details you provide.
• Customers browsing menus: We do not collect any personal information. No account required to view a menu.
• Usage data: Basic analytics to improve app performance (via Firebase Analytics).`,
  },
  {
    title: "2. How We Use Your Information",
    content: `Information collected is used solely to:
• Allow restaurant owners to manage their digital menus.
• Associate restaurant menus with owner accounts.
• Improve our platform and fix bugs.
We do NOT sell, share, or rent your personal information to any third party.`,
  },
  {
    title: "3. Google Authentication",
    content: `Menubabu uses Google Sign-In for restaurant owner authentication. When you log in with Google, we receive your name, email address, and profile picture from Google. We use your email to identify your restaurant account. We do not store your Google password.`,
  },
  {
    title: "4. Data Storage",
    content: `All data is securely stored using Google Firebase (Firestore). Firebase is a Google product and follows Google's data protection standards. Restaurant menu data (names, prices, images) is publicly readable so customers can view menus via QR code — no login required.`,
  },
  {
    title: "5. Cookies",
    content: `Menubabu uses minimal cookies only for authentication (to keep restaurant owners logged in). We do not use advertising or tracking cookies. You can clear cookies anytime via your browser settings.`,
  },
  {
    title: "6. Image URLs",
    content: `All images on Menubabu are linked via URLs provided by restaurant owners. We do not host or store image files ourselves. Images are loaded directly from the URL provided (e.g., Unsplash, your own hosting). Ensure you have rights to use any images you add.`,
  },
  {
    title: "7. Your Rights",
    content: `You have the right to:
• Access the personal data we hold about you.
• Request deletion of your account and restaurant data.
• Update or correct your information at any time via the dashboard.
To exercise any of these rights, contact us at monsterproduction21@gmail.com`,
  },
  {
    title: "8. Children's Privacy",
    content: `Menubabu is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately.`,
  },
  {
    title: "9. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top of this page. Continued use of Menubabu after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "10. Contact Us",
    content: `If you have any questions about this Privacy Policy, please reach out:\n\nDeepak Singh — Founder, Menubabu\nPhone: +91 8303858857\nEmail: monsterproduction21@gmail.com\nWhatsApp: +91 8303858857`,
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen" style={{ background: "#FFFBF5" }}>
      {/* Header */}
      <div className="hero-gradient py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-8 transition-colors">
            ← Back to Home
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="font-heading text-4xl font-bold text-white mb-3">Privacy Policy</h1>
            <p className="text-white/70 text-sm">Last Updated: June 26, 2026</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-50 border border-orange-100 rounded-3xl p-6 mb-8"
        >
          <p className="text-orange-800 leading-relaxed text-sm">
            At <strong>Menubabu</strong>, your privacy is important to us. This policy explains what information we collect, how we use it, and what rights you have. We keep things simple — we only collect what we need and never sell your data.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-5">
          {SECTIONS.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-3xl p-6 shadow-sm"
            >
              <h2 className="font-heading text-lg font-bold text-gray-900 mb-3">{section.title}</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{section.content}</p>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 bg-gradient-to-br from-orange-500 to-red-700 rounded-3xl p-8 text-white text-center"
        >
          <h3 className="font-heading text-xl font-bold mb-2">Questions about your data?</h3>
          <p className="text-white/80 text-sm mb-5">We're happy to help. Reach out any time.</p>
          <Link
            to="/contact"
            className="inline-block bg-white text-orange-600 font-bold px-8 py-3 rounded-2xl hover:shadow-lg transition-all active:scale-95"
          >
            Contact Us
          </Link>
        </motion.div>
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
