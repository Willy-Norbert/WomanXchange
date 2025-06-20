
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BarChart3, Clock, Users, Package, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/products';
import { getAllOrders } from '../api/orders';
import api from '../api/api';

interface DashboardStats {
  totalSales: number;
  dailySales: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: any[];
}

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalSales: 0,
    dailySales: 0,
    totalUsers: 0,
    totalProducts: 0,
    recentOrders: []
  });

  // Fetch products data
  const { data: productsData } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(),
    enabled: !!user && (user.role === 'admin' || user.role === 'seller')
  });

  // Fetch orders data (admin only)
  const { data: ordersData } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => getAllOrders(),
    enabled: !!user && user.role === 'admin'
  });

  // Fetch customers data (admin only)
  const { data: customersData } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await api.get('/users?role=buyer');
      return response.data;
    },
    enabled: !!user && user.role === 'admin'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Buyers cannot access dashboard at all
    if (user.role === 'buyer') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    // Calculate dashboard statistics
    if (productsData?.data) {
      setDashboardStats(prev => ({
        ...prev,
        totalProducts: productsData.data.length
      }));
    }

    if (ordersData?.data) {
      const orders = ordersData.data;
      const totalSales = orders.reduce((sum: number, order: any) => sum + order.totalPrice, 0);
      
      // Calculate daily sales (today's orders)
      const today = new Date().toDateString();
      const dailySales = orders
        .filter((order: any) => new Date(order.createdAt).toDateString() === today)
        .reduce((sum: number, order: any) => sum + order.totalPrice, 0);

      setDashboardStats(prev => ({
        ...prev,
        totalSales,
        dailySales,
        recentOrders: orders.slice(0, 4) // Get 4 most recent orders
      }));
    }

    if (customersData) {
      setDashboardStats(prev => ({
        ...prev,
        totalUsers: customersData.length
      }));
    }
  }, [productsData, ordersData, customersData]);

  // Show loading or redirect while checking access
  if (!user || user.role === 'buyer') {
    return null;
  }

  const getDashboardTitle = () => {
    switch (user.role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'seller':
        return 'Vendor Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{getDashboardTitle()}</h1>
          <Link to="/products">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Sales"
            value={`$${dashboardStats.totalSales.toFixed(2)}`}
            icon={BarChart3}
            color="text-green-600"
          />
          <StatsCard
            title="Daily Sales"
            value={`$${dashboardStats.dailySales.toFixed(2)}`}
            icon={Clock}
            color="text-blue-600"
          />
          {user.role === 'admin' && (
            <StatsCard
              title="Total Customers"
              value={dashboardStats.totalUsers.toString()}
              icon={Users}
              color="text-purple-600"
            />
          )}
          <StatsCard
            title="Products"
            value={dashboardStats.totalProducts.toString()}
            icon={Package}
            color="text-orange-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Sales Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Summary sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart visualization area</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dashboardStats.recentOrders.length > 0 ? (
                  dashboardStats.recentOrders.map((order: any, index: number) => (
                    <div key={order.id || index} className="text-sm text-gray-600">
                      Order #{order.id} - ${order.totalPrice}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Table - Admin only */}
        {user.role === 'admin' && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {dashboardStats.recentOrders.length > 0 ? (
                        dashboardStats.recentOrders.map((order: any) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">#{order.id}</td>
                            <td className="px-4 py-3 text-sm">{order.user?.name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm">${order.totalPrice}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 text-xs rounded ${
                                order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {order.isPaid ? 'Paid' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            No orders found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
