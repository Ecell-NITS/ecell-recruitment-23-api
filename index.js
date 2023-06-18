const express = require("express");
const app = express();
const mongoose = require("mongoose");
const UserModelAllTeam = require("./models/Users");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
app.use(bodyParser.json());
const cors = require("cors");
require("dotenv").config();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODBSECRET);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PWD,
  },
});

const otpStore = {};
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

app.post("/sendcred", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === process.env.USERNAME_TECHRESULT && password === process.env.PWD_TECHRESULT) {
    UserModelAllTeam.find({}, (err, result) => {
      if (err) {
        res.json(err);
      } else {
        res.json(result);
      }
    });
  } else {
    res.status(401).json({ message: 'Unauthorized user' });
  }
});


app.post("/check-email", (req, res) => {
  const email = req.body.email;
  UserModelAllTeam.findOne({ email }, (err, user) => {
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
  UserModelAllTeam.findOne({ scholarId }, (err, user) => {
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
  const newUser = new UserModelAllTeam(user); 
  await newUser.save();
  
  //sending confirmation email to the user's entered email and their entered email
  const email = user.email;
  const subject = "Successful Submission of the ECELL recruitment form.";
  const text = `Thanks for filling out ECELL NITS recruitment form.\n\nHere's what was received.\n\nName: ${user.name}\nScholar ID: ${user.scholarId}\nBranch: ${user.branch}\nWhatsapp number:${user.mobileno}\nEmail: ${user.email}\nWhich team you want to apply for? (multiple team selection allowed): ${user.team}\nWhy do you want to join ecell?: ${user.whyecell}\n\n Please join this https://chat.whatsapp.com/ whatsapp group as soon as possible for more information regarding further procedure for recruitment.`;
  sendEmail(email, subject, text);
  res.json(user);
});

const Schema = mongoose.Schema;
const otpSchema = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
});

const OTPModel = mongoose.model("OTPotherteamrecruit", otpSchema);

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    sendEmail(email, "ECELL OTP Verification", `Your OTP for verifying your email id for filling Ecell recruitment form is: ${otp}`);

    await OTPModel.findOneAndUpdate({ email }, { otp }, { upsert: true });

    res.json({ success: true, otp: otp.toString() });
  } catch (error) {
    console.log("Error sending OTP:", error);
    res.status(500).json({ error: "An error occurred while sending the OTP" });
  }
});

app.post("/verify-otp", async (req, res) => {
  console.log("Request Body:", req.body);
  const enteredOTP = req.body.otp.toString().trim();
  const email = req.body.email;

  try {
   
    const otpData = await OTPModel.findOne({ email }).exec();

    console.log("Entered OTP:", enteredOTP);
    console.log("Stored OTP Data:", otpData.otp);
// console.log(req.body.email)
    if (otpData) {
      const storedOTP = otpData.otp.toString().trim();
      if (enteredOTP === storedOTP) {
        res.status(200).json({ message: "OTP verified successfully" });
      } else {
        res.status(400).json({ message: "Wrong OTP. Please try again" });
      }
    } else {
      console.log("No OTP found for the provided email");
      res.status(400).json({ message: "No OTP found for the provided email" });
    }
  } catch (error) {
    // console.log("Error verifying OTP:", error);
    console.log(error)
    res.status(500).json({ error: "An error occurred while verifying the OTP" });
  }
});

app.get("/", (req, res) => {
  res.send("<p>Welcome to ecell Recruitment api.</p>");
});

const port = process.env.PORT || 8000;
app.listen(port, "0.0.0.0", () => {
  console.log(`server started at ${port}`);
});
