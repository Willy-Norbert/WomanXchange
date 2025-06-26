import { Request, Response } from 'express';
import { db } from '../lib/database';
import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'byiringirourban20@gmail.com',
    pass: 'zljw hslg rxpb mqpu',
  },
});

// Create order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customer_info, cart_id, user_id } = req.body;
    
    console.log('📦 Creating order with data:', { customer_info, cart_id, user_id });

    if (!customer_info) {
      return res.status(400).json({ message: 'Customer info is required' });
    }

    if (!cart_id && !user_id) {
      return res.status(400).json({ message: 'Cart ID or User ID is required' });
    }

    // Get cart items - prioritize user_id for authenticated users, cart_id for guests
    let cartQuery;
    let cartParam;
    
    if (user_id) {
      cartQuery = 'SELECT * FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = ?';
      cartParam = user_id;
    } else if (cart_id) {
      cartQuery = 'SELECT * FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?';
      cartParam = cart_id;
    } else {
      return res.status(400).json({ message: 'No valid cart identifier provided' });
    }
    
    console.log('📦 Fetching cart with query:', cartQuery, 'param:', cartParam);
    const cartItems = await db.query(cartQuery, [cartParam]);

    console.log('📦 Found cart items:', cartItems.length);

    if (!cartItems.length) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total
    const total = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Create order
    const orderResult = await db.query(
      `INSERT INTO orders (user_id, customer_email, customer_name, customer_phone, 
       shipping_address, total_amount, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [
        user_id || null,
        customer_info.email,
        `${customer_info.firstName} ${customer_info.lastName}`,
        customer_info.phone,
        `${customer_info.address}, ${customer_info.city}, ${customer_info.postalCode}`,
        total
      ]
    );

    const orderId = orderResult.insertId;

    // Create order items
    for (const item of cartItems) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // Clear cart - use appropriate identifier
    if (user_id) {
      await db.query('DELETE FROM cart_items WHERE user_id = ?', [user_id]);
    } else if (cart_id) {
      await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cart_id]);
    }

    // Send confirmation email to customer
    try {
      const orderItemsList = cartItems.map((item: any) => 
        `${item.name} - Qty: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
      ).join('\n');

      await transporter.sendMail({
        from: 'byiringirourban20@gmail.com',
        to: customer_info.email,
        subject: `Order Confirmation #${orderId}`,
        text: `
Thank you for your order!

Order Details:
Order ID: #${orderId}
Customer: ${customer_info.firstName} ${customer_info.lastName}
Email: ${customer_info.email}
Phone: ${customer_info.phone}

Shipping Address:
${customer_info.address}
${customer_info.city}, ${customer_info.postalCode}

Items:
${orderItemsList}

Total: $${total.toFixed(2)}

Your order is being processed and you will receive updates soon.

Thank you for shopping with us!
        `,
      });

      console.log('📧 Order confirmation email sent to customer');
    } catch (emailError) {
      console.error('📧 Failed to send confirmation email:', emailError);
    }

    // Send notification email to admin
    try {
      await transporter.sendMail({
        from: 'byiringirourban20@gmail.com',
        to: 'byiringirourban20@gmail.com',
        subject: `New Order Received #${orderId}`,
        text: `
New order received!

Order ID: #${orderId}
Customer: ${customer_info.firstName} ${customer_info.lastName}
Email: ${customer_info.email}
Phone: ${customer_info.phone}
Total: $${total.toFixed(2)}

Please review and approve the order in the admin panel.
        `,
      });

      console.log('📧 Admin notification email sent');
    } catch (emailError) {
      console.error('📧 Failed to send admin notification:', emailError);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order_id: orderId,
      total: total
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// Get orders (for admin)
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await db.query(`
      SELECT o.*, GROUP_CONCAT(CONCAT(p.name, ' (', oi.quantity, ')') SEPARATOR ', ') as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    // If approved, send email to customer
    if (status === 'approved') {
      const order = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
      if (order.length > 0) {
        try {
          await transporter.sendMail({
            from: 'byiringirourban20@gmail.com',
            to: order[0].customer_email,
            subject: `Order Approved #${id}`,
            text: `
Good news! Your order #${id} has been approved and is being prepared for shipment.

Order Total: $${order[0].total_amount}

You will receive tracking information once your order ships.

Thank you for your business!
            `,
          });
          console.log('📧 Order approval email sent to customer');
        } catch (emailError) {
          console.error('📧 Failed to send approval email:', emailError);
        }
      }
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};
