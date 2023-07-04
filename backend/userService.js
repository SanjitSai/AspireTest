const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  collegeName: String,
  firstName: String,
  lastName: String,
  otp: String,
  verified: Boolean,
});

const User = mongoose.model('User', userSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const userService = {
  registerUser: async (userData) => {
    const { username, password, confirmPassword, email, collegeName, firstName, lastName } = userData;

    if (password !== confirmPassword) {
      throw new Error('Password and confirm password do not match');
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    const otp = generateOTP();

    const user = new User({
      username,
      password, // TODO: Implement password hashing for security
      email,
      collegeName,
      firstName,
      lastName,
      otp,
      verified: false,
    });

    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Registration OTP',
      text: `Your OTP for registration is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    console.log('User registered successfully:');
    console.log(user);
    return user;
  },

  verifyUser: async (otp) => {
    const user = await User.findOne({ otp });

    if (!user) {
      throw new Error('User not found');
    }

    if (otp !== user.otp) {
      throw new Error('Invalid OTP');
    }

    user.verified = true;
    await user.save();

    console.log('User verified successfully:');
    console.log(user);
    return user;
  },

  loginUser: async (username, password) => {
    const user = await User.findOne({ username });

    if (!user) {
      throw new Error('User not found');
    }

    if (password !== user.password) {
      throw new Error('Invalid password');
    }

    if (!user.verified) {
      throw new Error('User not verified');
    }

    const payload = {
      username: user.username,
      email: user.email,
      collegeName: user.collegeName,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    console.log('User logged in successfully:');
    console.log(user);
    return token;
  },

  forgotPassword: async (usernameOrEmail) => {
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      throw new Error('User not found');
    }

    const otp = generateOTP();

    user.otp = otp;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    console.log('OTP sent for password reset:');
    console.log(user);
    return user;
  },

  resetPassword: async (username, existingPassword, newPassword) => {
    const user = await User.findOne({ username });

    if (!user) {
      throw new Error('User not found');
    }

    if (existingPassword !== user.password) {
      throw new Error('Invalid existing password');
    }

    user.password = newPassword; // TODO: Implement password hashing for security
    await user.save();

    console.log('Password reset successfully for user:', user.username);
    return user;
  },
  
};

function generateOTP() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let otp = '';
  for (let i = 0; i < 25; i++) {
    otp += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return otp;
}

module.exports = userService;
