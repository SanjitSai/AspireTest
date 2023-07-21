const express = require('express');
const router = express.Router();
const { User, userService } = require("../../userService");

/*** Get the predefined skills list.
 * @route GET /skills
 * @group Skills - Operations related to user skills
 * @returns {object} 200 - Success response with the predefined skills list
 * @returns {object} 500 - Error response for server error
 */
router.get('/', async (req, res) => {
  try {
    const predefinedSkills = await userService.getPredefinedSkills(); // Getting predefinedSkills list from UserSchema using getPredefinedSkills function in userService.js
    
    res.json({ predefinedSkills }); // displaying predefined skills 
  } catch (error) {
    console.error('Error fetching predefined skills:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

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

    const predefinedSkills = await userService.getPredefinedSkills(); // Getting predefinedSkills list from UserSchema using getPredefinedSkills function in userService.js
    const trimmedSkill = skill.trim();
    const existingSkill = user.skills.find((s) => typeof s === 'string' && s.toLowerCase().trim() === trimmedSkill.toLowerCase());


    if (existingSkill) {
      return res.status(400).json({ error: 'Skill already exists' });
    }


    if (predefinedSkills.includes(trimmedSkill)) {
      // Add the predefined skill to the user's skills list
      user.skills.push(trimmedSkill);
      
      // Save the new skill to the database
      await user.save();

      return res.json({ message: 'Skill added successfully', skills: user.skills });
    } else {
      // Skill is not predefined, give the user an option to add the new skill
      return res.json({ message: 'Skill is not predefined, add to the list', predefinedSkills });
    }
  } catch (error) {
    console.error('Error while adding new skill to the users skill section:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


/*** Add a skill to the predefinedSkills list if it does not already exist.
 * If the skill already exists, respond with an error message.
 *
 * @route PUT /skills
 * @group Skills - Operations related to user skills
 * @param {string} username.body.required - The username of the user
 * @param {string} skill.body.required - The skill to be added
 * @returns {object} 200 - Success response if the skill is added to the predefinedSkills list
 * @returns {object} 400 - Error response if the skill already exists in the predefinedSkills list
 * @returns {object} 404 - Error response if the user not found or invalid user
 * @returns {object} 500 - Error response for server error
 */
router.put('/useraddedskill', async (req, res) => {
  try {
    const { username, skill } = req.body; // taking request from the user

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.jwtToken === "") {
      return res.status(404).json({ error: 'Invalid User' })
    }

    const predefinedSkills = await userService.getPredefinedSkills(); // Getting predefinedSkills list from UserSchema using getPredefinedSkills function in userService.js
    const trimmedSkill = skill.trim();
    const trimmedSkillLowerCase = trimmedSkill.toLowerCase();
    const predefinedSkillsLowerCase = predefinedSkills.map(skill => skill.toLowerCase());


    if (predefinedSkillsLowerCase.includes(trimmedSkillLowerCase)) {
      
      return res.json({ message: 'Skill already exists.'});
    } else {
      // Add new skill to the predefinedSkills list and save it in userSchema
      predefinedSkills.push(trimmedSkill);
      
      // Save the updated schema to the database
      await User.updateOne({}, { $set: { predefinedSkills: predefinedSkills } });
      
      return res.json({ message: 'Skill is added to predefined'});
    }
  } catch (error) {
    console.error('Error while adding new skill to the predefinedSkills:', error);
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
    console.error('Error while deleting skill from the users skill section:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
