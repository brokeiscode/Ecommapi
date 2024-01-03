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
  if (!req.user) return;
  try {
    const carts = await prisma.cart.findMany({
      where: {
        userId: req.user.sub,
      },
      include: {
        products: {
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
    res.status(400).send("An error occured");
  }
});

//POST a product to cart
router.post("/", authProtect, async (req, res) => {
  if (!req.user) return;
  const { productId, quantity } = req.body;
  try {
    const acart = await prisma.cart.update({
      where: {
        userId: req.user.sub,
      },
      data: {
        products: {
          create: [
            {
              productId,
              quantity,
            },
          ],
        },
      },
      include: { products: true },
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

//PUT a product to cart
router.put("/:prodId", authProtect, async (req, res) => {
  if (!req.user) return;
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
  if (!req.user) return;
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
