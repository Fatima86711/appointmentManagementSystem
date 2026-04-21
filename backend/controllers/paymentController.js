import Stripe from 'stripe';
import appointmentModel from '../models/appointmentModel.js';
import userModel from '../models/userModel.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.userId; // from authUser middleware

    console.log('🔵 createCheckoutSession called:', { appointmentId, userId });

    // Validate appointment exists
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      console.log('❌ Appointment not found:', appointmentId);
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    console.log('✓ Appointment found:', appointment._id, appointment.amount);

    // Verify appointment belongs to user
    if (appointment.userId.toString() !== userId.toString()) {
      console.log('❌ Unauthorized: appointment user mismatch');
      return res.status(403).json({ success: false, message: 'Unauthorized: Not your appointment' });
    }

    // Check if already paid
    if (appointment.payment) {
      console.log('❌ Appointment already paid');
      return res.status(400).json({ success: false, message: 'Appointment already paid' });
    }

    // Get user details for email
    const user = await userModel.findById(userId);
    if (!user) {
      console.log('❌ User not found:', userId);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('✓ User found:', user.email);

    // Create Stripe Checkout Session
    const amountInCents = Math.round((appointment.amount || 0) * 100); // Convert to cents
    
    console.log('💳 Creating Stripe session with amount:', amountInCents, 'cents');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Appointment with ${appointment.docData?.name || 'Doctor'}`,
              description: `Appointment date: ${appointment.slotData} at ${appointment.slotTime}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: user.email,
      metadata: {
        appointmentId: appointmentId.toString(),
        userId: userId.toString(),
      },
      success_url: `${process.env.FRONTEND_URL}/my-appointments?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL}/my-appointments?payment=cancelled`,
    });

    console.log('✅ Session created:', session.id);
    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error('❌ createCheckoutSession error:', error.message, error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Stripe Webhook Handler
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const appointmentId = session.metadata?.appointmentId;

      if (appointmentId) {
        try {
          // Mark appointment as paid
          await appointmentModel.findByIdAndUpdate(
            appointmentId,
            {
              payment: true,
              paymentInfo: {
                sessionId: session.id,
                paymentIntentId: session.payment_intent,
                amountPaid: session.amount_total / 100, // Convert from cents
                paidAt: new Date(),
              },
            }
          );
          console.log(`✓ Appointment ${appointmentId} marked as paid`);
        } catch (dbError) {
          console.error('Error updating appointment:', dbError);
        }
      }
    }

    // Handle payment_intent.payment_failed event (optional)
    if (event.type === 'payment_intent.payment_failed') {
      console.warn('Payment failed:', event.data.object.id);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook signature verification failed:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};