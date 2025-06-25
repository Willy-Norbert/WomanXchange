
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOrder } from '@/api/orders';
import { useToast } from '@/hooks/use-toast';

interface OrderUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  userRole: string;
}

export const OrderUpdateDialog = ({ isOpen, onClose, order, userRole }: OrderUpdateDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    shippingAddress: order?.shippingAddress || '',
    paymentMethod: order?.paymentMethod || '',
    totalPrice: order?.totalPrice || 0,
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('🔄 Updating order:', order.id, 'with data:', data);
      return updateOrder(order.id, data);
    },
    onSuccess: () => {
      console.log('✅ Order updated successfully');
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
      toast({
        title: 'Order updated',
        description: 'Order has been updated successfully',
      });
      onClose();
    },
    onError: (error: any) => {
      console.error('❌ Order update error:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update order',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrderMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order #{order?.id}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="shippingAddress">Shipping Address</Label>
            <Textarea
              id="shippingAddress"
              value={formData.shippingAddress}
              onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
              placeholder="Enter shipping address"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => handleInputChange('paymentMethod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="momo">Mobile Money</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="totalPrice">Total Price (Rwf)</Label>
            <Input
              id="totalPrice"
              type="number"
              value={formData.totalPrice}
              onChange={(e) => handleInputChange('totalPrice', parseFloat(e.target.value) || 0)}
              placeholder="Enter total price"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateOrderMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {updateOrderMutation.isPending ? 'Updating...' : 'Update Order'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
