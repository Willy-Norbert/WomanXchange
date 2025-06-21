
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
    queryFn: () => api.get('/auth/users')
  });

  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['dashboard-products'],
    queryFn: () => api.get('/products')
  });

  const orders = ordersData?.data || [];
  const users = usersData?.data || [];
  const products = productsData?.data || [];

  // Calculate statistics
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.totalPrice, 0);
  const paidOrders = orders.filter((order: any) => order.isPaid);
  const paidRevenue = paidOrders.reduce((sum: number, order: any) => sum + order.totalPrice, 0);
  
  const totalSales = Math.round(totalRevenue / 1000);
  const dailySales = orders.filter((order: any) => {
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    return orderDate.toDateString() === today.toDateString();
  }).length;
  
  const buyers = users.filter((user: any) => user.role.toLowerCase() === 'buyer');
  const sellers = users.filter((user: any) => user.role.toLowerCase() === 'seller');
  const admins = users.filter((user: any) => user.role.toLowerCase() === 'admin');
  
  const dailyUsers = buyers.length;
  const totalProducts = products.length;
  const recentOrders = orders.slice(0, 10);

  // Chart data
  const userRoleData = [
    { name: 'Buyers', value: buyers.length },
    { name: 'Sellers', value: sellers.length },
    { name: 'Admins', value: admins.length }
  ];

  const monthlyOrdersData = (() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyData = monthNames.map((month, index) => {
      const monthOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getFullYear() === currentYear && orderDate.getMonth() === index;
      });
      
      return {
        name: month,
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum: number, order: any) => sum + order.totalPrice, 0)
      };
    });
    
    return monthlyData;
  })();

  const paymentStatusData = [
    { name: 'Paid', value: paidOrders.length },
    { name: 'Pending', value: orders.length - paidOrders.length }
  ];

  const loading = ordersLoading || usersLoading || productsLoading;
  const error = ordersError || usersError || productsError;

  return {
    totalSales,
    dailySales,
    dailyUsers,
    totalProducts,
    recentOrders,
    totalRevenue,
    paidRevenue,
    totalOrders: orders.length,
    totalUsers: users.length,
    buyers: buyers.length,
    sellers: sellers.length,
    admins: admins.length,
    userRoleData,
    monthlyOrdersData,
    paymentStatusData,
    loading,
    error: error ? 'Failed to load dashboard data' : null
  };
};
