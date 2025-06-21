
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { BarChart3, Clock, Users, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const VendorDashboard = () => {
  const { t } = useLanguage();

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.sidebar.dashboard')}</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title={t('orders.total_orders')}
            value="157"
            icon={BarChart3}
            color="text-red-500"
          />
          <StatsCard
            title={t('dashboard.daily_sales')}
            value="20"
            icon={Clock}
            color="text-red-500"
          />
          <StatsCard
            title={t('dashboard.daily_users')}
            value="425"
            icon={Users}
            color="text-red-500"
          />
          <StatsCard
            title={t('admin.products')}
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
                <CardTitle className="text-lg font-medium">{t('dashboard.summary_sales')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-r from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">{t('dashboard.chart_placeholder')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">{t('dashboard.upcoming_payments')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-purple-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">{t('dashboard.payment_data')}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">{t('dashboard.recent_orders')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">{t('dashboard.id')}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">{t('dashboard.customer_name')}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">{t('dashboard.product_name')}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">{t('orders.date')}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">{t('dashboard.price')}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">{t('dashboard.picture')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[1, 2, 3, 4].map((id) => (
                        <tr key={id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">{id}</td>
                          <td className="px-4 py-3 text-sm">Gentil Mugisha</td>
                          <td className="px-4 py-3 text-sm">{t('dashboard.sample_product')}</td>
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
              <CardTitle className="text-lg font-medium">{t('dashboard.expense_status')}</CardTitle>
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
              <p className="text-purple-700 text-sm">{t('dashboard.vendor_role')}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;
