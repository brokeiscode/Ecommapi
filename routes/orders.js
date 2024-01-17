const express = require("express");
const router = express.Router();
const authProtect = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
} = require("@prisma/client/runtime/library");

router.get("/pendingorder/", authProtect, async (req, res) => {
  if (!req.user) return;
  const {} = req.body;
  try {
    const acart = await prisma.cart.findUnique({
      where: {
        userId: req.user.sub,
      },
    });
    if (!acart) {
      return res.status(404).json({
        msg: "User cart not found. Something is wrong",
      });
    }
    const cartlist = await prisma.cartOnProduct.findMany({
      where: {
        cartId: acart.id,
      },
      select: {
        productId: true,
        quantity: true,
      },
    });
    if (!cartlist) {
      return res.status(404).json({
        msg: "No cart data found. Something went wrong",
      });
    }
    //calculate totalAmount of products and number of items
    return res.json(cartlist);
  } catch (error) {
    if (error instanceof PrismaClientValidationError) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send(error);
    }
  }
});

module.exports = router;
