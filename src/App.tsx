import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Catalog from "./pages/Catalog";
import Footer from "./components/Footer";
import Home from "./pages/Index";
import Menu from "./pages/Menu";
import Gallery from "./pages/Gallery";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  const [cartItems, setCartItems] = useState<any[]>([]);

  const handleAddToCart = (product: any) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Navigation
            cartItems={cartItems}
            setCartItems={setCartItems}
            onAddToCart={handleAddToCart}
          />
          <Routes>
            <Route path="/" element={<Home onAddToCart={handleAddToCart} />} />
            <Route path="/menu" element={<Menu onAddToCart={handleAddToCart} />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/catalog" element={<Catalog onAddToCart={handleAddToCart} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
