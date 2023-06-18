const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobileno: {
    type: Number,
    required: true,
  },
 
  whyecell: {
    type: String,
    required: true,
  },
  // project: {
  //   type: String,
  //   required: true,
  // },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  branch: {
    type: String,
    // enum: ["CSE", "Civil", "ME", "ECE", "EE", "EI"],
    enum: ["Civil", "CSE", "EE", "ECE", "EI", "ME"],
    required: true,
  },
  team:{
    type:[String],
    required:true,
    enum:["Content", "Collaboration & Outreach", "Curation","Design","Event Management","Marketing","Publicity"],
  },
  scholarId: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (value) {
        return /^221\d{4}$/.test(value);
      },
      message:
        'Scholar ID must begin with "221" and have 7 numeric characters.',
    },
  },
  // ip: String, // New field for IP address
  timestamp: Date,
  // poster: String,
});

const UserModelAllTeam = mongoose.model("allteamrecruit", UserSchema);
module.exports = UserModelAllTeam;
