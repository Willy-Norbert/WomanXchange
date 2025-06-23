
import React, { useContext, useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BarChart3, Clock, Users, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';

interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
}

interface SellerOrder {
  id: number;
  totalPrice: number;
  isPaid: boolean;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  items: Array<{
    id: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
      coverImage: string;
    };
  }>;
}

const VendorDashboard = () => {
  const { t } = useLanguage();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'SELLER') {
      navigate('/dashboard');
      return;
    }
  }, [user, loading, navigate]);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: async () => {
      const response = await api.get('/sellers/my-stats');
      return response.data;
    },
    enabled: !!user && user.role === 'SELLER',
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: async () => {
      const response = await api.get('/sellers/my-orders');
      return response.data;
    },
    enabled: !!user && user.role === 'SELLER',
  });

  if (loading || !user || user.role !== 'SELLER') {
    return null;
  }

  const stats: SellerStats = statsData || { totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalCustomers: 0 };
  const recentOrders: SellerOrder[] = (ordersData || []).slice(0, 5);

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.sidebar.dashboard')}</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Orders"
            value={statsLoading ? "..." : stats.totalOrders.toString()}
            icon={BarChart3}
            color="text-red-500"
          />
          <StatsCard
            title="Total Revenue"
            value={statsLoading ? "..." : `$${stats.totalRevenue.toFixed(2)}`}
            icon={Clock}
            color="text-green-500"
          />
          <StatsCard
            title="Total Customers"
            value={statsLoading ? "..." : stats.totalCustomers.toString()}
            icon={Users}
            color="text-blue-500"
          />
          <StatsCard
            title="Total Products"
            value={statsLoading ? "..." : stats.totalProducts.toString()}
            icon={Package}
            color="text-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Sales Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">{t('dashboard.summary_sales')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">{t('dashboard.chart_placeholder')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="font-semibold">${stats.totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Order Value</span>
                  <span className="font-semibold">
                    ${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">{t('dashboard.recent_orders')}</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading orders...</div>
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Products</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">#{order.id}</td>
                        <td className="px-4 py-3 text-sm">{order.user.name}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center space-x-2">
                            {order.items.slice(0, 2).map((item) => (
                              <img
                                key={item.id}
                                src={item.product.coverImage}
                                alt={item.product.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            ))}
                            {order.items.length > 2 && (
                              <span className="text-xs text-gray-500">+{order.items.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          ${order.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.isPaid 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.isPaid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No orders found
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Profile Update */}
        <div className="mt-auto pt-8">
          <div className="flex items-center space-x-3 px-4 py-3 bg-purple-100 rounded-lg max-w-xs">
            <div className="w-12 h-12 bg-purple-300 rounded-full flex items-center justify-center">
              <span className="text-purple-800 font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-purple-900 font-medium">{user.name}</p>
              <p className="text-purple-700 text-sm">{t('dashboard.vendor_role')}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;
