
import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ChartComponent } from '@/components/dashboard/ChartComponent';
import { BarChart3, Clock, Users, Package, Plus,  ShoppingCart, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  
  if (!auth) {
    throw new Error('AuthContext must be used within AuthProvider');
  }
  
  const { user, loading: authLoading } = auth;
  const { 
    totalSales, 
    dailySales, 
    dailyUsers, 
    totalProducts, 
    recentOrders, 
    totalRevenue,
    paidRevenue,
    totalOrders,
    totalUsers,
    buyers,
    sellers,
    admins,
    userRoleData,
    monthlyOrdersData,
    paymentStatusData,
    loading: dashboardLoading, 
    error 
  } = useDashboardData(user?.role);

  useEffect(() => {
    console.log('🏠 Dashboard: useEffect - authLoading:', authLoading, 'user:', user);
    
    // Don't redirect while auth is still loading
    if (authLoading) {
      console.log('⏳ Dashboard: Auth is still loading, waiting...');
      return;
    }
    
    if (!user) {
      console.log('👤 Dashboard: No user found, redirecting to login');
      navigate('/login');
      return;
    }
    
    if (user.role === 'BUYER' || user.role === 'buyer') {
      console.log('🛒 Dashboard: User is buyer, redirecting to home');
      navigate('/');
      return;
    }
    
    console.log('✅ Dashboard: User authenticated and authorized:', user.email, user.role);
  }, [user, authLoading, navigate]);

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // Don't render if user is not authenticated or authorized
  if (!user || user.role === 'BUYER' || user.role === 'buyer') {
    return null;
  }

  if (dashboardLoading) {
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

  const isAdmin = user.role?.toLowerCase() === 'admin';
  const isSeller = user.role?.toLowerCase() === 'seller';

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Admin Dashboard' : 'Seller Dashboard'}
          </h1>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={`${totalRevenue.toLocaleString()} Rwf`}
            icon={TrendingUp}
            color="text-green-500"
          />
          <StatsCard
            title="Paid Revenue"
            value={`${paidRevenue.toLocaleString()} Rwf`}
            icon={TrendingUp}
            color="text-blue-500"
          />
          <StatsCard
            title="Total Orders"
            value={totalOrders.toString()}
            icon={ShoppingCart}
            color="text-purple-500"
          />
          <StatsCard
            title={isSeller ? "My Customers" : "Total Users"}
            value={totalUsers.toString()}
            icon={Users}
            color="text-orange-500"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title={isSeller ? "My Products" : "Products"}
            value={totalProducts.toString()}
            icon={Package}
            color="text-green-500"
          />
          {isAdmin && (
            <>
              <StatsCard
                title="Buyers"
                value={buyers.toString()}
                icon={Users}
                color="text-purple-500"
              />
              <StatsCard
                title="Sellers"
                value={sellers.toString()}
                icon={BarChart3}
                color="text-orange-500"
              />
            </>
          )}
        </div>

        {/* Charts Section - Only for Admin */}
        {isAdmin && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartComponent
                type="bar"
                data={monthlyOrdersData}
                title="Monthly Orders"
                dataKey="orders"
                height={300}
              />
              <ChartComponent
                type="pie"
                data={userRoleData}
                title="User Roles Distribution"
                dataKey="value"
                height={300}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartComponent
                type="line"
                data={monthlyOrdersData}
                title="Monthly Revenue Trend"
                dataKey="revenue"
                height={300}
              />
              <ChartComponent
                type="pie"
                data={paymentStatusData}
                title="Payment Status"
                dataKey="value"
                height={300}
              />
            </div>
          </>
        )}

        {/* Recent Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              {isSeller ? "My Recent Orders" : "Recent Orders"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Payment</th>
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
                        <td className="px-4 py-3 text-sm font-medium">{order.totalPrice.toLocaleString()} Rwf</td>
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
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.isDelivered 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.isDelivered ? 'Delivered' : 'Processing'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        {isSeller ? "No orders found for your products" : "No orders found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="font-bold text-green-600">{totalRevenue.toLocaleString()} Rwf</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Orders:</span>
                  <span className="font-bold text-blue-600">{paidRevenue.toLocaleString()} Rwf</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-bold text-yellow-600">{(totalRevenue - paidRevenue).toLocaleString()} Rwf</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Order Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Orders:</span>
                  <span className="font-bold">{totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Orders:</span>
                  <span className="font-bold text-green-600">{paymentStatusData.find(p => p.name === 'Paid')?.value || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending Orders:</span>
                  <span className="font-bold text-yellow-600">{paymentStatusData.find(p => p.name === 'Pending')?.value || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                {isSeller ? "My Statistics" : "User Statistics"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{isSeller ? "My Customers:" : "Total Users:"}</span>
                  <span className="font-bold">{totalUsers}</span>
                </div>
                {isAdmin && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Buyers:</span>
                      <span className="font-bold text-purple-600">{buyers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sellers:</span>
                      <span className="font-bold text-blue-600">{sellers}</span>
                    </div>
                  </>
                )}
                {isSeller && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">My Products:</span>
                    <span className="font-bold text-green-600">{totalProducts}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
