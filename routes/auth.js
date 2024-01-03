// login happen here
const express = require("express");
const argon = require("argon2");
const config = require("config");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//login we use post
router.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    //1. VChecking for a registered email
    if (!user) {
      return res
        .status(400)
        .send("Invalid Credentails, Pls check email/password");
    }

    //2. Validate email with password
    const validPwd = await argon.verify(user.password, password);

    if (!validPwd) {
      return res.status(400).send("Invalid credentials");
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

    return res.send({
      access_token: token,
    });
  } catch (error) {
    return res.status(400).send(`error occurred: ${error}`);
  }
});

module.exports = router;
