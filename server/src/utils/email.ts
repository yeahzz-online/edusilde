import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendOTPEmail = async (email: string, otp: string, name: string): Promise<void> => {
    const mailOptions = {
        from: `"EduSlide Pro" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'EduSlide Pro - Email Verification OTP',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>EduSlide Pro - OTP Verification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #f0f4f8;">
        <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0F4C81 0%, #00B4D8 100%); padding: 40px 32px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">EduSlide Pro</h1>
            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">College PPT Management System</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 32px;">
            <h2 style="margin: 0 0 16px; color: #1B262C; font-size: 22px;">Welcome, ${name}! 👋</h2>
            <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
              Thank you for registering with EduSlide Pro. Please use the verification code below to complete your registration.
            </p>
            
            <!-- OTP Box -->
            <div style="background: linear-gradient(135deg, #f0f4ff 0%, #e8f4fd 100%); border: 2px solid #0F4C81; border-radius: 12px; padding: 32px; text-align: center; margin: 24px 0;">
              <p style="margin: 0 0 8px; color: #4a5568; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Your Verification Code</p>
              <div style="font-size: 48px; font-weight: 800; color: #0F4C81; letter-spacing: 8px; font-family: monospace;">${otp}</div>
              <p style="margin: 12px 0 0; color: #e53e3e; font-size: 13px;">⏱ Expires in 10 minutes</p>
            </div>
            
            <div style="background: #fff8e1; border-left: 4px solid #f6c90e; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
              <p style="margin: 0; color: #744210; font-size: 14px;">🔒 Never share this code with anyone. EduSlide Pro staff will never ask for your OTP.</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #f7fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #718096; font-size: 12px;">© 2025 EduSlide Pro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    };

    await transporter.sendMail(mailOptions);
};
