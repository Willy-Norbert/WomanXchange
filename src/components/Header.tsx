
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-purple-600 text-white px-3 py-1 rounded font-bold text-xl">
              SHOP.CO
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">
              {t('common.home')}
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-purple-600 transition-colors">
              {t('common.products')}
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-purple-600 transition-colors">
              {t('common.categories')}
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-purple-600 transition-colors">
              {t('common.contact')}
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t('common.search')}
                className="pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-200 rounded-full"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            <Link to="/cart">
              <Button variant="ghost" size="sm" className="p-2">
                <ShoppingCart className="w-5 h-5" />
              </Button>
            </Link>

            {user ? (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                  <User className="w-4 h-4 mr-2" />
                  {user.name}
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  {t('auth.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    {t('auth.login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    {t('auth.register')}
                  </Button>
                </Link>
              </div>
            )}

            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
