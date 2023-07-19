require('dotenv').config();

/**
 * Required dependencies
 */
const express = require("express");
const cors = require("cors");
const connectToDatabase = require('./db');
const routes = require("./routes");
const registerRoute = require('./routes/register.js');
const loginRoute = require('./routes/login.js');
const verifyRoute = require('./routes/verify.js');
const verifyforgotRoute = require('./routes/verifyForgotPassword.js')
const forgotPasswordRoute = require('./routes/forgotPassword.js');
const resetPasswordRoute = require('./routes/resetPassword.js')
const workExperience = require('./routes/userProfile/workExperience')
const education = require('./routes/userProfile/education');
const skill = require('./routes/userProfile/skills');
/**
 * Create an instance of Express app
 */
const app = express();

/**
 * Middleware
 */
app.use(cors());
app.use(express.json());
app.post('/register', registerRoute);
app.post('/login', loginRoute);
app.post('/verify', verifyRoute);
app.post('/forgotpassword', forgotPasswordRoute);
app.post('/verifyForgotPassword', verifyforgotRoute);
app.put('/resetpassword', resetPasswordRoute);
app.post('/addwork', workExperience);
app.put("/updatework", workExperience)
app.post("/addeducation", education);
app.put("/updateeducation", education);
app.put("/addskill", skill);
app.delete("/deleteskill", skill)
app.use(routes);

const port = process.env.PORT || 3004;
// Start the server
connectToDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
