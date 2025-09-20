import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { CartProvider } from "./hooks/useCart";
import { AdminGuard } from "./components/AdminGuard";
import { AdminLayout } from "./components/AdminLayout";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

// Public pages
import Index from "./pages/Index";
import Menu from "./pages/Menu";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

// Admin pages
import { AdminLogin } from "./pages/admin/auth/AdminLogin";
import { AdminSignup } from "./pages/admin/auth/AdminSignup";
import { Dashboard } from "./pages/admin/Dashboard";
import { Products } from "./pages/admin/Products";
import { ProductNew } from "./pages/admin/ProductNew";
import { ProductEdit } from "./pages/admin/ProductEdit";
import { Content } from "./pages/admin/Content";
import { Orders } from "./pages/admin/Orders";
import { Settings } from "./pages/admin/Settings";
import { Customers } from "./pages/admin/Customers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Admin Auth Routes (no layout) */}
              <Route path="/admin/auth/login" element={<AdminLogin />} />
              <Route path="/admin/auth/signup" element={<AdminSignup />} />
              
              {/* Admin Routes (with AdminGuard and AdminLayout) */}
              <Route path="/admin/*" element={
                <AdminGuard>
                  <AdminLayout>
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="products" element={<Products />} />
                      <Route path="products/new" element={<ProductNew />} />
                      <Route path="products/:id/edit" element={<ProductEdit />} />
                      <Route path="content" element={<Content />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="customers" element={<Customers />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="analytics" element={<ComingSoon />} />
                      <Route path="" element={<Dashboard />} />
                    </Routes>
                  </AdminLayout>
                </AdminGuard>
              } />
              
              {/* Public Routes (with public layout) */}
              <Route path="/*" element={
                <>
                  <Navigation />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/gallery" element={<ComingSoon />} />
                    <Route path="/about" element={<ComingSoon />} />
                    <Route path="/contact" element={<ComingSoon />} />
                    <Route path="/allergens" element={<ComingSoon />} />
                    <Route path="/terms" element={<ComingSoon />} />
                    <Route path="/privacy" element={<ComingSoon />} />
                    <Route path="/cart" element={<ComingSoon />} />
                    <Route path="/checkout" element={<ComingSoon />} />
                    <Route path="/account" element={<ComingSoon />} />
                    <Route path="/account/orders" element={<ComingSoon />} />
                    <Route path="/account/addresses" element={<ComingSoon />} />
                    <Route path="/account/favourites" element={<ComingSoon />} />
                    <Route path="/product/:slug" element={<ComingSoon />} />
                    <Route path="/order/:orderNumber" element={<ComingSoon />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Footer />
                </>
              } />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;