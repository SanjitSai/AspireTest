const express = require("express");
const router = express.Router();
const { User, userService } = require("../../userService");


/*** Create a new work experience for a user.
 * @route POST /work-experience
 * @param {string} username - The username of the user.
 * @param {string} jwtToken - The JWT token for authentication.
 * @param {string} companyName - The name of the company.
 * @param {string} startDate - The start date of the work experience.
 * @param {string} [endDate] - The end date of the work experience. Defaults to 'Present'.
 * @param {string} position - The position held in the company.
 * @param {string} description - The description of the work experience.
 * @returns {object} The created work experience.
 */

router.post('/', async (req, res) => {
  try {
    const { username, companyName, startDate, endDate, position, description } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    if (user.role !== "user") {
      throw new Error("Only users can add Work Experience")
    }

    if (user.jwtToken === "") {
      return res.status(404).json({ error: 'User not Logged In' })
    }

    const array_length = user.workExperiences.length // giving the index of the element as its id

    // Create a new workexperience document with the extracted data
    const workExperience = {
      id: array_length,
      companyName,
      startDate,
      endDate: endDate || 'Present', // if endDate not given then Present is the default value given
      position,
      description
    };


    user.workExperiences.push(workExperience); // adding new work experience to work experiences list
    await user.save();

    res.json({ message: 'Work experience created successfully', workExperience });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/*** Update an existing work experience for a user.
* @route PUT /work-experience
* @param {string} username - The username of the user.
* @param {string} jwtToken - The JWT token for authentication.
* @param {number} id - The ID of the work experience to update.
* @param {string} companyName - The name of the company.
* @param {string} startDate - The start date of the work experience.
* @param {string} [endDate] - The end date of the work experience. Defaults to 'Present'.
* @param {string} position - The position held in the company.
* @param {string} description - The description of the work experience.
* @returns {object} The updated work experience.
*/

router.put('/', async (req, res) => {
  try {
    const { username, id, companyName, startDate, endDate, position, description } = req.body;


    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== "user") {
      throw new Error("Only users can add or update Work Experience")
    }

    if (user.jwtToken === "") {
      return res.status(404).json({ error: 'Invalid User' })
    }

    const workExperience = user.workExperiences[id]
    if (!workExperience) {
      return res.status(404).json({ error: 'Work experience not found' });
    }

    workExperience.companyName = companyName;
    workExperience.startDate = startDate;
    workExperience.endDate = endDate || 'Present';
    workExperience.position = position;
    workExperience.description = description;

    await user.save();

    res.json({ message: 'Work experience updated successfully', workExperience });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
