
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from "@/components/ui/toaster";
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import SellerRequest from './pages/SellerRequest';
import VendorDashboard from './pages/VendorDashboard';
import Products from './pages/Products';
import SingleProduct from './pages/SingleProduct';
import Cart from './pages/Cart';
import Categories from './pages/Categories';
import Contact from './pages/Contact';
import Customers from './pages/Customers';
import Vendors from './pages/Vendors';
import Orders from './pages/Orders';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import CommunityChat from './pages/CommunityChat';
import OrderComplete from './pages/OrderComplete';
import NotFound from './pages/NotFound';
import TopBanner from './components/TopBanner';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <TopBanner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/seller-request" element={<SellerRequest />} />
                <Route path="/dashboard" element={<VendorDashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<SingleProduct />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/community-chat" element={<CommunityChat />} />
                <Route path="/order-complete" element={<OrderComplete />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
