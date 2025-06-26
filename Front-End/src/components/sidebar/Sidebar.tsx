
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Users, Package, FileText, ShoppingCart, TrendingUp, MessageSquare, UserCheck, FolderOpen, Settings } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard', roles: ['admin'], sellerPath: '/vendor-dashboard' },
  { id: 'customers', label: 'Users', icon: Users, path: '/user-management', roles: ['admin'], sellerPath: '/seller-customers' },
  { id: 'seller-management', label: 'Vendor', icon: Settings, path: '/seller-management', roles: ['admin'] },
  { id: 'community-chat', label: 'Community Chat', icon: MessageSquare, path: '/community-chat', roles: ['admin', 'seller'] },
];

const managementItems = [
  { label: 'Products', path: '/admin-products', roles: ['admin', 'seller'], sellerPath: '/admin-products' },
  { label: 'Categories', path: '/admin-categories', roles: ['admin', 'seller'], sellerPath: '/admin-categories' },
  { label: 'Orders', path: '/orders', roles: ['admin', 'seller'], sellerPath: '/orders' },
  { label: 'Reports', path: '/reports', roles: ['admin', 'seller'], sellerPath: '/reports' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  
  if (!user) return null;

  const userRole = user.role?.toLowerCase();
  const isSeller = userRole === 'seller';
  
  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );
  
  const filteredManagementItems = managementItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="w-64 bg-gradient-to-b from-purple-400 to-purple-600 text-white p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          w<span className="text-purple-200">X</span>c
        </h1>
        <p className="text-purple-200 text-sm">Change Potential</p>
      </div>

      <nav className="space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          // Use seller-specific path if user is seller and sellerPath exists
          const itemPath = isSeller && item.sellerPath ? item.sellerPath : item.path;
          const isActive = location.pathname === itemPath || currentPage === item.id;
          
          return (
            <Link
              key={item.id}
              to={itemPath}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'text-purple-100 hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {filteredManagementItems.length > 0 && (
        <div className="mt-8 pt-8 border-t border-purple-300">
          <h3 className="text-purple-200 text-sm font-semibold mb-4">Management</h3>
          <div className="space-y-2">
            {filteredManagementItems.map((item) => {
              // Use seller-specific path if user is seller and sellerPath exists
              const itemPath = isSeller && item.sellerPath ? item.sellerPath : item.path;
              const isActive = location.pathname === itemPath;
              return (
                <Link 
                  key={item.path}
                  to={itemPath} 
                  className={`block px-4 py-2 transition-colors rounded-lg ${
                    isActive 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'text-purple-100 hover:text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-auto pt-8">
        <div className="flex items-center space-x-3 px-4 py-3 bg-white bg-opacity-10 rounded-lg">
          <div className="w-10 h-10 bg-purple-300 rounded-full flex items-center justify-center">
            <span className="text-purple-800 font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-medium">{user.name}</p>
            <p className="text-purple-200 text-sm capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
