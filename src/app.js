const express = require("express");
const app = express();
const userRoutes = require("./Routes/UserRoutes");
const connectToDB = require("./db/DbConnection")
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

connectToDB();

app.use("/", userRoutes);
module.exports = app;