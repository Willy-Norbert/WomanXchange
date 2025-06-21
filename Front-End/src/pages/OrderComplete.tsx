
import { CheckCircle, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { generatePaymentCode, confirmClientPayment } from '@/api/payments';
import { useToast } from '@/hooks/use-toast';

const OrderComplete = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [paymentCode, setPaymentCode] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'code-generated' | 'confirmed'>('pending');
  const [orderId, setOrderId] = useState<number | null>(null);

  // Get order ID from navigation state or URL params
  useEffect(() => {
    const state = location.state as { orderId?: number };
    if (state?.orderId) {
      setOrderId(state.orderId);
    }
  }, [location.state]);

  const handleGeneratePaymentCode = async () => {
    if (!orderId) {
      toast({
        title: "Error",
        description: "Order ID not found",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await generatePaymentCode(orderId);
      setPaymentCode(response.data.paymentCode);
      setPaymentStatus('code-generated');
      toast({
        title: "Success",
        description: "Payment code generated successfully",
      });
    } catch (error: any) {
      console.error('Error generating payment code:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to generate payment code",
        variant: "destructive",
      });
    }
  };

  const handleConfirmPayment = async () => {
    if (!orderId) {
      toast({
        title: "Error",
        description: "Order ID not found",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await confirmClientPayment(orderId);
      setPaymentStatus('confirmed');
      toast({
        title: "Success",
        description: "Payment confirmed! Awaiting admin verification.",
      });
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to confirm payment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">
            Your order has been received and is being processed.
          </p>
          {orderId && (
            <p className="text-sm text-gray-500 mt-2">Order ID: #{orderId}</p>
          )}
        </div>

        {/* Payment Processing Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center justify-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Processing
          </h3>
          
          {paymentStatus === 'pending' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">Generate a payment code to proceed with MoMo payment</p>
              <Button 
                onClick={handleGeneratePaymentCode}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Generate Payment Code
              </Button>
            </div>
          )}

          {paymentStatus === 'code-generated' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded border">
                <p className="text-sm text-gray-600 mb-1">Your Payment Code:</p>
                <p className="text-xl font-bold text-blue-600">{paymentCode}</p>
              </div>
              <p className="text-xs text-gray-500">
                Use this code to complete your MoMo payment, then confirm below
              </p>
              <Button 
                onClick={handleConfirmPayment}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                I've Made the Payment
              </Button>
            </div>
          )}

          {paymentStatus === 'confirmed' && (
            <div className="space-y-2">
              <div className="flex items-center justify-center text-orange-600">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-semibold">Awaiting Admin Confirmation</span>
              </div>
              <p className="text-sm text-gray-600">
                Your payment is being verified by our admin team
              </p>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <Link to="/orders" className="block">
            <Button variant="outline" className="w-full">
              View My Orders
            </Button>
          </Link>
          <Link to="/" className="block">
            <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
              Return to Home Page
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Your purchases are secured by industry-standard encryption
        </p>
      </div>
    </div>
  );
};

export default OrderComplete;
