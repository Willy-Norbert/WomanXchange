
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  UserCircle, 
  MessageSquare,
  Store,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import LanguageSwitcher from '../LanguageSwitcher';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, currentPage }) => {
  const { user, logout } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isSeller = user?.role === 'seller';

  const menuItems = [
    {
      key: 'dashboard',
      icon: LayoutDashboard,
      label: t('nav.dashboard'),
      path: '/dashboard',
      allowedRoles: ['ADMIN', 'seller']
    },
    {
      key: 'orders',
      icon: ShoppingCart,
      label: t('nav.orders'),
      path: '/orders',
      allowedRoles: ['ADMIN', 'seller']
    },
    {
      key: 'customers',
      icon: Users,
      label: t('nav.customers'),
      path: '/customers',
      allowedRoles: ['ADMIN', 'seller']
    },
    {
      key: 'vendors',
      icon: Store,
      label: t('nav.vendors'),
      path: '/vendors',
      allowedRoles: ['ADMIN']
    },
    {
      key: 'analytics',
      icon: BarChart3,
      label: t('nav.analytics'),
      path: '/analytics',
      allowedRoles: ['ADMIN', 'seller']
    },
    {
      key: 'community-chat',
      icon: MessageSquare,
      label: t('nav.community-chat'),
      path: '/community-chat',
      allowedRoles: ['ADMIN', 'seller']
    },
    {
      key: 'profile',
      icon: UserCircle,
      label: t('nav.profile'),
      path: '/profile',
      allowedRoles: ['ADMIN', 'seller']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.allowedRoles.includes(user?.role || '')
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-purple-600 text-white px-3 py-1 rounded font-bold text-xl">
            SHOP.CO
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.key;
          
          return (
            <Link
              key={item.key}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-purple-100 text-purple-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-4">
        <LanguageSwitcher />
        
        <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role?.toLowerCase()}
            </p>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('nav.logout')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:w-64">
        <div className="flex flex-col w-full bg-white border-r border-gray-200">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
            <div className="flex items-center justify-between p-4 border-b">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-purple-600 text-white px-3 py-1 rounded font-bold text-xl">
                  SHOP.CO
                </div>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar for mobile */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-purple-600 text-white px-3 py-1 rounded font-bold text-xl">
                SHOP.CO
              </div>
            </Link>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
