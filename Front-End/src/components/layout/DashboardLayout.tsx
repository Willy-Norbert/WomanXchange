
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingBag, 
  FileText, 
  Settings,
  LogOut,
  Home,
  MessageSquare,
  User
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSwitcher from '../LanguageSwitcher';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentPage }) => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: t('nav.dashboard'), path: '/dashboard' },
    { id: 'analytics', icon: BarChart3, label: t('nav.analytics'), path: '/analytics' },
    { id: 'orders', icon: ShoppingBag, label: t('nav.orders'), path: '/orders' },
    { id: 'customers', icon: Users, label: t('nav.customers'), path: '/customers' },
    { id: 'vendors', icon: Users, label: t('nav.vendors'), path: '/vendors' },
    { id: 'admin-products', icon: Package, label: t('nav.products'), path: '/admin-products' },
    { id: 'reports', icon: FileText, label: t('nav.reports'), path: '/reports' },
    { id: 'profile', icon: User, label: t('nav.profile'), path: '/profile' },
    { id: 'community-chat', icon: MessageSquare, label: t('communityChat.title'), path: '/community-chat' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <Link to="/" className="text-2xl font-bold text-purple">
            SHOP.CO
          </Link>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple transition-colors ${
                  currentPage === item.id ? 'bg-purple-50 text-purple border-r-4 border-purple' : ''
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between mb-4">
            <LanguageSwitcher />
          </div>
          
          <div className="space-y-2">
            <Link to="/">
              <Button variant="outline" className="w-full justify-start">
                <Home className="w-4 h-4 mr-2" />
                {t('nav.home')}
              </Button>
            </Link>
            
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('auth.logout')}
            </Button>
          </div>
          
          {user && (
            <div className="mt-4 p-3 bg-purple-100 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-300 rounded-full flex items-center justify-center">
                  <span className="text-purple-800 font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-purple-900 font-medium text-sm">{user.name}</p>
                  <p className="text-purple-700 text-xs">{user.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
