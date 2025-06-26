
// Main order controller - re-exports all order-related functions
export {
  addToCart,
  removeFromCart,
  getCart
} from './cartController.js';

export {
  placeOrder,
  getUserOrders
} from './orderManagementController.js';

export {
  getOrderById,
  createOrder,
  getAllOrders,
  updateOrder,
  deleteOrder
} from './adminOrderController.js';

export {
  updateOrderStatus,
  confirmOrderPayment
} from './orderStatusController.js';
