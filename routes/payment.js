const express = require("express");
const router = express.Router();
const config = require("config");
const crypto = require("crypto");
const authProtect = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//for Paystack payment
router.post("/charge-pending-order", [authProtect], async (req, res, next) => {
  try {
    const { orderID } = req.body;
    const paystackEndpoint = "https://api.paystack.co/transaction/initialize";

    const paystackSecretApikey = config.get("PAYSTACK_SECRET_KEY");

    const pendingorder = await prisma.order.findUnique({
      where: {
        userId: parseInt(req.user.sub),
        id: orderID,
      },
    });

    //PAYSTACK
    const payLoad = {
      email: req.user.email,
      //we use *100 in paystack api
      amount: `${pendingorder.totalprice * 100}`,
      currency: `NGN`,
      reference: pendingorder.id,
      // callback_url: "https://www.uptuned.shop",
      // channels: ["card", "bank", "ussd"],
    };

    const response = await fetch(paystackEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${paystackSecretApikey}`,
      },
      body: JSON.stringify(payLoad),
    });

    if (!response.ok) {
      return res
        .status(400)
        .json({ msg: `HTTP error! status: ${response.status}` });
    }

    const data = await response.json();
    console.log(data);
    if (data.status === true) {
      return res.json({ url: data.data.authorization_url });
    }
  } catch (error) {
    next(error);
  }
});

//paystack webhook for verifying payment collection
router.post("/my/webhook/url", async function (req, res) {
  const paystackSecretApikey = config.get("PAYSTACK_SECRET_KEY");
  try {
    //validate event
    const hash = crypto
      .createHmac("sha512", paystackSecretApikey)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash == req.headers["x-paystack-signature"]) {
      // Signature is valid, process the webhook
      console.log("Webhook signature verified");
      // Retrieve the request's body
      const payLoad = req.body;
      // Do something with event payLoad
      console.log(payLoad);

      //get customer pending order
      const theorder = await prisma.order.findUnique({
        where: {
          id: payLoad.data.reference,
        },
      });

      if (!theorder) {
        console.log("Err: Order not found");
        return res
          .status(400)
          .json({ msg: "Unable to find transaction on server" });
      }

      if (theorder.transactionstatus !== "pending") {
        console.log("Err: Only pending transactions can be processed");
        return res
          .status(400)
          .json({ msg: "Err: Only pending transactions can be processed" });
      }

      // Determine the event type
      const event = payLoad.event;

      // Handle different event types
      switch (event) {
        case "charge.success":
          // Payment was successful
          console.log("Payment successful");
          // Update your database, send confirmation emails, etc.
          if (
            payLoad.data.status === "success" &&
            payLoad.data.amount >= theorder.totalprice * 100
          ) {
            //successful payment
            await prisma.order.update({
              where: {
                id: payLoad.data.reference,
              },
              data: {
                transactionstatus: "success",
              },
            });
          }
          break;
        case "transfer.failed":
          // Payment failed
          console.log("Payment failed");
          // Handle failed payment scenario
          await prisma.order.update({
            where: {
              id: payLoad.data.reference,
            },
            data: {
              transactionstatus: "Failed",
            },
          });
          break;
        case "transfer.success":
          // Transfer was successful
          console.log("Transfer successful");
          // Handle successful transfer scenario
          await prisma.order.update({
            where: {
              id: payLoad.data.reference,
            },
            data: {
              transactionstatus: "success",
            },
          });
          break;
        // Add more cases for other event types as needed
        default:
          // Handle unknown event types
          console.log("Unknown event type:", event);
      }
    } else {
      // Signature is invalid, reject the request
      console.error("Invalid webhook signature");
      return res.status(400).json({ msg: "Invalid signature" });
    }
  } catch (error) {
    console.error("Error verifying webhook signature", error);
    return res.status(500).json({ msg: "Error verifying signature" });
  }
  res.sendStatus(200);
});

router.get(
  "/status-confirmation/:reference",
  [authProtect],
  async (req, res, next) => {
    const paystackSecretApikey = config.get("PAYSTACK_SECRET_KEY");
    const reference = req.params.reference;
    try {
      //verify payment
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${paystackSecretApikey}`,
          },
        }
      );

      if (!response.ok) {
        await prisma.order.update({
          where: {
            id: reference,
          },
          data: {
            transactionstatus: "cancelled",
          },
        });
        return res.status(400).json({
          msg: "No Paystack reference of this order, Cancelled",
          status: "cancelled",
        });
      }

      const verifiedData = await response.json();
      // console.log(verifiedData);

      if (verifiedData.data.status === "success") {
        await prisma.order.update({
          where: {
            id: reference,
          },
          data: {
            transactionstatus: "success",
          },
        });
        //get cart id
        const thecart = await prisma.cart.findUnique({
          where: {
            userId: parseInt(req.user.sub),
          },
        });
        // Check if the product exists in the cart
        await prisma.cartOnProduct.deleteMany({
          where: {
            cartId: thecart.id,
          },
        });
        return res.json({ status: "success" });
      } else if (
        verifiedData.data.status === "ongoing" ||
        verifiedData.data.status === "pending" ||
        verifiedData.data.status === "processing"
      ) {
        return res.json({ status: "pending" });
      } else {
        await prisma.order.update({
          where: {
            id: reference,
          },
          data: {
            transactionstatus: "failed",
          },
        });
        return res.json({ status: "failed" });
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
