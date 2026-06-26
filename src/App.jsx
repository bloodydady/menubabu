import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
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
  const { user, loading, isSuperAdmin, ownerRestaurant } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (isSuperAdmin) return <Navigate to="/admin" replace />;
  if (!ownerRestaurant) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{background:'#FFFBF5'}}>
      <div className="text-6xl mb-4">🚫</div>
      <h2 className="font-heading text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
      <p className="text-gray-500 text-center max-w-xs">Your account has not been assigned to any restaurant. Please contact the admin.</p>
    </div>
  );
  return children;
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#FFFBF5'}}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-orange-100 border-t-orange-500 animate-spin" />
        <p className="font-hindi text-orange-600 font-medium">लोड हो रहा है...</p>
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
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
