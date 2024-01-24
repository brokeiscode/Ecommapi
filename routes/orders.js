const express = require("express");
const router = express.Router();
const authProtect = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//GET all orders
router.get("/allsuccessfulorder/", authProtect, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: parseInt(req.user.sub),
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!orders) {
      return res.status(404).json({
        msg: "No data found. Something is wrong",
      });
    }
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.post("/pendingorder/", authProtect, async (req, res, next) => {
  const {} = req.body;
  try {
    const acart = await prisma.cart.findUnique({
      where: {
        userId: parseInt(req.user.sub),
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

    const acheckout = await prisma.checkout.findUnique({
      where: {
        userId: parseInt(req.user.sub),
      },
    });
    //Create Order and OrderItems
    const aorder = await prisma.order.create({
      data: {
        itemnumber: acheckout.itemtotal,
        totalprice: acheckout.totalamount,
        userId: acheckout.userId,
        orderItems: {
          create: cartlist.map((acartlist) => ({
            productId: acartlist.productId,
            quantity: acartlist.quantity,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });
    return res.json({
      msg: "An Order has been Created",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
