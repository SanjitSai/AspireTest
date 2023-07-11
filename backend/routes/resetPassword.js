const express = require("express");
const router = express.Router();
const userService = require("../userService");
const User = userService.User;

/**
 * PUT /reset-password
 * Reset the password of a user.
 *
 * @route   PUT /reset-password
 * @param   {string} username - The username of the user.
 * @param   {string} existingPassword - The existing password of the user.
 * @param   {string} newPassword - The new password to set for the user.
 * @returns {object} Response object with a success message and the updated user.
 * @throws  {Error}  If password reset fails or an error occurs.
 */

router.put('/', async (req, res, next) => {
    try {
      // Using function resetPassword from userService.js
      const { username, existingPassword, newPassword } = req.body;
      const user = await userService.resetPassword(username, existingPassword, newPassword);
      res.status(200).json({ message: 'Password reset successful', user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

module.exports = router;