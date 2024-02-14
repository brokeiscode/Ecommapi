const express = require("express");
const router = express.Router();
const config = require("config");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//for Paystack payment
const initializeTransaction = async (orderID, user) => {
  // router.get("/", async (req, res, next) => {
  //   try {
  const paystackEndpoint = "https://api.paystack.co/transaction/initialize";

  const paystackSecretApikey = config.get("PAYSTACK_SECRET_KEY");

  const pendingorder = await prisma.order.findUnique({
    where: {
      userId: parseInt(user.sub),
      id: orderID,
    },
  });

  //PAYSTACK
  const payLoad = {
    email: user.email,
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
  console.log(response[Symbol()]);
  return response.json();
  //   } catch (error) {
  //     next(error);
  //   }
  // });
};

module.exports = initializeTransaction;
