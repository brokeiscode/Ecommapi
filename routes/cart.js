const express = require("express");
const router = express.Router();
const authProtect = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");
const { PrismaClient } = require("@prisma/client");
const auth = require("../middleware/auth");
const prisma = new PrismaClient();
const {
  PrismaClientValidationError,
  PrismaClientUnknownRequestError,
} = require("@prisma/client/runtime/library");

//GET all Carts
router.get("/", authProtect, async (req, res) => {
  try {
    const carts = await prisma.cart.findMany({
      where: {
        userId: req.user.sub,
      },
      include: {
        cartonproducts: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!carts) {
      return res.status(404).json({
        msg: "No data found. Something is wrong",
      });
    }
    res.json(carts);
  } catch (error) {
    if (error instanceof PrismaClientValidationError) {
      res.status(400).send(error.message);
    } else if (error instanceof PrismaClientUnknownRequestError) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send(error);
    }
  }
});

//POST a product to cart
router.post("/", authProtect, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const addcart = await prisma.cart.update({
      where: {
        userId: req.user.sub,
      },
      data: {
        cartonproducts: {
          create: [
            {
              productId,
              quantity,
            },
          ],
        },
      },
    });
    //calculate the total cart price and tax charge
    const cartItems = await prisma.cartOnProduct.findMany({
      where: {
        cartId: addcart.id,
      },
      select: {
        quantity: true,
        product: {
          select: {
            price: true,
          },
        },
      },
    });

    let totally = cartItems.reduce((accumulate, cartItem) => {
      return (
        accumulate +
        parseInt(parseInt(cartItem.product.price) * cartItem.quantity)
      );
    }, 0);
    // console.log("got here", totally);

    const acart = await prisma.cart.update({
      where: {
        id: addcart.id,
      },
      data: {
        carttotal: parseInt(totally),
      },
    });

    let chargedtax = (parseInt(totally) * 5) / 100;

    let noOfItem = cartItems.reduce((acc, cartItem) => {
      return acc + cartItem.quantity;
    }, 0);

    let deliveryamount = 3000;

    let totalprice = parseInt(totally + chargedtax + deliveryamount);

    await prisma.checkout.update({
      where: {
        userId: req.user.sub,
      },
      data: {
        subtotal: parseInt(totally),
        taxcharge: chargedtax,
        deliveryfee: deliveryamount,
        itemtotal: noOfItem,
        totalamount: totalprice,
      },
    });

    return res.json({
      msg: "Product added to cart",
      acart,
    });
  } catch (error) {
    if (error instanceof PrismaClientValidationError) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send(error);
    }
  }
});

//PUT a product to cart
router.put("/:prodId", authProtect, async (req, res) => {
  const theid = parseInt(req.params.prodId);
  const { quantity } = req.body;
  try {
    //get cart id
    const thecart = await prisma.cart.findUnique({
      where: {
        userId: req.user.sub,
      },
    });
    // Check if the product exists in the cart
    const cartProduct = await prisma.cartOnProduct.findFirst({
      where: {
        cartId: thecart.id,
        productId: theid,
      },
    });
    if (!cartProduct) {
      return res.status(404).json({ message: "Product not found in the cart" });
    }
    await prisma.cartOnProduct.update({
      where: {
        id: cartProduct.id,
      },
      data: {
        quantity,
      },
    });

    //calculate the total cart price and tax charge
    const cartItems = await prisma.cartOnProduct.findMany({
      where: {
        cartId: thecart.id,
      },
      select: {
        quantity: true,
        product: {
          select: {
            price: true,
          },
        },
      },
    });

    let totally = cartItems.reduce((accumulate, cartItem) => {
      return (
        accumulate +
        parseInt(parseInt(cartItem.product.price) * cartItem.quantity)
      );
    }, 0);

    let chargedtax = (parseInt(totally) * 5) / 100;

    let noOfItem = cartItems.reduce((acc, cartItem) => {
      return acc + cartItem.quantity;
    }, 0);

    let deliveryamount = 3000;

    let totalprice = parseInt(totally + chargedtax + deliveryamount);

    await prisma.checkout.update({
      where: {
        userId: req.user.sub,
      },
      data: {
        subtotal: parseInt(totally),
        taxcharge: chargedtax,
        deliveryfee: deliveryamount,
        itemtotal: noOfItem,
        totalamount: totalprice,
      },
    });

    return res.status(200).json({ message: "Quantity updated successfully" });
  } catch (error) {
    if (error instanceof PrismaClientValidationError) {
      res.status(400).send(error.message);
    } else if (error instanceof PrismaClientUnknownRequestError) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send(error);
    }
  }
});

