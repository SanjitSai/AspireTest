const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

/**
 * Define the user schema using Mongoose
 */

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  collegeName: String,
  firstName: String,
  lastName: String,
  otp: String,
  verified: Boolean,
  isBanned: Boolean,
  isVerified_forgot: Boolean,
  name: String,  
  city: String,  
  country: String,  
  bio: String,
  jwtToken: String,  
  education: [  
    {
      universityName: String,
      branch: String,
      startDate: String,
      endDate: String, 
    },
  ],
  workExperiences: [  
    {
      id: Number,
      companyName: String,
      position: String,
      description: String,
      startDate: String,
      endDate: String,

    },
  ],
  skills: [],
});

/**
 * Create a User model using the user schema
 */

const User = mongoose.model('User', userSchema);

/**
 * Create a nodemailer transport for sending emails
 */

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Define the userService object with methods for user-related operations
 */

const userService = {

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<User>} - The registered user
   * @throws {Error} - If registration fails
   */

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
      isBanned: false,
      isVerified_forgot: false,
      jwtToken: "",
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
  
  /**
   * Verify a user with the provided OTP
   * @param {string} otp - The OTP to verify
   * @returns {Promise<User>} - The verified user
   * @throws {Error} - If verification fails
   */

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

  /**
   * Log in a user with the provided username and password
   * @param {string} username - The user's username
   * @param {string} password - The user's password
   * @returns {Promise<string>} - The JWT token for the logged-in user
   * @throws {Error} - If login fails
   */
  
  loginUser: async (username, password) => {
    const user = await User.findOne({ username });

    if (!user) {
      throw new Error('User not found');
    }

    if (password !== user.password) {
      throw new Error('Invalid password');
    }

    if(user.isBanned){
      throw new Error('User is banned');
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

    user.jwtToken = token;

    console.log('User logged in successfully:');
    console.log(user);
    return token;
  },

  /**
   * Send a password reset OTP to the user's email
   * @param {string} usernameOrEmail - The username or email of the user
   * @returns {Promise<User>} - The user for whom the OTP is sent
   * @throws {Error} - If sending the OTP fails
   */
  
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

  /**
   * Reset a user's password with the provided OTP and new password
   * @param {string} username - The username of the user
   * @param {string} existingPassword - The existing password of the user
   * @param {string} newPassword - The new password to set for the user
   * @returns {Promise<User>} - The user with the updated password
   * @throws {Error} - If resetting the password fails
   */
  
  resetPassword: async (username, existingPassword, newPassword) => {
    const user = await User.findOne({ username });

    if (!user) {
      throw new Error('User not found');
    }

    if(!user.isVerify_forgot===false){
      throw new Error('Invalid or expired OTP');
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

/**
 * Generate a random OTP
 * @returns {string} - The generated OTP
 */

function generateOTP() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let otp = '';
  for (let i = 0; i < 25; i++) {
    otp += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return otp;
}

module.exports = {
  User,
  userService,
};
