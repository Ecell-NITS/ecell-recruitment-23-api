const express = require("express");
const router = express.Router();
const userController = require("../Controllers/UserController");

router.get("/", userController.home);
router.post("/sendcred", userController.sendCred);
router.post("/check-email", userController.checkEmail);
router.post("/check-scholarid", userController.checkScholarId);
router.post("/createUser", userController.createUser);
router.post("/createUser", userController.verifyOtp);
router.post("/verify-otp", userController.sendOtp);
module.exports = router;
