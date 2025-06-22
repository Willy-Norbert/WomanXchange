
import React, { useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, Clock, Package, DollarSign, Eye } from 'lucide-react';
import { getAllOrders, confirmOrderPayment } from '@/api/orders';
import { AuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading, error } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: getAllOrders,
    enabled: !!user && (user.role === 'admin' || user.role === 'seller'),
    staleTime: 30000, // 30 seconds stale time
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: confirmOrderPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: "Payment confirmed",
        description: "Order payment has been confirmed and customer notified",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to confirm payment",
        variant: "destructive",
      });
    }
  });

  const orders = ordersData?.data || [];

  const handleConfirmPayment = (orderId: number) => {
    confirmPaymentMutation.mutate(orderId);
  };

  if (isLoading) {
    return (
      <DashboardLayout currentPage="orders">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
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
        <div className="flex items-center space-x-3">
          <Package className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Order Management
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Orders ({orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.user?.name || 'Guest'}</div>
                          <div className="text-sm text-gray-500">{order.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {order.items?.length || 0} item(s)
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {order.totalPrice.toLocaleString()} Rwf
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.isPaid ? 'default' : 'secondary'}>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </Badge>
                        {order.isConfirmedByAdmin && (
                          <Badge variant="outline" className="ml-1 text-green-600 border-green-600">
                            Admin Confirmed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.isDelivered ? 'default' : 'secondary'}>
                          {order.isDelivered ? 'Delivered' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {!order.isPaid && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirmPayment(order.id)}
                              disabled={confirmPaymentMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              {confirmPaymentMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Confirm Payment
                                </>
                              )}
                            </Button>
                          )}
                          {order.isPaid && !order.isConfirmedByAdmin && (
                            <Button
                              size="sm"
                              onClick={() => handleConfirmPayment(order.id)}
                              disabled={confirmPaymentMutation.isPending}
                              variant="outline"
                              className="border-green-600 text-green-600 hover:bg-green-50"
                            >
                              {confirmPaymentMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Admin Confirm
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Orders;
