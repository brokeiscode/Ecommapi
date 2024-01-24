const express = require("express");
const router = express.Router();
const authProtect = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//GET checkout
router.get("/", authProtect, async (req, res, next) => {
  try {
    const checkout = await prisma.checkout.findUnique({
      where: {
        userId: req.user.sub,
      },
    });
    if (!checkout) {
      return res.status(404).json({
        msg: "No data found. Something is wrong",
      });
    }
    res.json(checkout);
  } catch (error) {
    next(error);
  }
});

// //Update to checkout
// router.put("/", authProtect, async (req, res) => {
//   if (!req.user) return;

//   try {
//     const addcart = await prisma.cart.findUnique({
//       where: {
//         userId: req.user.sub,
//       },
//     });
//     //calculate the total cart price and tax charge
//     const cartItems = await prisma.cartOnProduct.findMany({
//       where: {
//         cartId: addcart.id,
//       },
//       select: {
//         quantity: true,
//         product: {
//           select: {
//             price: true,
//           },
//         },
//       },
//     });

//     let totally = cartItems.reduce((accumulate, cartItem) => {
//       accumulate +
//         parseInt(parseInt(cartItem.product.price) * cartItem.quantity),
//         0;
//     });

//     let chargedtax = (parseInt(totally) * 5) / 100;

//     let noOfItem = cartItems.reduce(
//       (acc, cartItem) => acc + cartItem.quantity,
//       0
//     );

//     let deliveryamount = 3000;

//     let totalprice = parseInt(totally + chargedtax + deliveryamount);

//     const acart = await prisma.checkout.update({
//       where: {
//         userId: req.user.sub,
//       },
//       data: {
//         subtotal: parseInt(totally),
//         taxcharge: chargedtax,
//         deliveryfee: deliveryamount,
//         itemtotal: noOfItem,
//         totalamount: totalprice,
//       },
//     });
//     return res.json({
//       msg: "Product added to cart",
//       acart,
//     });
//   } catch (error) {
//     if (error instanceof PrismaClientValidationError) {
//       res.status(400).send(error.message);
//     } else {
//       res.status(400).send(error);
//     }
//   }
// });

module.exports = router;
