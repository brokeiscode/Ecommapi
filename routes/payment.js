const express = require("express");
const router = express.Router();
const config = require("config");
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
      callback: "http://paystack.com",
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
      return res.status(400).send(`HTTP error! status: ${response.status}`);
    }
    res.json(response);
  } catch (error) {
    next(error);
  }
});

//paystack webhook for verifying payment collection
router.post("/webhook/paystack", async function (req, res) {
  // try {
  //validate event
  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash == req.headers["x-paystack-signature"]) {
    // Retrieve the request's body
    const payLoad = req.body;
    // Do something with event payLoad
    console.log(payLoad);
  }
  //get customer transaction
  const transaction = await prisma.transaction.findFirst({
    where: {
      reference: payLoad.data.reference,
    },
  });

  if (!transaction) {
    console.log("Err: transaction not found");
    return res.status(400).send("Unable to find transaction on server");
  }

  if (transaction.status !== "pending") {
    console.log("Err: Only pending transactions can be processed");
    return res
      .status(400)
      .send("Err: Only pending transactions can be processed");
  }

  //verify payment
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${payLoad.data.reference}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${paystackSecretApikey}`,
      },
    }
  );

  if (!response.ok) {
    return res.status(400).send(`HTTP error! status: ${response.status}`);
  }

  const verifiedData = await response.json();
});

module.exports = router;
