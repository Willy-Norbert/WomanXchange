
import { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';

interface OrderForm {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

export const Checkout = () => {
  const { cart, cartId, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });

  const handleInputChange = (field: keyof OrderForm, value: string) => {
    setOrderForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['email', 'firstName', 'lastName', 'address', 'city', 'postalCode', 'phone'];
    const missing = required.filter(field => !orderForm[field as keyof OrderForm]);
    
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(', ')}`);
      return false;
    }
    
    if (!cart?.items?.length) {
      toast.error('Your cart is empty');
      return false;
    }
    
    return true;
  };

  const placeOrder = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      console.log('🛒 Placing order with cart ID:', cartId);
      console.log('🛒 Cart items count:', cart?.items?.length || 0);
      console.log('🛒 User authenticated:', !!user);

      const orderData = {
        customer_info: orderForm,
        cart_id: cartId, // Ensure cart ID is included
        user_id: user?.id || null,
      };

      console.log('🛒 Order payload:', orderData);

      let response;
      if (user) {
        // Authenticated user
        response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify(orderData),
        });
      } else {
        // Guest user
        response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });
      }

      console.log('🛒 Order response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('🛒 Order placed successfully:', result);
        
        toast.success('Order placed successfully! You will receive a confirmation email.');
        
        // Clear cart after successful order
        await clearCart();
        
        // Redirect or show success page
        window.location.href = '/order-confirmation';
      } else {
        const error = await response.json();
        console.error('🛒 Order failed:', error);
        toast.error(error.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('🛒 Order error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart?.items?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Your cart is empty</p>
            <Button className="mt-4" onClick={() => window.location.href = '/products'}>
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Form */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={orderForm.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={orderForm.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={orderForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={orderForm.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={orderForm.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={orderForm.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={orderForm.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-bold">
                  <span>Total</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-6" 
                onClick={placeOrder}
                disabled={loading}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
