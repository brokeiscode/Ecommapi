const express = require("express");
const router = express.Router();
const userSchema = require("../joischema/userSchema");
const userPwdSchema = require("../joischema/userSchema");
const argon = require("argon2");
const authProtect = require("../middleware/auth");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//Setting up Multer - Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/avatar"); //Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    //use a unique filename for the uploaded file
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

//Default avatar for all ursers
//Setting up Multer - Multer storage configuration
const storagefordefault = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/defaultavatar"); //Destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    //use a unique filename for the uploaded file
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const uploadfordefault = multer({ storage: storagefordefault });

//post an avatar
router.post(
  "/uploadavatar",
  [authProtect],
  upload.single("avatar"),
  async (req, res, next) => {
    try {
      const { filename } = req.file;
      // update user avatar
      // console.log("the upload", req.file);
      const auser = await prisma.user.update({
        where: {
          email: req.body.email,
        },
        data: {
          avatar: `static/avatar/${filename}`,
        },
      });
      return res.send({ msg: "Profile picture uploaded sucessfully" });
    } catch (error) {
      next(error);
    }
  }
);

//upload default avatar for all users
router.post(
  "/uploadavatar/default",
  [authProtect],
  uploadfordefault.single("defaultavatar"),
  async (req, res, next) => {
    try {
      const { destination, filename } = req.file;
      // update user avatar
      console.log("default upload", req.file);
    } catch (error) {
      next(error);
    }
  }
);

//POST a user
router.post("/", async (req, res, next) => {
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

      return res.json({
        msg: "New User registered, Please Log In",
      });
    } catch (error) {
      next(error);
    }
  }
});

module.exports = router;
