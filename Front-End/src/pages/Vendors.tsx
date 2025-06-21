
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/api/api';

const Vendors = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Case 1: still loading
    if (user === undefined) return;

    // Case 2: not logged in
    if (user === null) {
      navigate('/login');
      return;
    }

    // Case 3: not an admin
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    // Case 4: valid admin

  }, [user, navigate]);

  const { data: usersData, isLoading, error, refetch } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      console.log('Fetching vendors data...');
      const response = await api.get('/auth/users');
      console.log('Vendors API response:', response.data);
      return response;
    },
    enabled: !!user && user.role === 'admin'
  });

  // Filter vendors from the users data
  const allUsers = usersData?.data || [];
  const vendors = allUsers.filter((u: any) => {
    const userRole = u.role.toLowerCase();
    return userRole === 'seller';
  });

  // Filter vendors based on search term
  const filteredVendors = vendors.filter((vendor: any) =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('All users:', allUsers.length, 'Vendors found:', vendors.length, 'Filtered:', filteredVendors.length);

  if (isLoading) {
    return (
      <DashboardLayout currentPage="vendors">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">Loading vendors...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    console.error('Vendors fetch error:', error);
    return (
      <DashboardLayout currentPage="vendors">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">
            Failed to load vendors. 
            <Button onClick={() => refetch()} className="ml-2">Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="vendors">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search vendors..." 
              className="pl-10 bg-gray-50 border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Total Vendors Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{vendors.length}</p>
              <p className="text-sm text-gray-500">Active sellers</p>
            </CardContent>
          </Card>

          {/* Total Users Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{allUsers.length}</p>
              <p className="text-sm text-gray-500">All registered users</p>
            </CardContent>
          </Card>
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Vendors ({filteredVendors.length})</h2>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm">Import</Button>
                <Button variant="outline" size="sm">Export</Button>
              </div>
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">VENDOR</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">EMAIL</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ROLE</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">JOINED</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">STATUS</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ACTIONS</th>
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
                        ACTIVE
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
                    {searchTerm ? `No vendors found matching "${searchTerm}"` : 'No vendors found'}
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
