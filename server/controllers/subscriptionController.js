import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const getSubscriptionStatus = async (req, res) => {
    const userId = req.user.id;

    try {
        // Fetch profile
        let { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code === 'PGRST116') { // Profile not found
            // Initialize profile
            const { data: newProfile, error: createError } = await supabaseAdmin
                .from('profiles')
                .insert([{ id: userId, plan: 'free', ai_usage_count: 0, mindmap_usage_count: 0 }])
                .select()
                .single();

            if (createError) throw createError;
            profile = newProfile;
        } else if (error) {
            throw error;
        }

        res.json(profile);
    } catch (error) {
        console.error('Get Subscription Status Error:', error);
        res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
};

export const getSubscriptionPrice = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('settings')
            .select('value')
            .eq('key', 'pro_price')
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Default price if not set
                return res.json({ price: 499 });
            }
            throw error;
        }

        res.json({ price: parseInt(data.value) });
    } catch (error) {
        console.error('Get Price Error:', error);
        res.status(500).json({ error: 'Failed to fetch price' });
    }
};

export const createPaymentOrder = async (req, res) => {
    try {
        const { data: priceData } = await supabaseAdmin
            .from('settings')
            .select('value')
            .eq('key', 'pro_price')
            .single();
        
        const amount = priceData ? parseInt(priceData.value) * 100 : 49900; // In paise

        const options = {
            amount: amount,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
};

export const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;

    console.log("Incoming verification request:", { razorpay_order_id, razorpay_payment_id, userId });

    if (!process.env.RAZORPAY_KEY_SECRET) {
        console.error("RAZORPAY_KEY_SECRET is missing found in .env!");
        return res.status(500).json({ error: "Server configuration error" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

    console.log("Signature check:", { received: razorpay_signature, expected: expectedSign });

    if (razorpay_signature === expectedSign) {
        console.log("Signature verified! Updating user to Pro...");
        try {
            // Update user plan to pro
            const { data: profile, error } = await supabaseAdmin
                .from('profiles')
                .update({ plan: 'pro' })
                .eq('id', userId)
                .select()
                .single();

            if (error) throw error;
            
            // Log payment with current set price
            const { data: priceData } = await supabaseAdmin
                .from('settings')
                .select('value')
                .eq('key', 'pro_price')
                .single();
            const logAmount = priceData ? parseInt(priceData.value) : 499;

            await supabaseAdmin.from('payments').insert({
                user_id: userId,
                razorpay_order_id,
                razorpay_payment_id,
                amount: logAmount,
                status: 'success'
            });

            res.json({ success: true, message: "Payment verified successfully", profile });
        } catch (error) {
            console.error('Update Plan Error:', error);
            res.status(500).json({ error: "Payment verified but plan update failed. Please contact support." });
        }
    } else {
        res.status(400).json({ error: "Invalid payment signature" });
    }
};
