import nodemailer from 'nodemailer';

const transporter = process.env.NODE_ENV === 'test' ? {
        sendMail: async() => ({ response: 'Test email sent' })
    } :
    nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

export const sendVerificationEmail = async(email, verificationCode) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification - UniHub',
        html: `
            <h1>Welcome to UniHub!</h1>
            <p>Thank you for registering. Please verify your email address by entering the following code:</p>
            <h2 style="color: #4CAF50;">${verificationCode}</h2>
            <p>This code will expire in 24 hours.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
};