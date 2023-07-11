const express = require('express');
const router = express.Router();
const { User, userService } = require("../../userService");

/*** Add new education to the user's profile.
 * @route POST /education
 * @param {string} username - The username of the user.
 * @param {string} jwtToken - The JWT token for authentication.
 * @param {string} universityName - The name of the university.
 * @param {string} branch - The branch or course of study.
 * @param {string} startDate - The start date of education.
 * @param {string} [endDate] - The end date of education (optional).
 * @returns {Object} The response object with a success message and the added education.
 * @throws {Object} The error object with an error message.
 */

router.post('/', async (req, res) => {
  try {
    const { username, universityName, branch, startDate, endDate } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.jwtToken === "") {
      return res.status(404).json({ error: 'Invalid User' })
    }
    const array_length = user.education.length

    const education = {
      id: array_length,
      universityName,
      branch,
      startDate,
      endDate: endDate || 'Present',
    };

    user.education.push(education);
    await user.save();

    res.json({ message: 'Education added successfully', education });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/*** Update existing education in the user's profile.
 * @route PUT /education
 * @param {string} username - The username of the user.
 * @param {string} jwtToken - The JWT token for authentication.
 * @param {number} id - The ID of the education to be updated.
 * @param {string} universityName - The updated name of the university.
 * @param {string} branch - The updated branch or course of study.
 * @param {string} startDate - The updated start date of education.
 * @param {string} [endDate] - The updated end date of education (optional).
 * @returns {Object} The response object with a success message and the updated education.
 * @throws {Object} The error object with an error message.
 */

router.put('/', async (req, res) => {
  try {
    const { username, id, universityName, branch, startDate, endDate } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.jwtToken === "") {
      return res.status(404).json({ error: 'Invalid User' })
    }

    const education = user.education[id];

    if (!education) {
      return res.status(404).json({ error: 'Education not found' });
    }

    education.universityName = universityName;
    education.branch = branch;
    education.startDate = startDate;
    education.endDate = endDate || 'Present';

    await user.save();

    res.json({ message: 'Education updated successfully', education });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;