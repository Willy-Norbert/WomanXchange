
import { useQuery } from '@tanstack/react-query';
import { getAllOrders } from '@/api/orders';
import api from '@/api/api';

export const useDashboardData = () => {
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: getAllOrders
  });

  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['dashboard-users'],
    queryFn: () => api.get('/users')
  });

  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['dashboard-products'],
    queryFn: () => api.get('/products')
  });

  const orders = ordersData?.data || [];
  const users = usersData?.data || [];
  const products = productsData?.data || [];

  const totalSales = Math.round(orders.reduce((sum: number, order: any) => sum + order.totalPrice, 0) / 1000);
  const dailySales = orders.filter((order: any) => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;
  
  const dailyUsers = users.filter((user: any) => user.role === 'buyer').length;
  const totalProducts = products.length;
  const recentOrders = orders.slice(0, 10);

  const loading = ordersLoading || usersLoading || productsLoading;
  const error = ordersError || usersError || productsError;

  return {
    totalSales,
    dailySales,
    dailyUsers,
    totalProducts,
    recentOrders,
    loading,
    error: error ? 'Failed to load dashboard data' : null
  };
};
