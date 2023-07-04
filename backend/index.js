require('dotenv').config();

/**
 * Required dependencies
 */
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

/**
 * Create an instance of Express app
 */
const app = express();

/**
 * Middleware
 */
app.use(cors());
app.use(express.json());

/**
 * Array to store user data
 */
let users = [];

/**
 * JSON file path
 */
const dbFilePath = "users.json";

/**
 * Read data from the JSON file and initialize the users array
 */
function readDataFromJsonFile() {
  try {
    const jsonData = fs.readFileSync(dbFilePath, "utf8");
    users = JSON.parse(jsonData);
  } catch (error) {
    console.log("Error reading JSON file:", error);
    users = [];
  }
}

/**
 * Write data to the JSON file
 */
function writeDataToJsonFile() {
  const jsonData = JSON.stringify(users, null, 2);
  fs.writeFileSync(dbFilePath, jsonData, "utf8");
}

/**
 * Generate a 25-digit alphanumeric OTP (One-Time Password)
 */
function generateOTP() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let otp = "";
  for (let i = 0; i < 25; i++) {
    otp += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return otp;
}

/**
 * Create a Nodemailer transporter
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// User service module for user-related operations
const userService = {
  /**
   * Register a new user
   * @param {object} userData - User data including username, password, email, collegeName, firstName, and lastName
   * @returns {object} - Registered user object
   * @throws {Error} - If password and confirm password do not match, or if username or email already exists
   */
  registerUser: (userData) => {
    const { username, password, confirmPassword, email, collegeName, firstName, lastName } = userData;

    if (password !== confirmPassword) {
      throw new Error("Password and confirm password do not match");
    }

    const existingUser = users.find((user) => user.username === username || user.email === email);
    if (existingUser) {
      throw new Error("Username or email already exists");
    }

    const otp = generateOTP();

    const user = {
      username,
      password, // TODO: Implement password hashing for security
      email,
      collegeName,
      firstName,
      lastName,
      otp,
      verified: false,
    };

    users.push(user);
    writeDataToJsonFile();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Registration OTP",
      text: `Your OTP for registration is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

    console.log("User registered successfully:");
    console.log(user);
    return user;
  },
  
  /**
   * Verify user with OTP
   * @param {string} otp - One-Time Password
   * @returns {object} - Verified user object
   * @throws {Error} - If user is not found or if invalid OTP is provided
   */
  verifyUser: (otp) => {
    const user = users.find((user) => user.otp === otp);

    if (!user) {
      throw new Error("User not found");
    }

    if (otp !== user.otp) {
      throw new Error("Invalid OTP");
    }

    user.verified = true;
    writeDataToJsonFile();

    console.log("User verified successfully:");
    console.log(user);
    return user;
  },
  
  /**
   * Login user and generate JWT token
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {string} - JWT token
   * @throws {Error} - If user is not found, invalid password, or user is not verified
   */
  loginUser: (username, password) => {
    const user = users.find((user) => user.username === username);

    if (!user) {
      throw new Error("User not found");
    }

    if (password !== user.password) {
      throw new Error("Invalid password");
    }

    if (!user.verified) {
      throw new Error("User not verified");
    }

    const payload = {
      username: user.username,
      email: user.email,
      collegeName: user.collegeName,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    console.log("User logged in successfully:");
    console.log(user);
    return token;
  },
};

// Route handlers
app.post("/register", (req, res) => {
  try {
    const user = userService.registerUser(req.body);
    return res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.post("/verify", (req, res) => {
  try {
    const { otp } = req.body;
    const user = userService.verifyUser(otp);
    return res.status(200).json({ message: "User verified successfully", user });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;
    const token = userService.loginUser(username, password);
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// Start the server
app.listen(3004, () => {
  console.log("Server is running on port 3004");
});

// Read data from the JSON file on server startup
readDataFromJsonFile();
