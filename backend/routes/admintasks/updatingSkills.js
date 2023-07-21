const express = require('express');
const router = express.Router();
const { User, userService } = require("../../userService");

/* Get the predefined skills list.
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

/*** Update predefined skills list and remove invalid skills from users' skills.
 * @route PUT /skills
 * @group Skills - Operations related to user skills
 * @param {string} username.body.required - The username of the admin making changes
 * @param {Array<string>} invalidskills.body.required - The list of invalid skills reported by the admin
 * @returns {object} 200 - Success response with the updated predefined skills list
 * @returns {object} 404 - Error response if the user is not found or invalid
 * @returns {object} 500 - Error response for server error
 */
router.put('/', async (req, res) =>{
  try{
    const { username, invalidskills } = req.body;
    // Retrieve new added skills fom userSchema

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.jwtToken === "") {
      return res.status(404).json({ error: 'Invalid User' })
    }

    if(user.role !== 'admin'){
       return res.status(404).json({ error: 'Only admin can make cahnges'})
    }

    // Get the current predefined skills and skills added by user lists from the database
    const newlyAddedSkillsbyUser = await User.schema.path("skillsAddedbyUser").caster.enumValues;
    const predefinedSkills = await User.schema.path("predefinedSkills").caster.enumValues;

    // Filter out invalid skills from the predefinedSkills list
    const updatedPredefinedSkills = predefinedSkills.filter((skill) => !invalidSkills.includes(skill));
    
    await User.updateOne({}, { $set: { predefinedSkills: updatedPredefinedSkills } }); // Update the predefinedSkills field in the database

    // Now we have to delete these invalid skills from user's skill section if they exist.
    const usersWithInvalidSkills = await User.find({ skills: { $in: invalidSkills } });
    
    usersWithInvalidSkills.forEach(async (user) => {
      user.skills = user.skills.filter((skill) => !invalidSkills.includes(skill));
      await user.save();
    });

    // Empty the skillsAddedbyUser list in the database
    await User.updateOne({}, { $set: { skillsAddedbyUser: [] } });
    return res.json({ message: 'Skill updated successfully', updatedPredefinedSkills });
    
  }catch (error) {
    console.error('Error while updating predefined skills:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/*** Add new skills to the predefined skills list by the admin.
 * @route PUT /skills/newskills
 * @group Skills - Operations related to user skills
 * @param {string} username.body.required - The username of the admin making changes
 * @param {Array<string>} newSkills.body.required - The list of new skills to be added
 * @returns {object} 200 - Success response with the updated predefined skills list
 * @returns {object} 404 - Error response if the user is not found or invalid
 * @returns {object} 500 - Error response for server error
 */
router.put('/newskills', async (req, res) => {
  try{
    const { username, newSkills } = req.body;
    // Retrieve new added skills fom userSchema

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.jwtToken === "") {
      return res.status(404).json({ error: 'Invalid User' })
    }

    if(user.role !== 'admin'){
       return res.status(404).json({ error: 'Only admin can make changes'})
    }

    // Get the current predefined skills list from the database
    const predefinedSkills = await User.schema.path("predefinedSkills").caster.enumValues;

    // Check for common skills and add only new skills that don't already exist in predefinedSkills
    const uniqueNewSkills = newSkills.filter((skill) => !predefinedSkills.includes(skill));
    if (uniqueNewSkills.length === 0) {
      return res.status(400).json({ error: 'All skills already exist in predefinedSkills' });
    }

    // Add new skills to the predefinedSkills list
    predefinedSkills.push.apply(predefinedSkills, uniqueNewSkills)
    
    await User.updateOne({}, { $set: { predefinedSkills } }); // saving the changes in db

    return res.json({ message: 'Skill added successfully', predefinedSkills });
    
  }catch (error) {
    console.error('Error while adding new skills to predefined skills:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
