/**
 * Record Payment in Database
 * Called after successful Razorpay payment
 */

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const paymentData = await request.json();

        // Validate required fields
        if (!paymentData.booking_id || !paymentData.buyer_id || !paymentData.seller_id) {
            return new Response(JSON.stringify({
                error: 'Missing required fields',
                message: 'booking_id, buyer_id, and seller_id are required'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        const paymentId = paymentData.id || crypto.randomUUID();
        const now = Date.now();

        // Insert payment into database
        await env.DB.prepare(`
            INSERT INTO payments (
                id, booking_id, buyer_id, seller_id, 
                amount, payment_method, transaction_id, 
                status, payment_date, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
            paymentId,
            paymentData.booking_id,
            paymentData.buyer_id,
            paymentData.seller_id,
            paymentData.amount || 0,
            paymentData.payment_method || 'razorpay',
            paymentData.transaction_id || paymentData.razorpay_payment_id,
            paymentData.status || 'completed',
            paymentData.payment_date || new Date().toISOString(),
            now
        ).run();

        // Update booking status to completed
        await env.DB.prepare(`
            UPDATE bookings 
            SET status = 'completed', updated_at = ?
            WHERE id = ?
        `).bind(now, paymentData.booking_id).run();

        // Fetch created payment
        const createdPayment = await env.DB.prepare(
            'SELECT * FROM payments WHERE id = ?'
        ).bind(paymentId).first();

        console.log('Payment recorded successfully:', paymentId);

        return new Response(JSON.stringify({
            success: true,
            message: 'Payment recorded successfully',
            payment: createdPayment
        }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

    } catch (error) {
        console.error('Error recording payment:', error);
        return new Response(JSON.stringify({
            error: 'Failed to record payment',
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
