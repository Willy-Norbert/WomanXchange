
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
  
  // Form data with better defaults for guest users
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
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
          description: "Your MoMo payment code is ready",
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

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.location || !formData.streetLine) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
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

      // Create order - works for both authenticated and guest users
      const orderResponse = await placeOrder({
        shippingAddress,
        paymentMethod,
        // Include guest user info if not authenticated
        guestInfo: !auth?.user ? {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        } : undefined
      });
      
      const orderId = orderResponse.data.id;
      setCurrentOrderId(orderId);

      if (paymentMethod === 'MTN') {
        // For MTN MoMo, generate payment code if not already generated
        if (!paymentCode) {
          const codeResponse = await generatePaymentCode(orderId);
          setPaymentCode(codeResponse.data.paymentCode);
        }
        
        // Confirm client payment
        await confirmClientPayment(orderId);
        
        toast({
          title: "Payment Submitted",
          description: "Your payment has been submitted for admin confirmation",
        });
      } else {
        toast({
          title: "Success",
          description: "Order placed successfully!",
        });
      }

      navigate('/order-complete');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to place order",
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
  const shippingTax = 12000; // Consistent delivery fee
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
              {/* Guest User Notice */}
              {!auth?.user && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    You're checking out as a guest. Want to save your information? 
                    <Link to="/register" className="ml-1 underline font-medium">
                      Create an account
                    </Link> or 
                    <Link to="/login" className="ml-1 underline font-medium">
                      sign in
                    </Link>.
                  </p>
                </div>
              )}

              {/* Billing Address */}
              <div>
                <div className="flex items-center mb-4">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
                  <h2 className="text-xl font-semibold">
                    {auth?.user ? 'Billing Address' : 'Contact & Billing Information'}
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input 
                    placeholder="First Name *" 
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                  <Input 
                    placeholder="Last Name *" 
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Input 
                    placeholder="Email *" 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!!auth?.user}
                    required
                  />
                  <Input 
                    placeholder="Location *" 
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                  />
                </div>
                
                <Input 
                  placeholder="Street Line *" 
                  className="mb-4" 
                  value={formData.streetLine}
                  onChange={(e) => handleInputChange('streetLine', e.target.value)}
                  required
                />
              </div>

              {/* Shipping Address */}
              <div>
                <div className="flex items-center mb-4">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id="same-address" 
                    checked={sameAsBilling}
                    onCheckedChange={handleSameAsBillingChange}
                  />
                  <Label htmlFor="same-address" className="text-purple-600">Same as billing address</Label>
                </div>

                {!sameAsBilling && (
                  <Input 
                    placeholder="Shipping Address" 
                    value={formData.shippingAddress}
                    onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                  />
                )}
              </div>

              {/* Payment Method */}
              <div>
                <div className="flex items-center mb-4">
                  <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm mr-3">3</span>
                  <h2 className="text-xl font-semibold">Payment Method</h2>
                </div>
                
                <RadioGroup value={paymentMethod} onValueChange={handlePaymentMethodChange} className="mb-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MTN" id="mtn" />
                    <Label htmlFor="mtn">MTN MOMO</Label>
                  </div>
                </RadioGroup>

                {/* MoMo Payment Code Display */}
                {paymentMethod === 'MTN' && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">MoMo Payment Code</h3>
                    {generatingCode ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                        <span className="text-gray-600">Generating payment code...</span>
                      </div>
                    ) : paymentCode ? (
                      <div className="bg-white p-3 rounded border-2 border-green-500">
                        <div className="text-lg font-bold text-green-600">{paymentCode}</div>
                        <p className="text-sm text-gray-600 mt-1">
                          Use this code to complete your MoMo payment
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-600">Payment code will be generated after placing order</p>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-2 mt-4">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">Secure Payment</span>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Your purchases are secured by industry-standard encryption
                </p>
              </div>

              <Button 
                onClick={handleCompleteOrder}
                disabled={processing}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg"
              >
                {processing ? "Processing..." : paymentMethod === 'MTN' ? "Submit Payment for Confirmation →" : "Complete Order →"}
              </Button>
            </div>

            {/* Right Side - Order Summary */}
            <div className="lg:pl-8">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img 
                      src={item.product.coverImage} 
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-gray-600">{item.product.price.toLocaleString()} Rwf</p>
                    </div>
                    <span className="font-semibold">{item.quantity} ×</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString()} Rwf</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{shippingTax.toLocaleString()} Rwf</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{total.toLocaleString()} Rwf</span>
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
