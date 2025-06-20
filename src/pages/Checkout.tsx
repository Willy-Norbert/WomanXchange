
import { Button } from '@/components/ui/button';

const Checkout = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-600 mb-4">Complete your order</p>
        <Button className="w-full">
          Place Order
        </Button>
      </div>
    </div>
  );
};

export default Checkout;
