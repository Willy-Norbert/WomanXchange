
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

interface Seller {
  id: number;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  gender: string;
  sellerStatus: 'INACTIVE' | 'ACTIVE' | 'SUSPENDED';
  isActive: boolean;
  createdAt: string;
}

const SellerManagement = () => {
  const { t } = useLanguage();
  const { user, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
  }, [user, loading, navigate]);

  const { data: sellersData, isLoading, error } = useQuery({
    queryKey: ['sellers'],
    queryFn: async () => {
      const response = await api.get('/sellers/pending');
      return response;
    },
    enabled: !!user && user.role === 'ADMIN',
  });

  const updateSellerStatusMutation = useMutation({
    mutationFn: async ({ sellerId, status, isActive }: { sellerId: number; status: string; isActive: boolean }) => {
      const response = await api.put(`/sellers/${sellerId}/status`, {
        status,
        isActive
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      toast({
        title: "Success",
        description: "Seller status updated successfully.",
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to update seller status';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const sellers: Seller[] = sellersData?.data || [];
  
  const filteredSellers = sellers.filter((seller) =>
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = (sellerId: number, newStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    const isActive = newStatus === 'ACTIVE';
    updateSellerStatusMutation.mutate({
      sellerId,
      status: newStatus,
      isActive
    });
  };

  const getStatusBadge = (seller: Seller) => {
    if (seller.sellerStatus === 'ACTIVE' && seller.isActive) {
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    } else if (seller.sellerStatus === 'SUSPENDED') {
      return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getStatusCounts = () => {
    const active = sellers.filter(s => s.sellerStatus === 'ACTIVE' && s.isActive).length;
    const pending = sellers.filter(s => s.sellerStatus === 'INACTIVE').length;
    const suspended = sellers.filter(s => s.sellerStatus === 'SUSPENDED').length;
    
    return { active, pending, suspended, total: sellers.length };
  };

  if (loading || isLoading) {
    return (
      <DashboardLayout currentPage="seller-management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  if (error) {
    return (
      <DashboardLayout currentPage="seller-management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">Failed to load sellers</div>
        </div>
      </DashboardLayout>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <DashboardLayout currentPage="seller-management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sellers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{statusCounts.total}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{statusCounts.active}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Suspended</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{statusCounts.suspended}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search sellers..." 
            className="pl-10 bg-gray-50 border-gray-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Sellers Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">All Sellers ({filteredSellers.length})</h2>
          </div>

          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">SELLER</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">BUSINESS</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">CONTACT</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">STATUS</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">JOINED</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSellers.length > 0 ? (
                filteredSellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center text-white font-medium">
                          {seller.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{seller.name}</div>
                          <div className="text-sm text-gray-500">{seller.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{seller.businessName}</div>
                      <div className="text-sm text-gray-500 capitalize">{seller.gender}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{seller.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(seller)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(seller.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {seller.sellerStatus === 'INACTIVE' && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusUpdate(seller.id, 'ACTIVE')}
                            disabled={updateSellerStatusMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        
                        {seller.sellerStatus === 'ACTIVE' && seller.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleStatusUpdate(seller.id, 'SUSPENDED')}
                            disabled={updateSellerStatusMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Suspend
                          </Button>
                        )}
                        
                        {(seller.sellerStatus === 'SUSPENDED' || !seller.isActive) && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleStatusUpdate(seller.id, 'ACTIVE')}
                            disabled={updateSellerStatusMutation.isPending}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? `No sellers found matching "${searchTerm}"` : 'No sellers found'}
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

export default SellerManagement;
