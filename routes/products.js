const express = require("express");
const router = express.Router();
// const processFile = require("../middleware/uploadMulter");
// const { format } = require("util");
// const { Storage } = require("@google-cloud/storage");
const authProtect = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//GET all Products
router.get("/", async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({});
    if (!products) {
      return res.status(404).json({
        msg: "No data found. Something is wrong",
      });
    }
    res.json(products);
  } catch (error) {
    next(error);
  }
});

//GET a product
router.get("/:id", async (req, res, next) => {
  const theid = parseInt(req.params.id);
  try {
    const aproducts = await prisma.product.findUnique({
      where: {
        id: theid,
      },
    });
    if (!aproducts) {
      return res.status(404).json({
        msg: "The product requested was not found. Something is wrong",
      });
    }
    res.json(aproducts);
  } catch (error) {
    next(error);
  }
});

//POST a product
router.post("/single/", [authProtect, authAdmin], async (req, res, next) => {
  const {
    productname,
    brandname,
    price,
    rating,
    quantity,
    image,
    description,
    categoryId,
    brandId,
  } = req.body;
  try {
    const aproduct = await prisma.product.create({
      data: {
        productname,
        brandname,
        price,
        rating,
        quantity,
        image,
        description,
        categoryId,
        brandId,
      },
    });
    // console.log(req.user);
    return res.json(aproduct);
  } catch (error) {
    next(error);
  }
});

//POST many product
router.post("/many/", [authProtect, authAdmin], async (req, res, next) => {
  const { productsData } = req.body;
  try {
    const manyproduct = await prisma.product.createMany({
      data: productsData.map((item) => ({
        productname: item.productname,
        brandname: item.brandname,
        price: item.price,
        rating: item.rating,
        quantity: item.quantity,
        description: item.description,
        categoryId: item.categoryId,
        brandId: item.brandId,
      })),
    });
    return res.json(manyproduct);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
