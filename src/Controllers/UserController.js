const { UserModelAllTeam } = require("../Models/Users");
const emailService = require("../utils/email/EmailService");
require("dotenv").config();

const home = (req, res) => {
  res.send(
    "<p>Welcome to E-Cell recruitment api 2023-24. Developed by E-Cell Tech Team.</p>"
  );
};

const sendCred = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (
    username === process.env.USERNAME_TECHRESULT &&
    password === process.env.PWD_TECHRESULT
  ) {
    UserModelAllTeam.find({}, (err, result) => {
      if (err) {
        res.json(err);
      } else {
        res.json(result);
      }
    });
  } else {
    res.status(401).json({ message: "Unauthorized user" });
  }
};

module.exports = {
  home,sendCred
};
