const express = require('express');
const router = express.Router();
const { User, userService } = require("../../userService");

/*** Add a skill to the user's skills array.
 * @route PUT /skills
 * @group Skills - Operations related to user skills
 * @param {string} username.body.required - The username of the user
 * @param {string} skill.body.required - The skill to be added
 * @returns {object} 200 - Success response with the updated skills array
 * @returns {object} 400 - Error response if the skill already exists
 * @returns {object} 404 - Error response if the user not found
 * @returns {object} 500 - Error response for server error
 */

router.put('/', async (req, res) => {
  try {
    const { username, skill } = req.body; // taking request from the user

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.jwtToken === "") {
      return res.status(404).json({ error: 'Invalid User' })
    }

    const trimmedSkill = skill.trim();
    const existingSkill = user.skills.find((s) => typeof s === 'string' && s.toLowerCase().trim() === trimmedSkill.toLowerCase());


    if (existingSkill) {
      return res.status(400).json({ error: 'Skill already exists' });
    }



    // Add the new skill to the skill's list
    user.skills.push(skill);
    // Save the new skill to the database
    await user.save();

    res.json({ message: 'Skill added successfully', skills: user.skills });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/*** Delete a skill from the user's skills array.
 * @route DELETE /skills
 * @group Skills - Operations related to user skills
 * @param {string} username.body.required - The username of the user
 * @param {string} skill.body.required - The skill to be deleted
 * @returns {object} 200 - Success response with the updated skills array
 * @returns {object} 404 - Error response if the user or skill not found
 * @returns {object} 500 - Error response for server error
 */

router.delete('/', async (req, res) => {
  try {
    const { username, skill } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.jwtToken === "") {
      return res.status(404).json({ error: 'Invalid User' })
    }

    const skillIndex = user.skills.indexOf(skill);

    if (skillIndex === -1) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    user.skills.splice(skillIndex, 1);
    await user.save();

    res.json({ message: 'Skill deleted successfully', skills: user.skills });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;