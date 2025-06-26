
import { useState, useEffect, useContext } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { AuthContext } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import { placeOrder } from '@/api/orders';
import { generatePaymentCode, confirmClientPayment } from '@/api/payments';
import { useToast } from '@/hooks/use-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const { toast } = useToast();
  const { cart, isLoading } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('MTN');
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentCode, setPaymentCode] = useState('');
  const [generatingCode, setGeneratingCode] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
  
  // Form data for both authenticated and anonymous users
  const [formData, setFormData] = useState({
    firstName: auth?.user?.name?.split(' ')[0] || '',
    lastName: auth?.user?.name?.split(' ')[1] || '',
    email: auth?.user?.email || '',
    location: '',
    streetLine: '',
    shippingAddress: ''
  });

  // Generate MoMo payment code when MTN is selected
  const handlePaymentMethodChange = async (method: string) => {
    setPaymentMethod(method);
    
    if (method === 'MTN' && currentOrderId) {
      setGeneratingCode(true);
      try {
        const response = await generatePaymentCode(currentOrderId);
        setPaymentCode(response.data.paymentCode);
        toast({
          title: "Payment Code Generated",
          description: `Your MTN MoMo payment code is: ${response.data.paymentCode}`,
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to generate payment code",
          variant: "destructive",
        });
      } finally {
        setGeneratingCode(false);
      }
    } else {
      setPaymentCode('');
    }
  };

  const handleCompleteOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.location || !formData.streetLine) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    try {
      const shippingAddress = sameAsBilling 
        ? `${formData.streetLine}, ${formData.location}`
        : formData.shippingAddress || `${formData.streetLine}, ${formData.location}`;

      const customerName = `${formData.firstName} ${formData.lastName}`;

      // Get cart ID for anonymous users
      const cartId = localStorage.getItem('anonymous_cart_id');

      // Create the order
      const orderData = {
        shippingAddress,
        paymentMethod,
        customerEmail: formData.email,
        customerName,
        ...(cartId && !auth?.user && { cartId: parseInt(cartId) })
      };

      console.log('🛒 Placing order with data:', orderData);

      const orderResponse = await placeOrder(orderData);
      const orderId = orderResponse.data.id;
      setCurrentOrderId(orderId);

      console.log('✅ Order created:', orderId);

      if (paymentMethod === 'MTN') {
        // Generate payment code (static: 078374886)
        const codeResponse = await generatePaymentCode(orderId);
        setPaymentCode(codeResponse.data.paymentCode);
        
        // Confirm client payment
        await confirmClientPayment(orderId);
        
        toast({
          title: "Order Placed Successfully!",
          description: `Your MTN MoMo payment code is: ${codeResponse.data.paymentCode}. Please use this code to complete your payment. A confirmation email has been sent to ${formData.email}`,
        });
      } else {
        toast({
          title: "Order Placed Successfully!",
          description: `Your order will be delivered and you can pay upon delivery. A confirmation email has been sent to ${formData.email}`,
        });
      }

      // Clear cart for anonymous users
      if (!auth?.user && cartId) {
        localStorage.removeItem('anonymous_cart_id');
      }

      navigate('/order-complete');
    } catch (error: any) {
      console.error('❌ Checkout error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSameAsBillingChange = (checked: boolean | "indeterminate") => {
    setSameAsBilling(checked === true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shippingTax = 12000; // Delivery fee
  const total = subtotal + shippingTax;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/cart" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-6">Your cart is empty</p>
            <Link to="/products">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Forms */}
            <div className="space-y-8">
              {/* Customer Information */}
              <div>
                <div className="flex items-center mb-4">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
                  <h2 className="text-xl font-semibold">Customer Information</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName"
                      placeholder="First Name" 
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName"
                      placeholder="Last Name" 
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email"
                    placeholder="Email Address" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Order confirmation will be sent to this email</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <div className="flex items-center mb-4">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input 
                      id="location"
                      placeholder="City/District" 
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="streetLine">Street Address *</Label>
                    <Input 
                      id="streetLine"
                      placeholder="Street Line" 
                      value={formData.streetLine}
                      onChange={(e) => handleInputChange('streetLine', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <div className="flex items-center mb-4">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm mr-3">3</span>
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                </div>
                
                <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="MTN" id="mtn" />
                    <Label htmlFor="mtn" className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">MTN Mobile Money</span>
                        <span className="text-sm text-gray-500">Pay via MTN MoMo</span>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="PAY_ON_DELIVERY" id="pod" />
                    <Label htmlFor="pod" className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Pay on Delivery</span>
                        <span className="text-sm text-gray-500">Pay when you receive your order</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'MTN' && paymentCode && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-medium text-yellow-800 mb-2">MTN MoMo Payment Code</h3>
                    <p className="text-2xl font-bold text-yellow-900 mb-2">{paymentCode}</p>
                    <p className="text-sm text-yellow-700">Use this code to complete your MTN MoMo payment</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Order Summary */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img 
                        src={item.product.coverImage} 
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">{(item.product.price * item.quantity).toLocaleString()} Rwf</p>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">{subtotal.toLocaleString()} Rwf</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-semibold">{shippingTax.toLocaleString()} Rwf</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{total.toLocaleString()} Rwf</span>
                  </div>
                </div>

                {/* Complete Order Button */}
                <Button 
                  onClick={handleCompleteOrder}
                  disabled={processing || generatingCode}
                  className="w-full mt-6 bg-purple-500 hover:bg-purple-600 text-white py-4 rounded-full"
                >
                  {processing ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing Order...</span>
                    </div>
                  ) : generatingCode ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating Payment Code...</span>
                    </div>
                  ) : (
                    `Complete Order - ${total.toLocaleString()} Rwf`
                  )}
                </Button>

                {/* Security Note */}
                <div className="flex items-center space-x-2 mt-4 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Your information is secure and encrypted</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
