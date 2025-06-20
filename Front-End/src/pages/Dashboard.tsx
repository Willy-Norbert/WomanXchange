
import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BarChart3, Clock, Users, Package, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { totalSales, dailySales, dailyUsers, totalProducts, recentOrders, loading, error } = useDashboardData();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'buyer') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role === 'buyer') {
    return null;
  }

  if (loading) {
    return (
      <DashboardLayout currentPage="dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">Loading dashboard data...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout currentPage="dashboard">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {user.role === 'admin' ? 'Admin Dashboard' : 'Seller Dashboard'}
          </h1>
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
            value={`${totalSales}k`}
            icon={BarChart3}
            color="text-green-500"
          />
          <StatsCard
            title="Daily Orders"
            value={dailySales.toString()}
            icon={Clock}
            color="text-blue-500"
          />
          <StatsCard
            title="Total Users"
            value={dailyUsers.toString()}
            icon={Users}
            color="text-purple-500"
          />
          <StatsCard
            title="Products"
            value={totalProducts.toString()}
            icon={Package}
            color="text-orange-500"
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
                  <p className="text-gray-500">Chart visualization coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Upcoming Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-purple-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Payment data coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentOrders.length > 0 ? (
                        recentOrders.map((order: any) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">#{order.id}</td>
                            <td className="px-4 py-3 text-sm">{order.user?.name || 'Unknown'}</td>
                            <td className="px-4 py-3 text-sm">{order.totalPrice.toLocaleString()} Rwf</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                order.isPaid 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
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

          {/* Expense Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Expense status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-green-50 rounded-lg flex items-center justify-center">
                <div className="w-24 h-24 bg-green-400 rounded-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
