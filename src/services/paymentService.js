import api from './api';

export const paymentService = {
  /**
   * Full Razorpay payment flow.
   * @param {string} productId
   * @param {object} shippingAddress
   * @param {object} user  - prefill name/email in Razorpay modal
   * @returns {Promise<object>} verified order
   */
  initiatePayment: async (productId, shippingAddress, user) => {
    // Step 1: Create Razorpay order on backend
    const { data: orderData } = await api.post('/payment/create-order', {
      productId,
      shippingAddress,
    });

    const { razorpayOrderId, orderId, amount } = orderData.data;

    // Step 2: Open Razorpay checkout
    return new Promise((resolve, reject) => {
      const options = {
        key:         import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency:    'INR',
        name:        'ReWear',
        description: 'Second-hand branded fashion',
        order_id:    razorpayOrderId,
        handler: async (response) => {
          try {
            // Step 3: Verify signature on backend
            const { data: verifyData } = await api.post('/payment/verify', {
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId,
            });
            resolve(verifyData.data.order);
          } catch (err) {
            reject(err);
          }
        },
        prefill: {
          name:  user?.name  || '',
          email: user?.email || '',
        },
        theme: { color: '#FF6B35' },
        modal: {
          ondismiss: () => reject(new Error('Payment was cancelled')),
        },
      };

      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded. Check your internet connection.'));
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        reject(new Error(response.error?.description || 'Payment failed'));
      });
      rzp.open();
    });
  },
};
