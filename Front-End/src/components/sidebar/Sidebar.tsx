
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Users, Package, FileText, ShoppingCart, TrendingUp } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, path: '/analytics' },
  { id: 'customers', label: 'Customers', icon: Users, path: '/customers' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/orders' },
  { id: 'vendors', label: 'Vendors', icon: Package, path: '/vendors' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage }) => {
  return (
    <div className="w-64 bg-gradient-to-b from-purple-400 to-purple-600 text-white p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          w<span className="text-purple-200">X</span>c
        </h1>
        <p className="text-purple-200 text-sm">Change Potential</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Link
              key={item.id}
              to={item.path}
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

      <div className="mt-8 pt-8 border-t border-purple-300">
        <h3 className="text-purple-200 text-sm font-semibold mb-4">Management</h3>
        <div className="space-y-2">
          <Link to="/products" className="block px-4 py-2 text-purple-100 hover:text-white transition-colors">
            Products
          </Link>
          <Link to="/orders" className="block px-4 py-2 text-purple-100 hover:text-white transition-colors">
            Orders
          </Link>
          <Link to="/vendors" className="block px-4 py-2 text-purple-100 hover:text-white transition-colors">
            Vendors
          </Link>
          <Link to="/reports" className="block px-4 py-2 text-purple-100 hover:text-white transition-colors">
            Reports
          </Link>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <div className="flex items-center space-x-3 px-4 py-3 bg-white bg-opacity-10 rounded-lg">
          <div className="w-10 h-10 bg-purple-300 rounded-full flex items-center justify-center">
            <span className="text-purple-800 font-semibold">B</span>
          </div>
          <div>
            <p className="text-white font-medium">Beritha</p>
            <p className="text-purple-200 text-sm">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};
