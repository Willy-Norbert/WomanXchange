
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Mail, Phone, Calendar, ShoppingBag, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface SellerCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  _count: {
    orders: number;
  };
}

const SellerCustomers = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'SELLER') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  const { data: customersData, isLoading, error } = useQuery({
    queryKey: ['seller-customers'],
    queryFn: async () => {
      const response = await api.get('/sellers/my-customers');
      return response.data;
    },
    enabled: !!user && user.role === 'SELLER',
  });

  if (!user || user.role !== 'SELLER') {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout currentPage="customers">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">Loading customers...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout currentPage="customers">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">Failed to load customers</div>
        </div>
      </DashboardLayout>
    );
  }

  // Ensure customers is always an array
  const customers: SellerCustomer[] = Array.isArray(customersData) ? customersData : [];

  console.log('Seller customers data:', { customersData, customers });

  return (
    <DashboardLayout currentPage="customers">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">My Customers</h1>
          <div className="text-sm text-gray-500">
            Total: {customers.length} customers
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search customers..." 
            className="pl-10 bg-gray-50 border-gray-200" 
          />
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{customers.length}</p>
                  <p className="text-gray-600">Total Customers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {customers.reduce((sum, customer) => sum + (customer._count?.orders || 0), 0)}
                  </p>
                  <p className="text-gray-600">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {customers.filter(c => {
                      const customerDate = new Date(c.createdAt);
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return customerDate >= thirtyDaysAgo;
                    }).length}
                  </p>
                  <p className="text-gray-600">New This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers List */}
        <Card>
          <CardHeader>
            <CardTitle>Customer List</CardTitle>
          </CardHeader>
          <CardContent>
            {customers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Orders</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-purple-600 font-medium">
                                {customer.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                              <p className="text-sm text-gray-500">ID: #{customer.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-900">{customer.email}</span>
                            </div>
                            {customer.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900">{customer.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {customer._count?.orders || 0} orders
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No customers found</p>
                <p className="text-gray-500 text-sm mt-2">
                  Customers will appear here when they purchase your products
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SellerCustomers;
