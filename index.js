const express = require("express");
const app = express();
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require("mongoose");
const UserModel = require("./models/Users");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
app.use(bodyParser.json());
const cors = require("cors");
require("dotenv").config();
const crypto = require('crypto');
app.use(express.json());
app.use(cors({
  origin: 'https://ecellnits.org',
  // origin: 'http://localhost:3000',
  credentials: true
}));

const store = new MongoDBStore({
  uri: process.env.MONGODBSECRET, 
  collection: 'sessions',
});

store.on('error', (error) => {
  console.log('MongoDB session store error:', error);
});
app.use(
  session({
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);

mongoose.connect(process.env.MONGODBSECRET);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PWD,
  },
});

let storedOTP = "";
const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL,
    to: to,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

app.get("/getUsers", (req, res) => {
  UserModel.find({}, (err, result) => {
    if (err) {
      res.json(err);
    } else {
      res.json(result);
    }
  });
});

app.post("/check-email", (req, res) => {
  const email = req.body.email;
  UserModel.findOne({ email }, (err, user) => {
    if (err) {
      console.log("Error checking email uniqueness:", err);
      res
        .status(500)
        .json({ error: "An error occurred while checking email uniqueness" });
    } else {
      const unique = !user;
      res.json({ unique });
    }
  });
});

app.post("/check-scholarid", (req, res) => {
  const scholarId = req.body.scholarId;
  UserModel.findOne({ scholarId }, (err, user) => {
    if (err) {
      console.log("Error checking scholarId uniqueness:", err);
      res.status(500).json({
        error: "An error occurred while checking scholarId uniqueness",
      });
    } else {
      const unique = !user;
      res.json({ unique });
    }
  });
});

app.post("/createUser", async (req, res) => {
  const user = req.body;
  const newUser = new UserModel(user); 
  await newUser.save();
  
  //sending confirmation email to the user's entered email and their entered email
  const email = user.email;
  const subject = "Successful Submission of the ECELL recruitment form.";
  const text = `Thanks for filling out ECELL NITS recruitment form.\n\nHere's what was received.\n\nName: ${user.name}\nScholar ID: ${user.scholarId}\nBranch: ${user.branch}\nWhatsapp number:${user.mobileno}\nEmail: ${user.email}\nWhich domain in technical team of ECELL you want to apply for? : ${user.techteam}\nWhy do you want to join ecell?: ${user.whyecell}\nResume link:${user.resume}\n\n Please join this https://chat.whatsapp.com/FqKAj8b6cUj0tfyLArxdH6 whatsapp group as soon as possible for more information regarding further procedure for recruitment.`;
  sendEmail(email, subject, text);
  res.json(user);
});

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    sendEmail(email, "ECELL OTP Verification", `Your OTP for verifying your email id for filling Ecell recuitment form is: ${otp}`);

    req.session.otp = otp.toString();

    res.json({ success: true, otp });
  } catch (error) {
    console.log("Error sending OTP:", error);
    res.status(500).json({ error: "An error occurred while sending the OTP" });
  }
});

app.post("/verify-otp", (req, res) => {
  console.log("Request Body:", req.body);
  const enteredOTP = req.body.otp.toString().trim();
  const storedOTPString = req.session.otp;

  console.log("Entered OTP:", enteredOTP);
  console.log("Stored OTP:", storedOTPString);

  if (req.session.otp) {
    if (enteredOTP === storedOTPString) {
      delete req.session.otp;
      res.status(200).json({ message: "OTP verified successfully" });
    } else {
      res.status(400).json({ message: "Wrong OTP. Please try again" });
    }
  } else {
    res.status(400).json({ message: "No OTP found. Please generate a new OTP" });
  }
});

app.get("/", (req, res) => {
  res.send("<p>Welcome to ecell Recruitment api.</p>");
});

const port = process.env.PORT || 8000;
app.listen(port, "0.0.0.0", () => {
  console.log("server started.");
});