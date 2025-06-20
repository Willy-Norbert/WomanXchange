
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BarChart3, Clock, Users, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VendorDashboard = () => {
  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard Page</h1>
        
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

        {/* User Profile Update */}
        <div className="mt-auto pt-8">
          <div className="flex items-center space-x-3 px-4 py-3 bg-purple-100 rounded-lg max-w-xs">
            <div className="w-12 h-12 bg-purple-300 rounded-full flex items-center justify-center">
              <span className="text-purple-800 font-semibold">A</span>
            </div>
            <div>
              <p className="text-purple-900 font-medium">Alice</p>
              <p className="text-purple-700 text-sm">Vendor</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;
