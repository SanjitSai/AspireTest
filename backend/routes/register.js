const express = require("express");
const router = express.Router();
const { User, userService } = require("../userService");


/**
 * POST /register
 * Register a new user.
 *
 * @route   POST /register
 * @param   {string} username - The username of the user.
 * @param   {string} password - The password of the user.
 * @param   {string} confirmPassword - The confirmation password to validate the password.
 * @param   {string} email - The email address of the user.
 * @param   {string} collegeName - The name of the college associated with the user.
 * @param   {string} firstName - The first name of the user.
 * @param   {string} lastName - The last name of the user.
 * @returns {object} Response object with a success message and the registered user.
 * @throws  {Error}  If registration fails or an error occurs.
 */

router.post("/", async (req, res, next) => {
  try {
    // Using function registerUser from userService.js
    const user = await userService.registerUser(req.body);
    return res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;