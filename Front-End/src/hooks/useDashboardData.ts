
import { useQuery } from '@tanstack/react-query';
import { getAllOrders } from '@/api/orders';
import api from '@/api/api';

export const useDashboardData = (userRole?: string) => {
  // Only fetch admin data if user is admin
  const isAdmin = userRole?.toLowerCase() === 'admin';
  
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: getAllOrders,
    enabled: isAdmin
  });

  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['dashboard-users'],
    queryFn: () => api.get('/auth/users'),
    enabled: isAdmin
  });

  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['dashboard-products'],
    queryFn: () => api.get('/products'),
    enabled: isAdmin
  });

  // For sellers, fetch their specific data
  const { data: sellerStatsData, isLoading: sellerStatsLoading, error: sellerStatsError } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: () => api.get('/sellers/my-stats'),
    enabled: userRole?.toLowerCase() === 'seller'
  });

  const { data: sellerOrdersData, isLoading: sellerOrdersLoading, error: sellerOrdersError } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: () => api.get('/sellers/my-orders'),
    enabled: userRole?.toLowerCase() === 'seller'
  });

  const { data: sellerProductsData, isLoading: sellerProductsLoading, error: sellerProductsError } = useQuery({
    queryKey: ['seller-products'],
    queryFn: () => api.get('/sellers/my-products'),
    enabled: userRole?.toLowerCase() === 'seller'
  });

  const { data: sellerCustomersData, isLoading: sellerCustomersLoading, error: sellerCustomersError } = useQuery({
    queryKey: ['seller-customers'],
    queryFn: () => api.get('/sellers/my-customers'),
    enabled: userRole?.toLowerCase() === 'seller'
  });

  if (userRole?.toLowerCase() === 'seller') {
    // Return seller-specific data with proper array handling
    const sellerStats = sellerStatsData?.data || { totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalCustomers: 0 };
    const sellerOrders = Array.isArray(sellerOrdersData?.data) ? sellerOrdersData.data : [];
    const sellerProducts = Array.isArray(sellerProductsData?.data) ? sellerProductsData.data : [];
    const sellerCustomers = Array.isArray(sellerCustomersData?.data) ? sellerCustomersData.data : [];

    console.log('Seller data:', { sellerStats, sellerOrders, sellerProducts, sellerCustomers });

    return {
      totalSales: Math.round(sellerStats.totalRevenue / 1000),
      dailySales: sellerOrders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      }).length,
      dailyUsers: sellerCustomers.length,
      totalProducts: sellerStats.totalProducts,
      recentOrders: sellerOrders.slice(0, 10),
      totalRevenue: sellerStats.totalRevenue,
      paidRevenue: sellerOrders.filter((order: any) => order.isPaid).reduce((sum: number, order: any) => sum + order.totalPrice, 0),
      totalOrders: sellerStats.totalOrders,
      totalUsers: sellerStats.totalCustomers,
      buyers: sellerStats.totalCustomers,
      sellers: 0, // Sellers don't see other sellers
      admins: 0, // Sellers don't see admin count
      userRoleData: [
        { name: 'My Customers', value: sellerStats.totalCustomers }
      ],
      monthlyOrdersData: [],
      paymentStatusData: [
        { name: 'Paid', value: sellerOrders.filter((order: any) => order.isPaid).length },
        { name: 'Pending', value: sellerOrders.filter((order: any) => !order.isPaid).length }
      ],
      loading: sellerStatsLoading || sellerOrdersLoading || sellerProductsLoading || sellerCustomersLoading,
      error: sellerStatsError || sellerOrdersError || sellerProductsError || sellerCustomersError ? 'Failed to load seller data' : null
    };
  }

  // Admin data (existing logic) with proper array handling
  const orders = Array.isArray(ordersData?.data) ? ordersData.data : [];
  const users = Array.isArray(usersData?.data) ? usersData.data : [];
  const products = Array.isArray(productsData?.data) ? productsData.data : [];

  console.log('Admin data:', { orders, users, products });

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
