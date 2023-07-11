const express = require("express");
const router = express.Router();

const { User, userService } = require("../userService");

/**
 * POST /login
 * Login a user and generate a JWT token.
 *
 * @route   POST /login
 * @param   {string} username - The username of the user.
 * @param   {string} password - The password of the user.
 * @returns {object} Response object with a JWT token.
 * @throws  {Error}  If login fails or an error occurs.
 */

router.post("/", async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const token = await userService.loginUser(username, password);
      const user = await User.findOne({ username });

      user.jwtToken = token; // adding token to the database
      return res.status(200).json({ token });
    } catch (error) {
      return next(error);
    }
  });

module.exports = router;