//DELETE a product from cart
router.delete("/:prodId", authProtect, async (req, res) => {
  const theid = parseInt(req.params.prodId);
  try {
    //get cart id
    const thecart = await prisma.cart.findUnique({
      where: {
        userId: req.user.sub,
      },
    });
    // Check if the product exists in the cart
    const cartProduct = await prisma.cartOnProduct.findFirst({
      where: {
        cartId: thecart.id,
        productId: theid,
      },
    });
    if (!cartProduct) {
      return res.status(404).json({ message: "Product not found in the cart" });
    }
    await prisma.cartOnProduct.delete({
      where: {
        id: cartProduct.id,
      },
    });

    //calculate the total cart price and tax charge
    const cartItems = await prisma.cartOnProduct.findMany({
      where: {
        cartId: thecart.id,
      },
      select: {
        quantity: true,
        product: {
          select: {
            price: true,
          },
        },
      },
    });

    let totally = cartItems.reduce((accumulate, cartItem) => {
      return (
        accumulate +
        parseInt(parseInt(cartItem.product.price) * cartItem.quantity)
      );
    }, 0);

    let chargedtax = (parseInt(totally) * 5) / 100;

    let noOfItem = cartItems.reduce((acc, cartItem) => {
      return acc + cartItem.quantity;
    }, 0);

    let deliveryamount = 3000;

    let totalprice = parseInt(totally + chargedtax + deliveryamount);

    await prisma.checkout.update({
      where: {
        userId: req.user.sub,
      },
      data: {
        subtotal: parseInt(totally),
        taxcharge: chargedtax,
        deliveryfee: deliveryamount,
        itemtotal: noOfItem,
        totalamount: totalprice,
      },
    });

    return res
      .status(200)
      .json({ message: "Product removed from cart successfully" });
  } catch (error) {
    if (error instanceof PrismaClientValidationError) {
      res.status(400).send(error.message);
    } else if (error instanceof PrismaClientUnknownRequestError) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send(error);
    }
  }
});

module.exports = router;

/**
 * //POST a product to cart
router.post("/:id", authProtect, async (req, res) => {
  // const { productname, price, quantity, image } = req.body;
  if (!req.user) return;
  const theid = parseInt(req.params.id);
  try {
    const acart = await prisma.cart.upsert({
      where: {
        userId: req.user.sub,
      },
      update: {
        products: {
          connect: [{ id: theid }],
        },
      },
      create: {
        userId: req.user.sub,
        products: {
          connect: [{ id: theid }],
        },
      },
    });
    return res.json(acart);
  } catch (error) {
    if (error instanceof PrismaClientValidationError) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send(error);
    }
  }
});

//DELETE a product from cart
router.put("/:id", authProtect, async (req, res) => {
  // const { productname, price, quantity, image } = req.body;
  if (!req.user) return;
  const theid = parseInt(req.params.id);
  try {
    const acart = await prisma.cart.update({
      where: {
        userId: req.user.sub,
      },
      data: {
        products: {
          disconnect: [{ id: theid }],
        },
      },
    });
    return res.json(acart);
  } catch (error) {
    if (error instanceof PrismaClientValidationError) {
      res.status(400).send(error.message);
    } else {
      res.status(400).send(error);
    }
  }
});
 */
