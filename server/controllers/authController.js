import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const signup = async (req, res) => {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        console.log(`Starting signup for email: ${email}`);
        
        // 1. Create user in Supabase Auth (unverified)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            user_metadata: { full_name: fullName, phone: phone },
            email_confirm: false
        });

        if (authError) {
            console.error('Supabase Admin Create User Error:', authError);
            throw authError;
        }

        const userId = authData.user.id;
        console.log(`User created in Auth with ID: ${userId}`);

        // 2. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
        console.log(`Generated OTP: ${otp} for user: ${userId}`);

        // 3. Store OTP in profiles table
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({ 
                id: userId, 
                otp: otp, 
                otp_expires_at: expiresAt.toISOString(),
                plan: 'free'
            });

        if (profileError) {
            console.error('Error storing OTP in profile:', profileError);
            throw profileError;
        }
        console.log('OTP stored successfully in profile');

        // 4. Send Email via Nodemailer
        console.log(`Attempting to send email to: ${email}`);
        const mailOptions = {
            from: `"NoteShelf" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Your Verification Code - NoteShelf',
            text: `Your verification code is: ${otp}. It expires in 15 minutes.`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Welcome to NoteShelf!</h2>
                    <p>Please use the following 6-digit code to verify your email address:</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4c4a8f; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This code will expire in 15 minutes.</p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');

        res.status(201).json({ 
            success: true, 
            message: 'User created. OTP sent to email.',
            userId: userId 
        });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ error: error.message || 'Signup failed' });
    }
};

export const verifyOtp = async (req, res) => {
    const { email, token } = req.body;

    if (!email || !token) {
        return res.status(400).json({ error: 'Email and verification code are required' });
    }

    try {
        console.log(`Verifying OTP for email: ${email}`);
        
        // 1. Find user by email to get ID
        const { data, error: findError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (findError) {
            console.error('Supabase Auth List Users Error:', findError);
            throw findError;
        }

        const users = data?.users || [];
        const user = users.find(u => u.email === email);
        if (!user) {
            console.warn(`User not found for email: ${email}`);
            return res.status(404).json({ error: 'User not found' });
        }

        const userId = user.id;
        console.log(`Found user ID: ${userId} for verification`);

        // 2. Check OTP in profiles table
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('otp, otp_expires_at')
            .eq('id', userId)
            .single();

        if (profileError) {
            console.error('Profile fetch error during verification:', profileError);
            throw profileError;
        }

        if (!profile || profile.otp !== token) {
            console.warn(`Invalid OTP. Provided: ${token}, Stored: ${profile?.otp}`);
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // 3. Check expiration
        if (new Date(profile.otp_expires_at) < new Date()) {
            console.warn('OTP expired');
            return res.status(400).json({ error: 'Verification code has expired' });
        }

        console.log('OTP valid, updating user confirmed status');

        // 4. Update user as confirmed in Supabase Auth
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            email_confirm: true
        });

        if (updateError) {
            console.error('Error updating user confirmed status:', updateError);
            throw updateError;
        }

        // 5. Clear OTP from profile
        await supabaseAdmin
            .from('profiles')
            .update({ otp: null, otp_expires_at: null })
            .eq('id', userId);

        console.log('Verification successful!');
        res.json({ success: true, message: 'Email verified successfully' });

    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ error: error.message || 'Verification failed' });
    }
};
