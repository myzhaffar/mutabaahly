import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createClient(
      'https://isyhakwwgdozgtlquzis.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzeWhha3d3Z2Rvemd0bHF1emlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NTY3NzcsImV4cCI6MjA2MjUzMjc3N30.-2Ya944q8mgJzRAuhMpRAWgxWVmt2yc3CqM0jjgFuuY'
    );

    // Check if user exists and get their name
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    let userName = 'User'; // Default name
    if (profileData) {
      userName = profileData.full_name;
    } else {
      console.log('Profile not found yet, using default name');
      // Profile might not exist yet, that's okay for email confirmation
    }

    // Since we're using Resend for email confirmation, we don't need to verify user in auth.users
    // The profile creation happens in the background, and email confirmation is handled separately

    // Send confirmation email
    const confirmationHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c5530;">Welcome to Mutabaahly!</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for signing up for Mutabaahly. Your account has been created successfully!</p>
        <p>To complete your registration, please click the link below to confirm your email address:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="https://mutabaahly.com/auth/confirm?email=${encodeURIComponent(email)}" 
             style="background-color: #2c5530; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Confirm Email Address
          </a>
        </p>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">
          https://mutabaahly.com/auth/confirm?email=${encodeURIComponent(email)}
        </p>
        <p>If you didn't create this account, you can safely ignore this email.</p>
        <br>
        <p>Best regards,<br>Mutabaahly Team</p>
      </div>
    `;

    const { error: emailError } = await resend.emails.send({
      from: 'Mutabaahly <noreply@mutabaahly.com>',
      to: [email],
      subject: 'Welcome to Mutabaahly - Confirm Your Email',
      html: confirmationHtml,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      return NextResponse.json({ error: 'Failed to send confirmation email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Reminder email sent successfully' });
  } catch (error) {
    console.error('Error in send-confirmation-email route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 