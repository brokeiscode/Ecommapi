const express = require("express");
const router = express.Router();
const authProtect = require("../middleware/auth");
// const authAdmin = require("../middleware/authAdmin");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//GET all Carts
router.get("/", authProtect, async (req, res, next) => {
  try {
    const carts = await prisma.cart.findUnique({
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

    const thecheckout = await prisma.checkout.findUnique({
      where: {
        userId: req.user.sub,
      },
    });

    res.json({
      thecheckout: {
        deliveryfee: thecheckout.deliveryfee,
        discount: thecheckout.discount,
        itemtotal: thecheckout.itemtotal,
        subtotal: thecheckout.subtotal,
        taxcharge: thecheckout.taxcharge,
        totalamount: thecheckout.totalamount,
      },
      thecartlist: {
        carttotal: carts.carttotal,
        // cartlisted: carts.cartonproducts,
        cartlist: carts.cartonproducts.map(({ product, quantity }) => ({
          id: product.id,
          productname: product.productname,
          brandname: product.brandname,
          price: product.price,
          rating: product.rating,
          featuredproduct: product.featuredproduct,
          itembuy: quantity,
          image: product.image,
          description: product.description,
        })),
      },
      // carttotal: carts.carttotal,
      // // cartlisted: carts.cartonproducts,
      // cartlist: carts.cartonproducts.map(({ product, quantity }) => ({
      //   id: product.id,
      //   productname: product.productname,
      //   brandname: product.brandname,
      //   price: product.price,
      //   rating: product.rating,
      //   featuredproduct: product.featuredproduct,
      //   itembuy: quantity,
      //   image: product.image,
      //   description: product.description,
      // })),
    });
  } catch (error) {
    next(error);
  }
});

//POST a product to cart
router.post("/addproduct", authProtect, async (req, res, next) => {
  const { cartData } = req.body;
  try {
    // console.log("cartData:", cartData);
    const addcart = await prisma.cart.findUnique({
      where: {
        userId: parseInt(req.user.sub),
      },
    });
    // for (const item of cartData) {
    await prisma.cartOnProduct.upsert({
      create: {
        productId: parseInt(cartData.productId),
        quantity: parseInt(cartData.quantity),
        cartId: addcart.id,
      },
      update: {
        quantity: parseInt(cartData.quantity),
      },
      where: {
        productId_cartId: {
          productId: parseInt(cartData.productId),
          cartId: addcart.id,
        },
      },
    });
    // }
    // const { productId, quantity } = req.body;
    // try {
    //   const addcart = await prisma.cart.update({
    //     where: {
    //       userId: req.user.sub,
    //     },
    //     data: {
    //       cartonproducts: {
    //         create: [
    //           {
    //             productId,
    //             quantity,
    //           },
    //         ],
    //       },
    //     },
    //   });
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

    await prisma.cart.update({
      where: {
        // id: addcart.id,
        userId: req.user.sub,
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

    const thecheckout = await prisma.checkout.update({
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

    const carts = await prisma.cart.findUnique({
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

    return res.json({
      // msg: "Product added to cart",
      // carttotal: acart.carttotal,
      msg: "A product added to Cart",
      thecheckout: {
        deliveryfee: thecheckout.deliveryfee,
        discount: thecheckout.discount,
        itemtotal: thecheckout.itemtotal,
        subtotal: thecheckout.subtotal,
        taxcharge: thecheckout.taxcharge,
        totalamount: thecheckout.totalamount,
      },
      thecartlist: {
        carttotal: carts.carttotal,
        // cartlisted: carts.cartonproducts,
        cartlist: carts.cartonproducts.map(({ product, quantity }) => ({
          id: product.id,
          productname: product.productname,
          brandname: product.brandname,
          price: product.price,
          rating: product.rating,
          featuredproduct: product.featuredproduct,
          itembuy: quantity,
          image: product.image,
          description: product.description,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

//POST a cartData from local storage to cart db
router.post("/cart-move-cloud", authProtect, async (req, res, next) => {
  const { cartData } = req.body;
  try {
    // console.log("cartData:", cartData);
    const addcart = await prisma.cart.findUnique({
      where: {
        userId: parseInt(req.user.sub),
      },
    });
    for (const item of cartData) {
      await prisma.cartOnProduct.upsert({
        create: {
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          cartId: addcart.id,
        },
        update: {
          quantity: parseInt(item.quantity),
        },
        where: {
          productId_cartId: {
            productId: parseInt(item.productId),
            cartId: addcart.id,
          },
        },
      });
    }
    // const findcart = await prisma.cart.findUnique({
    //   where: {
    //     userId: parseInt(req.user.sub),
    //   },
    // });
    // const addcart = await prisma.cartOnProduct.createMany({
    //   data: { cartData, cartId: findcart.id },
    // });
    // console.log("got here", cartData);
    // const addcart = await prisma.cart.update({
    //   where: {
    //     userId: parseInt(req.user.sub),
    //   },
    //   data: {
    //     cartonproducts: {
    //       create: cartData.map((item) => ({
    //         productId: parseInt(item.id),
    //         quantity: parseInt(item.itembuy),
    //       })),
    //     },
    //   },
    // });
    // cartData.map((item) => ({
    //   cartonproducts: {
    //     create: [
    //       {
    //         productId: parseInt(item.id),
    //         quantity: parseInt(item.quantity),
    //       },
    //     ],
    //   },
    // })),
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

    const thecheckout = await prisma.checkout.update({
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
      msg: "All local cart moved to Cart",
      thecheckout: {
        deliveryfee: thecheckout.deliveryfee,
        discount: thecheckout.discount,
        itemtotal: thecheckout.itemtotal,
        subtotal: thecheckout.subtotal,
        taxcharge: thecheckout.taxcharge,
        totalamount: thecheckout.totalamount,
      },
    });
  } catch (error) {
    next(error);
  }
});

//PUT a product to cart
router.put("/:prodId", authProtect, async (req, res, next) => {
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
    next(error);
  }
});

//DELETE a product from cart
router.delete("/:prodId", authProtect, async (req, res, next) => {
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

    const acart = await prisma.cart.update({
      where: {
        id: thecart.id,
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

    const thecheckout = await prisma.checkout.update({
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

    const carts = await prisma.cart.findUnique({
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

    return res.json({
      // msg: "Product added to cart",
      // carttotal: acart.carttotal,
      msg: "Product removed from cart successfully",
      thecheckout: {
        deliveryfee: thecheckout.deliveryfee,
        discount: thecheckout.discount,
        itemtotal: thecheckout.itemtotal,
        subtotal: thecheckout.subtotal,
        taxcharge: thecheckout.taxcharge,
        totalamount: thecheckout.totalamount,
      },
      thecartlist: {
        carttotal: carts.carttotal,
        // cartlisted: carts.cartonproducts,
        cartlist: carts.cartonproducts.map(({ product, quantity }) => ({
          id: product.id,
          productname: product.productname,
          brandname: product.brandname,
          price: product.price,
          rating: product.rating,
          featuredproduct: product.featuredproduct,
          itembuy: quantity,
          image: product.image,
          description: product.description,
        })),
      },
    });
  } catch (error) {
    next(error);
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
