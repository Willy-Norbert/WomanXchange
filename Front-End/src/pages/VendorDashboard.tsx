
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BarChart3, Clock, Users, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProducts } from '../api/products';
import { getUserOrders } from '../api/orders';

const VendorDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch vendor's products
  const { data: productsData } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: () => getProducts(),
    enabled: !!user && user.role === 'seller'
  });

  // Fetch vendor's orders
  const { data: ordersData } = useQuery({
    queryKey: ['vendor-orders'],
    queryFn: () => getUserOrders(),
    enabled: !!user && user.role === 'seller'
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Only sellers can access vendor dashboard
    if (user.role !== 'seller') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  if (!user || user.role !== 'seller') {
    return null;
  }

  const products = productsData?.data || [];
  const orders = ordersData?.data || [];
  
  const totalSales = orders.reduce((sum: number, order: any) => sum + order.totalPrice, 0);
  const today = new Date().toDateString();
  const dailySales = orders
    .filter((order: any) => new Date(order.createdAt).toDateString() === today)
    .reduce((sum: number, order: any) => sum + order.totalPrice, 0);

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Sales"
            value={`$${totalSales.toFixed(2)}`}
            icon={BarChart3}
            color="text-green-600"
          />
          <StatsCard
            title="Daily Sales"
            value={`$${dailySales.toFixed(2)}`}
            icon={Clock}
            color="text-blue-600"
          />
          <StatsCard
            title="Total Orders"
            value={orders.length.toString()}
            icon={Users}
            color="text-purple-600"
          />
          <StatsCard
            title="Products"
            value={products.length.toString()}
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

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {orders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="text-sm">
                    <div className="flex justify-between">
                      <span>Order #{order.id}</span>
                      <span className="font-medium">${order.totalPrice}</span>
                    </div>
                    <div className="text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-gray-500 text-sm">No orders yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Table */}
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
                      <th className="px-4 py-3 text-left text-sm font-medium">Id</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.slice(0, 4).map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">#{order.id}</td>
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
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
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

        {/* User Profile */}
        <div className="mt-auto pt-8">
          <div className="flex items-center space-x-3 px-4 py-3 bg-purple-100 rounded-lg max-w-xs">
            <div className="w-12 h-12 bg-purple-300 rounded-full flex items-center justify-center">
              <span className="text-purple-800 font-semibold">
                {user.name?.charAt(0).toUpperCase() || 'V'}
              </span>
            </div>
            <div>
              <p className="text-purple-900 font-medium">{user.name}</p>
              <p className="text-purple-700 text-sm">Vendor</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;
