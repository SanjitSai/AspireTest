const express = require("express");
const router = express.Router();
const userService = require("../userService");
const User = userService.User;

/**
 * POST /verify-otp
 * Verify OTP (One-Time Password) for password reset.
 *
 * @route   POST /verify-otp
 * @param   {string} usernameOrEmail - The username or email of the user.
 * @param   {string} otp - The OTP (One-Time Password) to verify.
 * @returns {object} Response object with a success message if OTP verification is successful.
 * @throws  {Error}  If OTP verification fails or an error occurs.
 */

router.post('/', async (req, res) => {
    const { usernameOrEmail, otp } = req.body;
  
    try {
      // Find the user by username or email
      const user = await User.findOne({
        $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      });
  
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }
  
      // Check if the OTP matches the user's OTP
      if (otp === user.otp) {
        // Update the isVerified_forgot property to true
        user.isVerified_forgot = true;
        await user.save();
  
        // Return a success response
        return res.json({ message: 'OTP verification successful' });
      }
  
      return res.status(400).json({ error: 'Invalid OTP' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  module.exports = router;