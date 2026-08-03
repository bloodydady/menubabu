import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SuperAdmin from "./pages/SuperAdmin";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import CustomerMenu from "./pages/CustomerMenu";
import RestaurantBrowser from "./pages/RestaurantBrowser";
import RestaurantHome from "./pages/RestaurantHome";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

function ProtectedAdmin({ children }) {
  const { user, loading, isSuperAdmin } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

function ProtectedOwner({ children }) {
  const { user, loading, isSuperAdmin, ownerRestaurant, logout } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (isSuperAdmin) return <Navigate to="/admin" replace />;
  if (!ownerRestaurant) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{background:'#FFFBF5'}}>
      <div className="text-6xl mb-4">🚫</div>
      <h2 className="font-heading text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
      <p className="text-gray-500 text-center max-w-xs text-sm">Your account has not been assigned to any restaurant. Please contact the admin.</p>
      <button
        onClick={logout}
        className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-95 text-xs shadow-md shadow-orange-100"
      >
        Logout / Switch Account
      </button>
      <Link
        to="/"
        className="mt-4 text-orange-600 hover:underline text-xs font-semibold"
      >
        Back to Home Page
      </Link>
    </div>
  );
  return children;
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#FFFBF5'}}>
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <div className="absolute inset-0 w-20 h-20 rounded-full bg-orange-100 animate-ping opacity-60" />
          <div className="absolute inset-2 w-16 h-16 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-3xl shadow-lg shadow-orange-200">
            🍽️
          </div>
        </div>
        <div className="text-center">
          <p className="font-heading font-bold text-orange-600 text-base">लोड हो रहा है...</p>
          <p className="text-gray-400 text-xs mt-0.5">Menubabu is getting ready</p>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-orange-400"
              style={{ animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading, isSuperAdmin, ownerRestaurant } = useAuth();

  if (loading) return <FullScreenLoader />;

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/restaurants" element={<RestaurantBrowser />} />
      <Route path="/restaurant/:restaurantId" element={<RestaurantHome />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/login" element={
        user
          ? isSuperAdmin
            ? <Navigate to="/admin" replace />
            : <Navigate to="/dashboard" replace />
          : <LoginPage />
      } />
      <Route path="/admin" element={<ProtectedAdmin><SuperAdmin /></ProtectedAdmin>} />
      <Route path="/dashboard" element={<ProtectedOwner><RestaurantDashboard /></ProtectedOwner>} />
      <Route path="/menu/:restaurantId" element={<CustomerMenu />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#fff',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#FF6B00', secondary: '#fff' } },
          }}
        />
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
