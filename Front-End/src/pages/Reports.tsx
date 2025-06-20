
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Download, Eye } from 'lucide-react';

const Reports = () => {
  return (
    <DashboardLayout currentPage="reports">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Customers Report */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">Customer Analytics</CardTitle>
              <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">306.6K</div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12.5%
                </div>
              </div>
              <div className="h-20 bg-gradient-to-r from-purple-100 via-pink-50 to-purple-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
                <TrendingUp className="w-8 h-8 text-purple-500 relative z-10" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <Button variant="link" className="p-0 h-auto text-sm text-purple-600 hover:text-purple-700">
                  View Details →
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Products Report */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">Product Performance</CardTitle>
              <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">2,000</div>
                <div className="flex items-center text-red-600 text-sm font-medium">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  -3.2%
                </div>
              </div>
              <div className="h-20 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
                <BarChart3 className="w-8 h-8 text-blue-500 relative z-10" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <Button variant="link" className="p-0 h-auto text-sm text-purple-600 hover:text-purple-700">
                  View Details →
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sales Report */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 md:col-span-2 xl:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">Sales Overview</CardTitle>
              <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">$89.5K</div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8.7%
                </div>
              </div>
              <div className="h-20 bg-gradient-to-r from-green-100 via-emerald-50 to-teal-100 rounded-lg p-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10"></div>
                <div className="flex items-end justify-between h-full space-x-1 relative z-10">
                  {[60, 80, 45, 90, 70, 85, 95, 75].map((height, index) => (
                    <div key={index} className="flex-1 flex flex-col justify-end">
                      <div 
                        className="bg-gradient-to-t from-green-500 to-emerald-400 rounded-sm min-h-[8px] transition-all duration-300 hover:from-green-600 hover:to-emerald-500"
                        style={{ height: `${height}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <Button variant="link" className="p-0 h-auto text-sm text-purple-600 hover:text-purple-700">
                  View Details →
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Report */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">Monthly Revenue</CardTitle>
              <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">$45.2K</div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +15.3%
                </div>
              </div>
              <div className="h-20 bg-gradient-to-r from-orange-100 via-amber-50 to-yellow-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-yellow-500/10"></div>
                <PieChart className="w-8 h-8 text-orange-500 relative z-10" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <Button variant="link" className="p-0 h-auto text-sm text-purple-600 hover:text-purple-700">
                  View Details →
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Orders Report */}
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-semibold text-gray-800">Order Analytics</CardTitle>
              <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-gray-900">1,245</div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +6.8%
                </div>
              </div>
              <div className="h-20 bg-gradient-to-r from-pink-100 via-rose-50 to-red-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-red-500/10"></div>
                <BarChart3 className="w-8 h-8 text-pink-500 relative z-10" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <Button variant="link" className="p-0 h-auto text-sm text-purple-600 hover:text-purple-700">
                  View Details →
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Section */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">95%</div>
                <div className="text-sm text-gray-600">Customer Satisfaction</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">$2.4M</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">12.5K</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-orange-600">98%</div>
                <div className="text-sm text-gray-600">System Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
