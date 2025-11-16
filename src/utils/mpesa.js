const axios = require('axios');

class MPesaService {
    constructor() {
        this.consumerKey = process.env.MPESA_CONSUMER_KEY;
        this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
        this.passkey = process.env.MPESA_PASSKEY;
        this.shortcode = process.env.MPESA_SHORTCODE;
        this.callbackUrl = process.env.MPESA_CALLBACK_URL;
        this.environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
        
        // Set base URL based on environment
        this.baseURL = this.environment === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    // Get OAuth token
    async getAccessToken() {
        try {
            const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
            
            const response = await axios.get(
                `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
                {
                    headers: {
                        Authorization: `Basic ${auth}`
                    }
                }
            );

            return response.data.access_token;
        } catch (error) {
            console.error('Error getting M-Pesa access token:', error.response?.data || error.message);
            throw new Error('Failed to get M-Pesa access token');
        }
    }

    // Generate password for STK Push
    generatePassword() {
        const timestamp = this.getTimestamp();
        const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
        return { password, timestamp };
    }

    // Get timestamp in required format
    getTimestamp() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }

    // Format phone number to 254 format
    formatPhoneNumber(phone) {
        // Remove any spaces, dashes, or other characters
        phone = phone.replace(/\D/g, '');
        
        // If starts with 0, replace with 254
        if (phone.startsWith('0')) {
            phone = '254' + phone.substring(1);
        }
        
        // If doesn't start with 254, add it
        if (!phone.startsWith('254')) {
            phone = '254' + phone;
        }
        
        return phone;
    }

    // Initiate STK Push
    async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
        try {
            const accessToken = await this.getAccessToken();
            const { password, timestamp } = this.generatePassword();
            const formattedPhone = this.formatPhoneNumber(phoneNumber);

            const requestData = {
                BusinessShortCode: this.shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.ceil(amount), // Round up to nearest integer
                PartyA: formattedPhone,
                PartyB: this.shortcode,
                PhoneNumber: formattedPhone,
                CallBackURL: this.callbackUrl,
                AccountReference: accountReference,
                TransactionDesc: transactionDesc
            };

            const response = await axios.post(
                `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('STK Push Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // Query STK Push transaction status
    async querySTKPushStatus(checkoutRequestID) {
        try {
            const accessToken = await this.getAccessToken();
            const { password, timestamp } = this.generatePassword();

            const requestData = {
                BusinessShortCode: this.shortcode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestID
            };

            const response = await axios.post(
                `${this.baseURL}/mpesa/stkpushquery/v1/query`,
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('STK Push Query Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // Register URLs for C2B
    async registerC2BUrls(confirmationURL, validationURL) {
        try {
            const accessToken = await this.getAccessToken();

            const requestData = {
                ShortCode: this.shortcode,
                ResponseType: 'Completed',
                ConfirmationURL: confirmationURL,
                ValidationURL: validationURL
            };

            const response = await axios.post(
                `${this.baseURL}/mpesa/c2b/v1/registerurl`,
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                data: response.data
            };
        } catch (error) {
            console.error('C2B URL Registration Error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }
}

module.exports = new MPesaService();

