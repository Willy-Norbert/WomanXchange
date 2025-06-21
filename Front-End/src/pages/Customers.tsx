
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Edit } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';
import { useLanguage } from '@/contexts/LanguageContext';

const Customers = () => {
  const { t } = useLanguage();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Allow both ADMIN and sellers to access customers
    if (user.role !== 'ADMIN' && user.role !== 'seller') {
      navigate('/dashboard');
      return;
    }
  }, [user, loading, navigate]);

  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('Fetching customers data...');
      const response = await api.get('/auth/users');
      console.log('Customers API response:', response.data);
      return response;
    },
    enabled: !!user && (user.role === 'ADMIN' || user.role === 'seller')
  });

  // Filter customers (buyers) from the users data
  const allUsers = usersData?.data || [];
  const customers = allUsers.filter((u: any) => {
    const userRole = u.role?.toLowerCase();
    return userRole === 'buyer';
  });

  console.log('All users:', allUsers.length, 'Customers found:', customers.length);

  if (loading || isLoading) {
    return (
      <DashboardLayout currentPage="customers">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'seller')) {
    return null;
  }

  if (error) {
    console.error('Customers fetch error:', error);
    return (
      <DashboardLayout currentPage="customers">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">{t('error.failed_load_products')}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="customers">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t('customers.title')}</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            {t('customers.add_customer')}
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder={t('customers.search_customers')} 
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Filter Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="all">{t('customers.all_customers')} ({customers.length})</TabsTrigger>
            <TabsTrigger value="active">{t('customers.active')}</TabsTrigger>
            <TabsTrigger value="inactive">{t('customers.inactive')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{t('customers.total_customers')} ({customers.length})</h2>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm">{t('customers.import')}</Button>
                    <Button variant="outline" size="sm">{t('customers.export')}</Button>
                  </div>
                </div>
              </div>

              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('customers.customer').toUpperCase()}</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('customers.email').toUpperCase()}</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('customers.joined').toUpperCase()}</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('customers.status').toUpperCase()}</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('customers.actions').toUpperCase()}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers.length > 0 ? (
                    customers.map((customer: any) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center text-white font-medium">
                              {customer.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium">{customer.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{customer.email}</td>
                        <td className="px-6 py-4 text-gray-900">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {t('customers.active')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        {t('customers.no_customers')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Customers;
