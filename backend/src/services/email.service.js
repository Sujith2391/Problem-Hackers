const nodemailer = require('nodemailer');

// Create transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

class EmailService {
  async sendMealReminder(email, fullName, date) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Meal Confirmation Reminder - Karmic Canteen',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Meal Confirmation Reminder</h2>
          <p>Dear ${fullName},</p>
          <p>This is a reminder to confirm your meal for <strong>${date}</strong>.</p>
          <p>Please log in to the Karmic Canteen app and confirm your meal preferences.</p>
          <p>Thank you!</p>
          <p>Karmic Canteen Team</p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Meal reminder sent to ${email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
