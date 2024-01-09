const express = require("express");
const router = express.Router();
const authProtect = require("../middleware/auth");
const authAdmin = require("../middleware/authAdmin");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//GET all Brand
router.get("/", async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        products: true,
      },
    });
    if (!brands) {
      return res.status(404).json({
        msg: "No data found. Something is wrong",
      });
    }
    res.json(brands);
  } catch (error) {
    res.status(400).send("An error occured");
  }
});

//GET one Category
router.get("/:id", async (req, res) => {
  const theid = parseInt(req.params.id);
  try {
    const abrand = await prisma.brand.findUnique({
      where: {
        id: theid,
      },
      include: {
        products: true,
      },
    });
    if (!abrand) {
      return res.status(404).json({
        msg: "No data found. Something is wrong",
      });
    }
    return res.json(abrand);
  } catch (error) {
    return res.status(400).json({
      msg: "Something went wrong",
      error,
    });
  }
});

//POST many brands
router.post("/", [authProtect, authAdmin], async (req, res) => {
  const { brandsData } = req.body;
  try {
    const manybrands = await prisma.brand.createMany({
      data: { brandsData },
    });
    return res.json(manybrands);
  } catch (error) {
    return res.status(400).json({
      msg: "Something went wrong",
      error,
    });
  }
});

module.exports = router;
