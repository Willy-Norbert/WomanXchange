
import { useQuery } from '@tanstack/react-query';
import { getAllOrders } from '@/api/orders';
import api from '@/api/api';

export const useDashboardData = (userRole?: string) => {
  console.log('useDashboardData called with role:', userRole);
  
  const isAdmin = userRole?.toLowerCase() === 'admin';
  const isSeller = userRole?.toLowerCase() === 'seller';
  
  // For sellers, use seller-specific endpoints (ONLY THEIR DATA)
  const { data: sellerStatsData, isLoading: sellerStatsLoading, error: sellerStatsError } = useQuery({
    queryKey: ['seller-stats'],
    queryFn: async () => {
      console.log('🔍 Fetching seller stats (ONLY seller data)');
      const result = await api.get('/sellers/my-stats');
      console.log('📊 Seller stats received (ONLY seller data):', result.data);
      return result;
    },
    enabled: isSeller,
    retry: 2,
    staleTime: 30000,
  });

  const { data: sellerOrdersData, isLoading: sellerOrdersLoading, error: sellerOrdersError } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: async () => {
      console.log('🔍 Fetching seller orders (ONLY seller products)');
      const result = await api.get('/sellers/my-orders');
      console.log('📋 Seller orders received (ONLY seller products):', result.data);
      return result;
    },
    enabled: isSeller,
    retry: 2,
    staleTime: 30000,
  });

  const { data: sellerProductsData, isLoading: sellerProductsLoading, error: sellerProductsError } = useQuery({
    queryKey: ['seller-products'],
    queryFn: async () => {
      console.log('🔍 Fetching seller products (ONLY seller created)');
      const result = await api.get('/sellers/my-products');
      console.log('📦 Seller products received (ONLY seller created):', result.data);
      return result;
    },
    enabled: isSeller,
    retry: 2,
    staleTime: 30000,
  });

  const { data: sellerCustomersData, isLoading: sellerCustomersLoading, error: sellerCustomersError } = useQuery({
    queryKey: ['seller-customers'],
    queryFn: async () => {
      console.log('🔍 Fetching seller customers (ONLY who bought from seller)');
      const result = await api.get('/sellers/my-customers');
      console.log('👥 Seller customers received (ONLY who bought from seller):', result.data);
      return result;
    },
    enabled: isSeller,
    retry: 2,
    staleTime: 30000,
  });

  // Admin data queries (ALL DATA)
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      console.log('🔍 Fetching admin orders (ALL DATA)');
      const result = await getAllOrders();
      console.log('📋 Admin orders received (ALL DATA):', result);
      return result;
    },
    enabled: isAdmin,
    retry: 2,
    staleTime: 30000,
  });

  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      console.log('🔍 Fetching admin users (ALL DATA)');
      const result = await api.get('/auth/users');
      console.log('👥 Admin users received (ALL DATA):', result);
      return result;
    },
    enabled: isAdmin,
    retry: 2,
    staleTime: 30000,
  });

  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      console.log('🔍 Fetching admin products (ALL DATA)');
      const result = await api.get('/products');
      console.log('📦 Admin products received (ALL DATA):', result);
      return result;
    },
    enabled: isAdmin,
    retry: 2,
    staleTime: 30000,
  });

  if (isSeller) {
    // Return seller-specific data (ONLY THEIR DATA)
    const sellerStats = sellerStatsData?.data || { 
      totalProducts: 0, 
      totalOrders: 0, 
      totalRevenue: 0, 
      paidRevenue: 0,
      totalCustomers: 0 
    };
    const sellerOrders = Array.isArray(sellerOrdersData?.data) ? sellerOrdersData.data : [];
    const sellerProducts = Array.isArray(sellerProductsData?.data) ? sellerProductsData.data : [];
    const sellerCustomers = Array.isArray(sellerCustomersData?.data) ? sellerCustomersData.data : [];

    console.log('🔄 Processing seller data (ONLY SELLER DATA):', { 
      stats: sellerStats,
      ordersCount: sellerOrders.length, 
      productsCount: sellerProducts.length, 
      customersCount: sellerCustomers.length,
    });

    const hasSellerError = sellerStatsError || sellerOrdersError || sellerProductsError || sellerCustomersError;
    const isSellerLoading = sellerStatsLoading || sellerOrdersLoading || sellerProductsLoading || sellerCustomersLoading;

    // Calculate seller metrics (ONLY THEIR DATA)
    const totalRevenue = Number(sellerStats.totalRevenue) || 0;
    const paidRevenue = Number(sellerStats.paidRevenue) || 0;
    const totalOrders = Number(sellerStats.totalOrders) || 0;
    const totalProducts = Number(sellerStats.totalProducts) || 0;
    const totalCustomers = Number(sellerStats.totalCustomers) || 0;

    // Today's orders (ONLY SELLER'S ORDERS)
    const dailyOrders = sellerOrders.filter((order: any) => {
      try {
        const orderDate = new Date(order.createdAt);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      } catch {
        return false;
      }
    }).length;

    return {
      // Main metrics (ONLY SELLER DATA)
      totalSales: Math.round(totalRevenue / 1000),
      totalRevenue,
      paidRevenue,
      totalOrders,
      totalProducts,
      totalUsers: totalCustomers,
      
      // Daily metrics (ONLY SELLER DATA)
      dailySales: dailyOrders,
      dailyUsers: totalCustomers,
      
      // User breakdown (seller-specific)
      buyers: totalCustomers,
      sellers: 0,
      admins: 0,
      
      // Recent data (ONLY SELLER DATA)
      recentOrders: sellerOrders.slice(0, 10),
      
      // Chart data (ONLY SELLER DATA)
      userRoleData: [
        { name: 'My Customers', value: totalCustomers }
      ],
      monthlyOrdersData: [],
      paymentStatusData: [
        { name: 'Paid', value: sellerOrders.filter((order: any) => order.isPaid).length },
        { name: 'Pending', value: sellerOrders.filter((order: any) => !order.isPaid).length }
      ],
      
      // Loading and error states
      loading: isSellerLoading,
      error: hasSellerError ? 'Failed to load seller data' : null
    };
  }

  // Admin data processing (ALL DATA)
  const orders = Array.isArray(ordersData?.data) ? ordersData.data : [];
  const users = Array.isArray(usersData?.data) ? usersData.data : [];
  const products = Array.isArray(productsData?.data) ? productsData.data : [];

  console.log('🔄 Processing admin data (ALL DATA):', { 
    ordersCount: orders.length, 
    usersCount: users.length, 
    productsCount: products.length,
  });

  // Calculate admin statistics (ALL DATA)
  const totalRevenue = orders.reduce((sum: number, order: any) => {
    return sum + Number(order.totalPrice || 0);
  }, 0);
  
  const paidOrders = orders.filter((order: any) => order.isPaid);
  const paidRevenue = paidOrders.reduce((sum: number, order: any) => {
    return sum + Number(order.totalPrice || 0);
  }, 0);
  
  const totalSales = Math.round(totalRevenue / 1000);
  const dailySales = orders.filter((order: any) => {
    try {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  }).length;
  
  const buyers = users.filter((user: any) => user.role?.toLowerCase() === 'buyer');
  const sellers = users.filter((user: any) => user.role?.toLowerCase() === 'seller');
  const admins = users.filter((user: any) => user.role?.toLowerCase() === 'admin');
  
  const dailyUsers = buyers.length;
  const totalProducts = products.length;
  const recentOrders = orders.slice(0, 10);

  // Chart data for admin (ALL DATA)
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
        try {
          const orderDate = new Date(order.createdAt);
          return orderDate.getFullYear() === currentYear && orderDate.getMonth() === index;
        } catch {
          return false;
        }
      });
      
      return {
        name: month,
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum: number, order: any) => sum + Number(order.totalPrice || 0), 0)
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

  console.log('📊 Final admin dashboard data (ALL DATA):', {
    totalSales,
    dailySales,
    totalOrders: orders.length,
    totalUsers: users.length,
    totalRevenue,
    paidRevenue,
  });

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
