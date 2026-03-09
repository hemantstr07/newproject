/**
 * Simplified Membership Purchase - No Transaction Storage
 * Just updates user's membership directly after payment
 */

export async function onRequestPost({ request, env }) {
  try {
    const { userId, planId, razorpayPaymentId } = await request.json();
    
    // Validate input
    if (!userId || !planId || !razorpayPaymentId) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        message: 'userId, planId, and razorpayPaymentId are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Get plan details
    const planStmt = env.DB.prepare(`
      SELECT * FROM membership_plans WHERE id = ?
    `);
    const plan = await planStmt.bind(planId).first();
    
    if (!plan) {
      return new Response(JSON.stringify({ 
        error: 'Invalid plan',
        message: 'Plan not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Calculate expiry (365 days from now)
    const now = Date.now();
    const expiresAt = now + (365 * 24 * 60 * 60 * 1000);
    
    // Update user membership directly (no transaction table needed)
    const updateStmt = env.DB.prepare(`
      UPDATE users 
      SET membership_type = ?,
          property_limit = ?,
          membership_expiry = ?,
          updated_at = ?
      WHERE id = ?
    `);
    
    await updateStmt.bind(
      planId,
      plan.property_limit,
      expiresAt,
      now,
      userId
    ).run();
    
    console.log(`Membership upgraded: User ${userId} -> ${planId}`);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Membership upgraded successfully',
      membership: {
        plan_id: planId,
        plan_name: plan.name,
        property_limit: plan.property_limit,
        expires_at: expiresAt,
        razorpay_payment_id: razorpayPaymentId
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Error upgrading membership:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to upgrade membership',
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

// Handle OPTIONS for CORS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
