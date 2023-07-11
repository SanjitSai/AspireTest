const express = require("express");
const router = express.Router();
const userService = require("../userService");
const User = userService.User;

router.post('/', async (req, res) => {
    try {
      const user = await userService.forgotPassword(req.body.usernameOrEmail);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

module.exports = router ;