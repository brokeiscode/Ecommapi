const express = require("express");
const router = express.Router();
const userSchema = require("../joischema/userSchema");
const userPwdSchema = require("../joischema/userSchema");
const argon = require("argon2");
const { PrismaClient } = require("@prisma/client");
const {
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} = require("@prisma/client/runtime/library");
const prisma = new PrismaClient();

//POST a user
router.post("/", async (req, res) => {
  const valResult = userSchema.userVal.validate(req.body, {
    abortEarly: false,
  });

  if (valResult.error) {
    return res.send(valResult.error.details);
  } else {
    const pwdResult = userPwdSchema.pwdVal.validate(req.body.password);
    if (pwdResult.error) {
      return res.send(pwdResult.error.details);
    }
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (user)
        return res
          .status(400)
          .send("The email is already registered, please login if this is you");

      const pwdHash = await argon.hash(password);

      const addUser = await prisma.user.create({
        data: { email, password: pwdHash },
      });
      //creat cart for user upon sign up
      await prisma.cart.create({
        data: { userId: addUser.id },
      });
      //create checkout for user upon sign up
      await prisma.checkout.create({
        data: { userId: addUser.id },
      });
      return res.json(addUser);
    } catch (error) {
      if (error instanceof PrismaClientUnknownRequestError) {
        res.status(400).send(error.message);
      } else if (error instanceof PrismaClientValidationError) {
        res.status(400).send(error.message);
      } else {
        res.status(400).send(error);
      }
    }
  }
});

module.exports = router;
