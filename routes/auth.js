// login happen here
const express = require("express");
const argon = require("argon2");
const config = require("config");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authProtect = require("../middleware/auth");

//Verify token is still valid
router.get("/validate-token", [authProtect], async (req, res, next) => {
  try {
    // console.log(req.user);
    const auser = await prisma.user.findUnique({
      where: {
        id: parseInt(req.user.sub),
      },
    });
    if (!auser) {
      return res.status(500).json({
        msg: "email verification status not available",
      });
    }
    const shipping = await prisma.shippingAddress.findFirst({
      where: {
        userId: parseInt(req.user.sub),
      },
    });
    res.json({
      msg: "Valid token",
      emailVerify: auser.emailVerified,
      theuser: {
        firstName: auser.firstName,
        lastName: auser.lastName,
        email: auser.email,
        mobile: auser.mobile,
        avatar: auser.avatar,
        addressLineOne: shipping.addressLineOne,
        city: shipping.city,
        state: shipping.state,
        country: shipping.country,
        zipcode: shipping.zipcode,
      },
    });
  } catch (error) {
    next(error);
  }
});

//login we use post
router.post("/", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    //1. VChecking for a registered email
    if (!user) {
      return res.status(400).json({
        msg: "Invalid Credentials, Pls check email/password",
      });
    }

    //2. Validate email with password
    const validPwd = await argon.verify(user.password, password);

    if (!validPwd) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    //3. Generate JWT Token and Send the client
    const payload = {
      sub: user.id,
      firstName: user.firstName,
      email: user.email,
      isAdmin: user.isAdmin,
    };
    const jwtOption = { expiresIn: 3600 };
    const token = await jwt.sign(payload, config.get("jwtSecret"), jwtOption);

    return res.json({
      access_token: token,
      emailLogged: user.email,
      emailVerify: user.emailVerified,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
