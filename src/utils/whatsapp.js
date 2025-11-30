// WhatsApp Notification Service
// Supports multiple WhatsApp APIs (Twilio, WhatsApp Business API, etc.)

/**
 * Send WhatsApp notification to admin users
 * @param {Array} recipients - Array of phone numbers to notify
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>}
 */
async function sendWhatsAppNotification(recipients, orderData) {
    const results = [];
    
    for (const phoneNumber of recipients) {
        if (!phoneNumber || phoneNumber.trim() === '') continue;
        
        try {
            const message = formatOrderMessage(orderData);
            const result = await sendWhatsAppMessage(phoneNumber, message);
            results.push({ phoneNumber, success: true, result });
        } catch (error) {
            console.error(`Failed to send WhatsApp to ${phoneNumber}:`, error);
            results.push({ phoneNumber, success: false, error: error.message });
        }
    }
    
    return results;
}

/**
 * Format order message for WhatsApp
 * @param {Object} orderData - Order information
 * @returns {String}
 */
function formatOrderMessage(orderData) {
    const orderNumber = orderData.orderNumber || orderData.id || 'N/A';
    const customerName = orderData.customer?.name || orderData.customerName || 'Customer';
    const total = orderData.total || 0;
    const itemsCount = orderData.items?.length || 0;
    const paymentMethod = orderData.paymentMethod || 'N/A';
    const phone = orderData.customer?.phone || orderData.phone || 'N/A';
    
    return `🛒 *NEW ORDER RECEIVED*

📦 Order: ${orderNumber}
👤 Customer: ${customerName}
📱 Phone: ${phone}
💰 Total: Ksh ${parseFloat(total).toLocaleString()}.00
📦 Items: ${itemsCount}
💳 Payment: ${paymentMethod}

View order details in admin panel.

OneStop Kenya`;
}

/**
 * Send WhatsApp message using configured service
 * @param {String} phoneNumber - Recipient phone number (format: 254XXXXXXXXX)
 * @param {String} message - Message to send
 * @returns {Promise<Object>}
 */
async function sendWhatsAppMessage(phoneNumber, message) {
    // Normalize phone number (ensure it starts with country code)
    let normalizedPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
    
    // If starts with 0, replace with 254 (Kenya country code)
    if (normalizedPhone.startsWith('0')) {
        normalizedPhone = '254' + normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith('254')) {
        normalizedPhone = '254' + normalizedPhone;
    }
    
    // Use Twilio WhatsApp API if configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        return await sendViaTwilio(normalizedPhone, message);
    }
    
    // Use WhatsApp Business API if configured
    if (process.env.WHATSAPP_BUSINESS_API_TOKEN) {
        return await sendViaWhatsAppBusinessAPI(normalizedPhone, message);
    }
    
    // Fallback: Log message (for development/testing)
    console.log('WhatsApp Notification (Development Mode):');
    console.log(`To: ${normalizedPhone}`);
    console.log(`Message: ${message}`);
    
    return {
        success: true,
        message: 'WhatsApp notification logged (development mode)',
        phoneNumber: normalizedPhone
    };
}

/**
 * Send via Twilio WhatsApp API
 */
async function sendViaTwilio(phoneNumber, message) {
    const twilio = require('twilio');
    const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
    );
    
    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
    
    try {
        const result = await client.messages.create({
            from: fromNumber,
            to: `whatsapp:+${phoneNumber}`,
            body: message
        });
        
        return {
            success: true,
            messageId: result.sid,
            status: result.status
        };
    } catch (error) {
        throw new Error(`Twilio error: ${error.message}`);
    }
}

/**
 * Send via WhatsApp Business API
 */
async function sendViaWhatsAppBusinessAPI(phoneNumber, message) {
    const axios = require('axios');
    
    const apiUrl = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    try {
        const response = await axios.post(
            apiUrl,
            {
                messaging_product: 'whatsapp',
                to: phoneNumber,
                type: 'text',
                text: { body: message }
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.WHATSAPP_BUSINESS_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return {
            success: true,
            messageId: response.data.messages[0].id,
            status: 'sent'
        };
    } catch (error) {
        throw new Error(`WhatsApp Business API error: ${error.response?.data?.error?.message || error.message}`);
    }
}

module.exports = {
    sendWhatsAppNotification,
    sendWhatsAppMessage,
    formatOrderMessage
};

