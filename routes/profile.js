const express = require("express");
const router = express.Router();
const authProtect = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//get profile details

//post profile details
router.post("/profileupdate", authProtect, async (req, res, next) => {
  const {
    firstname,
    lastname,
    phonenumber,
    addressline,
    cityname,
    statename,
    countryname,
    zipcode,
  } = req.body;
  try {
    const theuser = await prisma.user.update({
      where: {
        id: parseInt(req.user.sub),
      },
      data: {
        firstName: firstname,
        lastName: lastname,
        mobile: phonenumber,
        shippingaddress: {
          create: {
            addressLineOne: addressline,
            city: cityname,
            state: statename,
            country: countryname,
            zipcode: zipcode,
          },
        },
      },
    });

    const address = await prisma.shippingAddress.findFirst({
      where: {
        userId: theuser.id,
      },
    });
    return res.json({
      theuser: {
        firstName: theuser.firstName,
        lastName: theuser.lastName,
        email: theuser.email,
        mobile: theuser.mobile,
        // "emailVerified": true,
        avatar: theuser.avatar,
        addressLineOne: address.addressLineOne,
        city: address.city,
        state: address.state,
        country: address.country,
        zipcode: address.zipcode,
      },
    });
  } catch (error) {
    next(error);
  }
});

//update profile details
router.post("/profileupdate/newupdate", authProtect, async (req, res, next) => {
  const {
    phonenumber,
    addressline,
    cityname,
    statename,
    countryname,
    zipcode,
  } = req.body;
  try {
    const theuser = await prisma.user.update({
      where: {
        id: parseInt(req.user.sub),
      },
      data: {
        mobile: phonenumber,
        // shippingaddress: {
        // where
        // create: {
        //   addressLineOne: addressline,
        //   city: cityname,
        //   state: statename,
        //   country: countryname,
        //   zipcode: zipcode,
        // },
        // },
      },
    });

    const address = await prisma.shippingAddress.findFirst({
      where: {
        userId: theuser.id,
      },
    });

    const updataddress = await prisma.shippingAddress.update({
      where: {
        userId: parseInt(req.user.sub),
        id: address.id,
      },
      data: {
        addressLineOne: addressline,
        city: cityname,
        state: statename,
        country: countryname,
        zipcode: zipcode,
      },
    });
    return res.json({
      theuser: {
        firstName: theuser.firstName,
        lastName: theuser.lastName,
        email: theuser.email,
        mobile: theuser.mobile,
        // "emailVerified": true,
        avatar: theuser.avatar,
        addressLineOne: updataddress.addressLineOne,
        city: updataddress.city,
        state: updataddress.state,
        country: updataddress.country,
        zipcode: updataddress.zipcode,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
