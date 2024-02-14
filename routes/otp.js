const express = require("express");
const router = express.Router();
const mailer = require("../utils/sendEmail");
const welcomeMailer = require("../utils/sendWelcomeEmail");
const authProtect = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");

//Generate OTP
router.post("/generate-otp", authProtect, async (req, res, next) => {
  function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  try {
    const otp = generateOTP();
    const auser = await prisma.user.update({
      where: {
        id: req.user.sub,
      },
      data: {
        currentOTP: otp,
      },
    });
    //Send email
    mailer(auser.email, otp);
    return res.json({
      msg: "OTP generated and sent successfully",
      // otp: auser.currentOTP,
    });
  } catch (error) {
    next(error);
  }
});

//Verify OTP
router.post("/verify-otp", authProtect, async (req, res, next) => {
  const { collectedotp } = req.body;
  try {
    const auser = await prisma.user.findUnique({
      where: {
        id: parseInt(req.user.sub),
      },
    });
    //check if otp was generated and sent
    if (auser.currentOTP === null) {
      return res
        .status(404)
        .json({ msg: "Invalid OTP. Click link to generate OTP" });
    }
    //verify OTP
    if (collectedotp === auser.currentOTP) {
      const verifieduser = await prisma.user.update({
        where: {
          id: auser.id,
        },
        data: {
          emailVerified: true,
        },
      });
      //Send email
      welcomeMailer(verifieduser.email);
      return res.json({
        msg: "Email Verified via OTP",
        emailVerify: verifieduser.emailVerified,
      });
    } else {
      return res.status(401).json({ msg: "Invalid OTP, try again" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
