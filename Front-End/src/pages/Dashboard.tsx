import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext'; // Adjust path if needed
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BarChart3, Clock, Users, Package, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext); // Get logged-in user from context
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // Not logged in, redirect to login page
      navigate('/login');
      return;
    }
    if (user.role === 'buyer') {
      // Buyers are NOT allowed here, redirect to homepage or other page
      navigate('/');
    }
  }, [user, navigate]);

  // Optional: show loading or nothing while redirecting
  if (!user || user.role === 'buyer') {
    return null;
  }

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
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
            value="157"
            icon={BarChart3}
            color="text-red-500"
          />
          <StatsCard
            title="Daily Sales"
            value="20"
            icon={Clock}
            color="text-red-500"
          />
          <StatsCard
            title="Daily user"
            value="425"
            icon={Users}
            color="text-red-500"
          />
          <StatsCard
            title="Products"
            value="400+"
            icon={Package}
            color="text-red-500"
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
              <CardTitle className="text-lg font-medium">Upcoming Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-purple-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Payment data</p>
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
                        <th className="px-4 py-3 text-left text-sm font-medium">Id</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Customer Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Product Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Picture</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[1, 2, 3, 4].map((id) => (
                        <tr key={id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{id}</td>
                          <td className="px-4 py-3 text-sm">Gentil Mugisha</td>
                          <td className="px-4 py-3 text-sm">Shirt</td>
                          <td className="px-4 py-3 text-sm">20/1/25</td>
                          <td className="px-4 py-3 text-sm">4000Frw</td>
                          <td className="px-4 py-3">
                            <div className="w-8 h-8 bg-gray-300 rounded"></div>
                          </td>
                        </tr>
                      ))}
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
