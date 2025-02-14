import nodemailer from 'nodemailer';

export const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Ваш код подтверждения',
      text: `Ваш OTP код: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP ${otp} отправлен на ${email}`);
    
    return true; // Успешно отправлено
  } catch (error) {
    console.error('❌ Ошибка отправки письма:', error);
    return false;
  }
};
