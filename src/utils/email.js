const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Send order confirmation email
exports.sendOrderConfirmation = async (order) => {
    const transporter = createTransporter();

    const itemsList = order.items.map(item => 
        `<li>${item.name} x ${item.quantity} - KES ${(item.price * item.quantity).toLocaleString()}</li>`
    ).join('');

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: order.customer.email,
        subject: `Order Confirmation - ${order.orderNumber}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1a365d;">Thank You for Your Order!</h2>
                <p>Dear ${order.customer.name},</p>
                <p>Your order has been received and is being processed.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #ff6b35; margin-top: 0;">Order Details</h3>
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
                    <p><strong>Payment Status:</strong> ${order.paymentStatus.toUpperCase()}</p>
                </div>

                <h3>Order Items:</h3>
                <ul style="list-style: none; padding: 0;">
                    ${itemsList}
                </ul>

                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
                    <p><strong>Subtotal:</strong> KES ${order.subtotal.toLocaleString()}</p>
                    <p><strong>Shipping:</strong> KES ${order.shippingCost.toLocaleString()}</p>
                    <p style="font-size: 20px; color: #1a365d;"><strong>Total:</strong> KES ${order.total.toLocaleString()}</p>
                </div>

                <div style="margin-top: 30px; padding: 20px; background: #f0f4f8; border-radius: 8px;">
                    <h3 style="margin-top: 0;">Delivery Address</h3>
                    <p>${order.customer.address.street}</p>
                    <p>${order.customer.address.city}, ${order.customer.address.county}</p>
                    <p>${order.customer.phone}</p>
                </div>

                <p style="margin-top: 30px;">If you have any questions, please contact us at ${process.env.EMAIL_USER} or call 0115 668 313.</p>
                
                <p style="color: #666;">Best regards,<br><strong>OneStop Kenya Team</strong></p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent to:', order.customer.email);
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
    }
};

// Send order status update email
exports.sendOrderStatusUpdate = async (order, newStatus) => {
    const transporter = createTransporter();

    let statusMessage = '';
    switch (newStatus) {
        case 'processing':
            statusMessage = 'Your order is being prepared for shipment.';
            break;
        case 'shipped':
            statusMessage = `Your order has been shipped! ${order.trackingNumber ? `Tracking Number: ${order.trackingNumber}` : ''}`;
            break;
        case 'delivered':
            statusMessage = 'Your order has been delivered. Thank you for shopping with us!';
            break;
        case 'cancelled':
            statusMessage = 'Your order has been cancelled. If you have any questions, please contact us.';
            break;
        default:
            statusMessage = `Your order status has been updated to: ${newStatus}`;
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: order.customer.email,
        subject: `Order Update - ${order.orderNumber}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1a365d;">Order Status Update</h2>
                <p>Dear ${order.customer.name},</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #ff6b35; margin-top: 0;">Order ${order.orderNumber}</h3>
                    <p style="font-size: 16px;">${statusMessage}</p>
                </div>

                <p>You can track your order status by contacting us with your order number.</p>
                
                <p style="margin-top: 30px;">Thank you for shopping with OneStop Kenya!</p>
                
                <p style="color: #666;">Best regards,<br><strong>OneStop Kenya Team</strong></p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Order status update email sent to:', order.customer.email);
    } catch (error) {
        console.error('Error sending order status update email:', error);
    }
};

// Send product request notification to admin
exports.sendProductRequestNotification = async (productRequest) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_USER, // Send to admin email
        subject: `New Product Request - ${productRequest.productName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ff6b35;">New Product Request</h2>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Product Details</h3>
                    <p><strong>Product Name:</strong> ${productRequest.productName}</p>
                    <p><strong>Category:</strong> ${productRequest.category || 'Not specified'}</p>
                    <p><strong>Description:</strong> ${productRequest.description || 'Not provided'}</p>
                    <p><strong>Urgency:</strong> ${productRequest.urgency.toUpperCase()}</p>
                </div>

                <div style="background: #f0f4f8; padding: 20px; border-radius: 8px;">
                    <h3 style="margin-top: 0;">Customer Information</h3>
                    <p><strong>Name:</strong> ${productRequest.customerName}</p>
                    <p><strong>Email:</strong> ${productRequest.email}</p>
                    <p><strong>Phone:</strong> ${productRequest.phone}</p>
                </div>

                <p style="margin-top: 30px;">Please review this request in the admin panel.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Product request notification sent to admin');
    } catch (error) {
        console.error('Error sending product request notification:', error);
    }
};

