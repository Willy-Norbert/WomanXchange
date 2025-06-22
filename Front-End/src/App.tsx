import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import SingleProduct from "./pages/SingleProduct";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Terms from "./pages/Terms";
import SellerRequest from "./pages/SellerRequest";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Vendors from "./pages/Vendors";
import Reports from "./pages/Reports";
import VendorDashboard from "./pages/VendorDashboard";
import Cart from "./pages/Cart";
import OrderComplete from "./pages/OrderComplete";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import CommunityChat from "./pages/CommunityChat";
import AdminProducts from "./pages/AdminProducts";
import AdminCategories from "./pages/AdminCategories";
import { AuthProvider } from './contexts/AuthContext'; 
import { LanguageProvider } from './contexts/LanguageContext';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/products" element={<Products />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/product/:id" element={<SingleProduct />} />
              <Route path="/contact" element={<Contact />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/community-chat" element={<CommunityChat />} />

              <Route path="/seller-request" element={<SellerRequest />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/admin-products" element={<AdminProducts />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-complete" element={<OrderComplete />} />
              <Route path="/admin-categories" element={<AdminCategories />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
