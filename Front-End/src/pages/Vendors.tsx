
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';

const Vendors = () => {
  const { user, loading } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    // Only ADMINs can access vendors page
    if (user.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
  }, [user, loading, navigate]);

  const { data: usersData, isLoading, error, refetch } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      console.log('Fetching vendors data...');
      const response = await api.get('/auth/users');
      console.log('Vendors API response:', response.data);
      return response;
    },
    enabled: !!user && user.role === 'ADMIN'
  });

  // Filter vendors from the users data
  const allUsers = usersData?.data || [];
  const vendors = allUsers.filter((u: any) => {
    const userRole = u.role?.toLowerCase();
    return userRole === 'SELLER';
  });

  // Filter vendors based on search term
  const filteredVendors = vendors.filter((vendor: any) =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('All users:', allUsers.length, 'Vendors found:', vendors.length, 'Filtered:', filteredVendors.length);

  if (loading || isLoading) {
    return (
      <DashboardLayout currentPage="vendors">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">{t('loading_vendors')}</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  if (error) {
    console.error('Vendors fetch error:', error);
    return (
      <DashboardLayout currentPage="vendors">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">
            {t('failed_load_vendors')}
            <Button onClick={() => refetch()} className="ml-2">{t('retry')}</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="vendors">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t('vendors')}</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            {t('add_vendor')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder={t('search_vendors')}
              className="pl-10 bg-gray-50 border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Total Vendors Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('total_vendors')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{vendors.length}</p>
              <p className="text-sm text-gray-500">{t('active_sellers')}</p>
            </CardContent>
          </Card>

          {/* Total Users Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('total_users')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{allUsers.length}</p>
              <p className="text-sm text-gray-500">{t('all_registered')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{t('vendors')} ({filteredVendors.length})</h2>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm">{t('import')}</Button>
                <Button variant="outline" size="sm">{t('export')}</Button>
              </div>
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('vendor').toUpperCase()}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('email').toUpperCase()}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('role').toUpperCase()}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('joined').toUpperCase()}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('status').toUpperCase()}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">{t('actions').toUpperCase()}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor: any) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center text-white font-medium">
                          {vendor.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{vendor.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{vendor.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {vendor.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {new Date(vendor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-green-600">
                        {t('active').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? `${t('no_vendors_search')} "${searchTerm}"` : t('no_vendors')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Vendors;
