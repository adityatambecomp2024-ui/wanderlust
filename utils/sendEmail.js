const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendBookingConfirmation = async (userEmail, userName, hotelName, startDate, endDate, guests, total) => {
    try {
        const mailOptions = {
            from: `"Wanderlust 🌍" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "✅ Booking Confirmed - Wanderlust",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    
                    <h2 style="color: #28a745; text-align: center;">🏨 Booking Confirmed!</h2>
                    
                    <p>Hello <b>${userName}</b>,</p>
                    <p>Your booking has been confirmed successfully!</p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333;">📋 Booking Details</h3>
                        <p>🏨 <b>Hotel:</b> ${hotelName}</p>
                        <p>📅 <b>Check-in:</b> ${new Date(startDate).toDateString()}</p>
                        <p>📅 <b>Check-out:</b> ${new Date(endDate).toDateString()}</p>
                        <p>👥 <b>Guests:</b> ${guests}</p>
                        <p>💰 <b>Total Amount:</b> ₹ ${total}</p>
                    </div>
                    
                    <p style="color: #666;">Thank you for choosing Wanderlust! Have a great stay! 🌟</p>
                    
                    <hr>
                    <p style="text-align: center; color: #999; font-size: 12px;">
                        Wanderlust Hotel Management System
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully!");
    } catch (err) {
        console.log("❌ Email error:", err);
    }
};

module.exports = { sendBookingConfirmation };