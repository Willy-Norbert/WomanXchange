
import { useState, useEffect } from 'react';
import { getAllOrders } from '@/api/orders';
import { getProducts } from '@/api/products';

interface DashboardStats {
  totalSales: number;
  dailySales: number;
  dailyUsers: number;
  totalProducts: number;
  recentOrders: any[];
  loading: boolean;
  error: string | null;
}

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardStats>({
    totalSales: 0,
    dailySales: 0,
    dailyUsers: 0,
    totalProducts: 0,
    recentOrders: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }));
        
        const [ordersResponse, productsResponse] = await Promise.all([
          getAllOrders(),
          getProducts()
        ]);

        const orders = ordersResponse.data;
        const products = productsResponse.data;

        // Calculate total sales
        const totalSales = orders.reduce((sum: number, order: any) => sum + order.totalPrice, 0);
        
        // Calculate daily sales (orders from today)
        const today = new Date().toDateString();
        const dailyOrders = orders.filter((order: any) => 
          new Date(order.createdAt).toDateString() === today
        );
        const dailySales = dailyOrders.reduce((sum: number, order: any) => sum + order.totalPrice, 0);

        // Get unique users from orders
        const uniqueUsers = new Set(orders.map((order: any) => order.userId)).size;
        
        // Get recent orders (last 10)
        const recentOrders = orders
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);

        setData({
          totalSales: Math.floor(totalSales / 1000), // Convert to thousands for display
          dailySales: dailyOrders.length,
          dailyUsers: uniqueUsers,
          totalProducts: products.length,
          recentOrders,
          loading: false,
          error: null,
        });
      } catch (error: any) {
        console.error('Dashboard data fetch error:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.response?.data?.message || 'Failed to fetch dashboard data'
        }));
      }
    };

    fetchDashboardData();
  }, []);

  return data;
};
