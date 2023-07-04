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
app.use(cors()); // Enable CORS
app.use(express.json()) // Parse JSON request bodies

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
    // For simplicity, we'll generate a random 25-character string
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
      user: "sanjitkolla519@gmail.com",
      pass: "Aspire@1234",
    },
  });

  /** * Endpoint: /register
 * Method: POST
 * Description: Register a new user
 * Request Body:
 *   - username: string
 *   - password: string
 *   - confirmPassword: string
 *   - email: string
 *   - collegeName: string
 *   - firstName: string
 *   - lastName: string
 */
app.post("/register", (req, res) => {
    const {
      username,
      password,
      confirmPassword,
      email,
      collegeName,
      firstName,
      lastName,
    } = req.body;
  
    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and confirm password do not match" });
    }
  
    // Check if username or email already exists
    const existingUser = users.find(
      (user) => user.username === username || user.email === email
    );
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Username or email already exists" });
    }
  
    // Generate OTP
    const otp = generateOTP();
  
    // Create user with the provided details
    const user = {
      username,
      password, // after testing encode the password for safety
      email,
      collegeName,
      firstName,
      lastName,
      otp,
      verified: false,
    };
  
    // Save the user to the in-memory store
    users.push(user);
  
    // Write data to the JSON file
    writeDataToJsonFile();
  
    // Send email with OTP to the provided email address
    const mailOptions = {
      from: "sanjitkolla519@gmail.com",
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
    return res.status(201).json({ message: "User registered successfully" });
  });

  /*** Endpoint: /verify
 * Method: POST
 * Description: Verify the user with OTP
 * Request Body:
 *   - otp: string
 */
// app.get("/", (req,res) => {
//     res.send(`Server running`)
// })
app.post("/verify", (req, res) => {
    const { otp } = req.body;
  
    // Find the user with the provided email address
    const users = JSON.parse(fs.readFileSync(dbFilePath, "utf8"));

    const user = users.find(user => user.otp === otp);
  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    // Check if the provided OTP matches the user's OTP
    if (otp !== user.otp) {
      return res.status(401).json({ message: "Invalid OTP" });
    }
  
    // Set the user as verified
    //if(user && otp){
    user.verified = true;
   // }
  
    // Write data to the JSON file
    //fs.writeFileSync('./users.json', JSON.stringify(users));
    writeDataToJsonFile();
  
    console.log("User verified successfully:");
    console.log(user);
    return res.status(200).json({ message: "User verified successfully" });
  });
  
  /** Endpoint: /login
   * Method: POST
   * Description: Authenticate a user and generate JWT token
   * Request Body:
   *   - username: string
   *   - password: string
   */
  app.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    // Find the user with the provided username
    const users = JSON.parse(fs.readFileSync('./users.json'));
    const user = users.find((user) => user.username === username);
  
    // Check if user exist in user.json
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
  
    // Check if the password matches
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid password" });
    }
  
    // Check if the user is verified
    if (!user.verified) {
      return res.status(401).json({ message: "User not verified" });
    }
  
    // Create a payload for the JWT token
    const payload = {
      username: user.username,
      email: user.email,
      collegeName: user.collegeName,
    };
  
    // Generate JWT token
    const token = jwt.sign(payload, "your-secret-key");
  
    console.log("User logged in successfully:");
    console.log(user);
    return res.status(200).json({ token });
  });
  
/**
 * Start the server
 */
  app.listen(3004, () => {
    console.log("Server is running on port 3004");
  });
  
  /**
 * Read data from the JSON file on server startup
 */
  readDataFromJsonFile();