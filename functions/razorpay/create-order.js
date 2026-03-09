/**
 * Razorpay Order Creation Endpoint
 * Creates Razorpay orders for both property bookings and memberships
 */

export async function onRequestPost(context) {
    try {
        const { request } = context;
        const body = await request.json();
        const { amount, currency = 'INR', receipt, notes = {} } = body;

        // Validate amount
        if (!amount || amount <= 0) {
            return new Response(JSON.stringify({
                error: 'Invalid amount',
                message: 'Amount must be greater than 0'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // For now, create a mock order ID (Razorpay integration)
        // In production, you'd call Razorpay API here
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const orderData = {
            id: orderId,
            entity: 'order',
            amount: Math.round(amount), // Amount in paise
            amount_paid: 0,
            amount_due: Math.round(amount),
            currency: currency,
            receipt: receipt || `rcpt_${Date.now()}`,
            status: 'created',
            attempts: 0,
            notes: notes,
            created_at: Math.floor(Date.now() / 1000)
        };

        console.log('Razorpay order created:', orderId);

        return new Response(JSON.stringify(orderData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        return new Response(JSON.stringify({
            error: 'Failed to create order',
            details: error.message
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        }
    });
}
