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
  
    const newlyAddedSkillsbyUser = await User.schema.path("skillsAddedbyUser").caster.enumValues;
    const predefinedSkills = await User.schema.path("predefinedSkills").caster.enumValues;

    predefinedSkills = predefinedSkills.filter((skill) => !invalidSkills.includes(skill)); // deleting invalid skills from predefinedSkills list
    await User.updateOne({}, { $set: { predefinedSkills } }); // saving the changes in db

    // Now we have to delete these invalid skills from user's skill section if they exist.
    const usersWithInvalidSkills = await User.find({ skills: { $in: invalidSkills } });
    
    usersWithInvalidSkills.forEach(async (user) => {
      user.skills = user.skills.filter((skill) => !invalidSkills.includes(skill));
      await user.save();
    });

    // making skillsAddedbyUser as empty list
    skillsAddedbyUser = []
    await User.updateOne({}, { $set: { skillsAddedbyUser } });
    
  }catch{
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/newskills', async (req, res) => {
  try{
    const { newSkills } = req.body;
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
    
    const predefinedSkills = await User.schema.path("predefinedSkills").caster.enumValues;
    
    predefinedSkills = predefinedSkills.push.apply(predefinedSkills, newSkills) // Adding new skills to the predefinedSkills list by admin 
    await User.updateOne({}, { $set: { predefinedSkills } }); // saving the changes in db

  }catch{
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
