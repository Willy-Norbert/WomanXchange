
import { useQuery } from '@tanstack/react-query';
import { getUserOrders } from '@/api/orders';
import ProtectedRoute from '@/components/ProtectedRoute';

const Orders = () => {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: getUserOrders,
  });

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        
        {isLoading && <div>Loading orders...</div>}
        {error && <div className="text-red-600">Error loading orders</div>}
        
        <div className="space-y-4">
          {orders?.data?.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
              <p className="font-semibold">Order #{order.id}</p>
              <p className="text-gray-600">Total: {order.totalPrice.toLocaleString()} Rwf</p>
              <p className="text-sm text-gray-500">
                Status: {order.isPaid ? 'Paid' : 'Pending Payment'}
              </p>
            </div>
          )) || <div className="text-gray-500">No orders found</div>}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Orders;
