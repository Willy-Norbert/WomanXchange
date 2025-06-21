
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthContext } from '../contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-purple">
            SHOP.CO
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-purple transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-purple transition-colors">
              {t('nav.products')}
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-purple transition-colors">
              {t('nav.categories')}
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-purple transition-colors">
              {t('nav.contact')}
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t('common.search')}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:ring-2 focus:ring-purple focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            <Link to="/cart" className="text-gray-700 hover:text-purple transition-colors">
              <ShoppingCart className="w-6 h-6" />
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="text-gray-700 hover:text-purple transition-colors">
                  {t('nav.dashboard')}
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-purple transition-colors">
                  <User className="w-6 h-6" />
                </Link>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                >
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
                  <Button size="sm" className="bg-purple hover:bg-purple-600 text-white">
                    {t('auth.register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
