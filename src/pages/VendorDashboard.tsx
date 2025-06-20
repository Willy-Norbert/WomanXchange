
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

const VendorDashboard = () => {
  const auth = useContext(AuthContext);

  return (
    <ProtectedRoute requiredRole="seller">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Vendor Dashboard</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-600">Welcome, {auth?.user?.name}!</p>
          <p className="text-sm text-gray-500">Role: {auth?.user?.role}</p>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default VendorDashboard;
