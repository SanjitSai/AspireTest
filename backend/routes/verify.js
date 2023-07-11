const express = require("express");
const router = express.Router();
const { User, userService } = require("../userService");

/**
 * POST /verify
 * Verify a user with the provided OTP.
 *
 * @route   POST /verify
 * @param   {string} otp - The OTP (One-Time Password) to verify the user.
 * @returns {object} Response object with a success message and the verified user.
 * @throws  {Error}  If user verification fails or an error occurs.
 */

router.post("/", async (req, res, next) => {
    try {
      // Using verifyUser from userService,js
      const { otp } = req.body;
      const user = await userService.verifyUser(otp);
      return res.status(200).json({ message: "User verified successfully", user });
    } catch (error) {
      return next(error);
    }
  });

module.exports = router;