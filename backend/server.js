require('dotenv').config();

/**
 * Required dependencies
 */
const express = require("express");
const cors = require("cors");
const connectToDatabase = require('./db');
const routes = require("./routes");

/**
 * Create an instance of Express app
 */
const app = express();

/**
 * Middleware
 */
app.use(cors());
app.use(express.json());

app.use(routes);

const port = process.env.PORT || 3004;
// Start the server
connectToDatabase().then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  });
  