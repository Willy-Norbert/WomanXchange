
import { Search, ShoppingCart, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import TopBanner from './TopBanner';

const Header = () => {
  const auth = useContext(AuthContext);
  const { t } = useLanguage();
  const user = auth?.user;

  return (
    <>
      <TopBanner />
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/">
              <div className="flex items-center space-x-2">
                <img 
                  src="/wxc.png" 
                  alt="Rwanda Marketplace Logo" 
                  className="h-12 w-auto"
                />
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">{t('home')}</Link>
              <Link to="/products" className="text-gray-700 hover:text-purple-600 transition-colors">{t('products')}</Link>
              <Link to="/categories" className="text-gray-700 hover:text-purple-600 transition-colors">{t('categories')}</Link>
              <Link to="/about" className="text-gray-700 hover:text-purple-600 transition-colors">{t('about')}</Link>
              <Link to="/contact" className="text-gray-700 hover:text-purple-600 transition-colors">{t('contact')}</Link>
              
              {/* Dashboard link for sellers and admins */}
              {user && (user.role === 'SELLER' || user.role === 'ADMIN' || user.role === 'seller' || user.role === 'admin') && (
                <Link to="/dashboard" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
                  {t('dashboard')}
                </Link>
              )}
            </nav>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-3">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder={t('search_products')}
                  className="bg-transparent border-none outline-none text-sm"
                />
              </div>

              <Link to="/cart">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              </Link>

              <LanguageSwitcher />

              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 hidden md:block">
                    {t('welcome')}, {user.name}
                  </span>
                  <Link to="/profile">
                    <Button variant="ghost" size="icon">
                      <User className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link to="/login">
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
              )}

              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
