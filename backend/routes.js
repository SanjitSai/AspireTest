/**
 * Required dependencies
 */
const express = require("express");
const router = express.Router();
const userService = require("./userService");

/**
 * Route: /register
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
router.post("/register", async (req, res, next) => {
  try {
    const user = await userService.registerUser(req.body);
    return res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    return next(error);
  }
});

/**
 * Route: /verify
 * Method: POST
 * Description: Verify the user with OTP
 * Request Body:
 *   - otp: string
 */
router.post("/verify", async (req, res, next) => {
  try {
    const { otp } = req.body;
    const user = await userService.verifyUser(otp);
    return res.status(200).json({ message: "User verified successfully", user });
  } catch (error) {
    return next(error);
  }
});

/**
 * Route: /login
 * Method: POST
 * Description: Authenticate a user and generate JWT token
 * Request Body:
 *   - username: string
 *   - password: string
 */
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const token = await userService.loginUser(username, password);
    return res.status(200).json({ token });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
