
import React, { useContext, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BarChart3, Clock, Users, Package, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { AuthContext } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';

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

  // Fetch ONLY seller-specific data
  const { data: sellerStats, isLoading: statsLoading } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: async () => {
      const response = await api.get('/sellers/my-stats');
      return response.data;
    },
    enabled: !!user && user.role === 'SELLER',
  });

  const { data: sellerOrders, isLoading: ordersLoading } = useQuery({
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

  if (statsLoading || ordersLoading) {
    return (
      <DashboardLayout currentPage="dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = sellerStats || { totalProducts: 0, totalOrders: 0, totalRevenue: 0, paidRevenue: 0, totalCustomers: 0 };
  const orders = Array.isArray(sellerOrders) ? sellerOrders : [];

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <div className="flex gap-2">
            <Link to="/admin-products">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </Link>
            <Link to="/orders">
              <Button variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Manage Orders
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Stats Cards - ONLY SELLER DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="My Orders"
            value={stats.totalOrders.toString()}
            icon={BarChart3}
            color="text-red-500"
          />
          <StatsCard
            title="My Revenue"
            value={`${stats.totalRevenue.toLocaleString()} Rwf`}
            icon={Clock}
            color="text-green-500"
          />
          <StatsCard
            title="My Customers"
            value={stats.totalCustomers.toString()}
            icon={Users}
            color="text-blue-500"
          />
          <StatsCard
            title="My Products"
            value={stats.totalProducts.toString()}
            icon={Package}
            color="text-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Overview - ONLY SELLER DATA */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">My Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="font-semibold">{stats.totalRevenue.toLocaleString()} Rwf</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paid Revenue</span>
                  <span className="font-semibold">{stats.paidRevenue.toLocaleString()} Rwf</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Order Value</span>
                  <span className="font-semibold">
                    {stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(0) : '0'} Rwf
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Orders</span>
                  <span className="font-semibold">{stats.totalOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">My Customers</span>
                  <span className="font-semibold">{stats.totalCustomers}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status - ONLY SELLER DATA */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Paid Orders</span>
                  <span className="font-semibold">{orders.filter((order: any) => order.isPaid).length} orders</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending Orders</span>
                  <span className="font-semibold">{orders.filter((order: any) => !order.isPaid).length} orders</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders - ONLY SELLER ORDERS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium flex justify-between items-center">
              My Recent Orders
              <Link to="/orders">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length > 0 ? (
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
                    {orders.slice(0, 10).map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">#{order.id}</td>
                        <td className="px-4 py-3 text-sm">{order.user?.name || order.customerName || 'Guest'}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center space-x-2">
                            {order.items.slice(0, 2).map((item: any) => (
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
                          {order.totalPrice.toLocaleString()} Rwf
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
                No orders found for your products
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;
