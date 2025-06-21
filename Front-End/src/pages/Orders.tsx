
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, CheckCircle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllOrders, updateOrderStatus } from '@/api/orders';
import { confirmPaymentByAdmin } from '@/api/payments';
import { useToast } from '@/hooks/use-toast';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role === 'buyer') {
      navigate('/');
    }
  }, [user, navigate]);

  const { data: ordersData, isLoading, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: getAllOrders
  });

  const orders = ordersData?.data || [];

  const handleConfirmPayment = async (orderId: number) => {
    try {
      await confirmPaymentByAdmin(orderId);
      toast({
        title: "Success",
        description: "Payment confirmed successfully",
      });
      refetch();
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to confirm payment",
        variant: "destructive",
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, isPaid?: boolean, isDelivered?: boolean) => {
    try {
      await updateOrderStatus(orderId, isPaid, isDelivered);
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      refetch();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getPaymentStatusBadge = (order: any) => {
    if (order.isConfirmedByAdmin) {
      return <Badge className="bg-green-100 text-green-800">Confirmed by Admin</Badge>;
    } else if (order.isPaid) {
      return <Badge className="bg-yellow-100 text-yellow-800">Awaiting Admin Confirmation</Badge>;
    } else if (order.paymentCode) {
      return <Badge className="bg-blue-100 text-blue-800">Payment Code Generated</Badge>;
    } else {
      return <Badge variant="secondary">Pending Payment</Badge>;
    }
  };

  const getDeliveryStatusBadge = (order: any) => {
    if (order.isDelivered) {
      return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">Not Delivered</Badge>;
    }
  };

  if (!user || user.role === 'buyer') {
    return null;
  }

  if (isLoading) {
    return (
      <DashboardLayout currentPage="orders">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">Loading orders...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout currentPage="orders">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">Failed to load orders</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="orders">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <Button onClick={() => refetch()} variant="outline">
            Refresh Orders
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search orders..." 
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-600">Paid Orders</h3>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter((order: any) => order.isPaid).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-600">Pending Payment</h3>
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter((order: any) => !order.isPaid).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <p className="text-2xl font-bold text-blue-600">
              {orders.reduce((sum: number, order: any) => sum + order.totalPrice, 0).toLocaleString()} Rwf
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">Order ID</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Total Price</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Payment Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Delivery Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{order.user?.name || 'Unknown Customer'}</div>
                        <div className="text-gray-500 text-xs">{order.user?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {order.totalPrice.toLocaleString()} Rwf
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getPaymentStatusBadge(order)}
                      {order.paymentCode && (
                        <div className="text-xs text-gray-500 mt-1">
                          Code: {order.paymentCode}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getDeliveryStatusBadge(order)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        {order.isPaid && !order.isConfirmedByAdmin && user.role === 'admin' && (
                          <Button
                            size="sm"
                            onClick={() => handleConfirmPayment(order.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm Payment
                          </Button>
                        )}
                        {order.isConfirmedByAdmin && !order.isDelivered && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateOrderStatus(order.id, undefined, true)}
                          >
                            Mark Delivered
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No orders found
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

export default Orders;
