const express = require("express");
const router = express.Router();
const authProtect = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//GET all Products
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({});
    if (!products) {
      return res.status(404).json({
        msg: "No data found. Something is wrong",
      });
    }
    res.json(products);
  } catch (error) {
    res.status(400).send("An error occured");
  }
});

//GET a product
router.get("/:id", async (req, res) => {
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
    res.status(400).send("An error occured");
  }
});

//POST a product
router.post("/single", [authProtect, authAdmin], async (req, res) => {
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
    return res.status(400).json({
      msg: "Something went wrong",
      error,
    });
  }
});

//POST a product
router.post("/many", [authProtect, authAdmin], async (req, res) => {
  const { productsData } = req.body;
  try {
    const manyproduct = await prisma.product.createMany({
      data: productsData.map((item) => ({
        productname: item.productname,
        brandname: item.brandname,
        price: item.price,
        rating: item.rating,
        quantity: item.quantity,
        image: item.image,
        description: item.description,
        categoryId: item.categoryId,
        brandId: item.brandId,
      })),
    });
    return res.json(manyproduct);
  } catch (error) {
    return res.status(400).json({
      msg: "Something went wrong",
      error,
    });
  }
});

module.exports = router;
